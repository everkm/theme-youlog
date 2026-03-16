import { NavItem } from "./NavTreeState";

export interface MarkdownTreeParseRule {
  rootTags: string[];
  itemTag: string;
  linkTag: string;
  paragraphTag: string;
  listTags: string[];
}

export const DEFAULT_MARKDOWN_RULE: MarkdownTreeParseRule = {
  rootTags: ["UL", "OL"],
  itemTag: "LI",
  linkTag: "A",
  paragraphTag: "P",
  listTags: ["UL", "OL"],
};

interface ExtractionStrategy {
  extractTitle(li: HTMLLIElement): string | null;
  extractLink(li: HTMLLIElement): HTMLAnchorElement | null;
  extractSubList(li: HTMLLIElement): HTMLElement | null;
}

class MarkdownExtractionStrategy implements ExtractionStrategy {
  constructor(private rule: MarkdownTreeParseRule) {}

  extractTitle(li: HTMLLIElement): string | null {
    const link = this.extractLink(li);
    if (link) {
      const title = link.textContent?.trim();
      if (title) return title;
    }
    const pElement = Array.from(li.children).find(
      (el) => el.tagName === this.rule.paragraphTag
    );
    if (pElement) {
      const title = pElement.textContent?.trim();
      if (title) return title;
    }
    const firstTextNode = Array.from(li.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (firstTextNode) {
      const title = firstTextNode.textContent?.trim();
      if (title) return title;
    }
    return null;
  }

  extractLink(li: HTMLLIElement): HTMLAnchorElement | null {
    const directLink = Array.from(li.children).find(
      (el) => el.tagName === this.rule.linkTag
    ) as HTMLAnchorElement | undefined;
    if (directLink) return directLink;
    const pElement = Array.from(li.children).find(
      (el) => el.tagName === this.rule.paragraphTag
    );
    if (pElement) {
      const linkInP = pElement.querySelector(this.rule.linkTag);
      if (linkInP) return linkInP as HTMLAnchorElement;
    }
    return null;
  }

  extractSubList(li: HTMLLIElement): HTMLElement | null {
    const subList = Array.from(li.children).find((el) =>
      this.rule.listTags.includes(el.tagName)
    ) as HTMLElement | undefined;
    return subList || null;
  }
}

export class MarkdownTreeParser {
  private strategy: ExtractionStrategy;

  constructor(rule: MarkdownTreeParseRule = DEFAULT_MARKDOWN_RULE) {
    this.strategy = new MarkdownExtractionStrategy(rule);
  }

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
      if (navItem) items.push(navItem);
    }
    return items;
  }

  private parseListItem(li: HTMLLIElement): NavItem | null {
    const title = this.strategy.extractTitle(li);
    if (!title) return null;
    const link = this.strategy.extractLink(li);
    const subList = this.strategy.extractSubList(li);
    const navItem: NavItem = {
      nodeId: "",
      title,
      url: link?.href,
      new_window: link?.target === "_blank" || false,
      children: undefined,
    };
    if (subList) {
      const children = this.parse(subList);
      if (children.length > 0) navItem.children = children;
    }
    return navItem;
  }

  private isValidRoot(element: HTMLElement): boolean {
    return DEFAULT_MARKDOWN_RULE.rootTags.includes(element.tagName);
  }

  static quickValidate(element: HTMLElement): boolean {
    if (!DEFAULT_MARKDOWN_RULE.rootTags.includes(element.tagName)) return false;
    if (element.children.length === 0) return false;
    return Array.from(element.children).every(
      (el) => el.tagName === DEFAULT_MARKDOWN_RULE.itemTag
    );
  }
}
