/**
 * AnchorScrollService — 锚点滚动编排与 inset 聚合。
 *
 * 【库级模块 · 可复制】
 * - 职责：统一 hash 滚动时机、inset 求和、CSS 变量同步、首屏校正。
 * - 不依赖：主题 layout、youlog 专有选择器。
 * - 前提：宿主传入 scrollContainer / articleSelector；sticky 区域通过 registerInset 注入。
 * - 协作：page-ajax（导航后滚动）、toc/topbar（inset contributor）。
 * - 宿主编排：由主题 entries/browser.ts 创建实例并 applyInitialHash。
 *
 * @module youlog_lib/core/anchorScrollService
 */

import {
  type AnchorInsetContributor,
  nextFrame,
  waitForDomContentLoaded,
} from "./anchorInset";
import {
  getHashFromUrl,
  getScrollTop,
  resolveScrollContainer,
  scrollToHash,
  type ScrollContainer,
  type ScrollToAnchorOptions,
} from "./scrollAnchor";

export type AnchorScrollSource = "initial" | "navigation" | "toc" | "link";

export interface ScrollToHashRequest {
  hash: string;
  source: AnchorScrollSource;
  behavior?: ScrollToAnchorOptions["behavior"];
  /** 跳转前布局变更（如收起 mobile TOC） */
  beforeScroll?: () => void | Promise<void>;
  /** 为 true 时不派发 onNavigate（由调用方自行通知） */
  skipNotify?: boolean;
}

export interface AnchorScrollServiceOptions {
  scrollContainer: ScrollContainer | string;
  articleSelector?: string;
  extraOffset?: number;
  /** 写入 documentElement 的 CSS 变量名；默认 "--anchor-inset-top" */
  insetCssVar?: string;
  /** hash 滚动完成后的通知；用于 nav-tree 等联动 */
  onNavigate?: (hash: string) => void;
  /** 开发模式下输出 inset 组成 */
  debug?: boolean;
}

export interface AnchorScrollService {
  registerInset(contributor: AnchorInsetContributor): () => void;
  getOffset(): number;
  whenLayoutReady(): Promise<void>;
  scrollToHash(req: ScrollToHashRequest): Promise<boolean>;
  applyInitialHash(): void;
  notifyNavigate(): void;
}

const DEFAULT_INSET_CSS_VAR = "--anchor-inset-top";
const INITIAL_CORRECTION_WINDOW_MS = 500;
const INITIAL_CORRECTION_THRESHOLD_PX = 2;

interface RegisteredInset {
  contributor: AnchorInsetContributor;
  dispose?: () => void;
}

function resolveContainer(scrollContainer: ScrollContainer | string): ScrollContainer {
  if (typeof scrollContainer !== "string") {
    return scrollContainer;
  }
  return resolveScrollContainer(scrollContainer) ?? window;
}

function resolveArticleRoot(
  scrollContainer: ScrollContainer,
  articleSelector?: string,
): ParentNode {
  if (!articleSelector) {
    return document;
  }
  if (scrollContainer instanceof Window) {
    return document.querySelector(articleSelector) ?? document;
  }
  return scrollContainer.querySelector(articleSelector) ?? scrollContainer;
}

