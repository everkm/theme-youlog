import { render } from "solid-js/web";
import { EVENT_PAGE_LOADED } from "../page-ajax/constants";
import { FloatingMenu } from "./FloatingMenu";
import { MobileNavController } from "./MobileNavController";
import { applyDerivedLabels, normalizeMenuContext } from "./menuItemDerived";
import { applyActiveState } from "./navMenuActiveState";

export interface MenuItem {
  text: string;
  link: string;
  newWindow: boolean;
  active: boolean;
  children?: MenuItem[];
  startIcon?: string;
  endIcon?: string;
  noHighlight?: boolean;
  reflectActiveChild?: boolean;
  matchChildrenPrefix?: boolean;
  [key: string]: unknown;
}

function parseMenuData(navElement: HTMLElement | null): MenuItem[] {
  if (!navElement) return [];
  const rootUl =
    navElement.querySelector('[data-role="nav-menu"] ul') ??
    navElement.querySelector("ul");
  if (!rootUl) return [];
  const items = parseMenuItems(rootUl as HTMLElement);
  applyActiveState(items, window.location.href);
  applyDerivedLabels(items);
  return items;
}

function parseMenuItems(ul: HTMLElement): MenuItem[] {
  const items: MenuItem[] = [];
  const listItems = ul.querySelectorAll(":scope > li");

  listItems.forEach((li) => {
    const link = li.querySelector(":scope > a");
    if (!link) return;

    const href = link.getAttribute("href") || "#";
    const text = link.textContent?.trim() || "";

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
      ...normalizeMenuContext(context),
      text,
      link: href,
      newWindow: link.getAttribute("target") === "_blank",
      active: false,
    };

    const subUl = li.querySelector(":scope > ul");
    if (subUl) {
      item.children = parseMenuItems(subUl as HTMLElement);
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
    return;
  }
  mobileMenuContainer.innerHTML = "";
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
    return;
  }

  navContainer.classList.remove("invisible");

  let menuData = parseMenuData(navContainer);
  if (options.menuItemsProcessor) {
    menuData = options.menuItemsProcessor(menuData);
  }

  createNavMenu(navContainer, menuData, options.mobileMenuContainerSelector);
}

const HEADER_NAV_SELECTOR = "#header-nav";

function mountNavMenu(options: NavMenuOptions = {}): void {
  const navContainer = document.querySelector(
    HEADER_NAV_SELECTOR,
  ) as HTMLElement | null;
  if (!navContainer) {
    return;
  }
  initNavMenu(navContainer, options);
}

let navMenuInstalled = false;

function installNavMenu(options: NavMenuOptions = {}): void {
  mountNavMenu(options);

  if (navMenuInstalled) {
    return;
  }
  navMenuInstalled = true;

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    mountNavMenu(options);
  });
}

export { createNavMenu, initNavMenu, installNavMenu };
export type { NavMenuOptions };
