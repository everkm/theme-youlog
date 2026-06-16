import { describe, expect, it } from "vitest";
import { navTreeNeedsUpdate } from "./navTreeSync";
import {
  NAV_TREE_FINGERPRINT_ATTR,
  NAV_TREE_SOURCE_MARKUP_ATTR,
  NAV_TREE_SOURCE_TEXT_ATTR,
} from "./constants";

function makeNavTreeEl(
  html: string,
  opts: {
    fp?: string;
    storedMarkup?: string;
    storedText?: string;
    withUi?: boolean;
  } = {},
): HTMLDivElement {
  const el = document.createElement("nav");
  if (opts.withUi) {
    el.innerHTML = `<div class="nav-tree-container">${html}</div>`;
  } else {
    el.innerHTML = html;
  }
  if (opts.fp) el.setAttribute(NAV_TREE_FINGERPRINT_ATTR, opts.fp);
  if (opts.storedMarkup) {
    el.setAttribute(NAV_TREE_SOURCE_MARKUP_ATTR, opts.storedMarkup);
  }
  if (opts.storedText) {
    el.setAttribute(NAV_TREE_SOURCE_TEXT_ATTR, opts.storedText);
  }
  return el;
}

describe("navTreeNeedsUpdate", () => {
  const navHtml = "<ul><li><a href='/a'>A</a></li></ul>";
  const navText = "A";

  it("returns false when fingerprint and text unchanged", () => {
    const current = makeNavTreeEl("", {
      fp: "/nav.md",
      storedText: navText,
      withUi: true,
    });
    const next = makeNavTreeEl(navHtml, { fp: "/nav.md" });
    expect(navTreeNeedsUpdate(current, next)).toBe(false);
  });

  it("returns false when markup quoting differs but text is same", () => {
    const current = makeNavTreeEl("", {
      fp: "/nav.md",
      storedText: navText,
      withUi: true,
    });
    const next = makeNavTreeEl('<ul><li><a href="/a">A</a></li></ul>', {
      fp: "/nav.md",
    });
    expect(navTreeNeedsUpdate(current, next)).toBe(false);
  });

  it("returns true when fingerprint changes", () => {
    const current = makeNavTreeEl("", {
      fp: "/nav-a.md",
      storedText: navText,
      withUi: true,
    });
    const next = makeNavTreeEl(navHtml, { fp: "/nav-b.md" });
    expect(navTreeNeedsUpdate(current, next)).toBe(true);
  });

  it("returns true when markup changes for same fingerprint", () => {
    const current = makeNavTreeEl("", {
      fp: "/nav.md",
      storedText: "A",
      withUi: true,
    });
    const next = makeNavTreeEl(
      "<ul><li><a href='/b'>B</a></li></ul>",
      { fp: "/nav.md" },
    );
    expect(navTreeNeedsUpdate(current, next)).toBe(true);
  });

  it("returns false for mounted tree without stored markup but same fingerprint", () => {
    const current = makeNavTreeEl("", { fp: "/nav.md", withUi: true });
    const next = makeNavTreeEl(navHtml, { fp: "/nav.md" });
    expect(navTreeNeedsUpdate(current, next)).toBe(false);
  });
});
