import { EVENT_PAGE_LOADED } from "../pageAjax";
import { NavTreeState, NavItem } from "../components/nav_tree/NavTreeState";
import { NavTree } from "../components/nav_tree/NavTree";
import { render } from "solid-js/web";

/**
 * DOM工具类
 */
class DOMUtils {
  /**
   * 获取元素的文本内容（去除空白）
   * @param element DOM元素
   * @returns 清理后的文本内容
   */
  static getCleanTextContent(element: Element): string {
    return element.textContent?.trim() || "";
  }

  /**
   * 检查元素是否包含指定的CSS类
   * @param element DOM元素
   * @param className CSS类名
   * @returns 是否包含该类
   */
  static hasClass(element: Element, className: string): boolean {
    return element.classList.contains(className);
  }

  /**
   * 安全地获取元素属性值
   * @param element DOM元素
   * @param attributeName 属性名
   * @param defaultValue 默认值
   * @returns 属性值或默认值
   */
  static getAttribute(
    element: Element,
    attributeName: string,
    defaultValue: string = ""
  ): string {
    return element.getAttribute(attributeName) || defaultValue;
  }
}

/**
 * Breadcrumb管理器
 * 负责处理breadcrumb相关的操作
 */
class BreadcrumbManager {
  /**
   * 获取breadcrumb路径
   * @returns breadcrumb文本路径数组
   */
  static getBreadcrumbPath(): string[] {
    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) {
      return [];
    }

    const navTitleElements = breadcrumb.querySelectorAll("[data-nav-title]");
    return Array.from(navTitleElements)
      .map((el) => DOMUtils.getCleanTextContent(el))
      .filter((text) => text.length > 0);
  }

  /**
   * 设置breadcrumb点击事件处理
   * @param navTreeManager 导航树管理器实例
   */
  static setupClickHandler(navTreeManager: NavTreeManager): void {
    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) {
      console.warn("找不到breadcrumb元素");
      return;
    }

    breadcrumb.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log("breadcrumb点击，目标:", target);

      if (!target.hasAttribute("data-nav-title")) {
        console.log("breadcrumb点击，目标不是data-nav-title");
      }
      // 处理父节点是A标签，且href以javascript:开头的情况
      const parentA = target.closest("a");
      if (!(parentA && parentA.href.startsWith("javascript:"))) {
        console.log("breadcrumb点击，父节点不是A标签或href以javascript:开头");
        return;
      }

      try {
        const breadcrumbPath = this.getBreadcrumbPath();

        if (breadcrumbPath.length === 0) {
          console.warn("breadcrumb路径为空");
          return;
        }

        const clickedIndex = Array.from(
          target.parentElement?.children || []
        ).indexOf(target);
        const pathToCurrent = breadcrumbPath.slice(0, clickedIndex + 1);

        console.log("breadcrumb点击，路径到当前位置:", pathToCurrent);
        navTreeManager.toggleByTextPath(pathToCurrent);
      } catch (error) {
        console.error("breadcrumb点击处理出错:", error);
      }
    });
  }
}

/**
 * 树结构验证器
 * 验证ul/ol结构是否符合要求
 */
class TreeStructureValidator {
  /**
   * 验证元素是否符合树结构要求
   * @param element 要验证的元素
   * @returns 通过时返回空字符串，不通过时返回错误说明
   */
  static validateTreeStructure(element: HTMLElement): string {
    // 必须是ul或ol元素
    if (element.tagName !== "UL" && element.tagName !== "OL") {
      return `元素必须是ul或ol，当前是${element.tagName}`;
    }

    // 检查所有直接子元素是否都是li
    const children = Array.from(element.children);
    if (children.length === 0) {
      return "列表元素不能为空";
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName !== "LI") {
        return `第${i + 1}个子元素必须是li，当前是${child.tagName}`;
      }

      // 递归验证每个li的子结构
      const liError = this.validateLiStructure(child as HTMLLIElement, i + 1);
      if (liError) {
        return liError;
      }
    }

