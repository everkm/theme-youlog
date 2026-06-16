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

/** 侧栏导航树容器选择器 */
export const NAV_TREE_SELECTOR = "#sidebar-nav-tree";
/** 导航树内容指纹，用于检测 nav 文档是否变化 */
export const NAV_TREE_FINGERPRINT_ATTR = "data-nav-fingerprint";
/** 已转换导航树对应的 SSR 源 markup，用于避免同 nav 下重复重建 */
export const NAV_TREE_SOURCE_MARKUP_ATTR = "data-nav-source-markup";
/** 已转换导航树的规范化文本，用于与 SSR 比较 */
export const NAV_TREE_SOURCE_TEXT_ATTR = "data-nav-source-text";
/** `data-ajax-element` 值：侧栏导航树（布局指纹相同时仍须同步 nav HTML） */
export const AJAX_ELEMENT_NAV_TREE = "sidebar-nav-tree";
/** 锚点 / hash 导航完成（pushState 或仅 hash 变化），不触发 page-loaded */
export const EVENT_ANCHOR_NAVIGATE = "anchor-navigate";
