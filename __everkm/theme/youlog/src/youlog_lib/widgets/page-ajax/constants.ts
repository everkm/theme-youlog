/**
 * page-ajax 共享常量。
 *
 * 生命周期事件名、布局壳选择器与 data 属性名。
 * 模块说明与更新日志见同目录 `index.ts`。
 */

/** 编程式触发站内 AJAX 导航 */
export const EVENT_PAGE_NAVIGATE = "page-navigate";
/** DOM 更新完成且 history 已推进 */
export const EVENT_PAGE_LOADED = "page-loaded";
/** 即将发起页面 HTML 请求 */
export const EVENT_PAGE_LOAD_BEFORE = "page-load-before";
/** 导航进行中，加在 document.body */
export const PAGE_LOADING_CLASS = "page-loading";
/** 即将写入 DOM（element 同步或 shell morph 之前） */
export const EVENT_PAGE_UPDATE_BEFORE = "page-update-before";

/** 页面布局壳元素选择器，用于 idiomorph 整壳替换 */
export const PAGE_SHELL_SELECTOR = "#page-shell";
/** 布局指纹属性，挂在 `#page-shell` 上 */
export const PAGE_SHELL_ATTR = "data-ajax-layout";
/** head 资源指纹属性，挂在 `<html>` 上 */
export const PAGE_HEAD_ATTR = "data-ajax-head";
