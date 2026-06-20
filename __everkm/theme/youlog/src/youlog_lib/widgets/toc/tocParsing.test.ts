import { describe, expect, it } from "vitest";
import { parseTocItems, resolveActiveHeadingKey } from "./tocParsing";

describe("parseTocItems", () => {
  it("deduplicates auto-generated heading ids", () => {
    const article = document.createElement("article");
    article.innerHTML = `
      <h2>Same Title</h2>
      <h3>Same Title</h3>
    `;

    const items = parseTocItems(article, "h2, h3");
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe("same-title");
    expect(items[1].id).toBe("same-title-2");
    expect(items[0].key).not.toBe(items[1].key);
    expect(article.querySelector("h3")?.id).toBe("same-title-2");
  });

  it("uses unique keys so duplicate id strings do not double-highlight", () => {
    const article = document.createElement("article");
    article.innerHTML = `<h2 id="dup">A</h2><h3 id="dup">B</h3>`;

    const items = parseTocItems(article, "h2, h3");
    expect(items[0].id).toBe("dup");
    expect(items[1].id).toBe("dup-2");
    expect(new Set(items.map((item) => item.key)).size).toBe(2);
  });
});

describe("resolveActiveHeadingKey", () => {
  it("reads heading position from article index instead of global getElementById", () => {
    document.body.innerHTML = `<div id="ghost" style="height:1px"></div>`;
    const article = document.createElement("article");
    article.innerHTML = `<h2 id="ghost">Real</h2>`;
    document.body.appendChild(article);

    const items = parseTocItems(article, "h2");
    const container = document.createElement("div");
    container.appendChild(article);
    document.body.appendChild(container);

    Object.defineProperty(container, "scrollTop", {
      value: 0,
      writable: true,
    });
    container.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 600,
        width: 0,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    const heading = article.querySelector("h2")!;
    heading.getBoundingClientRect = () =>
      ({
        top: 40,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 40,
        toJSON: () => ({}),
      }) as DOMRect;

    const key = resolveActiveHeadingKey(
      items,
      article,
      "h2",
      container,
      50,
    );
    expect(key).toBe(items[0].key);

    document.body.innerHTML = "";
  });
});
