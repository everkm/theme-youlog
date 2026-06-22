import { describe, expect, it } from "vitest";
import type { MenuItem } from "./nav_menu";
import {
  applyDerivedLabels,
  isItemHighlighted,
  normalizeMenuContext,
  navItemToContext,
} from "./menuItemDerived";

function item(partial: Partial<MenuItem> & Pick<MenuItem, "text" | "link">): MenuItem {
  return {
    newWindow: false,
    active: false,
    ...partial,
  };
}

describe("normalizeMenuContext", () => {
  it("maps snake_case YAML fields to camelCase", () => {
    expect(
      normalizeMenuContext({
        start_icon: "language",
        end_icon: "external",
        no_highlight: true,
        reflect_active_child: true,
      }),
    ).toEqual({
      startIcon: "language",
      endIcon: "external",
      noHighlight: true,
      reflectActiveChild: true,
    });
  });

  it("accepts camelCase as-is", () => {
    expect(
      normalizeMenuContext({
        startIcon: "language",
        noHighlight: true,
      }),
    ).toEqual({
      startIcon: "language",
      noHighlight: true,
    });
  });
});

describe("navItemToContext", () => {
  it("serializes only set extension fields", () => {
    expect(
      navItemToContext({
        title: "Languages",
        start_icon: "language",
        reflect_active_child: true,
      }),
    ).toEqual({
      startIcon: "language",
      reflectActiveChild: true,
    });
  });
});

describe("applyDerivedLabels", () => {
  it("replaces parent text with deepest active child", () => {
    const items: MenuItem[] = [
      item({
        text: "Languages",
        link: "#",
        reflectActiveChild: true,
        active: true,
        children: [
          item({ text: "English", link: "/index.html", active: true }),
          item({ text: "中文", link: "/zh/", active: false }),
        ],
      }),
    ];

    applyDerivedLabels(items);
    expect(items[0].text).toBe("English");
  });

  it("uses deepest nested active child", () => {
    const items: MenuItem[] = [
      item({
        text: "More",
        link: "#",
        reflectActiveChild: true,
        active: true,
        children: [
          item({
            text: "Section",
            link: "/section/",
            active: true,
            children: [
              item({ text: "Detail", link: "/section/detail/", active: true }),
            ],
          }),
        ],
      }),
    ];

    applyDerivedLabels(items);
    expect(items[0].text).toBe("Detail");
  });

  it("keeps parent text when no child is active", () => {
    const items: MenuItem[] = [
      item({
        text: "Languages",
        link: "#",
        reflectActiveChild: true,
        children: [
          item({ text: "English", link: "/index.html", active: false }),
          item({ text: "中文", link: "/zh/", active: false }),
        ],
      }),
    ];

    applyDerivedLabels(items);
    expect(items[0].text).toBe("Languages");
  });
});

describe("isItemHighlighted", () => {
  it("respects noHighlight for active state", () => {
    const activeItem = item({
      text: "Languages",
      link: "#",
      active: true,
      noHighlight: true,
    });
    expect(isItemHighlighted(activeItem)).toBe(false);
    expect(isItemHighlighted(activeItem, true)).toBe(true);
  });

  it("highlights normal active items", () => {
    const activeItem = item({ text: "Home", link: "/", active: true });
    expect(isItemHighlighted(activeItem)).toBe(true);
  });
});
