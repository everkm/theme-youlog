import { EVENT_PAGE_LOADED } from "../pageAjax";
import "./sidebarNavTree.css";

// 添加递归函数设置深度
function setNodeDepth(element: HTMLElement, depth: number = 0): void {
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
    setNodeDepth(child as HTMLElement, newDepth);
  });
}

// 递归处理树节点
function processTreeNode(liElement: HTMLLIElement): void {
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
      ((node as Element).tagName === "UL" || (node as Element).tagName === "OL")
  );

  if (childNodes.length === 1) {
    // 只有一个子节点，添加叶子节点类
    liElement.classList.add("tree-node-leaf");

    // 为叶子节点也添加node-content
    const contentNode = childNodes[0];
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content", "with-toggle");

    // 直接移动内容到node-content，而不是克隆
    contentDiv.appendChild(contentNode);

    // 在原位置插入内容div
    liElement.insertBefore(contentDiv, liElement.firstChild);

    // 不再需要移除原始节点，因为已经直接移动了
  } else if (childNodes.length >= 2 && listIndex !== -1) {
    // 有两个以上子节点且其中有ul/ol，添加分支节点类
    liElement.classList.add("tree-node-branch");

    // 处理前面的节点作为主干
    if (listIndex > 0) {
      // 获取前面的节点
      const contentNodes = childNodes.slice(0, listIndex);

      // 修改条件：处理多个节点或任何单个节点（不管是文本节点还是元素节点）
      if (contentNodes.length > 1 || contentNodes.length === 1) {
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("node-content", "with-toggle");

        // 将前面节点直接添加到content div
        contentNodes.forEach((node) => {
          // 不再克隆节点，而是直接移动
          contentDiv.appendChild(node);
        });

        // 在原位置插入内容div
        liElement.insertBefore(contentDiv, childNodes[listIndex]);

        // 不需要再移除原始节点，因为已经直接移动了
      }
    }

    // 递归处理子列表
    const subList = childNodes[listIndex] as Element;
    // 默认折叠子列表
    subList.classList.add("hidden");

    Array.from(subList.querySelectorAll("li")).forEach((li) =>
      processTreeNode(li as HTMLLIElement)
    );
  }
}

