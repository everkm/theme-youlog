# 顶栏导航 `header_nav` 增强（Feature）

## 0. 变更记录

| 日期 | 说明 |
|------|------|
| 260622 | 初稿：新增 `start_icon` / `end_icon` / `no_highlight` / `reflect_active_child` 配置项及客户端渲染规则 |
| 260622 | 已落地：SSR context 透传、`applyDerivedLabels`、桌面/移动菜单图标与高亮 |

---

## 1. 背景与目标

### 1.1 背景

当前 `header_nav` 仅支持 `title`、`url`、`new_window`、`children` 四字段。主题站点 `everkm.yaml` 已出现以下诉求：

| 菜单项 | 诉求 |
|--------|------|
| Guide / Docs | 外链，需在文字旁显示外链图标 |
| Languages | 父项固定展示语言类图标；子项为 English / 中文；当前语言页应对应显示子项标题而非「Languages」 |
| Languages | 父项本身无有效链接，不应出现「当前页高亮」样式 |

客户端 `MenuItem` 接口已预留字段（`nav_menu.tsx`），但 **SSR 未透传**、**FloatingMenu / MobileMenu 未消费**，配置无法生效。

### 1.2 目标

1. 扩展 `header_nav` YAML 配置，支持图标与高级展示/高亮行为。
2. 配置经 JSRender（`ssr.tsx`）写入 `data-nav-menu-context`，由客户端 `nav-menu` 解析并渲染。
3. 桌面端 `FloatingMenu`、移动端 `MobileMenu` 行为一致。
4. 不破坏现有 URL 最长匹配高亮逻辑（`navMenuUrl.ts`）。

### 1.3 非目标

- 不支持任意 SVG / HTML 片段注入（图标仅限内置注册表或后续单独扩展）。
- 不改变 `bottom_nav` 字段。
- 不在本需求内实现 RTL 布局翻转（字段命名已预留 `start`/`end` 语义）。

---

## 2. 配置项定义

YAML 使用 **snake_case**；经 `data-nav-menu-context` 透传后，客户端 `MenuItem` 使用 **camelCase**。

| 编号 | YAML | MenuItem | 类型 | 默认 | 说明 |
|------|------|----------|------|------|------|
| F-01 | `start_icon` | `startIcon` | string? | — | 菜单文字**前**侧图标标识 |
| F-02 | `end_icon` | `endIcon` | string? | — | 菜单文字**后**侧图标标识 |
| F-03 | `no_highlight` | `noHighlight` | boolean? | `false` | 该项**不应用**高亮样式（见 §3.2） |
| F-04 | `reflect_active_child` | `reflectActiveChild` | boolean? | `false` | 有子项命中当前页时，父项展示文字替换为**该子项** `title`（见 §3.3） |

既有字段不变：`title`、`url`、`new_window`、`children`。

### 2.1 图标标识 `start_icon` / `end_icon`

**取值**：内置名称字符串，首期支持：

| 值 | 用途 | 参考实现 |
|----|------|----------|
| `language` | 语言切换类菜单 | `FloatingMenu.tsx` `IconLanguage` |
| `external` | 外链提示 | `FloatingMenu.tsx` `IconExternal` |

未知值：**忽略**，不渲染图标，不报错（便于后续扩展注册表）。

**布局**（LTR）：

```
[ start_icon ]  title  [ end_icon ]  [ 子菜单 chevron ]
```

- `start_icon` 与文字间距、图标尺寸与现有 chevron 协调（`h-4 w-4` 量级）。
- 有 `children` 时，chevron **仍由组件内置**，与 `end_icon` 并存（chevron 在最末）。

### 2.2 配置示例

```yaml
header_nav:
  - title: "@i18n:Home"
    url:
      _default: /
      zh: /zh/
    new_window: false

  - title: "@i18n:Guide"
    url:
      _default: https://publish.everkm.com/guide/
      zh: https://publish.everkm.cn/guide/
    end_icon: external

  - title: "@i18n:Docs"
    url:
      _default: https://publish.everkm.com/docs/
      zh: https://publish.everkm.cn/docs/
    end_icon: external

  - title: "@i18n:Languages"
    start_icon: language
    no_highlight: true
    reflect_active_child: true
    children:
      - title: English
        url: /index.html
        new_window: false
      - title: 中文
        url: /zh/
        new_window: false
```

---

## 3. 行为规则

### 3.1 配置透传（SSR → Client）

1. `TopHeader` 渲染 `NavMenu` 时须开启 `withContext={true}`（或等效：始终输出 `data-nav-menu-context`）。
2. `ssr.tsx` 将单项除 `children` 外的字段 JSON 序列化到 `data-nav-menu-context`（现有逻辑已支持扩展字段，缺的是调用方传参）。
3. `parseMenuItems` 将 context 合并进 `MenuItem`（现有逻辑已支持）。

字段名映射由 everkm-publish 配置层负责 snake_case → camelCase，或 SSR 层统一转换——**实现时择一并在 README 注明**。

### 3.2 `no_highlight`（F-03）

**语义**：该项在 UI 上**永不**呈现「当前页高亮」样式，即使其子树存在匹配当前 URL 的项。

