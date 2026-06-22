import {
  isNavUrlMatch,
  normalizePathname,
} from "../nav-tree/navTreeUrl";

/** 尾斜杠目录规范为 `…/index.html`，用于最长匹配比较。 */
export function toComparePath(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === "/") {
    return "/index.html";
  }
  if (normalized.endsWith("/")) {
    return `${normalized}index.html`;
  }
  return normalized;
}

function resolveNavUrl(href: string, origin: string): URL {
  return new URL(href, origin);
}

function isRootNavPath(pathname: string): boolean {
  return normalizePathname(pathname) === "/";
}

/**
 * 判断顶栏导航项是否与当前地址匹配。
 * - 相对/绝对链接均先 resolve 为绝对 URL 再比较
 * - 首页 `/` 仅精确匹配 `/` 与 `/index.html`，不做前缀匹配
 * - 其它目录项（尾斜杠）可前缀匹配子路径
 */
export function isNavMenuUrlMatch(
  currentUrl: string,
  targetUrl: string,
  origin = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
): boolean {
  if (isNavUrlMatch(currentUrl, targetUrl)) {
    return true;
  }

  try {
    const current = resolveNavUrl(currentUrl, origin);
    const target = resolveNavUrl(targetUrl, origin);

    if (current.origin !== target.origin) {
      return false;
    }

    const targetPath = normalizePathname(target.pathname);
    if (isRootNavPath(targetPath)) {
      return false;
    }

    if (!targetPath.endsWith("/")) {
      return false;
    }

    const currentPath = normalizePathname(current.pathname);
    return (
      currentPath === targetPath || currentPath.startsWith(targetPath)
    );
  } catch {
    return false;
  }
}

/** 在候选链接中选出与当前地址最长匹配的一项（相对/绝对均可）。 */
export function findBestMatchingHref(
  currentUrl: string,
  hrefs: string[],
  origin = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
): string | null {
  let best: string | null = null;
  let bestLen = -1;

  for (const href of hrefs) {
    if (!href || href === "#") continue;
    if (!isNavMenuUrlMatch(currentUrl, href, origin)) continue;

    try {
      const len = toComparePath(resolveNavUrl(href, origin).pathname).length;
      if (len > bestLen) {
        bestLen = len;
        best = href;
      }
    } catch {
      // ignore invalid href
    }
  }

  return best;
}

/**
 * 两导航链接是否指向同一页面（含 `/` ↔ `/index.html` 等价，不含目录前缀）。
 * 用于在已选出 bestLink 后，标记与之等价的其它菜单项（如 Home `/` 与 English `/index.html`）。
 */
export function isEquivalentNavLink(
  a: string,
  b: string,
  origin = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
): boolean {
  return isNavUrlMatch(a, b, origin);
}

export function isSameNavLink(
  a: string,
  b: string,
  origin = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
): boolean {
  try {
    return resolveNavUrl(a, origin).href === resolveNavUrl(b, origin).href;
  } catch {
    return a === b;
  }
}
