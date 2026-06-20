import type { ScrollContainer } from "../../core/scrollAnchor";
import { VERTICAL_PADDING } from "./tocParsing";

export const TOC_SCROLL_INTO_VIEW_MARGIN = 10;

function isViewportScrollRoot(scrollContainer: ScrollContainer): boolean {
  if (scrollContainer instanceof Window) {
    return true;
  }
  return (
    scrollContainer === document.documentElement ||
    scrollContainer === document.body ||
    scrollContainer === document.scrollingElement
  );
}

export function resolveScrollportHeight(scrollContainer: ScrollContainer): number {
  if (isViewportScrollRoot(scrollContainer)) {
    return window.innerHeight;
  }
  return scrollContainer.clientHeight;
}

export function resolveScrollportTop(scrollContainer: ScrollContainer): number {
  if (isViewportScrollRoot(scrollContainer)) {
    return 0;
  }
  return scrollContainer.getBoundingClientRect().top;
}

export function resolveTocStickyTopPx(tocContainer: HTMLElement): number {
  const top = getComputedStyle(tocContainer).top;
  if (!top || top === "auto") {
    return 0;
  }
  const parsed = parseFloat(top);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveTocMaxHeight(
  scrollportHeight: number,
  stickyTopPx: number,
  bottomPadding = VERTICAL_PADDING,
): number {
  return Math.max(0, scrollportHeight - stickyTopPx - bottomPadding);
}

/** 元素相对滚动视口顶部的实际偏移（用于小屏 TOC 未吸顶时的限高） */
export function resolveTocViewportTopPx(
  tocElement: HTMLElement,
  scrollContainer: ScrollContainer,
): number {
  return (
    tocElement.getBoundingClientRect().top - resolveScrollportTop(scrollContainer)
  );
}

function resolveTocMaxHeightOffsetPx(
  tocContainer: HTMLElement,
  scrollContainer: ScrollContainer,
): number {
  if (isMobileTocExpanded(tocContainer)) {
    return resolveTocViewportTopPx(tocContainer, scrollContainer);
  }
  return resolveTocStickyTopPx(resolveTocStickyTopHost(tocContainer));
}

export function isMobileTocExpanded(indicator: HTMLElement): boolean {
  return (
    indicator.classList.contains("toc-mobile-indicator") &&
    indicator.classList.contains("toc-expanded")
  );
}

export function resolveMobileTocStickyHost(): HTMLElement | null {
  return document.getElementById("mobile-toc-indicator");
}

/** 桌面 sticky 或小屏展开态 TOC 需要限高 */
export function shouldLimitTocContainerHeight(container: HTMLElement): boolean {
  return (
    container.classList.contains("lg:sticky") || isMobileTocExpanded(container)
  );
}

function resolveTocStickyTopHost(tocContainer: HTMLElement): HTMLElement {
  if (isMobileTocExpanded(tocContainer)) {
    return resolveMobileTocStickyHost() ?? tocContainer;
  }
  return tocContainer;
}

/** 将 sticky / 小屏展开 TOC 限制在滚动容器视口内，返回计算后的 max-height（px） */
export function syncTocContainerMaxHeight(
  tocContainer: HTMLElement,
  scrollContainer: ScrollContainer,
  bottomPadding = VERTICAL_PADDING,
): number {
  const maxHeight = resolveTocMaxHeight(
    resolveScrollportHeight(scrollContainer),
    resolveTocMaxHeightOffsetPx(tocContainer, scrollContainer),
    bottomPadding,
  );

  if (maxHeight > 0) {
    tocContainer.style.maxHeight = `${maxHeight}px`;
  } else {
    tocContainer.style.removeProperty("max-height");
  }

  return maxHeight;
}

/** 页面滚动时间步更新 TOC 布局（展开态限高随 bar 位置变化） */
export function bindScrollportScroll(
  scrollContainer: ScrollContainer,
  onScroll: () => void,
): () => void {
  let ticking = false;
  const handleScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  };

  const isDocScrollRoot =
    scrollContainer instanceof Window || isViewportScrollRoot(scrollContainer);

  if (isDocScrollRoot) {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }

  scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
  return () => scrollContainer.removeEventListener("scroll", handleScroll);
}

/** 容器内容是否超出可视高度，存在可滚动范围 */
export function hasTocScrollRange(
  scrollContainer: HTMLElement,
  epsilon = 1,
): boolean {
  return (
    scrollContainer.scrollHeight - scrollContainer.clientHeight > epsilon
  );
}

/** 根据是否有滚动范围同步 overscroll-behavior（与 wheel/touch 拦截条件一致） */
export function syncTocOverscrollBehavior(scrollContainer: HTMLElement): void {
  if (hasTocScrollRange(scrollContainer)) {
    scrollContainer.style.overscrollBehavior = "contain";
  } else {
    scrollContainer.style.removeProperty("overscroll-behavior");
  }
}

/** 阻止 TOC 内部滚动在边界处传导到页面（wheel / touch）；无滚动范围时不拦截 */
export function bindTocScrollContainment(
  scrollContainer: HTMLElement,
): () => void {
  const sync = () => syncTocOverscrollBehavior(scrollContainer);

  sync();

  let resizeObserver: ResizeObserver | undefined;
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(scrollContainer);
  }

  const mutationObserver = new MutationObserver(sync);
  mutationObserver.observe(scrollContainer, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  const onWheel = (e: WheelEvent) => {
    if (!hasTocScrollRange(scrollContainer)) {
      sync();
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
    }
  };

  let touchStartY = 0;
  const onTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!hasTocScrollRange(scrollContainer)) {
      sync();
      return;
    }

    const touchY = e.touches[0]?.clientY;
    if (touchY === undefined) return;

    const deltaY = touchStartY - touchY;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
      e.preventDefault();
    }
  };

  scrollContainer.addEventListener("wheel", onWheel, { passive: false });
  scrollContainer.addEventListener("touchstart", onTouchStart, {
    passive: true,
  });
  scrollContainer.addEventListener("touchmove", onTouchMove, { passive: false });

  return () => {
    resizeObserver?.disconnect();
    mutationObserver.disconnect();
    scrollContainer.style.removeProperty("overscroll-behavior");
    scrollContainer.removeEventListener("wheel", onWheel);
    scrollContainer.removeEventListener("touchstart", onTouchStart);
    scrollContainer.removeEventListener("touchmove", onTouchMove);
  };
}

/**
 * 在 TOC 内部滚动容器内保证活跃项可见。
 * 使用 scrollTop/clientHeight，避免容器未限高时 getBoundingClientRect 误判。
 */
export function scrollActiveTocLinkIntoView(
  tocContainer: HTMLElement,
  activeLink: HTMLElement,
  margin = TOC_SCROLL_INTO_VIEW_MARGIN,
): void {
  const linkTop =
    activeLink.getBoundingClientRect().top -
    tocContainer.getBoundingClientRect().top +
    tocContainer.scrollTop;
  const linkBottom = linkTop + activeLink.offsetHeight;
  const viewTop = tocContainer.scrollTop;
  const viewBottom = viewTop + tocContainer.clientHeight;

  if (linkTop < viewTop + margin) {
    tocContainer.scrollTop = linkTop - margin;
  } else if (linkBottom > viewBottom - margin) {
    tocContainer.scrollTop = linkBottom - tocContainer.clientHeight + margin;
  }
}
