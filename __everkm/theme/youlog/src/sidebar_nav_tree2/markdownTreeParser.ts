import { NavItem } from "../components/nav_tree/NavTreeState";

/**
 * Markdown HTML 树解析规则配置
 * 定义如何从 markdown 转换的 HTML 中提取导航树结构
 */
export interface MarkdownTreeParseRule {
  /** 支持的根元素标签 */
  rootTags: string[];
  /** 列表项标签 */
  itemTag: string;
  /** 链接标签 */
  linkTag: string;
  /** 段落标签（可能包含链接或文本） */
  paragraphTag: string;
  /** 子列表标签 */
  listTags: string[];
}

/**
 * 默认的 Markdown HTML 解析规则
 */
export const DEFAULT_MARKDOWN_RULE: MarkdownTreeParseRule = {
  rootTags: ["UL", "OL"],
  itemTag: "LI",
  linkTag: "A",
  paragraphTag: "P",
  listTags: ["UL", "OL"],
};

/**
 * 提取策略接口
 */
interface ExtractionStrategy {
  extractTitle(li: HTMLLIElement): string | null;
  extractLink(li: HTMLLIElement): HTMLAnchorElement | null;
  extractSubList(li: HTMLLIElement): HTMLElement | null;
}

/**
 * Markdown HTML 提取策略实现
 * 处理 markdown 转换后的标准 HTML 结构
 */
class MarkdownExtractionStrategy implements ExtractionStrategy {
  constructor(private rule: MarkdownTreeParseRule) {}

  /**
   * 提取标题文本
   * 优先级：A标签文本 > P标签文本 > 第一个文本节点
   */
  extractTitle(li: HTMLLIElement): string | null {
    // 1. 优先从链接中提取
    const link = this.extractLink(li);
    if (link) {
      const title = link.textContent?.trim();
      if (title) return title;
    }

    // 2. 从 P 标签中提取（如果没有链接）
    const pElement = Array.from(li.children).find(
      (el) => el.tagName === this.rule.paragraphTag
    );
    if (pElement) {
      const title = pElement.textContent?.trim();
      if (title) return title;
    }

    // 3. 从第一个文本节点提取
    const firstTextNode = Array.from(li.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (firstTextNode) {
      const title = firstTextNode.textContent?.trim();
      if (title) return title;
    }

    return null;
  }

  /**
   * 提取链接元素
   * 支持：直接的 A 标签 或 P > A 结构
   */
  extractLink(li: HTMLLIElement): HTMLAnchorElement | null {
    // 查找直接的 A 标签
    const directLink = Array.from(li.children).find(
      (el) => el.tagName === this.rule.linkTag
    ) as HTMLAnchorElement | undefined;

    if (directLink) return directLink;

    // 查找 P > A 结构
    const pElement = Array.from(li.children).find(
      (el) => el.tagName === this.rule.paragraphTag
    );
    if (pElement) {
      const linkInP = pElement.querySelector(this.rule.linkTag);
      if (linkInP) return linkInP as HTMLAnchorElement;
    }

    return null;
  }

  /**
   * 提取子列表
   */
  extractSubList(li: HTMLLIElement): HTMLElement | null {
    const subList = Array.from(li.children).find((el) =>
      this.rule.listTags.includes(el.tagName)
    ) as HTMLElement | undefined;

    return subList || null;
  }
}

/**
 * Markdown HTML 树解析器
 * 专门用于解析 markdown 转换后的 HTML 结构
 */
export class MarkdownTreeParser {
  private strategy: ExtractionStrategy;

  constructor(rule: MarkdownTreeParseRule = DEFAULT_MARKDOWN_RULE) {
    this.strategy = new MarkdownExtractionStrategy(rule);
  }

  /**
   * 解析 ul/ol 元素为 NavItem 树
   */
  parse(element: HTMLElement): NavItem[] {
    if (!this.isValidRoot(element)) {
      throw new Error(
        `元素必须是 ${DEFAULT_MARKDOWN_RULE.rootTags.join(" 或 ")}`
      );
    }

    const items: NavItem[] = [];
    const liElements = Array.from(element.children).filter(
      (el) => el.tagName === DEFAULT_MARKDOWN_RULE.itemTag
    ) as HTMLLIElement[];

    for (const li of liElements) {
      const navItem = this.parseListItem(li);
      if (navItem) {
        items.push(navItem);
      }
    }

    return items;
  }

  /**
   * 解析单个列表项
   */
  private parseListItem(li: HTMLLIElement): NavItem | null {
    const title = this.strategy.extractTitle(li);
    if (!title) {
      return null; // 跳过没有标题的项
    }

    const link = this.strategy.extractLink(li);
    const subList = this.strategy.extractSubList(li);

    const navItem: NavItem = {
      nodeId: "", // 将在 NavTreeState 中生成
      title,
      url: link?.href,
      new_window: link?.target === "_blank" || false,
      children: undefined,
    };

    // 递归解析子列表
    if (subList) {
      const children = this.parse(subList);
      if (children.length > 0) {
        navItem.children = children;
      }
    }

    return navItem;
  }

  /**
   * 验证根元素是否有效
   */
  private isValidRoot(element: HTMLElement): boolean {
    return DEFAULT_MARKDOWN_RULE.rootTags.includes(element.tagName);
  }

  /**
   * 快速验证（可选，用于提前过滤）
   * 只做最基本的检查，不做深度验证
   */
  static quickValidate(element: HTMLElement): boolean {
    if (!DEFAULT_MARKDOWN_RULE.rootTags.includes(element.tagName)) {
      return false;
    }

    // 检查是否有子元素
    if (element.children.length === 0) {
      return false;
    }

    // 检查直接子元素是否都是 LI
    const allLi = Array.from(element.children).every(
      (el) => el.tagName === DEFAULT_MARKDOWN_RULE.itemTag
    );

    return allLi;
  }
}
