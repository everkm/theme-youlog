import type { MenuItem } from "./nav_menu";
import {
  findBestMatchingAmongCandidates,
  isEquivalentNavLink,
  isNavMenuUrlMatch,
  type NavMenuMatchOptions,
  resolveNavUrl,
  toComparePath,
} from "./navMenuUrl";

/** `exact_match` 优先于 `match_children_prefix` 子树内的放宽前缀。 */
export function matchOptionsForItem(
  item: Pick<MenuItem, "exactMatch">,
  inChildPrefixSubtree: boolean,
): NavMenuMatchOptions {
  if (item.exactMatch) {
    return { exactMatch: true };
  }
  if (inChildPrefixSubtree) {
    return { allowRootPrefix: true };
  }
  return {};
}

interface Phase1Result {
  bestLink: string | null;
  matchedItems: Set<MenuItem>;
}

function computePhase1Matches(
  items: MenuItem[],
  currentUrl: string,
  origin: string,
): Phase1Result {
  const matchedItems = new Set<MenuItem>();
  let bestLink: string | null = null;
  let bestLen = -1;

  function walk(menuItems: MenuItem[]) {
    for (const item of menuItems) {
      if (item.link && item.link !== "#") {
        const options = matchOptionsForItem(item, false);
        if (isNavMenuUrlMatch(currentUrl, item.link, origin, options)) {
          matchedItems.add(item);
          try {
            const len = toComparePath(
              resolveNavUrl(item.link, origin).pathname,
            ).length;
            if (len > bestLen) {
              bestLen = len;
              bestLink = item.link;
            }
          } catch {
            // ignore invalid href
          }
        }
      }
      if (item.children?.length) {
        walk(item.children);
      }
    }
  }

  walk(items);
  return { bestLink, matchedItems };
}

function applyChildPrefixMatchState(
  items: MenuItem[],
  currentUrl: string,
  origin: string,
): void {
  for (const item of items) {
    if (item.matchChildrenPrefix && item.children?.length) {
      const candidates = item.children
        .filter((child) => child.link && child.link !== "#")
        .map((child) => ({
          href: child.link,
          options: matchOptionsForItem(child, true),
        }));

      const bestChildLink = findBestMatchingAmongCandidates(
        currentUrl,
        candidates,
        origin,
      );

      if (bestChildLink !== null) {
        for (const child of item.children) {
          const options = matchOptionsForItem(child, true);
          if (
            isNavMenuUrlMatch(currentUrl, child.link, origin, options) &&
            isEquivalentNavLink(child.link, bestChildLink, origin)
          ) {
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

/** 阶段 1：按项匹配 + 最长竞争；阶段 2：`matchChildrenPrefix` 子树内放宽前缀。 */
export function applyActiveState(
  items: MenuItem[],
  currentUrl: string,
  origin = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
): void {
  const { bestLink, matchedItems } = computePhase1Matches(
    items,
    currentUrl,
    origin,
  );

  function walk(menuItems: MenuItem[]): boolean {
    let anyActive = false;
    for (const item of menuItems) {
      const selfActive =
        matchedItems.has(item) &&
        bestLink !== null &&
        isEquivalentNavLink(item.link, bestLink, origin);
      const childActive = item.children ? walk(item.children) : false;
      item.active = selfActive || childActive;
      if (item.active) anyActive = true;
    }
    return anyActive;
  }

  walk(items);
  applyChildPrefixMatchState(items, currentUrl, origin);
}
