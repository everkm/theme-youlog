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
  static getBreadcrumbPath(): string[] {
    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) return [];
    const navTitleElements = breadcrumb.querySelectorAll("[data-nav-title]");
    return Array.from(navTitleElements)
      .map((el) => DOMUtils.getCleanTextContent(el))
      .filter((text) => text.length > 0);
  }

  static setupClickHandler(navTreeManager: NavTreeManager): void {
    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) {
      warn_log("找不到breadcrumb元素");
      return;
    }
    breadcrumb.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      log("breadcrumb点击，目标:", target);
      const parentA = target.closest("a");
      if (!(parentA && parentA.href.startsWith("javascript:"))) return;
      try {
        const breadcrumbPath = this.getBreadcrumbPath();
        if (breadcrumbPath.length === 0) {
          warn_log("breadcrumb路径为空");
          return;
        }
        const clickedNavTitle = target.hasAttribute("data-nav-title")
          ? target
          : (target.closest("[data-nav-title]") as HTMLElement | null);
        if (!clickedNavTitle) return;
        const clickedText = DOMUtils.getCleanTextContent(clickedNavTitle);
        if (!clickedText) return;
        const clickedIndex = breadcrumbPath.findIndex(
          (text) => text === clickedText,
        );
        if (clickedIndex === -1) return;
        const pathToCurrent = breadcrumbPath.slice(0, clickedIndex + 1);
        log("breadcrumb点击，路径到当前位置:", pathToCurrent);
        navTreeManager.toggleByTextPath(pathToCurrent);
      } catch (error) {
        error_log("breadcrumb点击处理出错:", error);
      }
    });
  }
}

class TreeStructureValidator {
  static validateTreeStructure(element: HTMLElement): string {
    if (!DEFAULT_MARKDOWN_RULE.rootTags.includes(element.tagName)) {
      return `元素必须是${DEFAULT_MARKDOWN_RULE.rootTags.join("或").toLowerCase()}，当前是${element.tagName}`;
    }
    if (element.children.length === 0) return "列表元素不能为空";
    const children = Array.from(element.children);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName !== DEFAULT_MARKDOWN_RULE.itemTag) {
        return `第${i + 1}个子元素必须是${DEFAULT_MARKDOWN_RULE.itemTag.toLowerCase()}，当前是${child.tagName}`;
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
    if (childNodes.length === 0) return `第${index}个li元素不能为空`;
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
      ].join("、");
      return `第${index}个li元素包含不允许的元素，只能包含${allowedTags}`;
    }
    if (linkElements.length + listElements.length === 0) {
      const requiredTags = [
        DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase(),
        ...DEFAULT_MARKDOWN_RULE.listTags.map((t) => t.toLowerCase()),
      ].join("、");
      return `第${index}个li元素必须包含${requiredTags}中的至少一个`;
    }
    if (linkElements.length > 1)
      return `第${index}个li元素只能包含一个${DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase()}元素`;
    if (listElements.length > 1)
      return `第${index}个li元素只能包含一个${DEFAULT_MARKDOWN_RULE.listTags.map((t) => t.toLowerCase()).join("或")}元素`;
    const listElement = listElements[0];
    const textNodes = childNodes.filter((n) => n.nodeType === Node.TEXT_NODE);
    const hasNonEmptyText = textNodes.some(
      (n) => n.textContent && n.textContent.trim() !== "",
    );
    if (linkElements[0] && listElement && hasNonEmptyText) {
      const listTagsStr = DEFAULT_MARKDOWN_RULE.listTags
        .map((t) => t.toLowerCase())
        .join("或");
      return `第${index}个li元素同时包含${DEFAULT_MARKDOWN_RULE.linkTag.toLowerCase()}和${listTagsStr}时，文本节点必须为空或只包含空白字符`;
    }
    if (listElement && !linkElements[0]) {
      const firstChildNode = childNodes[0];
      const firstElement = elementChildren[0];
      const listTagsStr = DEFAULT_MARKDOWN_RULE.listTags
        .map((t) => t.toLowerCase())
        .join("或");
      const paragraphTagStr = DEFAULT_MARKDOWN_RULE.paragraphTag.toLowerCase();
      if (
        firstElement &&
        firstElement.tagName === DEFAULT_MARKDOWN_RULE.paragraphTag
      ) {
        if (!firstElement.textContent?.trim())
          return `第${index}个li元素的${paragraphTagStr}标签不能为空`;
      } else if (firstChildNode.nodeType !== Node.TEXT_NODE) {
        return `第${index}个li元素包含${listTagsStr}时，第一个子节点必须是文本节点或${paragraphTagStr}标签`;
      } else if (!firstChildNode.textContent?.trim()) {
        return `第${index}个li元素包含${listTagsStr}时，第一个文本节点不能为空`;
      }
    }
    if (listElement) {
      const subError = this.validateTreeStructure(listElement as HTMLElement);
      if (subError) return `第${index}个li元素的子列表验证失败: ${subError}`;
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

  constructor() {
    if (NavTreeManager.instance) return NavTreeManager.instance;
    NavTreeManager.instance = this;
    this.setupEventListeners();
    log("NavTreeManager 初始化完成, 监听事件:", EVENT_PAGE_LOADED);
  }

  static getInstance(): NavTreeManager {
    if (!NavTreeManager.instance)
      NavTreeManager.instance = new NavTreeManager();
    return NavTreeManager.instance;
  }

  registerNavTreeState(element: HTMLElement, navTreeState: NavTreeState): void {
    log("注册导航树状态:", element, navTreeState);
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
    const breadcrumbPath = BreadcrumbManager.getBreadcrumbPath();
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
        error_log("toggleByTextPath 执行出错:", error);
      }
    });
  }

  getBreadcrumbPath(): string[] {
    return BreadcrumbManager.getBreadcrumbPath();
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
      log("元素结构不符合要求，跳过转换:", element, "错误:", validationError);
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
      log("TreeConverter: 成功转换元素为NavTree:", element, navItems);
      return true;
    } catch (error) {
      error_log("TreeConverter: 转换元素失败:", element, error);
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
    log(`TreeScanner: 容器扫描完成，共转换了 ${convertedCount} 个元素`);
  }
}

export function initSidebarNavTree2(): void {
  document.addEventListener("DOMContentLoaded", () => {
    log("sidebarNavTree2: 初始化SidebarNavTree2...");
    const navTreeManager = NavTreeManager.getInstance();
    const container = document.getElementById(
      "sidebar-nav-tree",
    ) as HTMLElement;
    if (!container) {
      error_log("sidebarNavTree2: 找不到导航树容器元素 #sidebar-nav-tree");
      return;
    }
    TreeScanner.scanContainer(container);
    BreadcrumbManager.setupClickHandler(navTreeManager);
    requestAnimationFrame(() => navTreeManager.refreshHighlight());
    document.addEventListener(EVENT_PAGE_LOADED, () => {
      if (container) TreeScanner.scanContainer(container);
      navTreeManager.refreshHighlight();
    });
    container.classList.remove("invisible");
  });
}

export {
  TreeScanner,
  TreeConverter,
  TreeStructureValidator,
  NavTreeManager,
  BreadcrumbManager,
};
export { MarkdownTreeParser } from "./markdownTreeParser";
