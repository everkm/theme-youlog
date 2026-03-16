import type { MenuItem } from "../youlog_lib/widgets/nav-menu/nav_menu";

function getHtmlLangCode(): string | null {
  if (typeof document === "undefined") return null;
  const lang = document.documentElement.lang || "";
  if (!lang) return null;
  return lang.toLowerCase() || null;
}

function getRelativePathByActivePrefix(
  currentPath: string,
  activePrefix: string | undefined,
): string {
  if (!activePrefix || activePrefix === "/") return currentPath;

  // 统一以 / 结尾的前缀
  let base = activePrefix;
  if (!base.endsWith("/")) {
    base = `${base}/`;
  }

  // 完全相同，认为在语言根路径
  if (currentPath === base || currentPath === base.slice(0, -1)) {
    return "/";
  }

  // 使用当前 active 语言的 link 作为前缀做去重
  if (currentPath.startsWith(base)) {
    // 保留一个开头的 /
    return currentPath.slice(base.length - 1);
  }

  return currentPath;
}

function joinBaseAndSuffix(base: string, suffix: string): string {
  if (!suffix || suffix === "/") return base;

  const hasTrailingSlash = base.endsWith("/");
  const hasLeadingSlash = suffix.startsWith("/");

  if (hasTrailingSlash && hasLeadingSlash) {
    return base + suffix.slice(1);
  }

  if (!hasTrailingSlash && !hasLeadingSlash) {
    return `${base}/${suffix}`;
  }

  return base + suffix;
}

function convertLinkWithCurrentLocation(items: MenuItem[]): MenuItem[] {
  if (typeof window === "undefined") return items;

  const langCode = getHtmlLangCode();
  if (!langCode || items.length === 0) return items;

  const clonedItems = items.map((item) => ({ ...item }));
  const lastIndex = clonedItems.length - 1;
  const lastItem = clonedItems[lastIndex];

  if (!lastItem || !lastItem.children || lastItem.children.length === 0) {
    return clonedItems;
  }

  const currentPath = window.location.pathname;

  // 处理最后一个元素（语言切换）子数组
  const children = lastItem.children.map((child) => ({ ...child }));

  // 先根据 html.lang 设置当前 active 子项
  let activeChildIndex = children.findIndex(
    (child) =>
      typeof child.code === "string" &&
      (child.code as string).toLowerCase() === langCode,
  );

  if (activeChildIndex === -1) {
    return items;
  }

  const activeChild = children[activeChildIndex];
  const activePrefix = activeChild?.link ?? "/";

  const relativePath = getRelativePathByActivePrefix(currentPath, activePrefix);

  const processedChildren = children.map((child, index) => {
    const isActive = index === activeChildIndex;

    return {
      ...child,
      active: isActive,
      link: joinBaseAndSuffix(child.link, relativePath),
    };
  });

  clonedItems[lastIndex] = {
    ...lastItem,
    children: processedChildren,
    // 只要子项有 active，则父项也标记为 active
    active: processedChildren.some((c) => c.active),
  };

  // console.log("clonedItems", JSON.stringify(clonedItems, null, 2));

  return clonedItems;
}

export { convertLinkWithCurrentLocation };
