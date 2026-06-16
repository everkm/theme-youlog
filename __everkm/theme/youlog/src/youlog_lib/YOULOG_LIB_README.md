# youlog_lib 维护规范

## 0. 更新日志

本文件（库级规范）的变更记录：

- **2026-06-16**：初版；章节数字编号；page-ajax / nav-tree 跨项目复制注意事项写入 §5、§6。
- **2026-06-16**：page-ajax 分级导航（idiomorph shell morph、head/layout 指纹）；nav-tree 支持 AJAX 后动态 mount 侧栏。
- **2026-06-16**：新增 §3「使用注意事项」— 复制范围、库内外职责、入口接线、SSR 约定、widget 协作与已知缺口。
- **2026-06-16**：`scrollAnchor` 迁入 `core/scrollAnchor.ts`；`topbar` 统一使用 `EVENT_PAGE_LOADED`。

各 widget 的实现级更新日志仍维护在对应目录的 `index.ts` 文件头（见 §2）。

---

## 1. 概述

`youlog_lib/` 是可复用的浏览器端 widget 库，从 `theme-youlog` **原样复制**到其它主题或站点工程（主题 `Makefile`：`pull-youlog_lib` / `push-youlog_lib`）。

修改任意模块时，须同步维护该模块 **主入口**（§2）中的说明与更新日志；库级约定以本文为准。

**重要**：复制 `youlog_lib/` 并调用 `install*` **不能**单独获得完整站点能力。库负责浏览器端 widget 逻辑；SSR 模板、布局指纹、浏览器入口接线仍由宿主主题/项目承担（详见 §3）。

---

## 2. 主入口文件约定

每个 widget 目录应有一个**主入口**（通常为 `index.ts`），负责：

1. **模块说明** — 用途、对外 API  
2. **依赖** — npm 包、同库内其它 widget  
3. **前提条件** — DOM 约定、SSR 输出、全局变量、配置项  
4. **与其它 widget 的协作** — 订阅/派发的生命周期事件  
5. **用法示例**  
6. **更新日志** — 按日期倒序追加，格式：`- YYYY-MM-DD：变更摘要`

实现细节放在同名实现文件（如 `pageAjax.ts`、`sidebarNavTree2.ts`）；主入口以文档 + re-export 为主，避免在实现文件重复大段说明。

```
widgets/<name>/
├── index.ts          ← 主入口（文档 + 导出）
├── <impl>.ts         ← 实现
├── constants.ts      ← 可选：共享常量（须在 index 中一并导出）
└── README.md         ← 可选：较长示例或结构说明
```

---

## 3. 使用注意事项

### 3.1 复制范围

| 范围 | 说明 |
|------|------|
| **必须复制** | 整个 `youlog_lib/` 目录（含 `core/`、`widgets/`、`directives/` 等） |
| **不随库复制** | SSR 布局组件、`ajaxLayout` 指纹生成、主题 CSS、`entries/browser.ts` 入口（见 §3.2） |

### 3.2 库内 / 库外职责

| 职责 | 位置 | 说明 |
|------|------|------|
| Widget 逻辑与 `install*` | `youlog_lib/widgets/*` | 复制后按各模块 `index.ts` 接入 |
| 锚点滚动、嵌套滚动容器 | `youlog_lib/core/scrollAnchor.ts` | 被 `page-ajax`、`toc` 共用；经 `core/index.ts` 导出 |
| 布局 / head 指纹字符串 | 主题 `utils/ajaxLayout.ts` | 仅 SSR 使用；语义须与 `data-ajax-layout` / `data-ajax-head` 一致 |
| DOM 骨架与 `data-*` 标记 | 主题 layout / pages | `#page-shell`、`data-ajax-element`、`#sidebar-nav-tree` 等 |
| 浏览器入口接线 | 主题 `entries/browser.ts` | 调用各 `install*`，并处理 TOC 等与 `anchor-navigate` 的联动 |

指纹生成参考（youlog 主题）：`buildAjaxPageFingerprint` / `buildAjaxHeadFingerprint`。其它项目可实现自己的 config → 字符串规则，但**字段语义**须与 §5.1 一致，否则分级导航（快/慢路径、整页刷新）会失效。

### 3.3 浏览器入口接线

启用 AJAX 导航 + 侧栏树 + 目录时，入口至少应包含（选择器按项目调整）：

