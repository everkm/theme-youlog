import { describe, expect, it, vi } from "vitest";
import {
  bindTocScrollContainment,
  hasTocScrollRange,
  isMobileTocExpanded,
  resolveTocMaxHeight,
  resolveTocViewportTopPx,
  scrollActiveTocLinkIntoView,
  shouldLimitTocContainerHeight,
  syncTocContainerMaxHeight,
  syncTocOverscrollBehavior,
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

describe("shouldLimitTocContainerHeight", () => {
  it("桌面 sticky 容器需要限高", () => {
    const container = document.createElement("div");
    container.classList.add("lg:sticky");
    expect(shouldLimitTocContainerHeight(container)).toBe(true);
  });

  it("小屏展开态需要限高", () => {
    const container = document.createElement("div");
    container.classList.add("toc-mobile-indicator", "toc-expanded");
    expect(shouldLimitTocContainerHeight(container)).toBe(true);
  });

  it("小屏折叠态不限高", () => {
    const container = document.createElement("div");
    container.classList.add("toc-mobile-indicator");
    expect(shouldLimitTocContainerHeight(container)).toBe(false);
  });
});

describe("isMobileTocExpanded", () => {
  it("同时包含 toc-mobile-indicator 与 toc-expanded", () => {
    const container = document.createElement("div");
    container.classList.add("toc-mobile-indicator", "toc-expanded");
    expect(isMobileTocExpanded(container)).toBe(true);
  });
});

describe("hasTocScrollRange", () => {
  it("内容未溢出时无滚动范围", () => {
    const el = { scrollHeight: 200, clientHeight: 200 } as HTMLElement;
    expect(hasTocScrollRange(el)).toBe(false);
  });

  it("内容溢出时存在滚动范围", () => {
    const el = { scrollHeight: 400, clientHeight: 200 } as HTMLElement;
    expect(hasTocScrollRange(el)).toBe(true);
  });
});

describe("resolveTocViewportTopPx", () => {
  it("按元素在视口中的实际 top 计算", () => {
    const el = {
      getBoundingClientRect: () => ({ top: 320 }),
    } as HTMLElement;

    expect(resolveTocViewportTopPx(el, document.documentElement)).toBe(320);
  });
});

describe("syncTocContainerMaxHeight", () => {
  it("小屏展开态按 bar 实际位置限高", () => {
    const container = document.createElement("div");
    container.classList.add("toc-mobile-indicator", "toc-expanded");
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      top: 300,
    } as DOMRect);

    syncTocContainerMaxHeight(container, document.documentElement, 20);

    expect(container.style.maxHeight).toBe(`${window.innerHeight - 300 - 20}px`);
  });
});

describe("syncTocOverscrollBehavior", () => {
  it("有滚动范围时写入 contain", () => {
    const el = {
      scrollHeight: 400,
      clientHeight: 200,
      style: { overscrollBehavior: "", removeProperty: vi.fn() },
    } as unknown as HTMLElement;
    Object.defineProperty(el.style, "overscrollBehavior", {
      writable: true,
      value: "",
    });

    syncTocOverscrollBehavior(el);

    expect(el.style.overscrollBehavior).toBe("contain");
  });

  it("无滚动范围时移除 inline 样式", () => {
    const el = {
      scrollHeight: 200,
      clientHeight: 200,
      style: { removeProperty: vi.fn() },
    } as unknown as HTMLElement;

    syncTocOverscrollBehavior(el);

    expect(el.style.removeProperty).toHaveBeenCalledWith("overscroll-behavior");
  });
});

describe("bindTocScrollContainment", () => {
  function createScrollContainer(
    scrollHeight: number,
    clientHeight: number,
    scrollTop = 0,
  ) {
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollHeight", {
      configurable: true,
      get: () => scrollHeight,
    });
    Object.defineProperty(el, "clientHeight", {
      configurable: true,
      get: () => clientHeight,
    });
    Object.defineProperty(el, "scrollTop", {
      configurable: true,
      writable: true,
      value: scrollTop,
    });
    return el;
  }

  it("在顶部继续向上滚轮时阻止默认行为", () => {
    const scrollContainer = createScrollContainer(400, 200);
    const addSpy = vi.spyOn(scrollContainer, "addEventListener");

    bindTocScrollContainment(scrollContainer);

    const wheelHandler = addSpy.mock.calls.find(([event]) => event === "wheel")?.[1] as (
      e: WheelEvent,
    ) => void;

    const preventDefault = vi.fn();
    wheelHandler({ deltaY: -10, preventDefault } as unknown as WheelEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(scrollContainer.style.overscrollBehavior).toBe("contain");
  });

  it("无滚动范围时不拦截滚轮", () => {
    const scrollContainer = createScrollContainer(200, 200);
    const addSpy = vi.spyOn(scrollContainer, "addEventListener");

    bindTocScrollContainment(scrollContainer);

    const wheelHandler = addSpy.mock.calls.find(([event]) => event === "wheel")?.[1] as (
      e: WheelEvent,
    ) => void;

    const preventDefault = vi.fn();
    wheelHandler({ deltaY: -10, preventDefault } as unknown as WheelEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(scrollContainer.style.overscrollBehavior).toBe("");
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
