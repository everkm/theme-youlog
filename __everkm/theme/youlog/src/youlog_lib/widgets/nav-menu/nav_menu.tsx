import { onMount } from "solid-js";
import { render } from "solid-js/web";
import { FloatingMenu } from "./FloatingMenu";
import { MobileNavController } from "./MobileNavController";

export interface MenuItem {
  text: string;
  link: string;
  newWindow: boolean;
  active: boolean;
  children?: MenuItem[];
  [key: string]: unknown;
}

function parseMenuData(navElement: HTMLElement | null): MenuItem[] {
  if (!navElement) return [];
  const rootUl = navElement.querySelector("ul");
  if (!rootUl) return [];
  return parseMenuItems(rootUl as HTMLElement);
}

function parseMenuItems(ul: HTMLElement): MenuItem[] {
  const items: MenuItem[] = [];
  const currentPath = window.location.pathname;
  const listItems = ul.querySelectorAll(":scope > li");

  listItems.forEach((li) => {
    const link = li.querySelector(":scope > a");
    if (!link) return;

    const href = link.getAttribute("href") || "#";
    const text = link.textContent?.trim() || "";
    const isActive =
      currentPath === href ||
      (href !== "/" && currentPath.startsWith(href + "/"));

    let context: Record<string, unknown> = {};
    const contextAttr = link.getAttribute("data-nav-menu-context");
    if (contextAttr) {
      try {
        context = JSON.parse(contextAttr) ?? {};
      } catch {
        // ignore
      }
    }

    const item: MenuItem = {
      ...context,
      text,
      link: href,
      newWindow: link.getAttribute("target") === "_blank",
      active: isActive,
    };

    const subUl = li.querySelector(":scope > ul");
    if (subUl) {
      item.children = parseMenuItems(subUl as HTMLElement);
      if (
        item.children.some(
          (child) =>
            child.active ||
            (child.children && child.children.some((c) => c.active)),
        )
      ) {
        item.active = true;
      }
    }
    items.push(item);
  });
  return items;
}

function initDesktopMenu(
  navContainer: HTMLElement,
  menuData: MenuItem[],
): void {
  const container = document.createElement("div");
  container.className = "solid-menu-container";
  navContainer.innerHTML = "";
  navContainer.appendChild(container);
  render(() => <FloatingMenu items={menuData} />, container);
}

function initMobileMenu(
  mobileMenuContainerSelector: string,
  menuData: MenuItem[],
): void {
  const mobileMenuContainer = document.querySelector(
    mobileMenuContainerSelector,
  );
  if (!mobileMenuContainer) {
    console.error("nav_menu: mobileMenuContainer is required");
    return;
  }
  render(
    () => <MobileNavController menuData={menuData} />,
    mobileMenuContainer,
  );
}

function createNavMenu(
  navContainer: HTMLElement,
  menuData: MenuItem[],
  mobileMenuContainerSelector?: string,
): void {
  initDesktopMenu(navContainer, menuData);

  if (mobileMenuContainerSelector) {
    initMobileMenu(mobileMenuContainerSelector, menuData);
  }
}

interface NavMenuOptions {
  menuItemsProcessor?: (menuItems: MenuItem[]) => MenuItem[];
  mobileMenuContainerSelector?: string;
}

function initNavMenu(
  navContainer: HTMLElement,
  options: NavMenuOptions = {},
): void {
  if (!navContainer) {
    console.error("nav_menu: navContainer is required");
    return;
  }

  navContainer.classList.remove("invisible");

  let menuData = parseMenuData(navContainer);
  if (options.menuItemsProcessor) {
    menuData = options.menuItemsProcessor(menuData);
  }

  createNavMenu(navContainer, menuData, options.mobileMenuContainerSelector);
}

export { createNavMenu, initNavMenu };
export type { NavMenuOptions };
