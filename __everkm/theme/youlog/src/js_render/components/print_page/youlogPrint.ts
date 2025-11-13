import getShortPageUrl from "pageUrl";
import youlogRegister from "../../../youlogRegister";
import { EVENT_PAGE_LOAD_BEFORE, EVENT_PAGE_LOADED } from "pageAjax";

const PAGE_URL_SELECTOR = "[data-el='page-url']";

function youlogPrint() {
  window.print();
}

function renderPageUrl() {
  const pageUrl = document.querySelector<HTMLElement>(PAGE_URL_SELECTOR);
  if (pageUrl) {
    pageUrl.textContent = getShortPageUrl().toString();
  }
}

function initYoulogPrint() {
  document.addEventListener("DOMContentLoaded", () => {
    renderPageUrl();
  });

  // 在页面 AJAX 加载前清空页面URL
  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    const container = document.querySelector<HTMLElement>(PAGE_URL_SELECTOR);
    if (container) {
      container.textContent = "";
    }
  });

  // 在页面 AJAX 加载后重新生成页面URL
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    renderPageUrl();
  });

  // 使用 youlogRegister 注册 print 函数
  youlogRegister({
    print: youlogPrint,
  });
}

export { initYoulogPrint };
