import type { MenuItem } from "./nav_menu";

function findDeepestActiveInSubtree(items: MenuItem[]): MenuItem | null {
  let result: MenuItem | null = null;
  let maxDepth = -1;

  function walk(menuItems: MenuItem[], depth: number) {
    for (const item of menuItems) {
      if (item.active && depth > maxDepth) {
        maxDepth = depth;
        result = item;
      }
      if (item.children?.length) {
        walk(item.children, depth + 1);
      }
    }
  }

  walk(items, 0);
  return result;
}

/** 有子项命中当前页时，将父项展示文字替换为最深 active 子项的 text */
export function applyDerivedLabels(items: MenuItem[]): void {
  for (const item of items) {
    if (item.reflectActiveChild && item.children?.length) {
      const activeChild = findDeepestActiveInSubtree(item.children);
      if (activeChild) {
        item.text = activeChild.text;
      }
    }
    if (item.children?.length) {
      applyDerivedLabels(item.children);
    }
  }
}

export function isItemHighlighted(item: MenuItem, isOpen = false): boolean {
  return isOpen || (item.active === true && !item.noHighlight);
}

/** 将 YAML snake_case 或 camelCase 配置字段规范为 MenuItem 扩展字段 */
export function normalizeMenuContext(
  raw: Record<string, unknown>,
): Partial<MenuItem> {
  const result: Partial<MenuItem> = {};

  const startIcon = raw.startIcon ?? raw.start_icon;
  if (startIcon !== undefined && startIcon !== null && startIcon !== "") {
    result.startIcon = String(startIcon);
  }

  const endIcon = raw.endIcon ?? raw.end_icon;
  if (endIcon !== undefined && endIcon !== null && endIcon !== "") {
    result.endIcon = String(endIcon);
  }

  const noHighlight = raw.noHighlight ?? raw.no_highlight;
  if (noHighlight !== undefined) {
    result.noHighlight = Boolean(noHighlight);
  }

  const reflectActiveChild = raw.reflectActiveChild ?? raw.reflect_active_child;
  if (reflectActiveChild !== undefined) {
    result.reflectActiveChild = Boolean(reflectActiveChild);
  }

  return result;
}

/** SSR NavItem → data-nav-menu-context（camelCase） */
export function navItemToContext(
  item: Record<string, unknown>,
): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};
  const normalized = normalizeMenuContext(item);
  if (normalized.startIcon) ctx.startIcon = normalized.startIcon;
  if (normalized.endIcon) ctx.endIcon = normalized.endIcon;
  if (normalized.noHighlight) ctx.noHighlight = true;
  if (normalized.reflectActiveChild) ctx.reflectActiveChild = true;
  return ctx;
}
