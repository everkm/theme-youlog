import { EVENT_PAGE_LOADED } from "../page-ajax/constants";
import { NavTreeState } from "./NavTreeState";
import { NavTree } from "./NavTree";
import { render } from "solid-js/web";
import {
  MarkdownTreeParser,
  DEFAULT_MARKDOWN_RULE,
} from "./markdownTreeParser";

function log(message: string, ...args: any[]) {
  // console.log("sidebarNavTree2: " + message, ...args);
}

function error_log(message: string, ...args: any[]) {
  console.error("sidebarNavTree2: " + message, ...args);
}

function warn_log(message: string, ...args: any[]) {
  console.warn("sidebarNavTree2: " + message, ...args);
}

/**
 * DOM工具类
 */
class DOMUtils {
  static getCleanTextContent(element: Element): string {
    return element.textContent?.trim() || "";
  }

  static hasClass(element: Element, className: string): boolean {
    return element.classList.contains(className);
  }

  static getAttribute(
    element: Element,
    attributeName: string,
    defaultValue: string = "",
  ): string {
    return element.getAttribute(attributeName) || defaultValue;
  }
}

class BreadcrumbManager {
  static getBreadcrumbPath(
    breadcrumbRoot?: HTMLElement | null,
    titleSelector: string = "[data-nav-title]",
  ): string[] {
    const breadcrumb = breadcrumbRoot ?? document.getElementById("breadcrumb");
    if (!breadcrumb) return [];
    const navTitleElements = breadcrumb.querySelectorAll(titleSelector);
    return Array.from(navTitleElements)
      .map((el) => DOMUtils.getCleanTextContent(el))
      .filter((text) => text.length > 0);
  }

  static setupClickHandler(
    navTreeManager: NavTreeManager,
    breadcrumbRoot?: HTMLElement | null,
    titleSelector: string = "[data-nav-title]",
  ): void {
    const breadcrumb = breadcrumbRoot ?? document.getElementById("breadcrumb");
    if (!breadcrumb) {
      warn_log("breadcrumb element not found");
      return;
    }
    breadcrumb.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      log("breadcrumb click, target:", target);
      const parentA = target.closest("a");
      if (!(parentA && parentA.href.startsWith("javascript:"))) return;
      try {
        const breadcrumbPath = this.getBreadcrumbPath(
          breadcrumbRoot,
          titleSelector,
        );
        if (breadcrumbPath.length === 0) {
          warn_log("breadcrumb path is empty");
          return;
        }
        const clickedNavTitle = target.matches(titleSelector)
          ? target
          : (target.closest(titleSelector) as HTMLElement | null);
        if (!clickedNavTitle) return;
        const clickedText = DOMUtils.getCleanTextContent(clickedNavTitle);
        if (!clickedText) return;
        const clickedIndex = breadcrumbPath.findIndex(
          (text) => text === clickedText,
        );
        if (clickedIndex === -1) return;
        const pathToCurrent = breadcrumbPath.slice(0, clickedIndex + 1);
        log("breadcrumb click, path to current:", pathToCurrent);
        navTreeManager.toggleByTextPath(pathToCurrent);
      } catch (error) {
        error_log("breadcrumb click handler error:", error);
      }
    });
  }
}

