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
  if (!pageUrlElement) return;
  pageUrlElement.textContent = getShortPageUrl().toString();
}

function clearPageUrl(pageUrlElement?: HTMLElement | null) {
  if (!pageUrlElement) return;
  pageUrlElement.textContent = "";
}

function initYoulogPrint(selector: string = PAGE_URL_SELECTOR) {
  document.addEventListener("DOMContentLoaded", () => {
    const targetElement = document.querySelector<HTMLElement>(
      selector || PAGE_URL_SELECTOR,
    );
    renderPageUrl(targetElement);
  });

  // 在页面 AJAX 加载前清空页面URL
  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    const targetElement = document.querySelector<HTMLElement>(
      selector || PAGE_URL_SELECTOR,
    );
    clearPageUrl(targetElement);
  });

  // 在页面 AJAX 加载后重新生成页面URL
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    const targetElement = document.querySelector<HTMLElement>(
      selector || PAGE_URL_SELECTOR,
    );
    renderPageUrl(targetElement);
  });

  // 使用 youlogRegister 注册 print 函数
  youlogRegister({
    print: youlogPrint,
  });
}

export { initYoulogPrint };
