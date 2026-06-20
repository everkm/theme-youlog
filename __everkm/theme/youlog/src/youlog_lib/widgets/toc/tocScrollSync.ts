import { createSignal, onCleanup, type Accessor, type Setter } from "solid-js";
import type { ScrollContainer } from "../../core/scrollAnchor";
import { parseTocItems, resolveActiveHeadingKey, VERTICAL_PADDING, type TocItem } from "./tocParsing";

export { VERTICAL_PADDING };

const MOBILE_TOC_MQL = "(max-width: 1023px)";

function queryWithinScrollContainer(
  scrollContainer: ScrollContainer,
  selector: string,
): HTMLElement | null {
  if (scrollContainer instanceof Window) {
    return document.querySelector<HTMLElement>(selector);
  }
  return scrollContainer.querySelector<HTMLElement>(selector);
}

function resolveHeaderHeightInContainer(
  scrollContainer: ScrollContainer,
  headerSelector: string,
): number {
  const header = queryWithinScrollContainer(scrollContainer, headerSelector);
  return header ? header.offsetHeight : 0;
}

/** 小屏 sticky 状态下移动端 TOC 标题栏高度（用于跳转与高亮偏移） */
export function getMobileTocBarHeight(
  scrollContainer: ScrollContainer,
  headerSelector: string,
): number {
  const indicator = document.getElementById("mobile-toc-indicator");
  if (!indicator) return 0;

  const containerTop =
    scrollContainer instanceof Window
      ? 0
      : scrollContainer.getBoundingClientRect().top;
  const headerHeight = resolveHeaderHeightInContainer(
    scrollContainer,
    headerSelector,
  );
  const rect = indicator.getBoundingClientRect();
  const isSticky = rect.top - containerTop <= headerHeight + 1;
  if (!isSticky) return 0;

  const headerBar = indicator.querySelector<HTMLElement>(".toc-mobile-header");
  return headerBar?.offsetHeight ?? 0;
}

function isMobileTocViewport(): boolean {
  return window.matchMedia(MOBILE_TOC_MQL).matches;
}

export interface TocScrollSyncOptions {
  scrollContainer: ScrollContainer;
  articleSelector: string;
  headingSelector: string;
  headerSelector: string;
}

export interface TocScrollSync {
  activeId: Accessor<string>;
  setActiveId: Setter<string>;
  /** 跳转时锁定滚动同步，并立即写入目标 item.key */
  beginGoto: (activeKey: string) => void;
  stop: () => void;
  resume: () => void;
  refresh: () => void;
  dispose: () => void;
}

/**
 * 大小屏共享的 TOC 滚动同步：单一监听、单一 activeId。
 * 高亮判定偏移：容器内 header +（小屏 sticky 时 TOC bar）+ VERTICAL_PADDING。
 * 跳转偏移由各 TableOfContents 的 callbackHeadersHeight + offset 单独计算。
 */
export function createTocScrollSync(
  options: TocScrollSyncOptions,
): TocScrollSync {
  const [activeId, setActiveId] = createSignal("");
  let isScrollingToHeading = false;
  let stopSync = false;
  let gotoUnlockTimer: ReturnType<typeof setTimeout> | undefined;
  let tocItems: TocItem[] = [];

  const loadTocItems = () => {
    const article = document.querySelector<HTMLElement>(options.articleSelector);
    tocItems = parseTocItems(article, options.headingSelector);
  };

  const getSpyOffset = () => {
    const base = resolveHeaderHeightInContainer(
      options.scrollContainer,
      options.headerSelector,
    );
    const mobileBar = isMobileTocViewport()
      ? getMobileTocBarHeight(options.scrollContainer, options.headerSelector)
      : 0;
    return base + mobileBar + VERTICAL_PADDING;
  };

  const refresh = () => {
    if (isScrollingToHeading || stopSync) return;

    const article = document.querySelector<HTMLElement>(options.articleSelector);
    if (!article) return;

    loadTocItems();
    if (tocItems.length === 0) {
      setActiveId("");
      return;
    }

    const nextActiveKey = resolveActiveHeadingKey(
      tocItems,
      article,
      options.headingSelector,
      options.scrollContainer,
      getSpyOffset(),
    );
    setActiveId(nextActiveKey);
  };

  const beginGoto = (activeKey: string) => {
    if (gotoUnlockTimer) {
      clearTimeout(gotoUnlockTimer);
    }
    isScrollingToHeading = true;
    setActiveId(activeKey);
    gotoUnlockTimer = setTimeout(() => {
      isScrollingToHeading = false;
      gotoUnlockTimer = undefined;
      refresh();
    }, 1000);
  };

  let ticking = false;
  const handleScroll = () => {
    if (stopSync) return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        refresh();
        ticking = false;
      });
      ticking = true;
    }
  };

  const scrollEl = options.scrollContainer;
  const isDocScrollRoot =
    scrollEl instanceof HTMLElement &&
    (scrollEl === document.documentElement || scrollEl === document.body);

  if (isDocScrollRoot) {
    window.addEventListener("scroll", handleScroll, { passive: true });
  } else {
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
  }

  const mobileMql = window.matchMedia(MOBILE_TOC_MQL);
  const handleViewportChange = () => refresh();
  mobileMql.addEventListener("change", handleViewportChange);

  loadTocItems();
  refresh();

  const dispose = () => {
    if (gotoUnlockTimer) {
      clearTimeout(gotoUnlockTimer);
    }
    if (isDocScrollRoot) {
      window.removeEventListener("scroll", handleScroll);
    } else {
      scrollEl.removeEventListener("scroll", handleScroll);
    }
    mobileMql.removeEventListener("change", handleViewportChange);
  };

  return {
    activeId,
    setActiveId,
    beginGoto,
    stop: () => {
      stopSync = true;
      setActiveId("");
    },
    resume: () => {
      stopSync = false;
    },
    refresh,
    dispose,
  };
}
