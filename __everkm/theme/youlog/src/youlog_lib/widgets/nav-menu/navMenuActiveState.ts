import type { MenuItem } from "./nav_menu";
import { findBestMatchingHref, isEquivalentNavLink } from "./navMenuUrl";

function collectMenuLinks(items: MenuItem[]): string[] {
  const links: string[] = [];
  for (const item of items) {
    if (item.link && item.link !== "#") {
      links.push(item.link);
    }
    if (item.children) {
      links.push(...collectMenuLinks(item.children));
    }
  }
  return links;
}

function collectDirectChildLinks(children: MenuItem[]): string[] {
  return children
    .map((child) => child.link)
    .filter((link): link is string => Boolean(link && link !== "#"));
}

function applyChildPrefixMatchState(
  items: MenuItem[],
  currentUrl: string,
  origin: string,
): void {
  for (const item of items) {
    if (item.matchChildrenPrefix && item.children?.length) {
      const bestChildLink = findBestMatchingHref(
        currentUrl,
        collectDirectChildLinks(item.children),
        origin,
        { allowRootPrefix: true },
      );

      if (bestChildLink !== null) {
        for (const child of item.children) {
          if (isEquivalentNavLink(child.link, bestChildLink, origin)) {
            child.active = true;
          }
        }
        item.active = true;
      }
    }

    if (item.children?.length) {
      applyChildPrefixMatchState(item.children, currentUrl, origin);
    }
  }
}

/** 阶段 1：全局严格匹配；阶段 2：`matchChildrenPrefix` 父项子树内放宽前缀（不向外等价传染）。 */
export function applyActiveState(
  items: MenuItem[],
  currentUrl: string,
  origin = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
): void {
  const bestLink = findBestMatchingHref(
    currentUrl,
    collectMenuLinks(items),
    origin,
  );

  function walk(menuItems: MenuItem[]): boolean {
    let anyActive = false;
    for (const item of menuItems) {
      const selfActive =
        bestLink !== null && isEquivalentNavLink(item.link, bestLink, origin);
      const childActive = item.children ? walk(item.children) : false;
      item.active = selfActive || childActive;
      if (item.active) anyActive = true;
    }
    return anyActive;
  }

  walk(items);
  applyChildPrefixMatchState(items, currentUrl, origin);
}