```ts
import { installTopbarHeightWatcher } from "youlog_lib/widgets/topbar";
import { installAjaxPageLoad, notifyAnchorNavigate } from "youlog_lib/widgets/page-ajax";
import { installSidebarNavTree2 } from "youlog_lib/widgets/nav-tree";
import { installNavMenu } from "youlog_lib/widgets/nav-menu";
import { installToc } from "youlog_lib/widgets/toc";

installTopbarHeightWatcher("header"); // 写入 --topbar-height，供锚点滚动留白
installAjaxPageLoad({ scrollContainerSelector: "#body-main" });
installSidebarNavTree2(); // 无条件调用，侧栏可随 AJAX 后出现
installNavMenu({ mobileMenuContainerSelector: "#mobile-menu-container" });
installToc({
  scrollContainerSelector: "#body-main",
  onAfterGoto: (id, anchorName) => {
    const hash = anchorName || id;
    if (hash.length) {
      history.pushState(null, "", `#${hash}`);
      notifyAnchorNavigate(); // 刷新 nav-tree 高亮，不触发 page-loaded
    }
  },
});
```

要点：

- **`installSidebarNavTree2()`** 应在入口**无条件**调用，不要仅在首屏存在侧栏时才安装。
- **`notifyAnchorNavigate()`** 须在编程式改 hash（如 TOC 点击）后手动调用；仅 hash 变化的站内链路由 `page-ajax` 自动派发 `anchor-navigate`。
- 使用 `installNavMenu` / `installTopbarHeightWatcher` 等带 `page-loaded` 重挂的 API，勿混用仅首屏生效的 `init*`（若存在）。

### 3.4 SSR 与 DOM 约定（摘要）

除各 widget `index.ts` 中的细节外，启用分级 AJAX 时 SSR 还须：

| 标记 | 挂载位置 | 作用 |
|------|----------|------|
| `data-ajax-head` | `<html>` | head 资源指纹；不一致 → 整页刷新 |
| `id="page-shell"` + `data-ajax-layout` | 布局根 | 布局指纹；不一致 → shell morph |
| `data-ajax-element="<id>"` | 可局部替换块 | 快路径 innerHTML 同步 |
| `id="sidebar-nav-tree"` + `data-ajax-element="sidebar-nav-tree"` + `data-nav-fingerprint` | 侧栏 nav | 布局相同时仍须同步 nav HTML；指纹供 `navTreeSync` 判断 |

侧栏 SSR 可带 `invisible` class，由 `nav-tree` 转换完成后移除。

### 3.5 Widget 协作关系

```
SSR（指纹 + DOM）
    ↓
page-ajax ←── scrollAnchor（锚点滚动 / 滚顶）
    │              ↑
    │         topbar（--topbar-height）
    ├── page-loaded ──→ nav-tree / nav-menu / toc / prism / …
    └── anchor-navigate ──→ nav-tree（仅刷新高亮，不重建树）
```

- **page-ajax** 是多数 widget 的生命周期中枢；未安装时，仅整页加载场景下部分 widget 仍可用（如首屏已存在 DOM 的 nav-tree）。
- **nav-tree** 依赖 `page-ajax` 的 `page-loaded`（动态 mount）与 `anchor-navigate`（hash 高亮）；快路径下依赖 `data-nav-fingerprint` 与 `navTreeSync`。
- **toc** 与 **page-ajax** 共用 `scrollAnchor`；嵌套滚动容器（如 `#body-main`）须在 `installToc` / `installAjaxPageLoad` 中传同一 `scrollContainerSelector`。
- **topbar** 与 **scrollAnchor** 通过 CSS 变量 `--topbar-height` 协作；未安装 topbar 时锚点滚动仍可用，仅顶部留白可能偏小。

### 3.6 npm 依赖（常用组合）

| Widget | 主要 npm 依赖 |
|--------|----------------|
| page-ajax | `ky`, `nprogress`, `idiomorph` |
| nav-tree / nav-menu / toc | `solid-js` |
| 其它 | 见各模块 `index.ts` 文件头 |

### 3.7 已知缺口与维护注意