class TreeStructureValidator {
  static validateTreeStructure(element: HTMLElement): string {
    if (!DEFAULT_MARKDOWN_RULE.rootTags.includes(element.tagName)) {
      return `Element must be ${DEFAULT_MARKDOWN_RULE.rootTags
        .join(" or ")
        .toLowerCase()}, but got ${element.tagName}`;
    }
    if (element.children.length === 0) return "List element cannot be empty";
    const children = Array.from(element.children);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName !== DEFAULT_MARKDOWN_RULE.itemTag) {
        return `The ${i + 1}th child element must be ${DEFAULT_MARKDOWN_RULE.itemTag.toLowerCase()}, but got ${child.tagName}`;
      }
      const liError = this.validateLiStructure(child as HTMLLIElement, i + 1);
      if (liError) return liError;
    }
    return "";
  }

  private static validateLiStructure(
    liElement: HTMLLIElement,
    index: number,
  ): string {
    const childNodes = Array.from(liElement.childNodes);
    const elementChildren = Array.from(liElement.children);
    if (childNodes.length === 0)
      return `The ${index}th li element cannot be empty`;
    const linkElements = elementChildren.filter((child) => {
      if (child.tagName === DEFAULT_MARKDOWN_RULE.linkTag) return true;
      if (child.tagName === DEFAULT_MARKDOWN_RULE.paragraphTag) {
        return child.querySelector(DEFAULT_MARKDOWN_RULE.linkTag) !== null;
      }
      return false;
    });
    const listElements = elementChildren.filter((child) =>
      DEFAULT_MARKDOWN_RULE.listTags.includes(child.tagName),
    );
    const otherElements = elementChildren.filter((child) => {
      if (
        [
          DEFAULT_MARKDOWN_RULE.linkTag,
          ...DEFAULT_MARKDOWN_RULE.listTags,
        ].includes(child.tagName)
      )
        return false;
      if (child.tagName === DEFAULT_MARKDOWN_RULE.paragraphTag) {
        if (child.querySelector(DEFAULT_MARKDOWN_RULE.linkTag) !== null)
          return false;
        let nextSibling = child.nextElementSibling;
        while (nextSibling) {
          if (DEFAULT_MARKDOWN_RULE.listTags.includes(nextSibling.tagName))
            return false;
          nextSibling = nextSibling.nextElementSibling;
        }
        return true;
      }
      return true;
    });
    if (otherElements.length > 0) {
      const allowedTags = [
        DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase(),
        DEFAULT_MARKDOWN_RULE.paragraphTag.toLowerCase(),
        ...DEFAULT_MARKDOWN_RULE.listTags.map((t) => t.toLowerCase()),
      ].join(", ");
      return `The ${index}th li element contains disallowed elements, it can only contain ${allowedTags}`;
    }
    if (linkElements.length + listElements.length === 0) {
      const requiredTags = [
        DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase(),
        ...DEFAULT_MARKDOWN_RULE.listTags.map((t) => t.toLowerCase()),
      ].join(", ");
      return `The ${index}th li element must contain at least one of: ${requiredTags}`;
    }
    if (linkElements.length > 1)
      return `The ${index}th li element can only contain one ${DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase()} element`;
    if (listElements.length > 1)
      return `The ${index}th li element can only contain one ${DEFAULT_MARKDOWN_RULE.listTags
        .map((t) => t.toLowerCase())
        .join(" or ")} element`;
    const listElement = listElements[0];
    const textNodes = childNodes.filter((n) => n.nodeType === Node.TEXT_NODE);
    const hasNonEmptyText = textNodes.some(
      (n) => n.textContent && n.textContent.trim() !== "",
    );
    if (linkElements[0] && listElement && hasNonEmptyText) {
      const listTagsStr = DEFAULT_MARKDOWN_RULE.listTags
        .map((t) => t.toLowerCase())
        .join(" or ");
      return `When the ${index}th li element contains both ${DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase()} and ${listTagsStr}, text nodes must be empty or contain only whitespace`;
    }
    if (listElement && !linkElements[0]) {
      const firstChildNode = childNodes[0];
      const firstElement = elementChildren[0];
      const listTagsStr = DEFAULT_MARKDOWN_RULE.listTags
        .map((t) => t.toLowerCase())
        .join(" or ");
      const paragraphTagStr = DEFAULT_MARKDOWN_RULE.paragraphTag.toLowerCase();
      if (
        firstElement &&
        firstElement.tagName === DEFAULT_MARKDOWN_RULE.paragraphTag
      ) {
        if (!firstElement.textContent?.trim())
          return `The ${paragraphTagStr} tag of the ${index}th li element cannot be empty`;
      } else if (firstChildNode.nodeType !== Node.TEXT_NODE) {
        return `When the ${index}th li element contains ${listTagsStr}, the first child node must be a text node or a ${paragraphTagStr} tag`;
      } else if (!firstChildNode.textContent?.trim()) {
        return `When the ${index}th li element contains ${listTagsStr}, the first text node cannot be empty`;
      }
    }
    if (listElement) {
      const subError = this.validateTreeStructure(listElement as HTMLElement);
      if (subError)
        return `Validation failed for sub list of the ${index}th li element: ${subError}`;
    }
    return "";
  }

  static isValidTreeStructure(element: HTMLElement): boolean {
    return this.validateTreeStructure(element) === "";
  }
}

