import { EVENT_PAGE_LOADED, PAGE_SHELL_SELECTOR } from "./constants";

type AlpineApi = {
  initTree?: (el: ParentNode) => void;
  destroyTree?: (el: ParentNode) => void;
};

/**
 * PJAX morph 后重新绑定 Alpine `x-data` 片段（如 dcard 内联分页）。
 *
 * 首屏由 alpine.js defer 自动启动；换页后 idiomorph 可能原地更新已 init 的节点，
 * 仅 `initTree` 会跳过它们，导致片段失效。因此对 morph 入口先 `destroyTree` 再 `initTree`。
 */
export function installAlpinePjaxReinit(root?: ParentNode): void {
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    const Alpine = (window as { Alpine?: AlpineApi }).Alpine;
    if (typeof Alpine?.initTree !== "function") return;

    const target =
      root ??
      document.querySelector(PAGE_SHELL_SELECTOR) ??
      document.body;

    if (typeof Alpine.destroyTree === "function") {
      Alpine.destroyTree(target);
    }
    Alpine.initTree(target);
  });
}
