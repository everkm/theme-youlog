import { EVENT_PAGE_LOADED } from "../pageAjax";
import "./sidebarNavTree.css";

/**
 * 导航树节点类型枚举
 * 用于区分不同类型的导航节点
 */
enum TreeNodeType {
  LEAF = "leaf", // 叶子节点：没有子节点
  BRANCH = "branch", // 分支节点：有子节点
}

/**
 * 路径匹配策略枚举
 * 定义不同的路径匹配方式
 */
enum PathMatchStrategy {
  EXACT = "exact", // 精确匹配
  BREADCRUMB = "breadcrumb", // breadcrumb文本匹配
  PREFIX = "prefix", // 前缀匹配
}

/**
 * 导航树配置接口
 * 定义导航树的各种配置选项
 */
interface NavTreeConfig {
  autoExpandCurrentPath: boolean; // 是否自动展开当前路径
  enableBreadcrumbToggle: boolean; // 是否启用breadcrumb切换功能
  scrollToActiveLink: boolean; // 是否滚动到活动链接
  scrollDelay: number; // 滚动延迟时间(ms)
}

/**
 * 默认导航树配置
 */
const DEFAULT_CONFIG: NavTreeConfig = {
  autoExpandCurrentPath: true,
  enableBreadcrumbToggle: true,
  scrollToActiveLink: true,
  scrollDelay: 100,
};

/**
 * DOM工具类
 * 提供DOM操作相关的工具方法
 */
class DOMUtils {
  /**
   * 将相对URL转换为绝对URL
   * @param relativeUrl 相对URL
   * @returns 绝对URL
   */
  static toAbsoluteUrl(relativeUrl: string): string {
    if (
      relativeUrl.startsWith("http://") ||
      relativeUrl.startsWith("https://") ||
      relativeUrl.startsWith("/")
    ) {
      return relativeUrl;
    }

    // 获取当前URL的基础路径
    const basePath = window.location.pathname.split("/").slice(0, -1).join("/");
    return `${basePath}/${relativeUrl}`;
  }

  /**
   * 移除URL中的查询参数和锚点
   * @param url 原始URL
   * @returns 清理后的URL
   */
  static removeQueryParams(url: string): string {
    return url.split("?")[0].split("#")[0];
  }

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
 * 路径匹配工具类
 * 提供各种路径匹配算法
 */
class PathMatcher {
  /**
   * 检查两个路径是否精确匹配
   * 支持带/不带尾部斜杠的路径匹配
   * @param currentPath 当前路径
   * @param targetPath 目标路径
   * @returns 是否匹配
   */
  static isExactMatch(currentPath: string, targetPath: string): boolean {
    return (
      currentPath === targetPath ||
      (currentPath.endsWith("/") && currentPath.slice(0, -1) === targetPath) ||
      (!currentPath.endsWith("/") && `${currentPath}/` === targetPath)
    );
  }

  /**
   * 检查目标路径是否是当前路径的前缀
   * 处理index.html等特殊情况
   * @param currentPath 当前路径
   * @param targetPath 目标路径
   * @returns 是否匹配
   */
  static isPrefixMatch(currentPath: string, targetPath: string): boolean {
    // 处理目标路径：
    // 1. 如果以 index.html 结尾，则去掉 index.html
    // 2. 否则去掉 .html 后缀, 添加 /
    const processedTargetPath = targetPath.endsWith("/")
      ? targetPath
      : targetPath.endsWith("/index.html")
      ? targetPath.slice(0, -11)
      : targetPath.replace(/\.html$/, "/");

    return currentPath.startsWith(processedTargetPath);
  }

  /**
   * 按文本路径匹配导航树中的链接
   * 支持深度优先匹配，从最长路径开始尝试
   * @param navTree 导航树元素
   * @param textPath 文本路径数组
   * @returns 匹配的链接元素或null
   */
  static matchByTextPath(
    navTree: HTMLElement,
    textPath: string[]
  ): HTMLElement | null {
    if (!textPath || textPath.length === 0) {
      return null;
    }

    const links = navTree.querySelectorAll("a");

    // 按路径前缀依次匹配，从最长路径开始
    for (let pathLength = textPath.length; pathLength > 0; pathLength--) {
      const currentPath = textPath.slice(0, pathLength);

      for (const link of Array.from(links)) {
        const linkText = DOMUtils.getCleanTextContent(link);
        if (linkText === currentPath[currentPath.length - 1]) {
          // 检查这个链接是否在正确的路径层级上
          if (this.isLinkInCorrectDepth(link, currentPath)) {
            return link;
          }
        }
      }
    }

    return null;
  }

