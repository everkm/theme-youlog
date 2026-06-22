import { describe, expect, it, vi } from "vitest";
import { createAnchorScrollService } from "./anchorScrollService";

describe("createAnchorScrollService", () => {
  it("aggregates inset heights plus extraOffset", () => {
    const service = createAnchorScrollService({
      scrollContainer: document.documentElement,
      extraOffset: 10,
    });

    service.registerInset({
      id: "a",
      order: 0,
      measure: () => 40,
    });
    service.registerInset({
      id: "b",
      order: 10,
      measure: () => 24,
    });

    expect(service.getOffset()).toBe(74);
  });

  it("re-registering same inset id replaces previous contributor", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const service = createAnchorScrollService({
      scrollContainer: document.documentElement,
      extraOffset: 0,
    });

    service.registerInset({ id: "x", order: 0, measure: () => 10 });
    service.registerInset({ id: "x", order: 0, measure: () => 20 });

    expect(service.getOffset()).toBe(20);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("syncs --anchor-inset-top on documentElement", () => {
    const service = createAnchorScrollService({
      scrollContainer: document.documentElement,
      extraOffset: 8,
      insetCssVar: "--anchor-inset-top",
    });

    service.registerInset({ id: "bar", order: 0, measure: () => 36 });

    expect(
      document.documentElement.style.getPropertyValue("--anchor-inset-top"),
    ).toBe("44px");
  });

  it("whenLayoutReady waits for contributor whenReady", async () => {
    let ready = false;
    const service = createAnchorScrollService({
      scrollContainer: document.documentElement,
      extraOffset: 0,
    });

    service.registerInset({
      id: "delayed",
      order: 0,
      measure: () => (ready ? 12 : 0),
      whenReady: () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            ready = true;
            resolve();
          }, 20);
        }),
    });

    await service.whenLayoutReady();
    expect(service.getOffset()).toBe(12);
  });
});
