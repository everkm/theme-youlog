# youlog_lib 维护规范

## 0. 更新日志

本文件（库级规范）的变更记录：

- **2026-06-16**：初版；章节数字编号；page-ajax / nav-tree 跨项目复制注意事项写入 §4、§5。
- **2026-06-16**：page-ajax 分级导航（idiomorph shell morph、head/layout 指纹）；nav-tree 支持 AJAX 后动态 mount 侧栏。

各 widget 的实现级更新日志仍维护在对应目录的 `index.ts` 文件头（见 §2）。

---

## 1. 概述

`youlog_lib/` 是可复用的浏览器端 widget 库，从 `theme-youlog` **原样复制**到其它主题或站点工程（主题 `Makefile`：`pull-youlog_lib` / `push-youlog_lib`）。

修改任意模块时，须同步维护该模块 **主入口**（§2）中的说明与更新日志；库级约定以本文为准。

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

## 3. 复制到其它项目时的检查清单

- [ ] `package.json` 已声明该 widget 的 **npm 依赖**（例：`page-ajax` 需要 `idiomorph`）
- [ ] 浏览器入口（`entries/browser.ts`）已调用对应 `install*` / `init*`
- [ ] SSR / 模板满足该 widget 的 **DOM 与 data 属性约定**
- [ ] 依赖 `page-ajax` 生命周期的 widget 已订阅 `page-update-before` / `page-loaded`（见 §4）

---

## 4. 核心跨模块契约：page-ajax

多数 widget 依赖 [`widgets/page-ajax/index.ts`](./widgets/page-ajax/index.ts) 派发的生命周期事件：

| 事件 | 时机 | widget 典型用途 |
|------|------|-----------------|
| `page-load-before` | 发起导航请求前 | 取消进行中的异步任务 |
| `page-update-before` | 写入 DOM 前 | 销毁监听、清空第三方 UI |
| `page-loaded` | DOM 更新且 history 已更新后 | 重新扫描 DOM、高亮、渲染 |

### 4.1 分级导航（2026-06-16 起）

主题侧 SSR 还须输出：

| 标记 | 挂载位置 | 作用 |
|------|----------|------|
| `data-ajax-head` | `<html>` | head 资源指纹；不一致时整页刷新 |
| `id="page-shell"` + `data-ajax-layout` | 布局根节点 | 布局指纹；不一致时对壳做 idiomorph morph |

指纹生成（youlog 主题）：`src/utils/ajaxLayout.ts` 的 `buildAjaxPageFingerprint` / `buildAjaxHeadFingerprint`。其它项目须实现同等语义，否则慢路径与整页刷新判断失效。

### 4.2 导航策略摘要

| 条件 | 行为 |
|------|------|
| 仅 hash 变化 | 不请求 |
| `data-ajax-head` 不一致 | 整页跳转 |
| 无 `#page-shell` | 回退：仅 `data-ajax-element` 同步 |
| `data-ajax-layout` 一致 | 快路径：`data-ajax-element` innerHTML |
| `data-ajax-layout` 不一致 | 慢路径：`Idiomorph.morph(#page-shell)` |

---

## 5. 模块变更索引

便于跨项目同步时快速定位；细节见各模块 `index.ts`。

| 模块 | 日期 | 摘要 |
|------|------|------|
| page-ajax | 2026-06-16 | 分级导航 + idiomorph；`PAGE_SHELL_*` / `PAGE_HEAD_ATTR`；依赖 `idiomorph` |
| nav-tree | 2026-06-16 | `page-loaded` 动态 mount；`installSidebarNavTree2()` 无需首屏侧栏；面包屑 document 委托 |

---

## 6. 相关文档

| 路径 | 说明 |
|------|------|
| [`widgets/page-ajax/index.ts`](./widgets/page-ajax/index.ts) | page-ajax 主入口与 API |
| [`widgets/page-ajax/README.md`](./widgets/page-ajax/README.md) | page-ajax 快速接入 |
| [`widgets/nav-tree/index.ts`](./widgets/nav-tree/index.ts) | nav-tree 主入口与 API |
| [`widgets/nav-tree/README-sidebar-nav-tree.md`](./widgets/nav-tree/README-sidebar-nav-tree.md) | 侧栏树 DOM 与结构要求 |
