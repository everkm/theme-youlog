/**
 * 全局编程式导航：`window.youlogNavigate(url)`。
 *
 * 由 `initPageAjax` 注册；未启用 PJAX 时不存在，调用方应回退 `location.href`。
 * SSR / Alpine 内联脚本可用 `navigateOrLocation(url)` 生成带回退的表达式。
 */

/** `window` 上的全局导航函数名 */
export const GLOBAL_NAVIGATE_FN = "youlogNavigate" as const;

export type YoulogNavigate = (url: string) => void;

declare global {
  interface Window {
    youlogNavigate?: YoulogNavigate;
  }
}

export function registerGlobalNavigate(navigate: YoulogNavigate): void {
  window.youlogNavigate = (url: string) => {
    navigate(new URL(url, window.location.href).href);
  };
}

/**
 * 生成内联导航调用：优先 `youlogNavigate`，否则 `location.href`。
 * @param urlExpr 已求值好的 URL 表达式，如 `url` 或 `new URL(...).href`
 */
export function navigateOrLocation(urlExpr: string): string {
  return `(typeof window.youlogNavigate==='function'?window.youlogNavigate:function(u){location.href=u})(${urlExpr})`;
}
