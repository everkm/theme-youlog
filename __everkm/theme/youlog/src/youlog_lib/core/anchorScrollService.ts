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
 * 更新日志：
 * - 2026-06-22：scrollContainer 改为懒解析（避免在容器入 DOM 前锁成 window 致 scrollTo 空操作）；
 *   首屏校正升级为「窗口内持续重定位目标」，监听 fonts.ready / load / 正文 ResizeObserver，
 *   修复慢网首屏字体/图片回流后标题位置偏移。
 *
 * @module youlog_lib/core/anchorScrollService
 */

import {
  type AnchorInsetContributor,
  nextFrame,
  waitForDomContentLoaded,
} from "./anchorInset";
import {
  computeScrollTopForElement,
  getHashFromUrl,
  getScrollTop,
  resolveAnchorTarget,
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
// 首屏校正窗口：覆盖慢网下 CJK 字体 / 图片 / 代码高亮的延迟回流
const INITIAL_CORRECTION_WINDOW_MS = 2500;
const INITIAL_CORRECTION_THRESHOLD_PX = 2;
// 滚动位置偏离预期超过该阈值视为用户主动滚动，放弃自动校正
const USER_SCROLL_THRESHOLD_PX = 8;

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
  // 延迟解析滚动容器：服务可能在 #body-main 入 DOM 前创建（bundle 在 <head> 执行），
  // 若此时即解析会回退为 window，导致后续所有 scrollTo 落在不滚动的 window 上而失效。
  // 同时 PJAX morph 可能重建容器，故每次滚动都重新解析选择器。
  const getScrollContainer = (): ScrollContainer =>
    resolveContainer(options.scrollContainer);
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

    const scrollEl = getScrollContainer();
    const root = resolveArticleRoot(scrollEl, options.articleSelector);
    // 期望停留位置；程序化校正后同步更新，借此区分「用户主动滚动」与「自身校正」
    let expectedTop = getScrollTop(scrollEl);

    // 重新把目标钉回正确位置：覆盖 inset 变化与首屏资源回流（字体/图片/代码高亮）
    const reposition = (): void => {
      if (!initialCorrectionActive) return;
      if (
        Math.abs(getScrollTop(scrollEl) - expectedTop) >
        USER_SCROLL_THRESHOLD_PX
      ) {
        stopInitialCorrection();
        return;
      }
      const target = resolveAnchorTarget(hash, root);
      if (!target) return;
      syncInsetCssVar();
      const desiredTop = computeScrollTopForElement(
        target,
        scrollEl,
        getOffset(),
      );
      if (
        Math.abs(desiredTop - getScrollTop(scrollEl)) >
        INITIAL_CORRECTION_THRESHOLD_PX
      ) {
        scrollEl.scrollTo({ top: desiredTop, behavior: "auto" });
      }
      expectedTop = getScrollTop(scrollEl);
    };

    const onUserScroll = (): void => {
      if (
        Math.abs(getScrollTop(scrollEl) - expectedTop) >
        USER_SCROLL_THRESHOLD_PX
      ) {
        stopInitialCorrection();
      }
    };
    scrollEl.addEventListener("scroll", onUserScroll, { passive: true });

    let observer: ResizeObserver | undefined;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(() => reposition());
      observer.observe(document.documentElement);
      // 观察正文容器高度：字体/图片加载导致目标上方内容回流时触发复位
      if (root instanceof Element) {
        observer.observe(root);
      }
    }

    let active = true;
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (active) reposition();
      });
    }
    const onWindowLoad = (): void => reposition();
    window.addEventListener("load", onWindowLoad);

    // 兜底多帧复位，应对未触发 RO / load 的渐进式布局变化
    const timers = [0, 80, 200, 400, 800, 1400].map((delay) =>
      window.setTimeout(reposition, delay),
    );
    const endTimer = window.setTimeout(
      stopInitialCorrection,
      INITIAL_CORRECTION_WINDOW_MS,
    );

    initialCorrectionCleanup = () => {
      active = false;
      timers.forEach((t) => clearTimeout(t));
      clearTimeout(endTimer);
      scrollEl.removeEventListener("scroll", onUserScroll);
      window.removeEventListener("load", onWindowLoad);
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
    const container = getScrollContainer();
    const root = resolveArticleRoot(container, options.articleSelector);
    const behavior = req.behavior ?? "auto";
    const ok = scrollToHash(hash, container, { offset, behavior }, root);

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