  /**
   * 检查链接是否在正确的深度层级上
   * @param link 链接元素
   * @param targetPath 目标路径
   * @returns 是否在正确层级
   */
  private static isLinkInCorrectDepth(
    link: HTMLElement,
    targetPath: string[]
  ): boolean {
    const listItem = link.closest("li");
    if (!listItem) {
      return false;
    }

    // 获取链接在导航树中的深度
    const depth = parseInt(DOMUtils.getAttribute(listItem, "data-depth", "0"));

    // 检查深度是否与目标路径长度匹配（减1，因为深度从0开始）
    return depth === targetPath.length - 1;
  }
}

/**
 * 导航树节点处理器
 * 负责处理导航树节点的创建、分类和深度设置
 */
class TreeNodeProcessor {
  /**
   * 递归设置节点深度
   * 为每个li元素设置data-depth属性，用于层级识别
   * @param element 根元素
   * @param depth 当前深度（默认为0）
   */
  static setNodeDepth(element: HTMLElement, depth: number = 0): void {
    if (element.tagName === "LI") {
      element.setAttribute("data-depth", depth.toString());
      // 设置CSS变量以便在CSS中计算
      element.style.setProperty("--depth", depth.toString());
    }

    Array.from(element.children).forEach((child) => {
      // 只有当父元素是li并且子元素是ul/ol时深度才加1
      const newDepth =
        element.tagName === "LI" &&
        (child.tagName === "UL" || child.tagName === "OL")
          ? depth + 1
          : depth;
      this.setNodeDepth(child as HTMLElement, newDepth);
    });
  }

  /**
   * 递归处理树节点
   * 将原始HTML结构转换为可交互的导航树结构
   * @param liElement li元素
   */
  static processTreeNode(liElement: HTMLLIElement): void {
    // 如果已经处理过，则跳过
    if (liElement.querySelector(".node-content")) {
      return;
    }

    // 获取子节点数量
    const childNodes = Array.from(liElement.childNodes).filter(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== "")
    );

    // 查找第一个ul或ol子节点
    const listIndex = childNodes.findIndex(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        ((node as Element).tagName === "UL" ||
          (node as Element).tagName === "OL")
    );

    if (childNodes.length === 1) {
      // 只有一个子节点，添加叶子节点类
      this.processLeafNode(liElement, childNodes[0]);
    } else if (childNodes.length >= 2 && listIndex !== -1) {
      // 有两个以上子节点且其中有ul/ol，添加分支节点类
      this.processBranchNode(liElement, childNodes, listIndex);
    }
  }

  /**
   * 处理叶子节点
   * @param liElement li元素
   * @param contentNode 内容节点
   */
  private static processLeafNode(
    liElement: HTMLLIElement,
    contentNode: Node
  ): void {
    liElement.classList.add("tree-node-leaf");

    // 为叶子节点也添加node-content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content", "with-toggle");

    // 直接移动内容到node-content，而不是克隆
    contentDiv.appendChild(contentNode);

    // 在原位置插入内容div
    liElement.insertBefore(contentDiv, liElement.firstChild);
  }

  /**
   * 处理分支节点
   * @param liElement li元素
   * @param childNodes 子节点数组
   * @param listIndex 列表节点索引
   */
  private static processBranchNode(
    liElement: HTMLLIElement,
    childNodes: Node[],
    listIndex: number
  ): void {
    liElement.classList.add("tree-node-branch");

    // 处理前面的节点作为主干
    if (listIndex > 0) {
      const contentNodes = childNodes.slice(0, listIndex);

      if (contentNodes.length > 0) {
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("node-content", "with-toggle");

        // 将前面节点直接添加到content div
        contentNodes.forEach((node) => {
          contentDiv.appendChild(node);
        });

        // 在原位置插入内容div
        liElement.insertBefore(contentDiv, childNodes[listIndex]);
      }
    }

    // 递归处理子列表
    const subList = childNodes[listIndex] as Element;
    // 默认折叠子列表
    subList.classList.add("hidden");

    Array.from(subList.querySelectorAll("li")).forEach((li) =>
      this.processTreeNode(li as HTMLLIElement)
    );
  }

