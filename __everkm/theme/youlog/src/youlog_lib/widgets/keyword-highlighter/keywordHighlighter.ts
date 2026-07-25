import Mark from "mark.js";
import { EVENT_PAGE_LOADED } from "../page-ajax/constants";
import scrollIntoView from "scroll-into-view-if-needed";

function extractKeywordsFromUrl(): string[] | null {
  const u = new URL(window.location.href);
  const param = u.searchParams.get("__hlts") || "";
  if (!param) return null;

  try {
    const words = JSON.parse(param);
    if (!Array.isArray(words) || words.length === 0) return null;
    return words.filter((w): w is string => typeof w === "string" && w.length > 0);
  } catch {
    return null;
  }
}

function markKeywords(
  words: string[],
  container: HTMLElement | Document = document.body,
) {
  const mark = new Mark(container);
  mark.mark(words, {
    className: "keyword-hlt",
  });
}

function setupKeywordHighlighter(container: HTMLElement) {
  const words = extractKeywordsFromUrl();
  if (!words) return;

  markKeywords(words, container);

  const targets = document.querySelectorAll("mark[data-markjs]");
  if (targets.length === 0) return;

  let focusEl = targets[0] as HTMLElement;

  // If the match is inside a code block, scroll the code element —
  // client-side highlighters may rewrite nested mark nodes.
  let currentEl = focusEl;
  while (
    currentEl.parentElement &&
    currentEl.parentElement.tagName.toLowerCase() !== "pre"
  ) {
    currentEl = currentEl.parentElement;
    if (currentEl.tagName.toLowerCase() === "code") {
      focusEl = currentEl;
      break;
    }
  }

  setTimeout(() => {
    scrollIntoView(focusEl, {
      scrollMode: "if-needed",
      block: "start",
      inline: "nearest",
      behavior: (actions) => {
        actions.forEach(({ el, top, left }) => {
          el.scrollTo({
            top: Math.max(0, top - 100),
            left,
            behavior: "smooth",
          });
        });
      },
    });

    markKeywords(words, focusEl);
  }, 300);
}

function initKeywordHighlighter(containerSelector: string) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  setupKeywordHighlighter(container as HTMLElement);
}

function installKeywordHighlighter(containerSelector: string) {
  const mount = () => initKeywordHighlighter(containerSelector);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  document.addEventListener(EVENT_PAGE_LOADED, mount);
}

export { initKeywordHighlighter, installKeywordHighlighter };
