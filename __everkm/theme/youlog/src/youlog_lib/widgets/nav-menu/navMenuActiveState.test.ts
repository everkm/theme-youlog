import { describe, expect, it } from "vitest";
import type { MenuItem } from "./nav_menu";
import { applyActiveState } from "./navMenuActiveState";

const ORIGIN = "https://example.com";

function item(partial: Partial<MenuItem> & Pick<MenuItem, "text" | "link">): MenuItem {
  return {
    newWindow: false,
    active: false,
    ...partial,
  };
}

function everkmLikeMenu(): MenuItem[] {
  return [
    item({ text: "Home", link: "/" }),
    item({
      text: "Languages",
      link: "#",
      noHighlight: true,
      reflectActiveChild: true,
      matchChildrenPrefix: true,
      children: [
        item({ text: "English", link: "/" }),
        item({ text: "中文", link: "/zh/" }),
      ],
    }),
  ];
}

describe("applyActiveState", () => {
  it("highlights home and english on root without polluting via phase 2 only", () => {
    const items = everkmLikeMenu();
    applyActiveState(items, `${ORIGIN}/`, ORIGIN);

    expect(items[0].active).toBe(true);
    expect(items[1].active).toBe(true);
    expect(items[1].children![0].active).toBe(true);
    expect(items[1].children![1].active).toBe(false);
  });

  it("highlights languages english on changelog without highlighting home", () => {
    const items = everkmLikeMenu();
    applyActiveState(items, `${ORIGIN}/changelog.html`, ORIGIN);

    expect(items[0].active).toBe(false);
    expect(items[1].active).toBe(true);
    expect(items[1].children![0].active).toBe(true);
    expect(items[1].children![1].active).toBe(false);
  });

  it("prefers zh child on zh paths", () => {
    const items = everkmLikeMenu();
    applyActiveState(items, `${ORIGIN}/zh/changelog.html`, ORIGIN);

    expect(items[0].active).toBe(false);
    expect(items[1].active).toBe(true);
    expect(items[1].children![0].active).toBe(false);
    expect(items[1].children![1].active).toBe(true);
  });

  it("highlights english on unlisted english directory paths", () => {
    const items = everkmLikeMenu();
    applyActiveState(items, `${ORIGIN}/book/`, ORIGIN);

    expect(items[0].active).toBe(false);
    expect(items[1].children![0].active).toBe(true);
  });

  it("does not apply relaxed prefix when parent flag is off", () => {
    const items: MenuItem[] = [
      item({ text: "Home", link: "/" }),
      item({
        text: "Languages",
        link: "#",
        children: [
          item({ text: "English", link: "/" }),
          item({ text: "中文", link: "/zh/" }),
        ],
      }),
    ];

    applyActiveState(items, `${ORIGIN}/changelog.html`, ORIGIN);

    expect(items[0].active).toBe(false);
    expect(items[1].active).toBe(false);
    expect(items[1].children![0].active).toBe(false);
  });
});