1. 修改 `page-ajax` 生命周期或指纹语义时，须同步检查 **nav-tree、toc、nav-menu、topbar** 及宿主 SSR 模板。
2. 主题侧 [`utils/scrollAnchor.ts`](../utils/scrollAnchor.ts) 仅为兼容 re-export，新代码请从 `youlog_lib/core` 引用。

---

## 4. 复制到其它项目时的检查清单

- [ ] 已复制完整 `youlog_lib/`（含 `core/scrollAnchor.ts`）
- [ ] `package.json` 已声明所用 widget 的 **npm 依赖**（例：`page-ajax` → `idiomorph`）
- [ ] 浏览器入口已按 §3.3 调用 `install*` / `notifyAnchorNavigate` 等接线
- [ ] SSR / 模板满足 §3.4 与各 widget **DOM / data 属性约定**
- [ ] 布局指纹由主题侧生成，语义与 §5.1 一致
- [ ] 依赖 `page-ajax` 生命周期的 widget 已处理 `page-update-before` / `page-loaded` / `anchor-navigate`（见 §5）

---

## 5. 核心跨模块契约：page-ajax

多数 widget 依赖 [`widgets/page-ajax/index.ts`](./widgets/page-ajax/index.ts) 派发的生命周期事件：

| 事件 | 时机 | widget 典型用途 |
|------|------|-----------------|
| `page-load-before` | 发起导航请求前 | 取消进行中的异步任务 |
| `page-update-before` | 写入 DOM 前 | 销毁监听、清空第三方 UI |
| `page-loaded` | DOM 更新且 history 已更新后 | 重新扫描 DOM、高亮、渲染 |
| `anchor-navigate` | 仅 hash 变化或编程式锚点导航后 | 刷新 nav-tree 高亮等（**不**触发 `page-loaded`） |

### 5.1 分级导航（2026-06-16 起）

主题侧 SSR 还须输出：

| 标记 | 挂载位置 | 作用 |
|------|----------|------|
| `data-ajax-head` | `<html>` | head 资源指纹；不一致时整页刷新 |
| `id="page-shell"` + `data-ajax-layout` | 布局根节点 | 布局指纹；不一致时对壳做 idiomorph morph |

指纹生成（youlog 主题）：`src/utils/ajaxLayout.ts` 的 `buildAjaxPageFingerprint` / `buildAjaxHeadFingerprint`。其它项目须实现同等语义，否则慢路径与整页刷新判断失效。

### 5.2 导航策略摘要

| 条件 | 行为 |
|------|------|
| 仅 hash 变化 | 不请求；滚动到锚点；派发 `anchor-navigate` |
| `data-ajax-head` 不一致 | 整页跳转 |
| 无 `#page-shell` | 回退：仅 `data-ajax-element` 同步 |
| `data-ajax-layout` 一致 | 快路径：`data-ajax-element` innerHTML |
| `data-ajax-layout` 不一致 | 慢路径：`Idiomorph.morph(#page-shell)` |

---

## 6. 模块变更索引

便于跨项目同步时快速定位；细节见各模块 `index.ts`。

| 模块 | 日期 | 摘要 |
|------|------|------|
| scrollAnchor | 2026-06-16 | 迁入 `core/scrollAnchor.ts`；供 page-ajax、toc 锚点滚动 |
| page-ajax | 2026-06-16 | 分级导航 + idiomorph；`PAGE_SHELL_*` / `PAGE_HEAD_ATTR`；依赖 `idiomorph` |
| nav-tree | 2026-06-16 | `page-loaded` 动态 mount；`installSidebarNavTree2()` 无需首屏侧栏；面包屑 document 委托 |

---

## 7. 相关文档

| 路径 | 说明 |
|------|------|
| [`YOULOG_LIB_README.md`](./YOULOG_LIB_README.md) | 库级规范、§3 使用注意事项、复制检查清单 |
| [`widgets/page-ajax/index.ts`](./widgets/page-ajax/index.ts) | page-ajax 主入口与 API |
| [`widgets/page-ajax/README.md`](./widgets/page-ajax/README.md) | page-ajax 快速接入 |
| [`widgets/nav-tree/index.ts`](./widgets/nav-tree/index.ts) | nav-tree 主入口与 API |
| [`widgets/nav-tree/README-sidebar-nav-tree.md`](./widgets/nav-tree/README-sidebar-nav-tree.md) | 侧栏树 DOM 与结构要求 |
