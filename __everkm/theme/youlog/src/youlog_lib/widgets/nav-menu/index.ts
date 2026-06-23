/**
 * nav-menu — 顶栏导航菜单
 *
 * 将 `#header-nav` 内 SSR 输出的 `ul`/`li`/`a` 转为 SolidJS 交互菜单；
 * 桌面端为 `FloatingMenu` 下拉，移动端为 `MobileNavController` 折叠面板。
 *
 * ## 依赖（npm）
 * - `solid-js` — 菜单组件渲染（`solid-js/web` 的 `render`）
 * - `@floating-ui/dom` — 桌面端多级下拉定位
 *
 * ## 依赖（youlog_lib 内）
 * - `page-ajax` — 监听 `pjax:page-loaded`，AJAX 导航后按新 URL 重算高亮并重挂菜单
 * - `nav-tree/navTreeUrl` — `isNavUrlMatch` / `normalizePathname`（精确匹配与目录首页等价）
 *
 * ## 前提条件（DOM / SSR）
 *
 * 1. **导航容器**：`#header-nav`（SSR 由 `TopHeader` + `ssr.tsx` 输出，首屏带 `invisible`，客户端 mount 后移除）。
 * 2. **移动端容器（可选）**：`#mobile-menu-container`，由 `installNavMenu({ mobileMenuContainerSelector })` 指定。
 * 3. **配置来源**：站点 `header_nav` 配置项（见主题 README）。
 *    SSR 须 `withContext={true}`，扩展字段经 `data-nav-menu-context` 透传（`start_icon`、`end_icon`、
 *    `no_highlight`、`reflect_active_child`、`match_children_prefix`、`exact_match`）。
 *
 * ## 当前页高亮规则（`navMenuUrl.ts` + `navMenuActiveState.ts`）
 *
 * **阶段 1（全局）**：按**菜单项**各自选项匹配，最长者胜出；仅点亮**自身匹配成功**且与
 * `bestLink` 等价的项（同 href 不同选项不会等价传染，如 Home `exact_match` 与 Languages 子项 `/zh/`）。
 *
 * ### URL 规范化
 *
 * - 相对路径与绝对 URL（含域名）均先 `new URL(href, origin)` 转为绝对地址再比较。
 * - 目录首页等价（与侧栏 nav-tree 一致）：`/index.html` ↔ 对应目录尾斜杠路径互认
 *   （含根路径 `/index.html` ↔ `/`）；无尾斜杠的 `/a` **不参与**等价。
 * - 用于最长匹配的 pathname 规范（`toComparePath`）：尾斜杠目录追加 `index.html`，
 *   例如 `/` → `/index.html`，`/book/` → `/book/index.html`。
 *
 * ### 单项是否匹配（`isNavMenuUrlMatch`）
 *
 * 1. **精确 / 页面级匹配**：复用 `isNavUrlMatch`（pathname + search；导航项带 hash 则要求 hash 一致，
 *    导航项无 hash 时当前 URL 可带任意 hash）。
 * 2. **首页 `/`（特殊）**：`/` 与 `/index.html` 视为同一页面（目录首页等价，与 §URL 规范化一致）；
 *    但**不做前缀匹配**，避免在 `/book/` 等子路径误高亮首页。
 * 3. **其它目录项**（规范化后 pathname 以 `/` 结尾）：除精确匹配外，允许前缀匹配子路径，
 *    例如导航 `/book/` 可匹配当前 `/book/chapter/`。
 * 4. **无尾斜杠的路径**（如 `/doc/page`）：仅精确匹配，不做前缀匹配。
 *
 * ### 多项竞争时（最长匹配优先）
 *
 * 所有匹配项按 `toComparePath(pathname).length` 取最长者，得到 `bestLink`；
 * 再标记与 `bestLink` **页面等价**的项为 active（`isEquivalentNavLink`，含 `/` ↔ `/index.html`），
 * 故 Home `/` 与 English `/index.html` 在首页会同时高亮。
 *
 * ### `match_children_prefix`（阶段 2，子树内放宽）
 *
 * 父项 `match_children_prefix: true` 时，仅对其**直接子级**链接再跑一轮前缀匹配
 * （`allowRootPrefix`，含 `/`）；命中结果**不**通过 `isEquivalentNavLink` 传染子树外项
 * （如 `/changelog.html` 可点亮 Languages 下 English，但顶层 Home 不高亮）。
 * 直接子级之间仍按最长 `toComparePath` 竞争（`/zh/foo` 上 `/zh/` 胜过 `/`）。
 *
 * ### `exact_match`（仅精确，含 index.html 等价）
 *
 * 该项仅 `isNavUrlMatch`（如 `/zh/` ↔ `/zh/index.html`），不做前缀匹配。
 * 与 `match_children_prefix` 冲突时 **优先 `exact_match`**（子项设了 `exact_match` 则不参与父项放宽前缀）。
 * 适用于 locale 首页（`/zh/`），避免在 `/zh/changelog.html` 误高亮 Home。
 *
 * ## 与 page-ajax 的协作
 *
 * - `pjax:page-loaded`：`installNavMenu` 已监听，每次导航后重新解析 SSR 链接并重算高亮。
 * - `#header-nav` 位于 `#page-shell` 内，**未**登记 `data-processed`；morph 后会还原 SSR 结构，
 *   再由 `mountNavMenu` 重建 Solid 菜单。
 *
 * ## 用法
 *
 * ```ts
 * import { installNavMenu } from "youlog_lib/widgets/nav-menu";
 *
 * installNavMenu({ mobileMenuContainerSelector: "#mobile-menu-container" });
 * ```
 *
 * ## 更新日志
 *
 * - 2026-06-23：`exact_match` 按项精确匹配；与 `match_children_prefix` 冲突时优先 exact。
 * - 2026-06-23：`match_children_prefix` 子树二阶段匹配，兼顾多语言 English `/` 前缀覆盖。
 * - 2026-06-22：`header_nav` 扩展 `start_icon` / `end_icon` / `no_highlight` / `reflect_active_child`；SSR context 透传；桌面/移动菜单图标与高亮规则。
 * - 2026-06-20：URL 匹配改为绝对地址比较 + 最长匹配；首页 `/` 仅精确匹配；桌面端 `FloatingMenu` 应用 `active` 样式。
 * - 2026-06-16：`installNavMenu` 监听 `pjax:page-loaded`，修复 AJAX 切换后菜单失效。
 */
export type { MenuItem } from "./nav_menu";
export { initNavMenu, installNavMenu, createNavMenu } from "./nav_menu";
