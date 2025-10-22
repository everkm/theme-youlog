import { createStore } from "solid-js/store";

/**
 * 导航树节点接口
 * 定义树节点的基本结构
 */
export interface NavItem {
  /** 节点唯一标识符 */
  nodeId: string;
  /** 节点标题 */
  title: string;
  /** 节点链接 */
  url?: string;
  /** 是否在新窗口打开 */
  new_window?: boolean;
  /** 子节点列表 */
  children?: NavItem[];
}

/**
 * 导航树状态接口
 */
export interface NavTreeStateData {
  /** 树形结构数据 */
  tree: NavItem[];
  /** 展开的节点ID集合 */
  expandedIds: Set<string>;
  /** 活动的节点ID集合 */
  activeIds: Set<string>;
}

/**
 * 导航树配置接口
 */
export interface NavTreeConfig {
  /** 是否自动展开当前路径 */
  autoExpandCurrentPath: boolean;
  /** 是否启用breadcrumb切换功能 */
  enableBreadcrumbToggle: boolean;
  /** 是否滚动到活动链接 */
  scrollToActiveLink: boolean;
  /** 滚动延迟时间(ms) */
  scrollDelay: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: NavTreeConfig = {
  autoExpandCurrentPath: true,
  enableBreadcrumbToggle: true,
  scrollToActiveLink: true,
  scrollDelay: 100,
};

/**
 * DOM工具类
 */
class DOMUtils {
  static toAbsoluteUrl(relativeUrl: string): string {
    if (
      relativeUrl.startsWith("http://") ||
      relativeUrl.startsWith("https://") ||
      relativeUrl.startsWith("/")
    ) {
      return relativeUrl;
    }
    const basePath = window.location.pathname.split("/").slice(0, -1).join("/");
    return `${basePath}/${relativeUrl}`;
  }

  static removeQueryParams(url: string): string {
    return url.split("?")[0].split("#")[0];
  }
}

/**
 * 路径匹配工具类
 */
class PathMatcher {
  static isExactMatch(currentPath: string, targetPath: string): boolean {
    return (
      currentPath === targetPath ||
      (currentPath.endsWith("/") && currentPath.slice(0, -1) === targetPath) ||
      (!currentPath.endsWith("/") && `${currentPath}/` === targetPath)
    );
  }

  static isPrefixMatch(currentPath: string, targetPath: string): boolean {
    const processedTargetPath = targetPath.endsWith("/")
      ? targetPath
      : targetPath.endsWith("/index.html")
      ? targetPath.slice(0, -11)
      : targetPath.replace(/\.html$/, "/");

    return currentPath.startsWith(processedTargetPath);
  }
}

/**
 * 导航树状态管理类
 * 负责管理导航树的所有状态和业务逻辑
 */
export class NavTreeState {
  private store: ReturnType<typeof createStore<NavTreeStateData>>;
  private config: NavTreeConfig;

  constructor(items: NavItem[], config: Partial<NavTreeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 初始化状态
    const initialState = this.initializeState(items);
    this.store = createStore(initialState);
  }

  /**
   * 生成唯一ID
   */
  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 初始化状态
   */
  private initializeState(items: NavItem[]): NavTreeStateData {
    const expandedIds = new Set<string>();
    const activeIds = new Set<string>();

    const tree = this.initializeItems(items);

    return {
      tree,
      expandedIds,
      activeIds,
    };
  }

  // 递归处理节点，重新生成 nodeId，保持树形结构
  private initializeItems(items: NavItem[]): NavItem[] {
    return items.map((item) => {
      const processedItem: NavItem = {
        ...item,
        nodeId: this.generateNodeId(),
        children: item.children
          ? this.initializeItems(item.children)
          : undefined,
      };

      return processedItem;
    });
  }

  /**
   * 获取状态
   */
  get state() {
    return this.store[0];
  }

  /**
   * 获取更新函数
   */
  get updateState() {
    return this.store[1];
  }

  /**
   * 递归查找节点的路径
   */
  private findNodePath(
    items: NavItem[],
    targetNodeId: string,
    currentPath: string[] = []
  ): string[] | null {
    for (const item of items) {
      const newPath = [...currentPath, item.nodeId];

      if (item.nodeId === targetNodeId) {
        return newPath;
      }

      if (item.children) {
        const childPath = this.findNodePath(
          item.children,
          targetNodeId,
          newPath
        );
        if (childPath) {
          return childPath;
        }
      }
    }

    return null;
  }

  /**
   * 获取节点的路径
   */
  getNodePath(nodeId: string): string[] | null {
    return this.findNodePath(this.state.tree, nodeId);
  }

