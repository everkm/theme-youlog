import { describe, expect, it } from "vitest";
import { isNavUrlMatch } from "./navTreeUrl";

describe("isNavUrlMatch", () => {
  it("matches same path without hash", () => {
    expect(isNavUrlMatch("/doc/page", "/doc/page")).toBe(true);
  });

  it("matches same path with identical hash", () => {
    expect(isNavUrlMatch("/doc/page#intro", "/doc/page#intro")).toBe(true);
  });

  it("matches page-level link when current has hash", () => {
    expect(isNavUrlMatch("/doc/page#intro", "/doc/page")).toBe(true);
  });

  it("does not match when target hash differs from current", () => {
    expect(isNavUrlMatch("/doc/page#intro", "/doc/page#setup")).toBe(false);
  });

  it("does not match when target has hash but current does not", () => {
    expect(isNavUrlMatch("/doc/page", "/doc/page#intro")).toBe(false);
  });

  it("matches encoded and decoded hash", () => {
    expect(
      isNavUrlMatch("/doc/page#%E4%B8%AD%E6%96%87", "/doc/page#中文"),
    ).toBe(true);
  });

  it("matches directory index variants", () => {
    expect(isNavUrlMatch("/a/index.html", "/a/")).toBe(true);
    expect(isNavUrlMatch("/a/", "/a/index.html")).toBe(true);
  });

  it("does not treat bare path as directory index", () => {
    expect(isNavUrlMatch("/a", "/a/")).toBe(false);
    expect(isNavUrlMatch("/a/", "/a")).toBe(false);
    expect(isNavUrlMatch("/a", "/a/index.html")).toBe(false);
    expect(isNavUrlMatch("/a/index.html", "/a")).toBe(false);
  });

  it("matches root index variants", () => {
    expect(isNavUrlMatch("/index.html", "/")).toBe(true);
    expect(isNavUrlMatch("/", "/index.html")).toBe(true);
  });
});
