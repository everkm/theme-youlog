import { describe, expect, it } from "vitest";
import {
  resolveTocMaxHeight,
  scrollActiveTocLinkIntoView,
  TOC_SCROLL_INTO_VIEW_MARGIN,
} from "./tocContainerLayout";

describe("resolveTocMaxHeight", () => {
  it("减去 sticky top 与底部留白", () => {
    expect(resolveTocMaxHeight(900, 75, 20)).toBe(805);
  });

  it("结果不为负", () => {
    expect(resolveTocMaxHeight(50, 80, 20)).toBe(0);
  });
});

describe("scrollActiveTocLinkIntoView", () => {
  it("向下滚动以显示视口下方的活跃项", () => {
    const tocContainer = {
      scrollTop: 0,
      clientHeight: 200,
      getBoundingClientRect: () => ({ top: 100, bottom: 300 }),
    } as HTMLElement;

    const activeLink = {
      offsetHeight: 24,
      getBoundingClientRect: () => ({ top: 320, bottom: 344 }),
    } as HTMLElement;

    scrollActiveTocLinkIntoView(tocContainer, activeLink, TOC_SCROLL_INTO_VIEW_MARGIN);

    expect(tocContainer.scrollTop).toBe(54);
  });

  it("向上滚动以显示视口上方的活跃项", () => {
    const tocContainer = {
      scrollTop: 200,
      clientHeight: 200,
      getBoundingClientRect: () => ({ top: 100, bottom: 300 }),
    } as HTMLElement;

    const activeLink = {
      offsetHeight: 24,
      getBoundingClientRect: () => ({ top: 90, bottom: 114 }),
    } as HTMLElement;

    scrollActiveTocLinkIntoView(tocContainer, activeLink, TOC_SCROLL_INTO_VIEW_MARGIN);

    expect(tocContainer.scrollTop).toBe(180);
  });
});