    return ""; // 通过验证
  }

  /**
   * 验证li元素的结构
   * @param liElement li元素
   * @param index li元素的索引（用于错误提示）
   * @returns 通过时返回空字符串，不通过时返回错误说明
   */
  private static validateLiStructure(
    liElement: HTMLLIElement,
    index: number
  ): string {
    const childNodes = Array.from(liElement.childNodes);
    const elementChildren = Array.from(liElement.children);

    if (childNodes.length === 0) {
      return `第${index}个li元素不能为空`;
    }

    // 规则1: li下只能有一个标记 a/UL/OL
    const linkCount = elementChildren.filter(
      (child) => child.tagName === "A"
    ).length;
    const listCount = elementChildren.filter(
      (child) => child.tagName === "UL" || child.tagName === "OL"
    ).length;
    const otherElementCount = elementChildren.filter(
      (child) =>
        child.tagName !== "A" &&
        child.tagName !== "UL" &&
        child.tagName !== "OL"
    ).length;

    console.log(`第${index}个li元素分析:`, {
      linkCount,
      listCount,
      otherElementCount,
      elementChildren: elementChildren.map((c) => c.tagName),
      childNodes: childNodes.map((n) =>
        n.nodeType === Node.TEXT_NODE
          ? `TEXT: "${n.textContent?.trim()}"`
          : n.nodeName
      ),
    });

    // 检查是否有其他元素
    if (otherElementCount > 0) {
      return `第${index}个li元素包含不允许的元素，只能包含a、ul或ol`;
    }

    // 检查元素数量
    if (linkCount + listCount === 0) {
      return `第${index}个li元素必须包含a、ul或ol中的至少一个`;
    }

    if (linkCount + listCount > 1) {
      return `第${index}个li元素只能包含一个a、ul或ol元素`;
    }

    // 规则2: 当为OL/UL时，childNodes第一个必须是不为空的text_node
    if (listCount === 1) {
      const firstChildNode = childNodes[0];
      if (firstChildNode.nodeType !== Node.TEXT_NODE) {
        return `第${index}个li元素包含ul/ol时，第一个子节点必须是文本节点`;
      }
      if (!firstChildNode.textContent?.trim()) {
        return `第${index}个li元素包含ul/ol时，第一个文本节点不能为空`;
      }

      // 验证子列表结构
      const subList = elementChildren.find(
        (child) => child.tagName === "UL" || child.tagName === "OL"
      );
      if (subList) {
        const subError = this.validateTreeStructure(subList as HTMLElement);
        if (subError) {
          return `第${index}个li元素的子列表验证失败: ${subError}`;
        }
      }
    }

    return ""; // 通过验证
  }

  /**
   * 兼容性方法：检查元素是否符合树结构要求
   * @param element 要验证的元素
   * @returns 是否符合要求
   */
  static isValidTreeStructure(element: HTMLElement): boolean {
    return this.validateTreeStructure(element) === "";
  }
}

/**
 * DOM树解析器
 * 将DOM结构解析为NavItem树
 */
class DOMTreeParser {
  /**
   * 解析ul/ol元素为NavItem树
   * @param element ul/ol元素
   * @returns NavItem数组
   */
  static parseToNavItems(element: HTMLElement): NavItem[] {
    const items: NavItem[] = [];

    Array.from(element.children).forEach((child) => {
      if (child.tagName === "LI") {
        const navItem = this.parseLiElement(child as HTMLLIElement);
        if (navItem) {
          items.push(navItem);
        }
      }
    });

    return items;
  }

  /**
   * 解析li元素为NavItem
   * @param liElement li元素
   * @returns NavItem或null
   */
  private static parseLiElement(liElement: HTMLLIElement): NavItem | null {
    const childNodes = Array.from(liElement.childNodes);
    const elementChildren = Array.from(liElement.children);

    if (childNodes.length === 0) {
      return null;
    }

    // 根据简化规则解析
    const linkElement = elementChildren.find(
      (child) => child.tagName === "A"
    ) as HTMLAnchorElement;
    const listElement = elementChildren.find(
      (child) => child.tagName === "UL" || child.tagName === "OL"
    ) as HTMLElement;

    let title = "";
    let url: string | undefined;
    let new_window = false;

    if (linkElement) {
      // 情况1: 只有a标签 - 叶子节点
      title = linkElement.textContent?.trim() || "";
      url = linkElement.href;
      new_window = linkElement.target === "_blank";
    } else if (listElement) {
      // 情况2: 只有ul/ol - 分支节点，标题来自第一个文本节点
      const firstChildNode = childNodes[0];
      if (firstChildNode.nodeType === Node.TEXT_NODE) {
        title = firstChildNode.textContent?.trim() || "";
      }

      // 解析子列表
      const subItems = this.parseToNavItems(listElement);
      return {
        nodeId: "", // 将在NavTreeState中生成
        title,
        url: undefined,
        new_window: false,
        children: subItems.length > 0 ? subItems : undefined,
      };
    }

    if (!title) {
      return null;
    }

    return {
      nodeId: "", // 将在NavTreeState中生成
      title,
      url,
      new_window,
      children: undefined,
    };
  }
}

/**
 * 导航树管理器
 * 负责导航树的初始化、事件处理和状态管理
 */
class NavTreeManager {
  private navTreeStates: Map<HTMLElement, NavTreeState> = new Map();
  private static instance: NavTreeManager | null = null;