export function createAnchorScrollService(
  options: AnchorScrollServiceOptions,
): AnchorScrollService {
  const scrollContainer = resolveContainer(options.scrollContainer);
  const extraOffset = options.extraOffset ?? 0;
  const insetCssVar = options.insetCssVar ?? DEFAULT_INSET_CSS_VAR;
  const onNavigate = options.onNavigate;

  const insets = new Map<string, RegisteredInset>();
  let layoutReadyPromise: Promise<void> | undefined;
  let initialCorrectionActive = false;
  let initialCorrectionCleanup: (() => void) | undefined;

  const sortedInsets = (): AnchorInsetContributor[] =>
    [...insets.values()]
      .map((entry) => entry.contributor)
      .sort((a, b) => a.order - b.order);

  const sumInsetHeights = (): number =>
    sortedInsets().reduce((sum, inset) => sum + inset.measure(), 0);

  const syncInsetCssVar = (): number => {
    const total = getOffset();
    document.documentElement.style.setProperty(insetCssVar, `${total}px`);
    if (options.debug) {
      const parts = sortedInsets().map((i) => `${i.id}=${i.measure()}`);
      console.debug(
        `[AnchorScrollService] inset top=${total}px (${parts.join(", ")}, extra=${extraOffset})`,
      );
    }
    return total;
  };

  const getOffset = (): number => sumInsetHeights() + extraOffset;

  const notifyNavigate = (): void => {
    const hash = getHashFromUrl(window.location.href);
    onNavigate?.(hash);
  };

  const whenLayoutReady = (): Promise<void> => {
    if (!layoutReadyPromise) {
      layoutReadyPromise = (async () => {
        await waitForDomContentLoaded();
        const contributors = sortedInsets();
        await Promise.all(
          contributors.map((c) => c.whenReady?.() ?? Promise.resolve()),
        );
        await nextFrame();
        await nextFrame();
        syncInsetCssVar();
      })();
    }
    return layoutReadyPromise;
  };

  const stopInitialCorrection = (): void => {
    initialCorrectionActive = false;
    initialCorrectionCleanup?.();
    initialCorrectionCleanup = undefined;
  };

  const startInitialCorrection = (hash: string): void => {
    stopInitialCorrection();
    initialCorrectionActive = true;
    const scrollEl = scrollContainer;
    const baselineOffset = getOffset();
    const baselineScrollTop = getScrollTop(scrollEl);
    let userScrolled = false;

    const onUserScroll = (): void => {
      if (Math.abs(getScrollTop(scrollEl) - baselineScrollTop) > 4) {
        userScrolled = true;
        stopInitialCorrection();
      }
    };

    scrollEl.addEventListener("scroll", onUserScroll, { passive: true });

    const timeout = window.setTimeout(() => {
      stopInitialCorrection();
    }, INITIAL_CORRECTION_WINDOW_MS);

    const observer =
      "ResizeObserver" in window
        ? new ResizeObserver(() => {
            if (!initialCorrectionActive || userScrolled) return;
            const nextOffset = getOffset();
            syncInsetCssVar();
            if (
              Math.abs(nextOffset - baselineOffset) >
              INITIAL_CORRECTION_THRESHOLD_PX
            ) {
              scrollToHash(hash, scrollContainer, {
                behavior: "auto",
                offset: nextOffset,
              }, resolveArticleRoot(scrollContainer, options.articleSelector));
            }
          })
        : undefined;

    observer?.observe(document.documentElement);

    initialCorrectionCleanup = () => {
      clearTimeout(timeout);
      scrollEl.removeEventListener("scroll", onUserScroll);
      observer?.disconnect();
    };
  };

  const scrollToHashRequest = async (req: ScrollToHashRequest): Promise<boolean> => {
    const hash = req.hash.replace(/^#/, "").trim();
    if (!hash) {
      return false;
    }

    if (req.beforeScroll) {
      await req.beforeScroll();
      await nextFrame();
      await nextFrame();
    }

    if (req.source === "initial" || req.source === "navigation") {
      await whenLayoutReady();
    } else {
      syncInsetCssVar();
    }

    const offset = getOffset();
    const root = resolveArticleRoot(scrollContainer, options.articleSelector);
    const behavior = req.behavior ?? "auto";
    const ok = scrollToHash(hash, scrollContainer, { offset, behavior }, root);

    if (ok) {
      if (!req.skipNotify && req.source !== "toc") {
        onNavigate?.(hash);
      }
    }

    return ok;
  };

  const applyInitialHash = (): void => {
    const hash = getHashFromUrl(window.location.href);
    if (!hash) {
      return;
    }

    const run = async (): Promise<void> => {
      await whenLayoutReady();
      const ok = await scrollToHashRequest({
        hash,
        source: "initial",
        behavior: "auto",
        skipNotify: false,
      });
      if (ok) {
        startInitialCorrection(hash);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        void run();
      }, { once: true });
    } else {
      void run();
    }
  };

  const registerInset = (contributor: AnchorInsetContributor): (() => void) => {
    if (insets.has(contributor.id)) {
      console.warn(
        `[AnchorScrollService] inset "${contributor.id}" replaced by re-register`,
      );
      insets.get(contributor.id)?.dispose?.();
    }

    insets.set(contributor.id, { contributor });
    layoutReadyPromise = undefined;
    syncInsetCssVar();

    return () => {
      const entry = insets.get(contributor.id);
      if (entry?.contributor === contributor) {
        entry.dispose?.();
        insets.delete(contributor.id);
        layoutReadyPromise = undefined;
        syncInsetCssVar();
      }
    };
  };

  // 初始 CSS 变量
  syncInsetCssVar();

  return {
    registerInset,
    getOffset,
    whenLayoutReady,
    scrollToHash: scrollToHashRequest,
    applyInitialHash,
    notifyNavigate,
  };
}
