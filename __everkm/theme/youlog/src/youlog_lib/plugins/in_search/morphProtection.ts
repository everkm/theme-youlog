/**
 * 顶栏 Algolia 搜索（x-in-search）的 PJAX morph 保护。
 *
 * 须在 youlog 主包中安装（与 page-ajax 共用 processedRegistry），
 * 并在 plugin-in-search 的 customElement 升级之前完成注册。
 */
import { processedRegistry } from "../../widgets/page-ajax/processedRegistry";
import {
  EVENT_PAGE_LOADED,
  EVENT_WIDGET_REPROCESS,
} from "../../widgets/page-ajax/constants";

const WIDGET_ID = "in-search";
const WIDGET_SEL = "#header-in-search";

function registerMorphProtection(): void {
  const container = document.querySelector(WIDGET_SEL);
  if (!container || processedRegistry.has(WIDGET_ID)) return;
  container.setAttribute("data-processed", WIDGET_ID);
  processedRegistry.register(WIDGET_ID, container, WIDGET_SEL);
}

function bindPjaxEvents(): void {
  document.addEventListener(EVENT_PAGE_LOADED, registerMorphProtection);

  document.addEventListener(EVENT_WIDGET_REPROCESS, (e: Event) => {
    const { widgetId, newHtml, container } = (e as CustomEvent).detail;
    if (widgetId !== WIDGET_ID || !container) return;
    container.innerHTML = newHtml;
    container.setAttribute("data-processed", WIDGET_ID);
  });
}

let installed = false;

export function installInSearchMorphProtection(): void {
  if (installed) {
    registerMorphProtection();
    return;
  }
  installed = true;
  registerMorphProtection();
  bindPjaxEvents();
}
