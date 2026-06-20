import type { ScrollContainer } from "../../core/scrollAnchor";
import { VERTICAL_PADDING } from "./tocParsing";

export const TOC_SCROLL_INTO_VIEW_MARGIN = 10;

export function resolveScrollportHeight(scrollContainer: ScrollContainer): number {
  if (scrollContainer instanceof Window) {
    return window.innerHeight;
  }
  return scrollContainer.clientHeight;
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

/** 将桌面端 sticky TOC 限制在滚动容器视口内，返回计算后的 max-height（px） */
export function syncTocContainerMaxHeight(
  tocContainer: HTMLElement,
  scrollContainer: ScrollContainer,
  bottomPadding = VERTICAL_PADDING,
): number {
  const maxHeight = resolveTocMaxHeight(
    resolveScrollportHeight(scrollContainer),
    resolveTocStickyTopPx(tocContainer),
    bottomPadding,
  );

  if (maxHeight > 0) {
    tocContainer.style.maxHeight = `${maxHeight}px`;
  } else {
    tocContainer.style.removeProperty("max-height");
  }

  return maxHeight;
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