| 场景 | `active` 计算 | 高亮样式 |
|------|---------------|----------|
| 普通项 | 自身 URL 匹配 **或** 子项匹配 → `active=true` | `active` 时高亮 |
| `no_highlight: true` | 仍可计算 `active`（供 `reflect_active_child` 等逻辑使用） | **强制不高亮** |

说明：

- **不**从 `collectMenuLinks` 排除子项链接；子项仍参与 URL 最长匹配。
- 仅影响**该项自身**的展示样式，不影响子项高亮。
- Languages 父项：子项 English/中文 仍可高亮；父项保持普通文字样式。

### 3.3 `reflect_active_child`（F-04）

**语义**：当该项存在 `children`，且子树中**有且仅按现有规则**有一个（或多个中「最佳」）`active` 子项时，父项**展示用** `text` 替换为该子项的 `title`。

| 条件 | 父项展示文字 |
|------|--------------|
| 无子项 | 配置 `title` |
| 有子项，无一命中 | 配置 `title` |
| 有子项，存在命中子项 | 命中子项的 `title`（若多级嵌套，取**直接**命中项；若仅孙项命中，见 §3.3.1） |

**不改变**：父项 `link`、`href`（无 `url` 时仍为 `#` 或空链接行为）。

#### 3.3.1 嵌套子项命中

子项可多级。替换标题时取 **active 子树中深度最深的 active 叶子或节点** 的 `title`（与「当前选中的语言」一致：命中 `/zh/` 则父项显示「中文」）。

实现建议：在 `applyActiveState` 之后增加 `applyDerivedLabels(items)` 后处理；递归查找 `active` 且 `link` 参与匹配的子项。

#### 3.3.2 与 `no_highlight` 组合

Languages 典型组合：

- `reflect_active_child: true` → 顶栏显示「English」或「中文」
- `no_highlight: true` → 父项无高亮底色
- `start_icon: language` → 保留语言图标

### 3.4 高亮与 PJAX

现有 `installNavMenu` 在 `pjax:page-loaded` 后重新 `parseMenuData` → `applyActiveState` → 重挂菜单。新增后处理须在**每次**重算 `active` 后执行：

```
parseMenuData → applyActiveState → applyDerivedLabels → render
```

---

## 4. 渲染层改动范围

| 模块 | 改动 |
|------|------|
| `ssr.tsx` | `NavItem` 类型补充可选字段；确认 context 序列化 |
| `layout/TopHeader.tsx` | `NavMenu` 传入 `withContext={true}` |
| `nav_menu.tsx` | `MenuItem` 字段定稿；`applyDerivedLabels`；`noHighlight` 参与样式判断 |
| `FloatingMenu.tsx` | 渲染 `startIcon`/`endIcon`；图标注册表；尊重 `noHighlight` |
| `MobileMenu.tsx` | 同上 |
| `index.ts` | 更新文件头说明与更新日志 |
| `zh/README_CN.md` / `en/README.md` | `header_nav` 字段表补充 |

**不在此需求**：`youlog_lib` 对外复制时，宿主主题须同步 `TopHeader` 的 `withContext` 传参（记入 `YOULOG_LIB_README.md` 接入说明）。

---

## 5. 场景与验收（编号可引用）

| 编号 | 场景 | 预期 |
|------|------|------|
| T-01 | Guide/Docs 桌面顶栏 | 文字右侧显示 `external` 图标；默认新窗口打开 |
| T-02 | 当前 URL 为 `/index.html` | Languages 父项文字为「English」，带 `language` 图标，父项无高亮样式 |
| T-03 | 当前 URL 为 `/zh/` 或 `/zh/index.html` | Languages 父项文字为「中文」 |
| T-04 | 悬停 Languages 下拉 | 子项列表仍为 English / 中文；chevron 正常 |
| T-05 | 移动端折叠菜单 | T-02–T-04 行为一致 |
| T-06 | PJAX 从 `/` 切到 `/zh/` | Languages 父项文字随导航更新为「中文」 |
| T-07 | 未配置新字段的旧站点 | 菜单表现与现网一致 |
| T-08 | `end_icon: unknown` | 无图标，其余正常 |

---

## 6. 命名定稿

### 6.1 `useSelectedTitle` → `reflectActiveChild`

| 候选 | 评价 |
|------|------|
| ~~`useSelectedTitle`~~ | 「Selected」易与表单选中混淆；未体现父子关系 |
| **`reflectActiveChild`** ✓ | 短、准确：父项标签**反映**当前 **active 子项** |
| `showActiveChildTitle` | 可读性好，略长 |
| `inheritActiveChildLabel` | 语义正确，但 `label` 与配置字段 `title` 不一致 |

**定稿**：

- 配置：`reflect_active_child`
- 代码：`reflectActiveChild`

### 6.2 其它字段（已定）

- `start_icon` / `startIcon`
- `end_icon` / `endIcon`
- `no_highlight` / `noHighlight`

---

## 7. 实施顺序建议

1. 类型与 SSR 透传（`withContext`、字段映射）
2. `applyDerivedLabels` + 单元测试（可测纯函数）
3. `FloatingMenu` / `MobileMenu` 图标与高亮
4. 更新 `everkm.yaml` 与 README
5. 手动验收 T-01–T-08
