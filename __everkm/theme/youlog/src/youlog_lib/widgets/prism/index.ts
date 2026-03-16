import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

function setupPrism(bodySelector: string) {
  const container = document.querySelector(bodySelector) as HTMLElement;
  if (!container) {
    console.error(`Prism body selector ${bodySelector} not found`);
    return;
  }

  // 后端渲染时会自动添加上语言
  //   container.querySelectorAll("pre code").forEach((el) => {
  //     el.classList.add("language-markdown");
  //   });

  const prism = (window as any).Prism;
  if (!prism) {
    return;
  }

  if (typeof prism.highlightAllUnder === "function") {
    prism.highlightAllUnder(container);
  } else if (typeof prism.highlightAll === "function") {
    prism.highlightAll();
  }
}

function initPrism(bodySelector: string) {
  document.addEventListener("DOMContentLoaded", () => {
    setupPrism(bodySelector);
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    setupPrism(bodySelector);
  });
}

export { initPrism };
