import { describe, expect, it } from "vitest";
import {
  findBestMatchingHref,
  isNavMenuUrlMatch,
  toComparePath,
} from "./navMenuUrl";

const ORIGIN = "https://example.com";

describe("toComparePath", () => {
  it("normalizes root and trailing slash directories", () => {
    expect(toComparePath("/")).toBe("/index.html");
    expect(toComparePath("/index.html")).toBe("/index.html");
    expect(toComparePath("/book/")).toBe("/book/index.html");
    expect(toComparePath("/book/index.html")).toBe("/book/index.html");
  });

  it("keeps bare paths unchanged", () => {
    expect(toComparePath("/book")).toBe("/book");
  });
});

describe("isNavMenuUrlMatch", () => {
  it("matches absolute and relative URLs for the same page", () => {
    expect(
      isNavMenuUrlMatch(
        "https://example.com/book/",
        "/book/",
        ORIGIN,
      ),
    ).toBe(true);
    expect(
      isNavMenuUrlMatch(
        "/book/",
        "https://example.com/book/",
        ORIGIN,
      ),
    ).toBe(true);
  });

  it("matches directory prefix for non-root items", () => {
    expect(
      isNavMenuUrlMatch("/book/chapter/", "/book/", ORIGIN),
    ).toBe(true);
  });

  it("does not treat home as prefix of other pages", () => {
    expect(isNavMenuUrlMatch("/book/", "/", ORIGIN)).toBe(false);
    expect(isNavMenuUrlMatch("/book/", "/index.html", ORIGIN)).toBe(false);
  });

  it("matches home only on root paths", () => {
    expect(isNavMenuUrlMatch("/", "/", ORIGIN)).toBe(true);
    expect(isNavMenuUrlMatch("/index.html", "/", ORIGIN)).toBe(true);
    expect(isNavMenuUrlMatch("/book/", "/", ORIGIN)).toBe(false);
  });
});

describe("findBestMatchingHref", () => {
  it("prefers the longest match over home", () => {
    expect(
      findBestMatchingHref(
        "https://example.com/book/",
        ["/", "/book/"],
        ORIGIN,
      ),
    ).toBe("/book/");
  });

  it("prefers the deepest matching item", () => {
    expect(
      findBestMatchingHref(
        "/book/chapter/",
        ["/", "/book/", "/book/chapter/"],
        ORIGIN,
      ),
    ).toBe("/book/chapter/");
  });

  it("falls back to section prefix when no exact child exists", () => {
    expect(
      findBestMatchingHref(
        "/book/chapter/",
        ["/", "/book/"],
        ORIGIN,
      ),
    ).toBe("/book/");
  });

  it("returns null when only home could prefix-match", () => {
    expect(
      findBestMatchingHref("/book/", ["/"], ORIGIN),
    ).toBeNull();
  });
});
