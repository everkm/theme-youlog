/**
 * page-ajax 共享常量。
 *
 * 生命周期 / widget 协作事件名（均以 `pjax:` 命名空间）、布局壳选择器与 data 属性名。
 * 模块说明与更新日志见同目录 `index.ts`。
 */

// ── 生命周期（PJAX 引擎派发） ──────────────────────────────
/** 即将更新页面（fetch 之前派发）；widget 应在此断开 observer、清理第三方实例 */
export const EVENT_BEFORE_UPDATE = "pjax:before-update";
/** DOM 已更新、history 已推进；widget 在此重新初始化 */
export const EVENT_PAGE_LOADED = "pjax:page-loaded";
/** hash / anchor 导航完成（含 hash-only 变化）；不触发 page-loaded */
export const EVENT_ANCHOR_NAVIGATE = "pjax:anchor-navigate";

// ── Widget 协作（PJAX 引擎派发，widget 监听） ─────────────
/** Widget 容器内容有变化，需用新 HTML 重建（detail: { widgetId, newHtml, container }） */
export const EVENT_WIDGET_REPROCESS = "pjax:widget:reprocess";
/** Widget 容器在新页面中不存在，需销毁（detail: { widgetId, container }） */
export const EVENT_WIDGET_TEARDOWN = "pjax:widget:teardown";

// ── 编程式导航（外部代码派发到 window，引擎监听） ─────────
/** window.dispatchEvent(new CustomEvent(EVENT_NAVIGATE, { detail: { url } })) */
export const EVENT_NAVIGATE = "pjax:navigate";

// ── DOM 标记 ──────────────────────────────────────────────
/** 页面布局壳元素选择器，idiomorph morph 入口 */
export const PAGE_SHELL_SELECTOR = "#page-shell";
/** `<html>` 上的 head 资源指纹；不一致时触发整页刷新 */
export const PAGE_HEAD_ATTR = "data-ajax-head";
/** 导航进行中加在 document.body 的 class */
export const PAGE_LOADING_CLASS = "page-loading";