  constructor() {
    // 单例模式
    if (NavTreeManager.instance) {
      return NavTreeManager.instance;
    }
    NavTreeManager.instance = this;

    this.setupEventListeners();
    console.log("NavTreeManager 初始化完成, 监听事件:", EVENT_PAGE_LOADED);
  }

  /**
   * 获取单例实例
   * @returns NavTreeManager实例
   */
  public static getInstance(): NavTreeManager {
    if (!NavTreeManager.instance) {
      NavTreeManager.instance = new NavTreeManager();
    }
    return NavTreeManager.instance;
  }

  /**
   * 注册导航树状态
   * @param element 原始DOM元素
   * @param navTreeState 导航树状态
   */
  public registerNavTreeState(
    element: HTMLElement,
    navTreeState: NavTreeState
  ): void {
    console.log("注册导航树状态:", element, navTreeState);
    this.navTreeStates.set(element, navTreeState);
    console.log(`当前注册的导航树状态数量: ${this.navTreeStates.size}`);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听页面加载事件，更新导航高亮
    document.addEventListener(EVENT_PAGE_LOADED, () => {
      this.updateNavHighlight();
    });

    // 监听浏览器历史变化
    window.addEventListener("popstate", () => {
      this.updateNavHighlight();
    });
  }

  /**
   * 更新导航高亮
   */
  private updateNavHighlight(): void {
    console.log(`开始更新导航高亮，当前路径: ${window.location.pathname}`);
    console.log(`注册的导航树状态数量: ${this.navTreeStates.size}`);

    if (this.navTreeStates.size === 0) {
      console.warn("没有注册的导航树状态，跳过高亮更新");
      return;
    }

    this.navTreeStates.forEach((navTreeState, element) => {
      console.log(`处理导航树状态:`, element);
      const activeNodeId = this.findActiveNode(navTreeState);
      console.log(`找到的活动节点ID: ${activeNodeId}`);
      if (activeNodeId) {
        navTreeState.setActiveNode(activeNodeId);
        console.log(`已设置活动节点: ${activeNodeId}`);
      } else {
        console.log("未找到匹配的活动节点");
      }
    });

    console.log(`导航高亮更新完成，当前路径: ${window.location.pathname}`);
  }

  /**
   * 查找活动节点
   * @param navTreeState 导航树状态
   * @returns 活动节点ID或null
   */
  private findActiveNode(navTreeState: NavTreeState): string | null {
    const currentUrl = window.location.href;
    console.log(`查找活动节点，当前路径: ${currentUrl}`);

    // 首先尝试精确路径匹配
    let activeNodeId = navTreeState.findActiveNode(
      currentUrl,
      (currentPath, targetPath) => {
        const absTargetPath = new URL(targetPath, window.location.origin);
        const absCurrentPath = new URL(currentPath, window.location.origin);
        return (
          absCurrentPath.pathname === absTargetPath.pathname &&
          absCurrentPath.origin === absTargetPath.origin
        );
      }
    );
    console.log(`精确路径匹配结果: ${activeNodeId}`);

    // 如果路径匹配失败，尝试使用breadcrumb文本路径匹配
    if (!activeNodeId) {
      activeNodeId = this.findActiveNodeByBreadcrumb(navTreeState);
      console.log(`面包屑匹配结果: ${activeNodeId}`);
    }

    return activeNodeId;
  }

  /**
   * 通过breadcrumb匹配查找活动节点
   * @param navTreeState 导航树状态
   * @returns 活动节点ID或null
   */
  private findActiveNodeByBreadcrumb(
    navTreeState: NavTreeState
  ): string | null {
    const breadcrumbPath = BreadcrumbManager.getBreadcrumbPath();
    if (!breadcrumbPath || breadcrumbPath.length === 0) {
      return null;
    }

    console.log("尝试使用breadcrumb路径匹配:", breadcrumbPath);
    console.log("导航树根节点:", navTreeState.getRootNodes());

    // 使用NavTreeState的文本路径匹配方法
    const matchedNode = navTreeState.findNodeByTextPath(breadcrumbPath);
    if (matchedNode) {
      console.log(`找到匹配的节点: ${matchedNode.title}`);
      return matchedNode.nodeId;
    }

    console.log("未找到匹配的节点");
    return null;
  }

  /**
   * 手动触发高亮更新
   */
  public refreshHighlight(): void {
    this.updateNavHighlight();
  }

  /**
   * 按文本路径toggle节点
   * @param textPath 文本路径数组
   */
  public toggleByTextPath(textPath: string[]): void {
    if (!textPath || textPath.length === 0) {
      console.warn("toggleByTextPath: 文本路径为空");
      return;
    }

    console.log("按文本路径toggle:", textPath);

    this.navTreeStates.forEach((navTreeState) => {
      try {
        navTreeState.toggleByTextPath(textPath);
      } catch (error) {
        console.error("toggleByTextPath 执行出错:", error);
      }
    });
  }

