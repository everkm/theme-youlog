import { describe, expect, it } from "vitest";
import {
  chooseScrollBehavior,
  computeScrollTopForElement,
} from "./scrollAnchor";

describe("computeScrollTopForElement", () => {
  it("uses container-relative coordinates for nested scroll containers", () => {
    const container = document.createElement("div");
    const target = document.createElement("h2");
    container.appendChild(target);
    document.body.appendChild(container);

    Object.defineProperty(container, "scrollTop", {
      value: 200,
      writable: true,
      configurable: true,
    });
    container.getBoundingClientRect = () =>
      ({
        top: 100,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect;
    target.getBoundingClientRect = () =>
      ({
        top: 460,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 460,
        toJSON: () => ({}),
      }) as DOMRect;

    const nextTop = computeScrollTopForElement(target, container, 16);
    expect(nextTop).toBe(200 + (460 - 100) - 16);

    container.remove();
  });
});

describe("chooseScrollBehavior", () => {
  it("uses instant scroll for long distances", () => {
    expect(chooseScrollBehavior(900, 800)).toBe("auto");
  });

  it("uses smooth scroll for short distances", () => {
    expect(chooseScrollBehavior(200, 800)).toBe("smooth");
  });
});
