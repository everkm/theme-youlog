import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

function setupKatex(bodySelector: string) {
  const container = document.querySelector(bodySelector) as HTMLElement;
  if (!container) {
    console.error(`Katex body selector ${bodySelector} not found`);
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const options = {
      throwOnError: false,
      errorColor: "#cc0000",
      macros: {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\ZZ": "\\mathbb{Z}",
      },
    };
    container.querySelectorAll(".math.math-inline").forEach(function (el) {
      try {
        (window as any).katex.render(el.textContent, el, {
          ...options,
          displayMode: false,
        });
      } catch (e) {}
    });
    container.querySelectorAll(".math.math-display").forEach(function (el) {
      try {
        (window as any).katex.render(el.textContent, el, {
          ...options,
          displayMode: true,
        });
      } catch (e) {}
    });
  });
}

function initKatex(bodySelector: string) {
  document.addEventListener("DOMContentLoaded", () => {
    setupKatex(bodySelector);
  });
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    setupKatex(bodySelector);
  });
}

export { initKatex };