class NavTreeManager {
  private navTreeStates: Map<HTMLElement, NavTreeState> = new Map();
  private static instance: NavTreeManager | null = null;
  private breadcrumbRoot: HTMLElement | null = null;
  private breadcrumbTitleSelector: string = "[data-nav-title]";

  constructor() {
    if (NavTreeManager.instance) return NavTreeManager.instance;
    NavTreeManager.instance = this;
    this.setupEventListeners();
    log("NavTreeManager initialized, listening event:", EVENT_PAGE_LOADED);
  }

  static getInstance(): NavTreeManager {
    if (!NavTreeManager.instance)
      NavTreeManager.instance = new NavTreeManager();
    return NavTreeManager.instance;
  }

  setBreadcrumbRoot(element: HTMLElement | null): void {
    this.breadcrumbRoot = element;
  }

  setBreadcrumbTitleSelector(selector: string): void {
    if (selector && selector.trim().length > 0) {
      this.breadcrumbTitleSelector = selector;
    }
  }

  registerNavTreeState(element: HTMLElement, navTreeState: NavTreeState): void {
    log("register nav tree state:", element, navTreeState);
    this.navTreeStates.set(element, navTreeState);
  }

  private setupEventListeners(): void {
    document.addEventListener(EVENT_PAGE_LOADED, () =>
      this.updateNavHighlight(),
    );
    window.addEventListener("popstate", () => this.updateNavHighlight());
  }

  private updateNavHighlight(): void {
    if (this.navTreeStates.size === 0) return;
    this.navTreeStates.forEach((navTreeState, element) => {
      const activeNodeId = this.findActiveNode(navTreeState);
      if (activeNodeId) navTreeState.setActiveNode(activeNodeId);
    });
  }

  private findActiveNode(navTreeState: NavTreeState): string | null {
    const currentUrl = window.location.href;
    let activeNodeId = navTreeState.findActiveNode(
      currentUrl,
      (currentPath, targetPath) => {
        const absTargetPath = new URL(targetPath, window.location.origin);
        const absCurrentPath = new URL(currentPath, window.location.origin);
        return (
          absCurrentPath.pathname === absTargetPath.pathname &&
          absCurrentPath.origin === absTargetPath.origin
        );
      },
    );
    if (!activeNodeId)
      activeNodeId = this.findActiveNodeByBreadcrumb(navTreeState);
    return activeNodeId;
  }

  private findActiveNodeByBreadcrumb(
    navTreeState: NavTreeState,
  ): string | null {
    const breadcrumbPath = BreadcrumbManager.getBreadcrumbPath(
      this.breadcrumbRoot ?? undefined,
      this.breadcrumbTitleSelector,
    );
    if (!breadcrumbPath || breadcrumbPath.length === 0) return null;
    const matchedNode = navTreeState.findNodeByTextPath(breadcrumbPath);
    return matchedNode ? matchedNode.nodeId : null;
  }

  refreshHighlight(): void {
    this.updateNavHighlight();
  }

  toggleByTextPath(textPath: string[]): void {
    if (!textPath || textPath.length === 0) return;
    this.navTreeStates.forEach((navTreeState) => {
      try {
        navTreeState.toggleByTextPath(textPath);
      } catch (error) {
        error_log("toggleByTextPath failed:", error);
      }
    });
  }

