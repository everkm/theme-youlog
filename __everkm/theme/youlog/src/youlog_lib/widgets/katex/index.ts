import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

function initKatex(bodySelector: string) {
  const container = document.querySelector(bodySelector) as HTMLElement;
  if (!container) {
    console.error(`Katex body selector ${bodySelector} not found`);
    return;
  }

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
    } catch (e) {
      console.error(`Katex render error:`, e);
    } finally {
      el.classList.remove("opacity-0");
    }
  });
  container.querySelectorAll(".math.math-display").forEach(function (el) {
    try {
      (window as any).katex.render(el.textContent, el, {
        ...options,
        displayMode: true,
      });
    } catch (e) {
      console.error(`Katex render error:`, e);
    } finally {
      el.classList.remove("opacity-0");
    }
  });
}

function installKatex(bodySelector: string) {
  document.addEventListener("DOMContentLoaded", () => {
    initKatex(bodySelector);
  });
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    initKatex(bodySelector);
  });
}

export { initKatex, installKatex };
