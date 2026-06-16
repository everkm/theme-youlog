import {
  NAV_TREE_FINGERPRINT_ATTR,
  NAV_TREE_SOURCE_MARKUP_ATTR,
  NAV_TREE_SOURCE_TEXT_ATTR,
} from "./constants";

export function getNavFingerprint(el: Element): string {
  return el.getAttribute(NAV_TREE_FINGERPRINT_ATTR) || "";
}

export function normalizeNavText(el: Element | string): string {
  if (typeof el === "string") {
    const tmp = document.createElement("div");
    tmp.innerHTML = el;
    return (tmp.textContent || "").replace(/\s+/g, " ").trim();
  }
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

/** 采集容器内尚未转换的 ul/ol 源 markup */
export function captureRawNavMarkup(container: HTMLElement): string {
  const lists = container.querySelectorAll(":scope > ul, :scope > ol");
  return Array.from(lists)
    .map((el) => el.outerHTML)
    .join("")
    .trim();
}

export function markNavTreeSource(
  container: HTMLElement,
  markup: string,
): void {
  const trimmed = markup.trim();
  container.setAttribute(NAV_TREE_SOURCE_MARKUP_ATTR, trimmed);
  container.setAttribute(NAV_TREE_SOURCE_TEXT_ATTR, normalizeNavText(trimmed));
}

export function hasNavTreeUi(container: Element): boolean {
  return !!container.querySelector(":scope > .nav-tree-container");
}

/**
 * 判断侧栏导航树 SSR 源是否变化。
 * - fingerprint（nav 路径）不同 → 更新
 * - 已挂载交互树 → 比较规范化文本，避免 HTML 引号差异误触发重建
 * - 未挂载 → 比较缓存的源 markup
 */
export function navTreeNeedsUpdate(current: Element, next: Element): boolean {
  const nextFp = getNavFingerprint(next);
  const currentFp = getNavFingerprint(current);
  if (nextFp !== currentFp) return true;

  const nextText = normalizeNavText(next);

  if (hasNavTreeUi(current)) {
    const storedText = current.getAttribute(NAV_TREE_SOURCE_TEXT_ATTR);
    if (storedText !== null && storedText === nextText) return false;
    // 尚无文本缓存时信任 fingerprint，避免同 nav 切换闪烁
    if (storedText === null) return false;
    return storedText !== nextText;
  }

  const nextMarkup = next.innerHTML.trim();
  const storedMarkup = current.getAttribute(NAV_TREE_SOURCE_MARKUP_ATTR);
  if (storedMarkup !== null && storedMarkup === nextMarkup) return false;

  return storedMarkup !== nextMarkup;
}
