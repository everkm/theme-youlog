import { describe, expect, it, vi } from "vitest";
import { getMobileTocBarHeight, resolveTocGotoHeadersHeight } from "./tocScrollSync";

describe("getMobileTocBarHeight", () => {
  function setupIndicator(options: {
    indicatorTop: number;
    barHeight: number;
    containerTop?: number;
  }) {
    const scrollContainer = document.createElement("div");
    vi.spyOn(scrollContainer, "getBoundingClientRect").mockReturnValue({
      top: options.containerTop ?? 0,
    } as DOMRect);

    const headerBar = {
      offsetHeight: options.barHeight,
    } as HTMLElement;

    const indicator = document.createElement("div");
    indicator.id = "mobile-toc-indicator";
    vi.spyOn(indicator, "getBoundingClientRect").mockReturnValue({
      top: options.indicatorTop,
    } as DOMRect);

    const headerBarEl = document.createElement("div");
    headerBarEl.className = "toc-mobile-header";
    Object.defineProperty(headerBarEl, "offsetHeight", {
      configurable: true,
      get: () => options.barHeight,
    });
    indicator.appendChild(headerBarEl);
    document.body.appendChild(indicator);

    return { scrollContainer, indicator, headerBarEl };
  }

  it("requireSticky 为 true 时，未 sticky 返回 0", () => {
    const { scrollContainer, indicator } = setupIndicator({
      indicatorTop: 80,
      barHeight: 44,
    });

    expect(
      getMobileTocBarHeight(scrollContainer, "header", { requireSticky: true }),
    ).toBe(0);

    indicator.remove();
  });

  it("requireSticky 为 false 时，未 sticky 仍返回标题栏高度", () => {
    const { scrollContainer, indicator } = setupIndicator({
      indicatorTop: 80,
      barHeight: 44,
    });

    expect(
      getMobileTocBarHeight(scrollContainer, "header", { requireSticky: false }),
    ).toBe(44);

    indicator.remove();
  });

  it("requireSticky 为 true 且已 sticky 时返回标题栏高度", () => {
    const { scrollContainer, indicator } = setupIndicator({
      indicatorTop: 0,
      barHeight: 44,
    });

    expect(
      getMobileTocBarHeight(scrollContainer, "header", { requireSticky: true }),
    ).toBe(44);

    indicator.remove();
  });
});

describe("resolveTocGotoHeadersHeight", () => {
  it("小屏计入 mobile TOC 标题栏高度", () => {
    const scrollContainer = document.createElement("div");
    const indicator = document.createElement("div");
    indicator.id = "mobile-toc-indicator";
    const headerBar = document.createElement("div");
    headerBar.className = "toc-mobile-header";
    Object.defineProperty(headerBar, "offsetHeight", {
      configurable: true,
      get: () => 44,
    });
    indicator.appendChild(headerBar);
    document.body.appendChild(indicator);

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn() }),
    );

    expect(resolveTocGotoHeadersHeight(scrollContainer, "header")).toBe(44);

    indicator.remove();
    vi.unstubAllGlobals();
  });
});
