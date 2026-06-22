function normalizeHash(hash: string): string {
  if (!hash) return "";
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** 目录首页等价：仅 `/a/index.html` 与 `/a/` 互认；无尾斜杠的 `/a` 不参与等价。 */
export function normalizePathname(pathname: string): string {
  if (pathname.endsWith("/index.html")) {
    return pathname.slice(0, -"/index.html".length) + "/";
  }
  return pathname;
}

/**
 * 判断导航链接是否与当前地址匹配（含 hash / search）。
 * pathname 一致时：导航项带 hash 则要求 hash 一致；导航项无 hash 则视为页面级链接（当前 URL 可带任意 hash）。
 */
export function isNavUrlMatch(
  currentUrl: string,
  targetUrl: string,
  origin?: string,
): boolean {
  try {
    const resolvedOrigin =
      origin ??
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost");
    const current = new URL(currentUrl, resolvedOrigin);
    const target = new URL(targetUrl, resolvedOrigin);

    if (
      current.origin !== target.origin ||
      normalizePathname(current.pathname) !== normalizePathname(target.pathname) ||
      current.search !== target.search
    ) {
      return false;
    }

    if (target.hash) {
      return normalizeHash(current.hash) === normalizeHash(target.hash);
    }

    return true;
  } catch {
    return false;
  }
}
