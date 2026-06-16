/**
 * page-ajax — 结构透明的站内无刷新导航（PJAX）
 *
 * 拦截同源链接点击，拉取完整 HTML 后对 `#page-shell` 做 idiomorph，并派发生命周期事件供其它 widget 订阅。
 * 引擎对页面结构**零感知**：除 `#page-shell` 外不含任何具体内容 selector；
 * 受保护的 widget 容器通过 `data-processed` + `ProcessedRegistry` 自行登记。
 *
 * ## 依赖（npm）
 * - `idiomorph` — `#page-shell` DOM morph
 * - `nprogress` — 顶部加载进度条
 *
 * ## 前提条件（SSR / 模板约定）
 *
 * 1. **布局壳**：页面根布局包裹在 `#page-shell`（morph 入口，唯一结构锚点）。
 * 2. **Head 资源指纹**：在 `<html>` 上输出 `data-ajax-head="<指纹>"`；
 *    代码高亮 / KaTeX / custom_css 等 head 资源变化时自动整页刷新（指纹由主题 `utils/ajaxLayout.ts` 生成）。
 * 3. **站内链接**：默认拦截同源、非 `_blank`、位于 `window.__everkm_base_url` 下的 `<a>`；
 *    排除：`data-no-ajax`、`javascript:` / `mailto:` / `tel:`、外链、修饰键点击、`download`。
 *
 * ## Widget 协作契约
 *
 * 受 morph 影响、需保留增强状态的 widget（如侧栏 nav-tree）：
 * 1. 容器必须带**稳定唯一 `id`**（idiomorph 据此原地 morph 而非删旧建新，否则状态会丢失）。
 * 2. 首次 mount 时：`container.setAttribute("data-processed", WIDGET_ID)` +
 *    `processedRegistry.register(WIDGET_ID, container, "#id")`（**必须在改写 innerHTML 之前**，保证 hash 来自原始 SSR HTML）。
 * 3. 监听事件：
 *    - `pjax:before-update` — 清理 observer / 第三方实例（fetch 前派发）
 *    - `pjax:page-loaded` — DOM 已更新、history 已推进；未注册则 mount，已注册可做轻量刷新
 *    - `pjax:widget:reprocess` — 容器内容有变化（detail: `{ widgetId, newHtml, container }`），用新 HTML 重建
 *    - `pjax:widget:teardown` — 容器在新页面不存在（detail: `{ widgetId, container }`），销毁 JS 实例
 *    - `pjax:anchor-navigate` — hash / 锚点导航完成（含 hash-only 变化），不触发 `page-loaded`
 *
 * 无需保留状态的 widget（TOC、代码高亮等）只需监听 `pjax:page-loaded` 重新处理即可。
 *
 * ## 用法
 *
 * ```ts
 * import { initPageAjax } from "youlog_lib/widgets/page-ajax";
 *
 * initPageAjax({ scrollContainerSelector: "#body-main" });
 * ```
 *
 * ## 更新日志
 *
 * - 2026-06-17：v5 重构——引擎零感知架构、`data-processed` + `ProcessedRegistry` 契约、
 *   单 `beforeNodeMorphed` 跳过子树、prefetch 缓存（LRU + 并发去重）、事件命名空间 `pjax:*`；
 *   移除 `data-ajax-element` 快路径与 `data-ajax-layout` / nav-tree 指纹逻辑。
 */

export { initPageAjax, notifyAnchorNavigate, type PageAjaxOptions } from "./pageAjax";
export {
  EVENT_BEFORE_UPDATE,
  EVENT_PAGE_LOADED,
  EVENT_ANCHOR_NAVIGATE,
  EVENT_WIDGET_REPROCESS,
  EVENT_WIDGET_TEARDOWN,
  EVENT_NAVIGATE,
  PAGE_SHELL_SELECTOR,
  PAGE_HEAD_ATTR,
  PAGE_LOADING_CLASS,
} from "./constants";
export { processedRegistry, type RegistryEntry } from "./processedRegistry";
export { hashHtml } from "./htmlHash";
