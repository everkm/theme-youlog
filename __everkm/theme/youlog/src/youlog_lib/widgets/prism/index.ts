import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

function initPrism(bodySelector: string) {
  const container = document.querySelector(bodySelector) as HTMLElement;
  if (!container) {
    console.error(`Prism body selector ${bodySelector} not found`);
    return;
  }

  const prism = (window as any).Prism;
  if (!prism) {
    console.error(`Prism not found in window`);
    return;
  }

  if (typeof prism.highlightAllUnder === "function") {
    prism.highlightAllUnder(container);
  } else if (typeof prism.highlightAll === "function") {
    prism.highlightAll();
  }
}

function installPrism(bodySelector: string) {
  const run = () => {
    initPrism(bodySelector);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    run();
  });
}

export { initPrism, installPrism };
