import { youlogRegister, getShortPageUrl } from "../../core";
import {
  EVENT_PAGE_LOAD_BEFORE,
  EVENT_PAGE_LOADED,
} from "../page-ajax/constants";

const PAGE_URL_SELECTOR = "[data-el='page-url']";

function youlogPrint() {
  window.print();
}

function renderPageUrl(pageUrlElement?: HTMLElement | null) {
  if (!pageUrlElement) {
    console.error(`Page URL element not found`);
    return;
  }
  pageUrlElement.textContent = getShortPageUrl().toString();
}

function clearPageUrl(pageUrlElement?: HTMLElement | null) {
  if (!pageUrlElement) {
    console.error(`Page URL element not found`);
    return;
  }
  pageUrlElement.textContent = "";
}

function initYoulogPrint(selector: string = PAGE_URL_SELECTOR) {
  const targetElement = document.querySelector<HTMLElement>(selector);
  if (!targetElement) {
    console.error(`Page URL element not found: ${selector}`);
    return;
  }

  renderPageUrl(targetElement);
}

function installYoulogPrint(selector: string = PAGE_URL_SELECTOR) {
  document.addEventListener("DOMContentLoaded", () => {
    initYoulogPrint(selector);
  });

  // 在页面 AJAX 加载前清空页面URL
  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    clearPageUrl(document.querySelector<HTMLElement>(selector));
  });

  // 在页面 AJAX 加载后重新生成页面URL
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    initYoulogPrint(selector);
  });

  // 使用 youlogRegister 注册 print 函数
  youlogRegister({
    print: youlogPrint,
  });
}

export { installYoulogPrint };