  /**
   * 移除叶子节点的toggle功能
   * 当父节点下所有子节点都是叶子节点时，移除toggle功能
   * @param container 容器元素
   */
  static removeLeafToggle(container: HTMLElement): void {
    const toggleElements = container.querySelectorAll(".with-toggle");
    toggleElements.forEach((element) => {
      const parent = element.parentElement;
      if (parent) {
        const totalChildren = parent.children.length;
        const leafNodes = parent.querySelectorAll(".tree-node-leaf").length;

        if (totalChildren === leafNodes) {
          element.classList.remove("with-toggle");
        }
      }
    });
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
 * 导航树管理器
 * 负责导航树的初始化、事件处理和状态管理
 */
class NavTreeManager {
  private container: HTMLElement;
  private navTrees: HTMLElement[] = [];
  private config: NavTreeConfig;
  private static instance: NavTreeManager | null = null;

  constructor(container: HTMLElement, config: Partial<NavTreeConfig> = {}) {
    this.container = container;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 单例模式
    if (NavTreeManager.instance) {
      return NavTreeManager.instance;
    }
    NavTreeManager.instance = this;

    this.initNavTrees();
    this.setupEventListeners();

    console.log("NavTreeManager 初始化完成, 监听事件:", EVENT_PAGE_LOADED);
  }

  /**
   * 获取单例实例
   * @param container 容器元素
   * @param config 配置选项
   * @returns NavTreeManager实例
   */
  public static getInstance(
    container: HTMLElement,
    config: Partial<NavTreeConfig> = {}
  ): NavTreeManager {
    if (!NavTreeManager.instance) {
      NavTreeManager.instance = new NavTreeManager(container, config);
    }
    return NavTreeManager.instance;
  }

  /**
   * 初始化所有导航树
   */
  private initNavTrees(): void {
    this.container.classList.add("nav-tree");

    this.navTrees = Array.from(
      this.container.querySelectorAll(":scope > ul, :scope > ol")
    ) as HTMLElement[];

    if (this.navTrees.length === 0) {
      console.warn("找不到导航树元素 .nav-tree");
      return;
    }

    console.log(`找到 ${this.navTrees.length} 个导航树`);
    this.navTrees.forEach((tree) => {
      this.buildNavTree(tree);
    });

    this.container.classList.remove("invisible");
  }

  /**
   * 构建单个导航树
   * @param navTree 导航树元素
   */
  private buildNavTree(navTree: HTMLElement): void {
    // 处理所有li节点
    navTree
      .querySelectorAll(":scope > li")
      .forEach((li) => TreeNodeProcessor.processTreeNode(li as HTMLLIElement));

    // 设置事件处理
    this.setupTreeClickHandlers(navTree);

    // 设置节点深度
    TreeNodeProcessor.setNodeDepth(navTree);
    TreeNodeProcessor.removeLeafToggle(navTree);

    // 展开当前页面路径
    if (this.config.autoExpandCurrentPath) {
      this.expandCurrentPath(navTree);
    }
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
   * 设置树节点点击处理程序
   * @param navTree 导航树元素
   */
  private setupTreeClickHandlers(navTree: HTMLElement): void {
    // 防止文本选择
    navTree.addEventListener("mousedown", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const nodeContent = target.closest(".node-content");
      if (nodeContent && DOMUtils.hasClass(nodeContent, "with-toggle")) {
        e.preventDefault();
      }
    });

    // 处理节点展开/折叠
    navTree.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const nodeContent = target.closest(".node-content") as HTMLElement;

      if (nodeContent && DOMUtils.hasClass(nodeContent, "with-toggle")) {
        // 防止文本选择
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }

        this.toggleNode(nodeContent);
      }

      if (target.tagName !== "A") {
        this.handleTreeLeafClick(target);
      }
    });
  }

  /**
   * 切换节点展开/折叠状态
   * @param nodeContent 节点内容元素
   */
  private toggleNode(nodeContent: HTMLElement): void {
    nodeContent.classList.toggle("expanded");
    const liElement = nodeContent.closest("li");
    if (liElement) {
      const subList = liElement.querySelector("ul, ol");
      if (subList) {
        subList.classList.toggle("hidden");
      }
    }
  }

  /**
   * 处理叶子节点点击
   * @param target 点击目标
   */
  private handleTreeLeafClick(target: HTMLElement): void {
    const leaf = target.closest(".tree-node-leaf") as HTMLElement | null;
    if (leaf) {
      const link = leaf.querySelector("a");
      if (link) {
        link.click();
      }
    }
  }

  /**
   * 展开包含当前页面的导航路径
   * @param navTree 导航树元素
   * @returns 活动链接元素或null
   */
  private expandCurrentPath(navTree: HTMLElement): HTMLElement | null {
    const currentPath = DOMUtils.removeQueryParams(window.location.pathname);
    const links = navTree.querySelectorAll("a");
    let activeLink: HTMLElement | null = null;
    const matchingElements: HTMLElement[] = [];

    // 首先尝试精确路径匹配
    activeLink = this.findActiveLinkByPath(
      links,
      currentPath,
      matchingElements
    );

    // 如果路径匹配失败，尝试使用breadcrumb文本路径匹配
    if (!activeLink) {
      activeLink = this.findActiveLinkByBreadcrumb(navTree, matchingElements);
    }

    // 如果仍然没有匹配，尝试前缀匹配
    if (!activeLink) {
      activeLink = this.findActiveLinkByPrefix(
        links,
        currentPath,
        matchingElements
      );
    }

    // 高亮活动链接
    this.highlightActiveLink(activeLink, matchingElements);
    return activeLink;
  }

  /**
   * 通过路径匹配查找活动链接
   * @param links 链接元素列表
   * @param currentPath 当前路径
   * @param matchingElements 匹配元素收集器
   * @returns 活动链接或null
   */
  private findActiveLinkByPath(
    links: NodeListOf<HTMLAnchorElement>,
    currentPath: string,
    matchingElements: HTMLElement[]
  ): HTMLElement | null {
    for (const link of Array.from(links)) {
      const href = link.getAttribute("href");
      if (href) {
        const absoluteHref = DOMUtils.removeQueryParams(
          DOMUtils.toAbsoluteUrl(href)
        );
        if (PathMatcher.isExactMatch(currentPath, absoluteHref)) {
          return this.markAsActive(link, matchingElements);
        }
      }
    }
    return null;
  }

  /**
   * 通过breadcrumb匹配查找活动链接
   * @param navTree 导航树元素
   * @param matchingElements 匹配元素收集器
   * @returns 活动链接或null
   */
  private findActiveLinkByBreadcrumb(
    navTree: HTMLElement,
    matchingElements: HTMLElement[]
  ): HTMLElement | null {
    const breadcrumbPath = BreadcrumbManager.getBreadcrumbPath();
    if (!breadcrumbPath || breadcrumbPath.length === 0) {
      return null;
    }

    console.log("尝试使用breadcrumb路径匹配:", breadcrumbPath);

    const matchedLink = PathMatcher.matchByTextPath(navTree, breadcrumbPath);
    if (matchedLink) {
      console.log(
        `找到匹配的链接: ${DOMUtils.getCleanTextContent(matchedLink)}`
      );
      return this.markAsActive(matchedLink, matchingElements);
    }

    return null;
  }

  /**
   * 通过前缀匹配查找活动链接
   * @param links 链接元素列表
   * @param currentPath 当前路径
   * @param matchingElements 匹配元素收集器
   * @returns 活动链接或null
   */
  private findActiveLinkByPrefix(
    links: NodeListOf<HTMLAnchorElement>,
    currentPath: string,
    matchingElements: HTMLElement[]
  ): HTMLElement | null {
    const prefixMatchingElements: [HTMLAnchorElement, string][] = [];

    for (const link of Array.from(links)) {
      const href = link.getAttribute("href");
      if (href) {
        const absoluteHref = DOMUtils.removeQueryParams(
          DOMUtils.toAbsoluteUrl(href)
        );
        if (PathMatcher.isPrefixMatch(currentPath, absoluteHref)) {
          prefixMatchingElements.push([link, absoluteHref]);
        }
      }
    }

    // 使用路径段最长者
    const longestMatch = prefixMatchingElements.sort(
      (a, b) => b[1].split("/").length - a[1].split("/").length
    )[0];

    if (longestMatch) {
      return this.markAsActive(longestMatch[0], matchingElements);
    }

    return null;
  }

  /**
   * 标记链接为活动状态
   * @param link 链接元素
   * @param matchingElements 匹配元素收集器
   * @returns 链接元素
   */
  private markAsActive(
    link: HTMLElement,
    matchingElements: HTMLElement[]
  ): HTMLElement {
    const listItem = link.closest("li");
    if (listItem) {
      listItem.classList.add("active");
      link.classList.add("active-link");
      this.collectParentElements(listItem, matchingElements);
    }
    return link;
  }

  /**
   * 高亮活动链接
   * @param activeLink 活动链接
   * @param matchingElements 匹配元素列表
   */
  private highlightActiveLink(
    activeLink: HTMLElement | null,
    matchingElements: HTMLElement[]
  ): void {
    // 展开包含当前页面的所有父级导航
    this.expandElements(matchingElements);

    // 滚动到高亮的链接
    if (this.config.scrollToActiveLink && activeLink) {
      this.scrollToActiveLink(activeLink);
    }
  }

  /**
   * 收集父元素
   * @param element 起始元素
   * @param collection 收集器数组
   */
  private collectParentElements(
    element: Element,
    collection: HTMLElement[]
  ): void {
    let parent = element.parentElement;
    while (parent) {
      const parentLi = parent.closest("li");
      if (parentLi) {
        collection.push(parentLi as HTMLElement);
        parent = parentLi.parentElement;
      } else {
        break;
      }
    }
  }

  /**
   * 展开元素列表
   * @param elements 要展开的元素列表
   */
  private expandElements(elements: HTMLElement[]): void {
    elements.forEach((element) => {
      const nodeContent = element.querySelector(".node-content");
      if (nodeContent) {
        nodeContent.classList.add("expanded");
      }

      const subList = element.querySelector("ul, ol");
      if (subList) {
        subList.classList.remove("hidden");
      }
    });
  }

  /**
   * 滚动到活动链接
   * @param activeLink 活动链接
   */
  private scrollToActiveLink(activeLink: HTMLElement): void {
    setTimeout(() => {
      activeLink.scrollIntoView({ behavior: "smooth", block: "center" });
    }, this.config.scrollDelay);
  }

  /**
   * 更新导航高亮
   */
  private updateNavHighlight(): void {
    // 如果导航树为空，重新初始化
    if (this.navTrees.length === 0) {
      this.initNavTrees();
      return;
    }

    let hasActive = false;
    this.navTrees.forEach((tree) => {
      // 清除当前的所有高亮
      tree.querySelectorAll(".active, .active-link").forEach((el) => {
        el.classList.remove("active", "active-link");
      });

      // 重新应用高亮
      const activeLink = this.expandCurrentPath(tree);
      if (activeLink) {
        hasActive = true;
      }
    });

    console.log(`导航高亮更新完成，当前路径: ${window.location.pathname}`);
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

    this.navTrees.forEach((tree) => {
      try {
        // 找到导航树中实际存在的最大深度
        const maxDepth = this.getMaxDepthInNavTree(tree);
        const effectivePath = textPath.slice(
          0,
          Math.min(textPath.length, maxDepth + 1)
        );

        console.log(`导航树最大深度: ${maxDepth}, 有效路径:`, effectivePath);

        // 如果只有一个元素，直接toggle该节点
        if (effectivePath.length === 1) {
          this.toggleSingleNodeByText(tree, effectivePath[0]);
        } else {
          // 先展开所有祖先节点
          this.expandAncestorsByTextPath(tree, effectivePath);
          // 然后toggle最后一级节点
          this.toggleLastLevelNodeByTextPath(tree, effectivePath);
        }
      } catch (error) {
        console.error("toggleByTextPath 执行出错:", error);
      }
    });
  }

  /**
   * 获取导航树中的最大深度
   * @param navTree 导航树元素
   * @returns 最大深度
   */
  private getMaxDepthInNavTree(navTree: HTMLElement): number {
    const depthElements = navTree.querySelectorAll("[data-depth]");
    let maxDepth = 0;

    for (const element of Array.from(depthElements)) {
      const depth = parseInt(DOMUtils.getAttribute(element, "data-depth", "0"));
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  /**
   * 切换单个节点（深度为0的根节点）
   * @param navTree 导航树元素
   * @param text 节点文本
   */
  private toggleSingleNodeByText(navTree: HTMLElement, text: string): void {
    const links = navTree.querySelectorAll("a");

    for (const link of Array.from(links)) {
      const linkText = DOMUtils.getCleanTextContent(link);
      if (linkText === text) {
        const listItem = link.closest("li");
        if (listItem) {
          const depth = parseInt(
            DOMUtils.getAttribute(listItem, "data-depth", "0")
          );
          // 检查深度是否为0（根节点）
          if (depth === 0) {
            const nodeContent = listItem.querySelector(".node-content");
            if (nodeContent && DOMUtils.hasClass(nodeContent, "with-toggle")) {
              // toggle展开/折叠状态
              nodeContent.classList.toggle("expanded");
              const subList = listItem.querySelector("ul, ol");
              if (subList) {
                subList.classList.toggle("hidden");
              }
              console.log(`切换根节点: ${text}`);
            } else {
              console.log(`根节点 ${text} 没有toggle功能`);
            }
            break; // 找到匹配项后立即退出
          }
        }
      }
    }
  }

  /**
   * 展开祖先节点
   * @param navTree 导航树元素
   * @param textPath 文本路径
   */
  private expandAncestorsByTextPath(
    navTree: HTMLElement,
    textPath: string[]
  ): void {
    if (textPath.length <= 1) {
      return;
    }

    // 展开除最后一级外的所有祖先节点
    const ancestorPath = textPath.slice(0, -1);
    const links = navTree.querySelectorAll("a");

    for (let i = 0; i < ancestorPath.length; i++) {
      const text = ancestorPath[i];
      const targetDepth = i; // 目标深度

      for (const link of Array.from(links)) {
        const linkText = DOMUtils.getCleanTextContent(link);
        if (linkText === text) {
          const listItem = link.closest("li");
          if (listItem) {
            const depth = parseInt(
              DOMUtils.getAttribute(listItem, "data-depth", "0")
            );
            // 检查深度是否匹配
            if (depth === targetDepth) {
              const nodeContent = listItem.querySelector(".node-content");
              if (nodeContent) {
                nodeContent.classList.add("expanded");
              }
              const subList = listItem.querySelector("ul, ol");
              if (subList) {
                subList.classList.remove("hidden");
              }
              break; // 找到匹配项后立即退出
            }
          }
        }
      }
    }
  }

  /**
   * toggle最后一级节点
   * @param navTree 导航树元素
   * @param textPath 文本路径
   */
  private toggleLastLevelNodeByTextPath(
    navTree: HTMLElement,
    textPath: string[]
  ): void {
    const lastText = textPath[textPath.length - 1];
    const targetDepth = textPath.length - 1; // 最后一级的深度
    const links = navTree.querySelectorAll("a");

    for (const link of Array.from(links)) {
      const linkText = DOMUtils.getCleanTextContent(link);
      if (linkText === lastText) {
        const listItem = link.closest("li");
        if (listItem) {
          const depth = parseInt(
            DOMUtils.getAttribute(listItem, "data-depth", "0")
          );
          // 检查深度是否匹配
          if (depth === targetDepth) {
            const nodeContent = listItem.querySelector(".node-content");
            if (nodeContent && DOMUtils.hasClass(nodeContent, "with-toggle")) {
              // toggle展开/折叠状态
              nodeContent.classList.toggle("expanded");
              const subList = listItem.querySelector("ul, ol");
              if (subList) {
                subList.classList.toggle("hidden");
              }
            }
            break; // 找到匹配项后立即退出
          }
        }
      }
    }
  }

  /**
   * 获取breadcrumb路径（公共方法）
   * @returns breadcrumb路径数组
   */
  public getBreadcrumbPath(): string[] {
    return BreadcrumbManager.getBreadcrumbPath();
  }
}

/**
 * 初始化侧边栏导航树
 * 这是模块的入口函数，负责初始化整个导航树系统
 */
export function initSidebarNavTree(): void {
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById(
      "sidebar-nav-tree"
    ) as HTMLElement;

    if (!container) {
      console.error("找不到导航树容器元素 #sidebar-nav-tree");
      return;
    }

    // 初始化导航树管理器
    const navTreeManager = NavTreeManager.getInstance(container);

    // 设置breadcrumb点击处理
    BreadcrumbManager.setupClickHandler(navTreeManager);
  });
}
