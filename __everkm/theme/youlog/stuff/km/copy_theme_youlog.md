站点工作区 ({{WORKSPACE_NAME}}/)
├── zh/, en/                    # Markdown 内容
└── __everkm/
    ├── Makefile                # 开发/发布入口（everkm-publish）
    ├── package.json            # everkm-publish 依赖
    └── theme/{{THEME_NAME}}/   # 主题源码（脚手架化主体）
        ├── Makefile
        ├── build.js
        ├── package.json
        ├── everkm-theme.yaml
        ├── tailwind.config.js
        ├── tsconfig.json
        ├── __assets/             # 静态资源，发布时原样复制到 dist/assets/
        ├── stuff/
        │   └── km/               # 主题知识文档（需求/规范）
        ├── src/
        │   ├── entries/
        │   │   ├── browser.ts    # Client 入口
        │   │   └── jsrender.ts   # JSRender 入口
        │   ├── youlog_lib/       # 可复用 widget 库
        │   ├── layout/
        │   ├── pages/
        │   ├── dcard/
        │   ├── assets/css/
        │   └── types/
        └── templates/            # Tera 模板 + everkm-render.js（构建产物）


## everkm-theme.yaml 要求

```yaml
name: {{THEME_NAME}}
version: {{THEME_VERSION}}
author: {{AUTHOR}}
repository: {{REPOSITORY}}
demo: {{DEMO_URL}}
default_template: doc   # 或 book
```

## package.json scripts（theme 级）

```json
{
  "build": "NODE_ENV=production node build.js",
  "dev": "node build.js --watch",
  "build:jsrender": "JSRENDER=true NODE_ENV=production node build.js",
  "dev:jsrender": "JSRENDER=true node build.js --watch"
}
```

- `build` / `dev`：仅 Client（浏览器端 youlog、插件等）
- `build:jsrender` / `dev:jsrender`：Client + JSRender（`everkm-render.js`）

## Makefile 要求（theme 级）

必须包含：

| Target | 说明 |
|--------|------|
| `fe-install` | `pnpm i` |
| `fe-clean` | 清理 `dist/` 和 `templates/everkm-render.js` |
| `client-build` / `client-dev` | 仅浏览器端资源 |
| `jsrender-build` / `jsrender-dev` | Client + JSRender |
| `build` | `jsrender-build` → 复制 templates、assets-manifest.json、everkm-theme.yaml、`__assets/*` |
| `bundle` | `build` → zip 为 `{{DIST_BUNDLE_NAME}}.zip` |
| `tag` | 委托上级 Makefile |

可选：

| Target | 说明 |
|--------|------|
| `dist-local` | `build` → 移动到 `../{{DIST_BUNDLE_NAME}}` |
| `debug-install` | rsync 到本地调试站点 |
| `copy-types` | 从 everkm-publish 复制类型定义 |
| `pull-youlog_lib` / `push-youlog_lib` | 同步 youlog_lib |
| `analyze` | bundle 体积分析 |

JSRender 概念详见：`stuff/km/260615-JSRender-Feature.md`（canonical 源：`theme-youlog` 仓库）

## build.js 要求

1. 多入口 IIFE 浏览器构建，输出到 `./dist/assets/`
2. 生成 `assets-manifest.json`（entrypoints 映射）
3. JSRender 构建输出 `templates/everkm-render.js`（ESM，供 everkm-publish 调用）
4. 浏览器入口：`src/entries/browser.ts` → `youlog`
5. JSRender 入口：`src/entries/jsrender.ts` → `everkm-render`
6. 按 {{PLUGINS}} 动态增减 entryPoints（如 `plugin-in-search`）
7. 使用 esbuild + solid-plugin + tailwind/postcss
8. `JSRENDER=true`（或 `--jsrender`）时同时构建 Client 与 JSRender

### build.js 变体

- **默认**（如 www-2026）：JSRender 用 `outfile: templates/everkm-render.js`
- **含静态资源 import**（如 about-2026 引用 `.svg`）：Client 与 JSRender 的 esbuild `loader` 需保留 `.svg`/`.png` 等为 `file`；JSRender 可用 `outdir` + `entryNames` 输出到 `templates/`
- `youlog_lib/widgets/*/ssr.tsx` 是 Solid 编译实现，架构层统称 JSRender，不必改名

## JSRender 约定

- `src/entries/jsrender.ts` 导出：`ping`, `renderPage`, `renderDcard`
- `src/pages/index.tsx` 的 `renderPage(compName, props)` 用 switch 分发到各页面组件
- 每个页面组件包裹 `<RootLayout context={props}>...</RootLayout>`
- 使用 `renderToStringAsync` from `solid-js/web`
- JSRender 与 Tera 对等，由 everkm-publish 在发布时执行，非运行时 SSR 服务

## 模板约定（Tera）

- Tera 模板与 JSRender 产物 `everkm-render.js` 均放在 `templates/`
- `_layout.html` 通过 `{{asset(type="js", section="youlog")}}` 引用 Client 资源

## 工作区 Makefile（__everkm 级）

| Target | 说明 |
|--------|------|
| `pnpm-install` | 安装 everkm-publish 等依赖 |
| `install-everkm-publish` | 更新 everkm-publish |
| `work` | `everkm-publish serve --work-dir ../ --theme {{THEME_NAME}} --theme-dev` |
| `preview` | 预览已 export 的 dist |

## 约束

1. 包管理器使用 pnpm，`packageManager` 写 `pnpm@10.x`
2. 不要硬编码个人路径（`INSTALL_DIR`、`YOULOG_LIB_DIR` 等用注释占位）
3. 最小可运行：`make fe-install && make jsrender-build && make work`
4. 代码风格：SolidJS + TSX + Tailwind
5. `youlog_lib` 可从 `theme-youlog` 原样复制，或按需增删
6. 新建主题时复制 `stuff/km/260615-JSRender-Feature.md` 到主题目录

## 日常开发

| 场景 | 命令 |
|------|------|
| 只改浏览器交互（TOC、导航等） | `make client-dev` |
| 改页面组件 / renderPage | `make jsrender-dev` |
| 打完整主题包 | `make build` 或 `make bundle` |

## 输出

1. 生成完整文件树
2. 每个文件给出完整内容（不是伪代码）
