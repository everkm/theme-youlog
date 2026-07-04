import { EVENT_PAGE_LOADED } from "./constants";

/**
 * PJAX morph 后重新扫描 Alpine `x-data` 子树。
 * 首屏由 alpine.js defer 自动启动；换页插入的新 HTML 须手动 initTree。
 * 已初始化的节点会被 Alpine 跳过，可安全对 body 调用。
 */
export function installAlpinePjaxReinit(root: ParentNode = document.body): void {
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    const Alpine = (window as { Alpine?: { initTree?: (el: ParentNode) => void } })
      .Alpine;
    if (typeof Alpine?.initTree === "function") {
      Alpine.initTree(root);
    }
  });
}