// 移除叶子节点的toggle
function remoteLeafToggle(el: HTMLElement): void {
  const toggleElements = el.querySelectorAll(".with-toggle");
  toggleElements.forEach(function (element) {
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

// 将相对链接转换为绝对链接
function toAbsoluteUrl(relativeUrl: string): string {
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

// 移除查询参数中的查询参数部分
function removeQueryParams(url: string): string {
  return url.split("?")[0].split("#")[0];
}

function findTreeNodeLeaf(el: HTMLElement): HTMLElement | null {
  return el.closest(".tree-node-leaf") as HTMLElement | null;
}

function handleTreeLeafClick(el: HTMLElement): void {
  const leaf = findTreeNodeLeaf(el);
  // console.log("handleTreeLeafClick", el, leaf);
  if (leaf) {
    const link = leaf.querySelector("a");
    if (link) {
      link.click();
    }
  }
}

// 导航树管理类
class NavTreeManager {
  private container: HTMLElement;
  private navTrees: HTMLElement[] = [];
  private static instance: NavTreeManager | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 单例模式
    if (NavTreeManager.instance) {
      return NavTreeManager.instance;
    }
    NavTreeManager.instance = this;

    this.initNavTrees();
    this.setupEventListeners();

    // 在控制台输出调试信息
    console.log("NavTreeManager 初始化完成, 监听事件:", EVENT_PAGE_LOADED);
  }

  // 获取单例实例
  public static getInstance(container: HTMLElement): NavTreeManager {
    if (!NavTreeManager.instance) {
      NavTreeManager.instance = new NavTreeManager(container);
    }
    return NavTreeManager.instance;
  }

  // 初始化所有导航树
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

  // 构建导航树
  private buildNavTree(navTree: HTMLElement): void {
    navTree
      .querySelectorAll(":scope > li")
      .forEach((li) => processTreeNode(li as HTMLLIElement));

    // 添加事件代理，处理所有节点的点击事件
    this.setupTreeClickHandlers(navTree);

    // 设置所有节点的深度
    setNodeDepth(navTree);
    remoteLeafToggle(navTree);

    // 展开当前页面路径
    this.expandCurrentPath(navTree);
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 监听页面加载事件，更新导航高亮
    document.addEventListener(EVENT_PAGE_LOADED, (event: Event) => {
      // console.log("接收到页面加载事件:", EVENT_PAGE_LOADED, event);
      this.updateNavHighlight();
    });

    // 监听浏览器历史变化 - 这对于处理后退按钮也很重要
    window.addEventListener("popstate", () => {
      // console.log("浏览器历史变化 (popstate)");
      this.updateNavHighlight();
    });
  }

  // 设置树节点点击处理程序
  private setupTreeClickHandlers(navTree: HTMLElement): void {
    // 防止文本选择
    navTree.addEventListener("mousedown", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const nodeContent = target.closest(".node-content");
      if (nodeContent && nodeContent.classList.contains("with-toggle")) {
        e.preventDefault();
      }
    });

    // 处理节点展开/折叠
    navTree.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const nodeContent = target.closest(".node-content") as HTMLElement;

      if (nodeContent && nodeContent.classList.contains("with-toggle")) {
        // 防止文本选择
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }

        nodeContent.classList.toggle("expanded");
        const liElement = nodeContent.closest("li");
        if (liElement) {
          const subList = liElement.querySelector("ul, ol");
          if (subList) {
            subList.classList.toggle("hidden");
          }
        }
      }

      if (target.tagName !== "A") {
        handleTreeLeafClick(target);
      }
    });
  }

  // 展开包含当前页面的导航路径
  private expandCurrentPath(navTree: HTMLElement): HTMLElement | null {
    // 移除查询参数，只保留路径部分进行匹配
    const currentPath = removeQueryParams(window.location.pathname);

    // 查找所有链接并转换为绝对路径
    const links = navTree.querySelectorAll("a");
    let activeLink: HTMLElement | null = null;
    const matchingElements: HTMLElement[] = [];

    // 首先尝试路径匹配
    for (const link of Array.from(links)) {
      const href = link.getAttribute("href");
      if (href) {
        const absoluteHref = removeQueryParams(toAbsoluteUrl(href));
        if (this.isMatchingPath(currentPath, absoluteHref)) {
          activeLink = this.findActiveLink(link, matchingElements);
          break; // 找到匹配项后立即退出
        }
      }
    }

    // 如果路径匹配失败，尝试使用breadcrumb文本路径匹配
    if (!activeLink) {
      activeLink = this.matchByBreadcrumbPath(navTree, matchingElements);
    }

    // 高亮活动链接
    this.highlightActiveLink(activeLink, matchingElements);
    return activeLink;
  }

  private highlightActiveLink(
    activeLink: HTMLElement | null,
    matchingElements: HTMLElement[]
  ): void {
    // 展开包含当前页面的所有父级导航
    this.expandElements(matchingElements);

    // 滚动到高亮的链接
    this.scrollToActiveLink(activeLink);
  }

  // 找到活动链接, 处理活动链接
  private findActiveLink(
    link: HTMLElement,
    matchingElements: HTMLElement[]
  ): HTMLElement | null {
    // 标记当前活动项
    const listItem = link.closest("li");
    if (listItem) {
      listItem.classList.add("active");

      // 为当前项链接添加高亮样式
      link.classList.add("active-link");

      // 收集需要展开的所有父元素
      this.collectParentElements(listItem, matchingElements);

      return link;
    }
    return null;
  }

  // 通过breadcrumb文本路径匹配
  private matchByBreadcrumbPath(
    navTree: HTMLElement,
    matchingElements: HTMLElement[]
  ): HTMLElement | null {
    const breadcrumbPath = this.getBreadcrumbPath();
    if (!breadcrumbPath || breadcrumbPath.length === 0) {
      return null;
    }

    console.log("尝试使用breadcrumb路径匹配:", breadcrumbPath);

    // 查找所有链接
    const links = navTree.querySelectorAll("a");
    let activeLink: HTMLElement | null = null;

    // 按路径前缀依次匹配，从最长路径开始
    for (let pathLength = breadcrumbPath.length; pathLength > 0; pathLength--) {
      const currentPath = breadcrumbPath.slice(0, pathLength);
      console.log(`尝试匹配路径长度 ${pathLength}:`, currentPath);

      // 查找匹配当前路径前缀的链接
      for (const link of Array.from(links)) {
        const linkText = link.textContent?.trim();
        if (linkText === currentPath[currentPath.length - 1]) {
          // 检查这个链接是否在正确的路径层级上
          if (this.isLinkInCorrectPathLevel(link, currentPath)) {
            activeLink = this.findActiveLink(link, matchingElements);
            console.log(`找到匹配的链接: ${linkText}, 路径:`, currentPath);
            break;
          }
        }
      }

      if (activeLink) {
        break; // 找到匹配项后立即退出
      }
    }

    return activeLink;
  }

  // 检查链接是否在正确的路径层级上
  private isLinkInCorrectPathLevel(
    link: HTMLElement,
    targetPath: string[]
  ): boolean {
    const listItem = link.closest("li");
    if (!listItem) {
      return false;
    }

    // 获取链接在导航树中的深度
    const depth = parseInt(listItem.getAttribute("data-depth") || "0");

    // 检查深度是否与目标路径长度匹配（减1，因为深度从0开始）
    return depth === targetPath.length - 1;
  }

  // 获取breadcrumb路径
  public getBreadcrumbPath(): string[] {
    const breadcrumb = document.getElementById("breadcrumb");
    if (!breadcrumb) {
      return [];
    }

    const navTitleElements = breadcrumb.querySelectorAll("[data-nav-title]");
    return Array.from(navTitleElements)
      .map((el) => {
        const text = el.textContent?.trim();
        return text || "";
      })
      .filter((text) => text.length > 0);
  }

  // 链接不匹配, 则收集所有前缀匹配，选取路径段最长者
  private fallbackToLongestPrefixMatchingLink(
    navTree: HTMLElement
  ): HTMLElement | null {
    // 移除查询参数，只保留路径部分进行匹配
    const currentPath = removeQueryParams(window.location.pathname);

    const links = navTree.querySelectorAll("a");
    let activeLink: HTMLElement | null = null;
    const matchingElements: HTMLElement[] = [];

    const prefixMatchingElements: [HTMLAnchorElement, string][] = [];
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href) {
        const absoluteHref = removeQueryParams(toAbsoluteUrl(href));
        if (this.isMatchingPrefix(currentPath, absoluteHref)) {
          prefixMatchingElements.push([link, absoluteHref]);
        }
      }
    });

    // 使用路径段最长者
    const longestPrefixMatchingElement = prefixMatchingElements.sort(
      (a, b) => b[1].split("/").length - a[1].split("/").length
    )[0];
    if (longestPrefixMatchingElement) {
      return this.findActiveLink(
        longestPrefixMatchingElement[0],
        matchingElements
      );
    }

    this.highlightActiveLink(activeLink, matchingElements);
    return activeLink;
  }

  // 检查路径是否匹配
  private isMatchingPath(currentPath: string, targetPath: string): boolean {
    return (
      currentPath === targetPath ||
      (currentPath.endsWith("/") && currentPath.slice(0, -1) === targetPath) ||
      (!currentPath.endsWith("/") && `${currentPath}/` === targetPath)
    );
  }

  private isMatchingPrefix(currentPath: string, targetPath: string): boolean {
    // 对targetPath进行处理，
    // 1. 如果以 index.html 结尾，则去掉 index.html
    // 2. 否则去掉 .html 后缀, 添加 /
    const processedTargetPath = targetPath.endsWith("/")
      ? targetPath
      : targetPath.endsWith("/index.html")
      ? targetPath.slice(0, -11)
      : targetPath.replace(/\.html$/, "/");

    return currentPath.startsWith(processedTargetPath);
  }

  // 收集父元素
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

  // 展开元素列表
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

  // 滚动到活动链接
  private scrollToActiveLink(activeLink: HTMLElement | null): void {
    if (activeLink) {
      setTimeout(() => {
        activeLink?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }

  // 清除当前高亮并更新为新页面的高亮
  private updateNavHighlight(): void {
    // console.log("更新导航高亮，当前路径:", window.location.pathname);

    // 如果导航树为空，重新初始化
    if (this.navTrees.length === 0) {
      this.initNavTrees();
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

    // 如果没有任何链接匹配, 则收集所有前缀匹配，选取路径段最长者
    if (!hasActive) {
      Array.from(this.navTrees).some((tree) => {
        return this.fallbackToLongestPrefixMatchingLink(tree);
      });
    }
  }

  // 手动触发高亮更新
  public refreshHighlight(): void {
    this.updateNavHighlight();
  }

  // 按文本路径toggle节点
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

        // 先展开所有祖先节点
        this.expandAncestorsByTextPath(tree, effectivePath);

        // 然后toggle最后一级节点
        this.toggleLastLevelNodeByTextPath(tree, effectivePath);
      } catch (error) {
        console.error("toggleByTextPath 执行出错:", error);
      }
    });
  }

  // 获取导航树中的最大深度
  private getMaxDepthInNavTree(navTree: HTMLElement): number {
    const depthElements = navTree.querySelectorAll("[data-depth]");
    let maxDepth = 0;

    for (const element of Array.from(depthElements)) {
      const depth = parseInt(element.getAttribute("data-depth") || "0");
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  // 展开祖先节点
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
        const linkText = link.textContent?.trim();
        if (linkText === text) {
          const listItem = link.closest("li");
          if (listItem) {
            const depth = parseInt(listItem.getAttribute("data-depth") || "0");
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

  // toggle最后一级节点
  private toggleLastLevelNodeByTextPath(
    navTree: HTMLElement,
    textPath: string[]
  ): void {
    const lastText = textPath[textPath.length - 1];
    const targetDepth = textPath.length - 1; // 最后一级的深度
    const links = navTree.querySelectorAll("a");

    for (const link of Array.from(links)) {
      const linkText = link.textContent?.trim();
      if (linkText === lastText) {
        const listItem = link.closest("li");
        if (listItem) {
          const depth = parseInt(listItem.getAttribute("data-depth") || "0");
          // 检查深度是否匹配
          if (depth === targetDepth) {
            const nodeContent = listItem.querySelector(".node-content");
            if (nodeContent && nodeContent.classList.contains("with-toggle")) {
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
}

// 初始化导航树
export function initSidebarNavTree(): void {
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById(
      "sidebar-nav-tree"
    ) as HTMLElement;
    NavTreeManager.getInstance(container);

    document
      .getElementById("breadcrumb")
      ?.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        console.log("breadcrumb click", target);

        if (target.hasAttribute("data-nav-title")) {
          // 检查父节点是否是A标签
          const parentA = target.closest("a");
          if (!parentA) {
            try {
              // 父节点不是A标签，获取breadcrumb路径并调用toggle
              const navTreeManager = NavTreeManager.getInstance(container);
              const breadcrumbPath = navTreeManager.getBreadcrumbPath();

              if (breadcrumbPath.length === 0) {
                console.warn("breadcrumb路径为空");
                return;
              }

              const clickedIndex = Array.from(
                target.parentElement?.children || []
              ).indexOf(target);
              const pathToCurrent = breadcrumbPath.slice(0, clickedIndex + 1);

              console.log("click nav title, path to current:", pathToCurrent);
              navTreeManager.toggleByTextPath(pathToCurrent);
            } catch (error) {
              console.error("breadcrumb点击处理出错:", error);
            }
          }
        }
      });
  });
}
