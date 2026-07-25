/**
 * URL `__hlts` 关键词高亮（mark.js），并滚到首个命中。
 *
 * ## 更新日志
 *
 * - 2026-07-25：稳健解析 `__hlts`；高亮 class 改为 `keyword-hlt`；readyState 挂载；去掉 debug log。
 */

export {
  installKeywordHighlighter,
  initKeywordHighlighter,
} from "./keywordHighlighter";
