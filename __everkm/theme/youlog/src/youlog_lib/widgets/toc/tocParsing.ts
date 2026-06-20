import type { ScrollContainer } from "../../core/scrollAnchor";

export const VERTICAL_PADDING = 20;

export interface TocItem {
  /** 锚点 id（href / 滚动目标） */
  id: string;
  /** 目录内唯一键（高亮状态，避免重复 id 导致多项同时亮） */
  key: string;
  text: string;
  level: number;
  parentKey?: string;
  /** 在 article 内 headingSelector 结果中的序号 */
  headingIndex: number;
}

function slugifyHeadingText(text: string | null | undefined): string {
  const slug = text?.trim().toLowerCase().replace(/\s+/g, "-") || "";
  return slug || "section";
}

/** 保证 heading.id 在文档内唯一，返回最终 id */
function ensureHeadingId(
  heading: HTMLHeadingElement,
  usedIds: Set<string>,
): string {
  let base = heading.id.trim() || slugifyHeadingText(heading.textContent);
  if (!base) {
    base = "section";
  }

  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix++}`;
  }

  usedIds.add(id);
  if (heading.id !== id) {
    heading.id = id;
  }

  return id;
}

function itemLevelJustify(items: TocItem[]) {
  if (items.length === 0) return items;

  let working = items;

  const h1Count = items.filter((item) => item.level === 1).length;
  if (items[0].level === 1 && h1Count === 1) {
    const droppedKey = items[0].key;
    working = items
      .slice(1)
      .map((item) =>
        item.parentKey === droppedKey
          ? { ...item, parentKey: undefined }
          : item,
      );
  }

  if (working.length === 0) return working;

  const minLevel = Math.min(...working.map((item) => item.level));
  if (minLevel === 1) return working;

  const levelOffset = minLevel - 1;
  return working.map((item) => ({
    ...item,
    level: item.level - levelOffset,
  }));
}

export function parseTocItems(
  articleElement: HTMLElement | null,
  headingSelector: string,
): TocItem[] {
  if (!articleElement) return [];

  const headings =
    articleElement.querySelectorAll<HTMLHeadingElement>(headingSelector);
  const tocItems: TocItem[] = [];
  const usedIds = new Set<string>();

  let previousLevel = 0;
  const levelStack: { key: string; level: number }[] = [];

  headings.forEach((heading, headingIndex) => {
    const id = ensureHeadingId(heading, usedIds);
    const key = `toc-${headingIndex}`;
    const level = parseInt(heading.tagName.substring(1), 10);

    if (level > previousLevel) {
      levelStack.push({ key, level });
    } else if (level < previousLevel) {
      while (
        levelStack.length > 0 &&
        levelStack[levelStack.length - 1].level >= level
      ) {
        levelStack.pop();
      }
      levelStack.push({ key, level });
    } else {
      levelStack.pop();
      levelStack.push({ key, level });
    }
    previousLevel = level;

    const item: TocItem = {
      id,
      key,
      text: heading.textContent || "",
      level,
      headingIndex,
    };

    if (levelStack.length > 1) {
      item.parentKey = levelStack[levelStack.length - 2].key;
    }

    tocItems.push(item);
  });

  return itemLevelJustify(tocItems);
}

/**
 * 在文章范围内按 headingIndex 定位标题，避免 document.getElementById 命中页外或重复 id。
 * 返回应高亮的 toc item.key。
 */
export function resolveActiveHeadingKey(
  items: TocItem[],
  article: HTMLElement,
  headingSelector: string,
  scrollContainer: ScrollContainer,
  totalOffset: number,
): string {
  const headings = article.querySelectorAll<HTMLHeadingElement>(headingSelector);
  const containerTop =
    scrollContainer instanceof Window
      ? 0
      : scrollContainer.getBoundingClientRect().top;

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const heading = headings[item.headingIndex];
    if (!heading) continue;

    const rect = heading.getBoundingClientRect();
    if (rect.top - containerTop <= totalOffset) {
      return item.key;
    }
  }

  return "";
}
