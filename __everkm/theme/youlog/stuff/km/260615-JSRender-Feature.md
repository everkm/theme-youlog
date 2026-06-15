# JSRender：EverKM 主题 JS 渲染层

## 0. 变更记录

| 日期 | 说明 |
|------|------|
| 260615 | 确立 JSRender 概念；废弃「SSR」作为构建/架构术语；统一 Makefile、package.json、build.js 命名 |

## 1. 背景与问题

EverKM 主题前端构建长期沿用 `ssr-build`、`build:ssr`、`SSR=true` 等命名，容易误解为：

- 需要独立 Node SSR 服务按请求渲染 HTML
- 与浏览器端 hydration 构成传统 Web SSR 架构

实际并非如此。主题中的「SSR 构建」产出 `templates/everkm-render.js`，由 **everkm-publish 在站点生成阶段加载执行**，与 Tera 模板处于同一渲染层级。

## 2. 概念定义：JSRender

**JSRender** 是 everkm-publish 的 **JS 渲染后端**，与 **Tera** 对等：

```
everkm-publish 渲染层
├── Tera        → templates/*.html           （声明式 HTML 模板）
└── JSRender    → templates/everkm-render.js （程序化 Solid 组件渲染）
```

要点：

1. **执行时机**：发布/生成静态页时，由 everkm-publish 调用，非浏览器运行时 SSR 服务
2. **实现手段**：SolidJS `renderToStringAsync` 将组件输出为 HTML 字符串
3. **产物文件**：`templates/everkm-render.js`（文件名保持不变，everkm-publish 已约定）
4. **导出 API**：`renderPage`、`renderDcard`、`ping`

与 SolidJS 内部术语「SSR」的区别：`youlog_lib/widgets/*/ssr.tsx` 等文件使用 Solid 的 SSR 代码生成能力，属于 **实现细节**；架构层统一称 **JSRender**，不称 SSR 服务。

## 3. 主题前端双构建

主题前端分为两条构建链路：

| 链路 | 入口文件 | 产物 | 运行环境 |
|------|----------|------|----------|
| **Client** | `src/entries/browser.ts` | `dist/assets/youlog*.js`、插件 bundle | 浏览器 |
| **JSRender** | `src/entries/jsrender.ts` | `templates/everkm-render.js` | everkm-publish |

`JSRENDER=true` 模式下，`build.js` **同时**构建 Client 与 JSRender（Client 资源仍需要，供 `_layout.html` 引用）。

仅 `client-build` 时不生成 `everkm-render.js`，适用于只改浏览器交互 widget 的场景。

## 4. 目录与入口约定

```
theme/youlog/
├── build.js
├── Makefile
├── package.json
├── templates/
│   ├── _layout.html          # Tera：引用 {{asset(section="youlog")}}
│   ├── book.html             # Tera 页面模板
│   └── everkm-render.js      # JSRender 产物（构建生成，勿手改）
└── src/
    ├── entries/
    │   ├── browser.ts        # Client 入口
    │   └── jsrender.ts       # JSRender 入口，导出 renderPage / renderDcard
    ├── pages/index.tsx       # renderPage 路由分发
    ├── dcard/index.tsx       # renderDcard
    └── layout/               # 页面布局（项目级）
```

### 4.1 `src/entries/jsrender.ts`

```ts
import { renderPage } from "../pages";
import { renderDcard } from "../dcard";

export { ping, renderPage, renderDcard };
```

### 4.2 `src/pages/index.tsx`

`renderPage(compName, props)` 通过 switch 分发到各页面组件，每个页面包裹 `<RootLayout context={props}>`。

## 5. 构建命令（Makefile）

| Target | 说明 |
|--------|------|
| `fe-clean` | 清理 `dist/` 与 `templates/everkm-render.js` |
| `client-build` | 仅 Client 资源（`pnpm run build`） |
| `client-dev` | Client watch（`pnpm run dev`） |
| `jsrender-build` | Client + JSRender（`pnpm run build:jsrender`） |
| `jsrender-dev` | Client + JSRender watch（`pnpm run dev:jsrender`） |
| `build` | `jsrender-build` + 复制 templates / manifest / 静态资源，组装可发布主题包 |
| `bundle` | `build` 后打 zip |

### 5.1 日常开发选型

| 场景 | 命令 |
|------|------|
| 只改 TOC、导航、懒加载等浏览器交互 | `make client-dev` |
| 改 `renderPage`、页面组件、布局 | `make jsrender-dev` |
| 打完整主题包 | `make build` 或 `make bundle` |

### 5.2 package.json scripts

```json
{
  "build": "NODE_ENV=production node build.js",
  "dev": "node build.js --watch",
  "build:jsrender": "JSRENDER=true NODE_ENV=production node build.js",
  "dev:jsrender": "JSRENDER=true node build.js --watch"
}
```

环境变量：`JSRENDER=true`（替代已废弃的 `SSR=true`）。

## 6. build.js 行为

```
JSRENDER 未设置 → 仅 buildClientBundle()
JSRENDER=true   → Promise.all([client, jsRender]) → everkm-render.js + dist/assets/*
```

JSRender bundle 配置要点：

- `platform: "node"`、`format: "esm"`
- `outfile: templates/everkm-render.js`
- `solidPlugin({ solid: { generate: "ssr" } })` — Solid 编译选项，非架构层 SSR 服务

## 7. 与 Tera 的协作

`_layout.html` 通过 Tera 组装页面骨架，引用 Client 资源：

```html
{{asset(type="css", section="youlog")}}
{{asset(type="js", section="youlog")}}
```

需要 JS 组件渲染的页面（如 `book.html` 中的 SSR 占位）由 everkm-publish 调用 `everkm-render.js` 的 `renderPage` / `renderDcard` 注入 HTML 片段。

Tera 与 JSRender 分工：

- **Tera**：静态结构、条件块、宏、i18n 片段
- **JSRender**：复杂布局、导航状态、需 TypeScript 逻辑的页面区域

## 8. 废弃命名对照

| 废弃 | 现行 |
|------|------|
| `SSR=true` | `JSRENDER=true` |
| `build:ssr` / `dev:ssr` | `build:jsrender` / `dev:jsrender` |
| `ssr-build` / `ssr-dev` | `jsrender-build` / `jsrender-dev` |
| `fe-build` / `fe-dev`（指完整前端） | `jsrender-build` / `jsrender-dev` |
| `fe-build` / `fe-dev`（指仅 Client） | `client-build` / `client-dev` |
| `src/entries/ssr.ts` | `src/entries/jsrender.ts` |

## 9. 相关文档

- 主题构建脚手架说明：各主题仓库 `stuff/km/` 目录
- Solid 组件 SSR 代码生成：`youlog_lib/widgets/*/ssr.tsx`（实现层，非本概念）