  /**
   * 递归查找节点
   */
  private findNodeById(items: NavItem[], nodeId: string): NavItem | undefined {
    for (const item of items) {
      if (item.nodeId === nodeId) {
        return item;
      }
      if (item.children) {
        const found = this.findNodeById(item.children, nodeId);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * 根据ID获取节点
   */
  getNode(nodeId: string): NavItem | undefined {
    return this.findNodeById(this.state.tree, nodeId);
  }

  /**
   * 获取根节点列表
   */
  getRootNodes(): NavItem[] {
    return this.state.tree;
  }

  /**
   * 获取子节点列表
   */
  getChildNodes(nodeId: string): NavItem[] {
    const node = this.getNode(nodeId);
    return node?.children || [];
  }

  /**
   * 检查节点是否展开
   */
  isExpanded(nodeId: string): boolean {
    return this.state.expandedIds.has(nodeId);
  }

  /**
   * 检查节点是否为活动状态
   */
  isActive(nodeId: string): boolean {
    return this.state.activeIds.has(nodeId);
  }

  /**
   * 切换节点展开状态
   */
  toggleExpanded(nodeId: string): void {
    this.setExpanded(nodeId, !this.isExpanded(nodeId));
  }

  /**
   * 设置节点展开状态
   */
  setExpanded(nodeId: string, expanded: boolean): void {
    this.updateState("expandedIds", (prev) => {
      const newSet = new Set(prev);
      if (expanded) {
        // 展开时，需要确保所有祖先节点也展开
        const nodePath = this.getNodePath(nodeId);
        if (nodePath) {
          // 将路径上的所有节点都设置为展开状态
          nodePath.forEach((pathNodeId) => {
            newSet.add(pathNodeId);
          });
        }
      } else {
        // 折叠时，只移除当前节点
        newSet.delete(nodeId);
      }
      return newSet;
    });
  }

  /**
   * 设置节点活动状态
   */
  setActive(nodeId: string, active: boolean): void {
    this.updateState("activeIds", (prev) => {
      const newSet = new Set(prev);
      if (active) {
        newSet.add(nodeId);
      } else {
        newSet.delete(nodeId);
      }
      return newSet;
    });
  }

  /**
   * 递归查找匹配当前路径的节点
   */
  private findActiveNodeRecursive(
    items: NavItem[],
    currentPath: string
  ): string | null {
    for (const item of items) {
      if (item.url) {
        const absoluteHref = DOMUtils.removeQueryParams(
          DOMUtils.toAbsoluteUrl(item.url)
        );

        // 精确匹配
        if (PathMatcher.isExactMatch(currentPath, absoluteHref)) {
          return item.nodeId;
        }

        // 前缀匹配
        if (PathMatcher.isPrefixMatch(currentPath, absoluteHref)) {
          return item.nodeId;
        }
      }

      // 递归查找子节点
      if (item.children) {
        const childResult = this.findActiveNodeRecursive(
          item.children,
          currentPath
        );
        if (childResult) {
          return childResult;
        }
      }
    }

    return null;
  }

  /**
   * 查找匹配当前路径的节点
   */
  findActiveNode(currentPath: string): string | null {
    return this.findActiveNodeRecursive(this.state.tree, currentPath);
  }

  /**
   * 更新活动状态
   */
  updateActiveState(): void {
    if (!this.config.autoExpandCurrentPath) return;

    const currentPath = DOMUtils.removeQueryParams(window.location.pathname);
    const activeNodeId = this.findActiveNode(currentPath);

    if (activeNodeId) {
      const nodePath = this.getNodePath(activeNodeId);
      if (nodePath) {
        // 清除所有活动状态
        this.updateState("activeIds", new Set());
        this.updateState("expandedIds", new Set());

        // 设置活动状态
        nodePath.forEach((nodeId) => {
          this.setActive(nodeId, true);
        });

        // 展开包含活动项的路径（除了最后一个节点）
        nodePath.slice(0, -1).forEach((nodeId) => {
          this.setExpanded(nodeId, true);
        });
      }
    }
  }

  /**
   * 递归查找匹配文本路径的节点
   */
  private findNodeByTextPathRecursive(
    items: NavItem[],
    textPath: string[],
    currentPath: string[] = []
  ): NavItem | null {
    for (const item of items) {
      const newPath = [...currentPath, item.title];

      // 检查是否匹配
      if (
        newPath.length === textPath.length &&
        newPath.every((text, index) => text === textPath[index])
      ) {
        return item;
      }

      // 递归查找子节点
      if (item.children) {
        const childResult = this.findNodeByTextPathRecursive(
          item.children,
          textPath,
          newPath
        );
        if (childResult) {
          return childResult;
        }
      }
    }

    return null;
  }

  /**
   * 按文本路径切换节点
   */
  toggleByTextPath(textPath: string[]): void {
    if (!textPath || textPath.length === 0) return;

    // 查找匹配的节点
    const matchedNode = this.findNodeByTextPathRecursive(
      this.state.tree,
      textPath
    );

    if (matchedNode) {
      this.toggleExpanded(matchedNode.nodeId);
    }
  }
}
