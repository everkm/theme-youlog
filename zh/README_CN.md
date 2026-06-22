---
slug: index
---


# 主题配置说明

Youlog 是 [everkm-publish](https://publish.everkm.cn) 的文档/博客主题，默认模板为 `book`。站点级配置写在工作区 `__everkm/everkm.yaml` 的 `config` 节点下；书籍目录的路由参数写在 `folders` 的 `query` 中。

## 配置总览

```yaml
# __everkm/everkm.yaml

config:
  site: { ... }           # 站点基本信息
  layout: { ... }         # 布局相关
  features: { ... }       # 功能开关
  theme_color: "..."      # 浏览器主题色
  custom_css: "..."       # 自定义样式
  copyright: { ... }      # 页脚版权
  beian: [ ... ]          # 备案信息
  yousha: { ... }         # 有啥评论
  algolia_search: { ... } # 全文搜索
  header_nav: [ ... ]     # 顶栏导航
  bottom_nav: [ ... ]     # 页脚链接
  body_end_html: "..."    # 尾部追加的 HTML, 

folders:
  "/docs/":
    template: book
    query:
      nav_file: /docs/_nav.md   # 可选：章节目录文件
      stack: true               # 可选：上下布局（Header 在上，下分左右栏）
```

---

## 站点信息 `site`

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `site.name` | string | 站点名称，用于页面标题、侧栏、顶栏、页脚等 |
| `site.description` | string | 站点描述（发布系统元信息） |
| `site.keywords` | string | 站点关键词（发布系统元信息） |
| `site.logo` | string | Logo 图片路径，如 `~/assets/logos/logo.svg` |
| `site.host` | string | 站点域名，用于正文「永久地址」链接展示 |

示例：

```yaml
config:
  site:
    name: My Docs
    description: 我的文档站
    keywords: docs, everkm
    logo: ~/assets/logos/logo.svg
    host: docs.example.com
```

---

## 布局 `layout`

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `layout.only_display_logo` | boolean | `false` | 有 Logo 时仅显示图片，不显示站点名称 |
| `layout.aisde_no_header` | boolean | `false` | 侧栏不显示站点 Header（Logo / 站点名）。注：配置键名为历史拼写 `aisde`，非 `aside` |
| `layout.hide_print_button` | boolean | `false` | 为 `true` 时隐藏打印入口（元信息区 Print 按钮及打印页眉） |
| `layout.hide_page_qrcode` | boolean | `false` | 为 `true` 时隐藏页面二维码（屏幕端与打印页底部） |

以上 `hide_print_button`、`hide_page_qrcode` 也可在单篇文章 Front Matter 中设置（见下文），**文章级配置优先于全局 `layout` 配置**。

示例：

```yaml
config:
  layout:
    hide_print_button: false
    hide_page_qrcode: false
```

`stack=true` 时，站点 Header 会移至页面顶部顶栏左侧；侧栏内不再重复显示。

---

## 功能开关 `features`

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `features.code_highlight` | boolean | `true` | 是否启用 Prism 代码高亮 |
| `features.katex_formula` | boolean | `false` | 是否启用 KaTeX 数学公式渲染 |

示例：

```yaml
config:
  features:
    code_highlight: true
    katex_formula: true
```

---

## 外观

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `theme_color` | string | 浏览器 `theme-color`，如 `"#0f766e"` |
| `custom_css` | string | 自定义 CSS 文件路径，如 `~/assets/my.css` |

配色变量可参考主题包内 `templates/theme-demo/` 下的配色示例，通过 `custom_css` 覆盖 CSS 变量实现品牌色定制。

---

## 导航

### 顶栏导航 `header_nav`

显示在页面顶部右侧（桌面端为横向菜单，移动端为折叠菜单）。支持多级嵌套。

```yaml
config:
  header_nav:
    - title: 首页
      url: /
    - title: 文档
      url: /docs/
    - title: 更多
      url: /more/
      children:
        - title: 子菜单
          url: /more/sub/
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | — | 显示文本 |
| `url` | string | — | 链接地址 |
| `new_window` | boolean | `true` | 是否新窗口打开 |
| `children` | array | — | 子菜单项，结构同上级 |
| `start_icon` | string | — | 文字前图标，支持 `language`、`external` |
| `end_icon` | string | — | 文字后图标，支持 `language`、`external` |
| `no_highlight` | boolean | `false` | 该项不显示当前页高亮样式 |
| `reflect_active_child` | boolean | `false` | 子项命中当前页时，父项显示子项标题 |
| `match_children_prefix` | boolean | `false` | 仅对**直接子级**链接启用放宽前缀匹配（含 `/`）；子树内二阶段高亮，不改变全局 Home 规则 |

### 页脚导航 `bottom_nav`

显示在正文底部，**仅支持一级**链接。

```yaml
config:
  bottom_nav:
    - title: everkm
      url: https://everkm.cn
    - title: GitHub
      url: https://github.com/everkm/theme-youlog
      new_window: true
```

---

## 搜索 `algolia_search`

配置后顶栏显示 Algolia 全文搜索组件（需配合 `plugin-in-search` 构建产物）。

```yaml
config:
  algolia_search:
    app_id: YOUR_APP_ID
    api_key: YOUR_SEARCH_API_KEY
    index_name: your_index
    site: your-site-id
```

| 字段 | 说明 |
|------|------|
| `app_id` | Algolia Application ID |
| `api_key` | Algolia Search-Only API Key |
| `index_name` | 索引名称 |
| `site` | 站点标识（插件内部使用） |

---

## 评论 `yousha`

接入 [有啥评论](https://yousha.top/) 时配置：

```yaml
config:
  yousha:
    community: your-community-id
```

配置后正文下方渲染 `<yousha-comment>` 组件。

---

## 页脚信息

### 版权 `copyright`

```yaml
config:
  copyright:
    from_year: 2021        # 可选，起始年份；省略则仅显示当前年
    text: everkm           # 版权主体文字
    link: https://everkm.cn  # 可选，链接
```

### 备案 `beian`

```yaml
config:
  beian:
    - text: 苏ICP备2025000000号-1
      link: https://beian.miit.gov.cn/
    - text: 公安备案号
      link: https://beian.mps.gov.cn/
```

---

## 书籍模板路由参数（`folders.query`）

对使用 `template: book` 的目录，可在 `everkm.yaml` 中通过 `query` 传入模板查询参数：

```yaml
folders:
  "/docs/":
    template: book
    query:
      nav_file: /docs/_nav.md
      stack: true
  "/blog/":
    template: book
    # 无 nav_file：不显示左侧树形导航
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `nav_file` | string | **可选**。章节目录 Markdown 文件路径（通常为 `_nav.md` 或 `_SUMMARY.md`）。未配置或文件不存在时不显示树形导航，也不显示上下页导航 |
| `stack` | boolean | **可选**。`true` / `1` / `yes` 启用上下布局：顶栏全宽 Header，下方左侧导航树 + 右侧正文。默认 `false` 为左右布局（左侧全高侧栏 + 右侧顶栏与正文） |

### 布局模式对比

**默认（`stack=false`）**

```
┌──────────┬──────────────────┐
│ 侧栏     │ 顶栏             │
│ (全高)   ├──────────────────┤
│ 导航树   │ 正文 + 目录      │
└──────────┴──────────────────┘
```

**上下布局（`stack=true`）**

```
┌─────────────────────────────┐
│ 顶栏（站点 Logo + 工具）     │
├──────────┬──────────────────┤
│ 导航树   │ 正文 + 目录      │
└──────────┴──────────────────┘
```

`stack=true` 时的行为差异：

- 顶栏左侧固定显示站点 Logo / 名称（不再随滚动切换为文章标题）
- 侧栏顶部不再重复站点 Header
- 侧栏仅保留导航树

---

## 文章 Front Matter

在 Markdown 文首 YAML 中可设置：

| 字段 | 类型 | 说明 |
|------|------|------|
| `meta.description` | string | 页面 `<meta name="description">` |
| `meta.keywords` | string | 页面 `<meta name="keywords">` |
| `meta.hide_meta` | boolean | 为 `true` 时隐藏更新日期、永久地址等元信息行（默认 `false`） |
| `meta.hide_toc` | boolean | 为 `true` 时隐藏页面目录（TOC）（默认 `false`） |
| `meta.hide_title` | boolean | 为 `true` 时隐藏文章标题（默认 `false`） |
| `meta.permalink` | string | 永久链接 slug，正文元信息区展示为 `https://{site.host}/{permalink}` |
| `meta.hide_print_button` | boolean | 为 `true` 时隐藏打印入口；未设置时继承 `layout.hide_print_button`（默认 `false`） |
| `meta.hide_page_qrcode` | boolean | 为 `true` 时隐藏页面二维码；未设置时继承 `layout.hide_page_qrcode`（默认 `false`） |

示例：

```yaml
---
title: 内置过滤器
meta:
  description: 过滤器说明
  keywords: filter, everkm
  permalink: docs/builtin-filter
  hide_print_button: true
  hide_page_qrcode: true
---
```

---

## 环境变量

发布或托管平台可通过环境变量注入（主题通过 `env()` 读取）：

| 变量名 | 说明 |
|--------|------|
| `YOULOG_PLATFORM` | Youlog 平台链接；配置后页脚显示「Youlog」入口 |
| `YOULOG_VERSION` | 当前部署版本号；与版本列表组件联动 |
| `YOULOG_VERSIONS_URL` | 版本列表 JSON 地址，供 `<youlog-version>` 组件使用 |

> `everkm.yaml` 中的 `versions_url` 为发布工作区预留字段；主题页脚版本组件实际读取的是环境变量 `YOULOG_VERSIONS_URL`。

---

## 正文 Markdown 扩展

### 提示块（Alert）

在 Markdown 中使用带特定 class 的引用块：

| Class | 用途 |
|-------|------|
| `.tips` | 提示 |
| `.info` | 信息 |
| `.warning` | 警告 |
| `.error` | 错误 |
| `.success` | 成功 |

### dcard `list` 参数

`dcard/list` 支持参数 `hide_prev_next: true`，隐藏列表项中的上下篇导航链接。

---

## 阅读器设置（浏览器端）

以下由用户浏览器本地存储，**不在** `everkm.yaml` 中配置：

- 字号、行距、字体
- 亮色 / 暗色模式

通过顶栏「Aa」按钮打开阅读设置面板。

---

## 主题元信息

| 项 | 值 |
|----|-----|
| 主题名 | `youlog` |
| 默认模板 | `book` |
| 演示站 | https://youlog.theme.everkm.com/ |
| 仓库 | https://github.com/everkm/theme-youlog |