  getBreadcrumbPath(): string[] {
    return BreadcrumbManager.getBreadcrumbPath(
      this.breadcrumbRoot ?? undefined,
      this.breadcrumbTitleSelector,
    );
  }
}

class TreeConverter {
  static convertedElements = new Set<HTMLElement>();
  private static parser = new MarkdownTreeParser();

  static convertToNavTree(element: HTMLElement): boolean {
    if (this.convertedElements.has(element)) return false;
    const validationError =
      TreeStructureValidator.validateTreeStructure(element);
    if (validationError) {
      log(
        "element structure invalid, skip converting:",
        element,
        "error:",
        validationError,
      );
      return false;
    }
    try {
      const navItems = TreeConverter.parser.parse(element);
      if (navItems.length === 0) return false;
      const navTreeState = new NavTreeState(navItems, {
        autoExpandCurrentPath: true,
        enableBreadcrumbToggle: true,
        scrollToActiveLink: true,
        scrollDelay: 100,
      });
      NavTreeManager.getInstance().registerNavTreeState(element, navTreeState);
      const container = document.createElement("div");
      container.className = "nav-tree-container";
      render(() => NavTree({ state: navTreeState }), container);
      element.parentNode?.replaceChild(container, element);
      this.convertedElements.add(element);
      log("TreeConverter: converted element to NavTree:", element, navItems);
      return true;
    } catch (error) {
      error_log("TreeConverter: failed to convert element:", element, error);
      return false;
    }
  }

  static getConvertedCount(): number {
    return this.convertedElements.size;
  }

  static clearConvertedElements(): void {
    this.convertedElements.clear();
  }
}

class TreeScanner {
  static scanContainer(container: HTMLElement): void {
    const lists = container.querySelectorAll(":scope > ul, :scope > ol");
    let convertedCount = 0;
    Array.from(lists).forEach((list) => {
      const element = list as HTMLElement;
      if (TreeConverter.convertToNavTree(element)) convertedCount++;
    });
    log(`TreeScanner: container scan done, converted ${convertedCount} items`);
  }
}

export interface SidebarNavTreeOptions {
  /**
   * 导航树所在的容器元素（原先的 #sidebar-nav-tree）
   */
  container: HTMLElement;
  /**
   * 面包屑根元素（原先的 #breadcrumb），可选
   */
  breadcrumbRoot?: HTMLElement | null;
  /**
   * 面包屑中表示导航标题的元素选择器
   * 默认为 "[data-nav-title]"
   */
  breadcrumbTitleSelector?: string;
}

export function initSidebarNavTree2(options: SidebarNavTreeOptions): void {
  const {
    container,
    breadcrumbRoot,
    breadcrumbTitleSelector = "[data-nav-title]",
  } = options;

  if (!container) {
    error_log("sidebarNavTree2: container element is required");
    return;
  }

  log("sidebarNavTree2: init SidebarNavTree2...");
  const navTreeManager = NavTreeManager.getInstance();
  navTreeManager.setBreadcrumbRoot(breadcrumbRoot ?? null);
  navTreeManager.setBreadcrumbTitleSelector(breadcrumbTitleSelector);

  TreeScanner.scanContainer(container);
  BreadcrumbManager.setupClickHandler(
    navTreeManager,
    breadcrumbRoot ?? undefined,
    breadcrumbTitleSelector,
  );
  requestAnimationFrame(() => navTreeManager.refreshHighlight());

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    if (container) TreeScanner.scanContainer(container);
    navTreeManager.refreshHighlight();
  });

  container.classList.remove("invisible");
}

export {
  TreeScanner,
  TreeConverter,
  TreeStructureValidator,
  NavTreeManager,
  BreadcrumbManager,
};
export { MarkdownTreeParser } from "./markdownTreeParser";
