/** 滚动目标：window 为整页滚动，否则为可滚动元素 */
export type ScrollContainer = Window | HTMLElement;

const DEFAULT_EXTRA_OFFSET = 16;
/** 超过约 0.75 屏高度时跳过平滑滚动，避免长距离动画 */
const INSTANT_SCROLL_VIEWPORT_RATIO = 0.75;

export function resolveScrollContainer(selector: string): ScrollContainer | null {
  const normalized = selector.trim().toLowerCase();

  if (normalized === "body" || normalized === "html") {
    return (
      (document.scrollingElement as HTMLElement | null) ||
      document.documentElement
    );
  }

  return document.querySelector<HTMLElement>(selector);
}

export function getScrollTop(target: ScrollContainer): number {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

export function parseTopbarHeight(): number {
  return (
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--topbar-height")
        .trim() || "0",
      10,
    ) || 0
  );
}

/**
 * 锚点滚动时顶部留白：滚动容器内有 sticky header 时计入其高度，否则仅保留少量间距。
 */
export function getAnchorScrollOffset(
  scrollContainer: ScrollContainer,
  extraOffset = DEFAULT_EXTRA_OFFSET,
): number {
  if (scrollContainer instanceof Window) {
    return parseTopbarHeight() + extraOffset;
  }

  const header = scrollContainer.querySelector<HTMLElement>("header");
  if (header) {
    return header.offsetHeight + extraOffset;
  }

  return extraOffset;
}

export function resolveAnchorTarget(
  idOrHash: string,
  root: ParentNode = document,
): HTMLElement | null {
  const id = idOrHash.replace(/^#/, "").trim();
  if (!id) return null;

  const byId = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (byId) return byId;

  const anchors = root.querySelectorAll<HTMLAnchorElement>("a.heading-anchor");
  for (const anchor of Array.from(anchors)) {
    if (anchor.getAttribute("name") === id) {
      return anchor;
    }
  }

  return null;
}

/** 计算将 target 滚入 scrollContainer 视口顶部（扣除 offset）所需的 scrollTop */
export function computeScrollTopForElement(
  target: HTMLElement,
  scrollContainer: ScrollContainer,
  offset: number,
): number {
  const targetRect = target.getBoundingClientRect();

  if (scrollContainer instanceof Window) {
    return Math.max(0, getScrollTop(scrollContainer) + targetRect.top - offset);
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  return Math.max(
    0,
    scrollContainer.scrollTop + (targetRect.top - containerRect.top) - offset,
  );
}

export function chooseScrollBehavior(
  distance: number,
  viewportHeight: number,
): ScrollBehavior {
  return distance > viewportHeight * INSTANT_SCROLL_VIEWPORT_RATIO
    ? "auto"
    : "smooth";
}

export interface ScrollToAnchorOptions {
  offset?: number;
  /** auto：按距离智能选择；其余值强制指定 */
  behavior?: ScrollBehavior | "auto";
}

export function scrollToElement(
  target: HTMLElement,
  scrollContainer: ScrollContainer,
  options: ScrollToAnchorOptions = {},
): void {
  const offset =
    options.offset ?? getAnchorScrollOffset(scrollContainer, DEFAULT_EXTRA_OFFSET);
  const nextTop = computeScrollTopForElement(target, scrollContainer, offset);
  const currentTop = getScrollTop(scrollContainer);
  const distance = Math.abs(nextTop - currentTop);
  const behavior =
    options.behavior === "auto" || options.behavior === undefined
      ? chooseScrollBehavior(distance, window.innerHeight)
      : options.behavior;

  scrollContainer.scrollTo({ top: nextTop, behavior });
}

export function scrollToHash(
  hash: string,
  scrollContainer: ScrollContainer,
  options: ScrollToAnchorOptions = {},
  root: ParentNode = document,
): boolean {
  const target = resolveAnchorTarget(hash, root);
  if (!target) return false;
  scrollToElement(target, scrollContainer, options);
  return true;
}

export function scrollContainerToTop(
  scrollContainer: ScrollContainer,
  behavior: ScrollBehavior = "smooth",
): void {
  scrollContainer.scrollTo({ top: 0, behavior });
}

export function getHashFromUrl(url: string): string {
  try {
    return new URL(url, window.location.href).hash.replace(/^#/, "");
  } catch {
    const hashIndex = url.indexOf("#");
    return hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  }
}
