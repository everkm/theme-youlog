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
 *
 * ## 当前页高亮规则（`navMenuUrl.ts`）
 *
 * 解析完菜单链接后，用 `findBestMatchingHref` 在**全部候选链接**中选出唯一最佳匹配，
 * 再标记 `active`；有子项命中时父项也会高亮（下拉菜单场景）。
 *
 * ### URL 规范化
 *
 * - 相对路径与绝对 URL（含域名）均先 `new URL(href, origin)` 转为绝对地址再比较。
 * - 目录首页等价（与侧栏 nav-tree 一致）：仅 `/a/index.html` ↔ `/a/` 互认；
 *   无尾斜杠的 `/a` **不参与**等价。
 * - 用于最长匹配的 pathname 规范（`toComparePath`）：尾斜杠目录追加 `index.html`，
 *   例如 `/` → `/index.html`，`/book/` → `/book/index.html`。
 *
 * ### 单项是否匹配（`isNavMenuUrlMatch`）
 *
 * 1. **精确 / 页面级匹配**：复用 `isNavUrlMatch`（pathname + search；导航项带 hash 则要求 hash 一致，
 *    导航项无 hash 时当前 URL 可带任意 hash）。
 * 2. **首页 `/`（特殊）**：仅精确匹配 `/` 与 `/index.html`，**不做前缀匹配**，
 *    避免在 `/book/` 等子路径误高亮首页。
 * 3. **其它目录项**（规范化后 pathname 以 `/` 结尾）：除精确匹配外，允许前缀匹配子路径，
 *    例如导航 `/book/` 可匹配当前 `/book/chapter/`。
 * 4. **无尾斜杠的路径**（如 `/doc/page`）：仅精确匹配，不做前缀匹配。
 *
 * ### 多项竞争时（最长匹配优先）
 *
 * 所有匹配项按 `toComparePath(pathname).length` 取最长者；例如当前 `/book/` 时，
 * 配置同时有 `/` 与 `/book/`，仅 `/book/` 高亮；当前 `/book/chapter/` 且存在
 * `/book/chapter/` 与 `/book/` 时，优先 `/book/chapter/`。
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
 * - 2026-06-20：URL 匹配改为绝对地址比较 + 最长匹配；首页 `/` 仅精确匹配；桌面端 `FloatingMenu` 应用 `active` 样式。
 * - 2026-06-16：`installNavMenu` 监听 `pjax:page-loaded`，修复 AJAX 切换后菜单失效。
 */
export type { MenuItem } from "./nav_menu";
export { initNavMenu, installNavMenu, createNavMenu } from "./nav_menu";