  /**
   * 获取breadcrumb路径（公共方法）
   * @returns breadcrumb路径数组
   */
  public getBreadcrumbPath(): string[] {
    return BreadcrumbManager.getBreadcrumbPath();
  }
}
class TreeConverter {
  static convertedElements = new Set<HTMLElement>();

  /**
   * 转换元素为NavTree
   * @param element 要转换的元素
   * @returns 是否转换成功
   */
  static convertToNavTree(element: HTMLElement): boolean {
    // 检查是否已经转换过
    if (this.convertedElements.has(element)) {
      return false;
    }

    // 验证结构
    const validationError =
      TreeStructureValidator.validateTreeStructure(element);
    if (validationError) {
      console.log(
        "元素结构不符合要求，跳过转换:",
        element,
        "错误:",
        validationError
      );
      return false;
    }

    try {
      // 解析为NavItem树
      const navItems = DOMTreeParser.parseToNavItems(element);

      if (navItems.length === 0) {
        console.log("解析结果为空，跳过转换:", element);
        return false;
      }

      // 创建NavTreeState
      const navTreeState = new NavTreeState(navItems, {
        autoExpandCurrentPath: true,
        enableBreadcrumbToggle: true,
        scrollToActiveLink: true,
        scrollDelay: 100,
      });

      // 注册到NavTreeManager
      const navTreeManager = NavTreeManager.getInstance();
      navTreeManager.registerNavTreeState(element, navTreeState);

      // 创建容器
      const container = document.createElement("div");
      container.className = "nav-tree-container";

      // 使用SolidJS渲染NavTree
      render(() => NavTree({ state: navTreeState }), container);

      // 替换原元素
      element.parentNode?.replaceChild(container, element);

      // 标记为已转换
      this.convertedElements.add(element);

      console.log("成功转换元素为NavTree:", element, navItems);
      return true;
    } catch (error) {
      console.error("转换元素失败:", element, error);
      return false;
    }
  }

  /**
   * 获取已转换的元素数量
   */
  static getConvertedCount(): number {
    return this.convertedElements.size;
  }

  /**
   * 清除转换记录（用于测试）
   */
  static clearConvertedElements(): void {
    this.convertedElements.clear();
  }
}

/**
 * 树扫描器
 * 扫描页面中所有可转换为tree的元素
 */
class TreeScanner {
  /**
   * 扫描特定容器内的元素
   * @param container 容器元素
   */
  static scanContainer(container: HTMLElement): void {
    const lists = container.querySelectorAll(":scope > ul, :scope > ol");
    console.log("扫描容器内的树元素:", lists);
    console.log(`找到 ${lists.length} 个列表元素`);
    let convertedCount = 0;

    Array.from(lists).forEach((list, index) => {
      const element = list as HTMLElement;
      console.log(`处理第 ${index + 1} 个列表元素:`, element);

      if (TreeConverter.convertToNavTree(element)) {
        convertedCount++;
        console.log(`成功转换第 ${index + 1} 个元素`);
      } else {
        console.log(`跳过第 ${index + 1} 个元素（不符合转换条件）`);
      }
    });

    console.log(`容器扫描完成，共转换了 ${convertedCount} 个元素`);
  }
}

/**
 * 初始化函数
 * 扫描并转换所有可转换为tree的元素
 */
export function initSidebarNavTree2(): void {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("初始化SidebarNavTree2...");

    // 初始化导航树管理器
    const navTreeManager = NavTreeManager.getInstance();

    // 初始扫描
    const container = document.getElementById(
      "sidebar-nav-tree"
    ) as HTMLElement;

    if (!container) {
      console.error("找不到导航树容器元素 #sidebar-nav-tree");
      return;
    }

    console.log("找到导航树容器:", container);
    TreeScanner.scanContainer(container);

    // 设置breadcrumb点击处理
    BreadcrumbManager.setupClickHandler(navTreeManager);

    // 初始高亮更新
    setTimeout(() => {
      console.log("执行初始高亮更新");
      navTreeManager.refreshHighlight();
    }, 100);

    // 监听页面加载事件，处理动态内容
    document.addEventListener(EVENT_PAGE_LOADED, () => {
      console.log("页面加载完成，重新扫描...");
      // 重新扫描容器
      if (container) {
        TreeScanner.scanContainer(container);
      }
      // 更新高亮
      navTreeManager.refreshHighlight();
    });
  });
}

// 导出工具类供外部使用
export {
  TreeScanner,
  TreeConverter,
  TreeStructureValidator,
  DOMTreeParser,
  NavTreeManager,
  BreadcrumbManager,
};
