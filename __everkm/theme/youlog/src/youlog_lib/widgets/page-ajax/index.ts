/**
 * page-ajax — 站内无刷新导航（PJAX）
 *
 * 拦截同源链接点击，拉取完整 HTML 后按策略局部更新 DOM，并派发生命周期事件供其它 widget 订阅。
 *
 * ## 依赖（npm）
 * - `ky` — 页面 HTML 请求
 * - `nprogress` — 顶部加载进度条
 * - `idiomorph` — 布局壳 DOM morph（慢路径）
 *
 * ## 前提条件（SSR / 模板约定）
 *
 * 1. **可局部替换的内容块**：在需要 AJAX 刷新的节点上标记 `data-ajax-element="<唯一 id>"`，
 *    新旧页面各有一份同名标记；快路径仅同步这些节点的 `innerHTML`。
 * 2. **布局壳（推荐）**：页面根布局包裹在 `#page-shell`，并输出布局指纹：
 *    - `id="page-shell"`
 *    - `data-ajax-layout="<指纹>"` — 布局骨架或文档级显示开关变化时触发 shell morph
 * 3. **Head 资源指纹（推荐）**：在 `<html>` 上输出 `data-ajax-head="<指纹>"`；
 *    代码高亮 / KaTeX / custom_css 等 head 资源变化时自动整页刷新。
 * 4. **站内链接**：默认拦截同源且位于 `window.__everkm_base_url` 下的 `<a>`；
 *    排除链接：`data-no-ajax`、`#hash`、`mailto:`、外链。
 * 5. **滚动容器**：调用 `installAjaxPageLoad({ scrollContainerSelector })` 指定导航后滚动的容器（默认 `#body-main`）。
 * 6. **布局指纹生成（主题侧）**：`data-ajax-layout` / `data-ajax-head` 由 SSR 输出；
 *    youlog 主题使用 `src/utils/ajaxLayout.ts` 的 `buildAjaxPageFingerprint` / `buildAjaxHeadFingerprint`，
 *    其它项目需自行实现同等语义的指纹，否则慢路径与整页刷新判断将失效。
 *
 * ## 导航分级策略
 *
 * | 条件 | 行为 |
 * |------|------|
 * | 仅 hash 变化 | 不请求；滚动到锚点；派发 `anchor-navigate` |
 * | `data-ajax-head` 不一致 | `location.href` 整页跳转 |
 * | 无 `#page-shell` | 回退：仅 `data-ajax-element` 同步（兼容旧模板） |
 * | `data-ajax-layout` 一致 | 快路径：`data-ajax-element` innerHTML 同步 |
 * | `data-ajax-layout` 不一致 | 慢路径：`Idiomorph.morph(#page-shell)` |
 *
 * ## 生命周期事件（`constants.ts`）
 *
 * - `page-load-before` — 即将发起请求（`detail.url`）
 * - `page-update-before` — 即将写入 DOM；widget 应在此销毁监听、清理第三方实例
 * - `page-loaded` — DOM 已更新且 `history.pushState` 完成（`detail.url`）
 * - `anchor-navigate` — 锚点 / hash 导航完成（TOC、`pushState`、仅 hash 变化）；**不**触发 `page-loaded`
 * - `page-navigate` — 编程式导航：`window.dispatchEvent(new CustomEvent('page-navigate', { detail: { url } }))`
 *
 * ## 与其它 widget 的协作
 *
 * - 监听 `page-update-before` 做清理，监听 `page-loaded` 做重新初始化（TOC、代码高亮、侧栏导航树等）。
 * - 布局壳 morph 后，依赖具体 DOM 节点引用（非 document 查询）的 widget 必须在新节点上重新绑定。
 *
 * ## 用法
 *
 * ```ts
 * import { installAjaxPageLoad } from "youlog_lib/widgets/page-ajax";
 *
 * installAjaxPageLoad({ scrollContainerSelector: "#body-main" });
 * ```
 *
 * ## 更新日志
 *
 * - 2026-06-16：`anchor-navigate` 与 `notifyAnchorNavigate()`；导航完成后在 `pushState` 之后滚动到 fragment。
 * - 2026-06-16：引入分级导航：`data-ajax-head` 不一致整页刷新；`data-ajax-layout` 一致走 element 快路径，
 *   不一致时对 `#page-shell` 做 idiomorph；新增 `PAGE_SHELL_*` / `PAGE_HEAD_ATTR` 常量；依赖 `idiomorph`。
 * - （更早）基于 `data-ajax-element` 的 PJAX 与 `page-*` 生命周期事件。
 */

export { installAjaxPageLoad, notifyAnchorNavigate, type PjaxOptions } from "./pageAjax";
export {
  EVENT_PAGE_NAVIGATE,
  EVENT_PAGE_LOADED,
  EVENT_PAGE_LOAD_BEFORE,
  EVENT_PAGE_UPDATE_BEFORE,
  EVENT_ANCHOR_NAVIGATE,
  PAGE_LOADING_CLASS,
  PAGE_SHELL_SELECTOR,
  PAGE_SHELL_ATTR,
  PAGE_HEAD_ATTR,
} from "./constants";
