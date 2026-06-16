/**
 * nav-tree — 侧栏 Markdown 导航树
 *
 * 将 `#sidebar-nav-tree` 内符合结构的 `ul`/`ol` 转为 SolidJS `NavTree` 交互组件；
 * 支持面包屑联动与当前页高亮。
 *
 * ## 依赖（npm）
 * - `solid-js` — `NavTree` 组件渲染（`solid-js/web` 的 `render`）
 *
 * ## 依赖（youlog_lib 内）
 * - `page-ajax/constants` — `EVENT_PAGE_LOADED`、`EVENT_PAGE_UPDATE_BEFORE`
 *   （与站内 AJAX 导航协作；**未安装 page-ajax 时仍可在整页加载场景使用**，但不会响应 AJAX 后动态出现的侧栏）
 *
 * ## 前提条件（DOM / SSR）
 *
 * 1. **导航容器**：`#sidebar-nav-tree`（`<nav>` 或任意块级容器），首屏可无（侧栏随路由动态出现时由 `PAGE_LOADED` 自动 mount）。
 * 2. **初始 HTML**：容器直接子级为 Markdown 导出的 `ul`/`ol`（结构须通过 `TreeStructureValidator`）；
 *    转换后子级变为 `.nav-tree-container`。
 * 3. **面包屑（可选）**：`#breadcrumb` 内含 `[data-nav-title]`，用于无 URL 匹配时的路径高亮与点击展开。
 * 4. **隐藏态**：SSR 可给 `#sidebar-nav-tree` 加 `invisible`，转换完成后会自动移除。
 * 5. **浏览器入口**：应**无条件**调用 `installSidebarNavTree2()`，不要仅在首屏存在侧栏时才安装。
 *
 * ## 与 page-ajax 的协作
 *
 * - `page-update-before`：清理已脱离文档的 NavTree 状态，避免 morph 后引用悬空节点。
 * - `page-loaded`：重新查询 `#sidebar-nav-tree`；若存在未转换的 `ul`/`ol` 则执行 `TreeScanner.scanContainer`。
 * - `anchor-navigate`：hash 变化后刷新当前页高亮（不重建树）。
 * - 布局壳 morph（`data-ajax-layout` 变化）后，侧栏可能从无到有，**必须**依赖上述 `page-loaded` 路径完成初始化。
 *
 * ## 用法
 *
 * ```ts
 * import { installSidebarNavTree2 } from "youlog_lib/widgets/nav-tree";
 *
 * // 推荐：浏览器入口无条件调用
 * installSidebarNavTree2();
 *
 * // 可选：自定义面包屑标题选择器
 * installSidebarNavTree2({ breadcrumbTitleSelector: "[data-nav-title]" });
 * ```
 *
 * ## 更新日志
 *
 * - 2026-06-16：`isNavUrlMatch` hash 匹配（页面级链接兜底）；子节点优先；监听 `anchor-navigate` 刷新高亮。
 * - 2026-06-16：`installSidebarNavTree2()` 不再要求首屏存在 `#sidebar-nav-tree`；新增 `mountSidebarNavTree`，
 *   在 `page-loaded` 时重新发现容器并初始化；`navTreeStates` 以 `#sidebar-nav-tree` 为 key；
 *   面包屑点击改为 document 委托；`SidebarNavTreeOptions.container` 改为可选（保留兼容）。
 * - （更早）Markdown `ul`/`ol` 自动扫描转换、面包屑联动、`NavTree` Solid 组件。
 */

export { NavTree, type NavTreeProps } from "./NavTree";
export {
  installSidebarNavTree2,
  type SidebarNavTreeOptions,
} from "./sidebarNavTree2";
