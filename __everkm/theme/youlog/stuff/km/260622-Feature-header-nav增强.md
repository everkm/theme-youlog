# 顶栏导航 `header_nav` 增强（Feature）

## 0. 变更记录

| 日期 | 说明 |
|------|------|
| 260622 | 初稿：新增 `start_icon` / `end_icon` / `no_highlight` / `reflect_active_child` 配置项及客户端渲染规则 |
| 260622 | 已落地：SSR context 透传、`applyDerivedLabels`、桌面/移动菜单图标与高亮 |
| 260623 | 增补 `match_children_prefix`：父项开关 + 子树内二阶段 URL 匹配，兼顾多语言子项（English `/` 前缀覆盖未入导航的英文页） |
| 260623 | 已落地：`exact_match` 按项精确匹配；与 `match_children_prefix` 冲突时优先 exact |
| 260623 | 已落地：`match_children_prefix` 二阶段高亮、`allowRootPrefix`、`everkm.yaml` Languages 开启开关 |

---

## 1. 背景与目标

### 1.1 背景

当前 `header_nav` 仅支持 `title`、`url`、`new_window`、`children` 四字段。主题站点 `everkm.yaml` 已出现以下诉求：

| 菜单项 | 诉求 |
|--------|------|
| Guide / Docs | 外链，需在文字旁显示外链图标 |
| Languages | 父项固定展示语言类图标；子项为 English / 中文；当前语言页应对应显示子项标题而非「Languages」 |
| Languages | 父项本身无有效链接，不应出现「当前页高亮」样式 |
| Languages | 英文子项链到 `/` 时，无法像 `/zh/` 那样前缀覆盖 `/changelog.html` 等未单独入导航的页面；中文子项 `/zh/` 已可前缀匹配 |

客户端 `MenuItem` 接口已预留字段（`nav_menu.tsx`），但 **SSR 未透传**、**FloatingMenu / MobileMenu 未消费**，配置无法生效。

**260623 补充背景**：全局高亮规则中，首页 `/` 仅精确匹配（不做前缀），避免 `/book/` 等子路径误高亮 Home——该规则保持不变。多语言场景下，需在 **Languages 子树内** opt-in 放宽直接子级的前缀匹配（含 `/`），且**不**通过页面等价传染顶层 Home（例如 `/changelog.html` 上 Languages 显示 English，但 Home 不高亮）。

### 1.2 目标

1. 扩展 `header_nav` YAML 配置，支持图标与高级展示/高亮行为。
2. 配置经 JSRender（`ssr.tsx`）写入 `data-nav-menu-context`，由客户端 `nav-menu` 解析并渲染。
3. 桌面端 `FloatingMenu`、移动端 `MobileMenu` 行为一致。
4. 不破坏现有 URL 最长匹配高亮逻辑（`navMenuUrl.ts`）；多语言子树通过 opt-in 的 `match_children_prefix` 增补，而非修改全局默认。

### 1.3 非目标

- 不支持任意 SVG / HTML 片段注入（图标仅限内置注册表或后续单独扩展）。
- 不改变 `bottom_nav` 字段。
- 不在本需求内实现 RTL 布局翻转（字段命名已预留 `start`/`end` 语义）。
- 不提供子项级 `allow_prefix_match`；前缀放宽仅通过父项 `match_children_prefix` 声明。

---

## 2. 配置项定义

YAML 使用 **snake_case**；经 `data-nav-menu-context` 透传后，客户端 `MenuItem` 使用 **camelCase**。

| 编号 | YAML | MenuItem | 类型 | 默认 | 说明 |
|------|------|----------|------|------|------|
| F-01 | `start_icon` | `startIcon` | string? | — | 菜单文字**前**侧图标标识 |
| F-02 | `end_icon` | `endIcon` | string? | — | 菜单文字**后**侧图标标识 |
| F-03 | `no_highlight` | `noHighlight` | boolean? | `false` | 该项**不应用**高亮样式（见 §3.2） |
| F-04 | `reflect_active_child` | `reflectActiveChild` | boolean? | `false` | 有子项命中当前页时，父项展示文字替换为**该子项** `title`（见 §3.3） |
| F-05 | `match_children_prefix` | `matchChildrenPrefix` | boolean? | `false` | 对该项**直接子级**链接启用放宽前缀匹配（含 `/`）；见 §3.4 |
| F-06 | `exact_match` | `exactMatch` | boolean? | `false` | 该项仅精确匹配（含 index.html 等价），不做前缀；见 §3.5 |

既有字段不变：`title`、`url`、`new_window`、`children`。不支持子项级单独开关（`exact_match` 除外，按项配置）。

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
    exact_match: true
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
    match_children_prefix: true
    children:
      - title: English
        url: /
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

### 3.4 `match_children_prefix`（F-05）

**语义**：当父项 `match_children_prefix: true` 时，对该父项的**直接子级**链接单独跑一轮「放宽前缀」URL 匹配；全局默认规则（`navMenuUrl.ts`）**不变**。

#### 3.4.1 动机（多语言不对称）

| 当前路径 | 子项 `/zh/` | 子项 `/` |
|----------|-------------|----------|
| `/zh/changelog.html` | ✅ 尾斜杠目录前缀 | ❌ |
| `/changelog.html` | ❌ | ❌（全局下 `/` 仅精确匹配） |
| `/` | ✅ | ✅ |

中文子项靠既有目录前缀已够用；英文子项指向 `/` 时，需在 Languages 子树内 opt-in 放开 `/` 的前缀匹配，才能在 `/changelog.html` 等页标出 English。

**非目标**：不放宽顶层 Home 的全局匹配；访问 `/changelog.html` 时 Home **可以**不高亮（合理）；由 Languages + `reflect_active_child` 反映当前语言即可。

#### 3.4.2 二阶段 `applyActiveState`

```
阶段 1（按项匹配）：
  遍历每项，用该项自身选项（含 exact_match）匹配 → 最长者 bestLink
  → 仅点亮「自身匹配成功」且与 bestLink 等价的项（同 href 不等价传染）

阶段 2（仅 matchChildrenPrefix 父项）：
  直接子级按各自选项匹配（子项 exact_match 优先于父项放宽前缀）
  → 子树内标记命中子项 + 父项 childActive
```

阶段 1 与阶段 2 **叠加**；阶段 2 不向外等价传染（如 `/changelog.html` 点亮 Languages English，不点亮顶层 Home）。

#### 3.4.3 子树内匹配规则

对开启开关的父项，在其**直接子级**链接集合上：

1. 相对/绝对 URL 均 `new URL(href, origin)` 后再比较（与全局一致）。
2. **精确匹配**：复用 `isNavUrlMatch`（pathname + search；hash 规则同全局）。
3. **前缀匹配**：
   - 尾斜杠目录（如 `/zh/`）：与全局一致，可匹配子路径。
   - **`/`（仅本子树内）**：允许前缀匹配同 origin 路径（全局下仍禁止）。
   - 无尾斜杠路径（如 `/doc/page`）：仅精确匹配。
4. **多项竞争**：仅在**该父项直接子级**之间，按 `toComparePath(pathname).length` 最长者优先（如 `/zh/foo` 上 `/zh/` 胜过 `/`）。

#### 3.4.4 典型场景

| 当前路径 | 阶段 1：顶层 Home | 阶段 2：Languages 子树 |
|----------|-------------------|------------------------|
| `/` | ✅ Home 高亮 | English 子项 ✅ |
| `/changelog.html` | ❌ | English 子项 ✅；父项显示「English」 |
| `/zh/changelog.html` | ❌（或 zh Home `/zh/` 视 locale） | 中文 子项 ✅ |
| `/book/`（导航无 `/book/`） | ❌ | English 子项 ✅（英文站范围内，可接受） |

#### 3.4.5 作用范围与组合

- **仅直接子级**：不继承给孙级；嵌套中间层若需放宽须各自声明。
- **无子项级开关**：只在父项配置，不做 per-child `allow_prefix_match`。
- **与 `no_highlight`**：父项仍无高亮底色；子项照常高亮。
- **与 `reflect_active_child`**：阶段 2 命中子项后，父项展示文字替换为该子项 `title`。
- **全局 `collectMenuLinks`**：子项链接仍参与阶段 1（`/zh/` 等目录项照旧）；English `/` 在阶段 1 仍仅精确匹配。阶段 2 单独处理放宽逻辑，**不**将放宽后的 `/` 前缀结果并入全局 `bestLink`。

#### 3.4.6 透传

开关挂在**父项** `data-nav-menu-context`（与 `reflect_active_child` 同级）；`parseMenuItems` 解析父项时保留 `matchChildrenPrefix`，在 `applyActiveState` 遍历到该父项时对 `children` 执行阶段 2。

### 3.5 `exact_match`（F-06）

**语义**：该项仅 `isNavUrlMatch`（pathname + search；含 `/zh/` ↔ `/zh/index.html`），**不做前缀匹配**。

#### 3.5.1 动机

locale 首页 `/zh/` 在全局规则下会前缀匹配 `/zh/changelog.html`，导致 Home 与 Languages 子项（同 href）一并高亮。对 Home 设 `exact_match: true` 后，仅在 `/zh/`、`/zh/index.html` 高亮。

#### 3.5.2 与 `match_children_prefix` 的优先级

**冲突时优先 `exact_match`**：

| 项 | 配置 | `/zh/changelog.html` |
|----|------|------------------------|
| Home `/zh/` | `exact_match: true` | ❌ 不匹配 |
| Languages → 中文 `/zh/` | （无 exact）+ 父项 `match_children_prefix` | ✅ 阶段 2 前缀匹配 |

子项若设 `exact_match: true`，即使在 `match_children_prefix` 父项下也**不**参与放宽前缀。

#### 3.5.3 配置示例

```yaml
- title: "@i18n:Home"
  url:
    _default: /
    zh: /zh/
  exact_match: true
```

### 3.6 高亮与 PJAX

现有 `installNavMenu` 在 `pjax:page-loaded` 后重新 `parseMenuData` → `applyActiveState` → 重挂菜单。新增后处理须在**每次**重算 `active` 后执行：

```
parseMenuData → applyActiveState（含阶段 1 + 阶段 2）→ applyDerivedLabels → render
```

---

## 4. 渲染层改动范围

| 模块 | 改动 |
|------|------|
| `ssr.tsx` | `NavItem` 类型补充可选字段；确认 context 序列化 |
| `layout/TopHeader.tsx` | `NavMenu` 传入 `withContext={true}` |
| `nav_menu.tsx` | `MenuItem` 字段定稿；`applyDerivedLabels`；`noHighlight` 参与样式判断；`applyActiveState` 阶段 2 |
| `navMenuUrl.ts` | `isNavMenuUrlMatch` 支持 `allowRootPrefix`；子树专用 `findBestMatchingHref` 变体或选项 |
| `menuItemDerived.ts` | `normalizeMenuContext` / `navItemToContext` 透传 `matchChildrenPrefix` |
| `FloatingMenu.tsx` | 渲染 `startIcon`/`endIcon`；图标注册表；尊重 `noHighlight` |
| `MobileMenu.tsx` | 同上 |
| `index.ts` | 更新文件头说明与更新日志（含二阶段与子树前缀规则） |
| `navMenuUrl.test.ts` | 阶段 2 / `allowRootPrefix` / 子树最长匹配用例 |
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
| T-09 | Languages 配 `match_children_prefix: true`，URL `/changelog.html` | Home **不高亮**；Languages 显示「English」；English 子项高亮 |
| T-10 | 同上，URL `/zh/changelog.html` | 中文子项高亮；Languages 显示「中文」；`/zh/` 胜过 `/` |
| T-11 | 同上，URL `/book/`（导航无 book 项） | Home 不高亮；Languages 显示「English」 |
| T-12 | 同上，URL `/` | Home 与 English 子项均高亮（阶段 1 精确匹配）；Languages 显示「English」 |
| T-13 | PJAX `/` → `/changelog.html` | T-09 行为；Home 高亮消失，Languages 仍显示 English |
| T-14 | 父项未配 `match_children_prefix` | `/changelog.html` 上 Languages 子项均不高亮（与现网一致） |

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

### 6.2 `match_children_prefix` → `matchChildrenPrefix`

| 候选 | 评价 |
|------|------|
| **`match_children_prefix`** ✓ | 直白：子级按前缀匹配；与「仅直接子级」语义一致 |
| `prefix_match_children` | 与 `reflect_active_child` 语序接近，略拗口 |
| `relaxed_child_prefix` | 强调放宽，但未体现「前缀匹配」行为 |

**定稿**：

- 配置：`match_children_prefix`
- 代码：`matchChildrenPrefix`

### 6.3 其它字段（已定）

- `start_icon` / `startIcon`
- `end_icon` / `endIcon`
- `no_highlight` / `noHighlight`
- `reflect_active_child` / `reflectActiveChild`

---

## 7. 实施顺序建议

**已落地（260622）**

1. 类型与 SSR 透传（`withContext`、字段映射）
2. `applyDerivedLabels` + 单元测试（可测纯函数）
3. `FloatingMenu` / `MobileMenu` 图标与高亮
4. 更新 `everkm.yaml` 与 README
5. 手动验收 T-01–T-08

**待落地（260623，`match_children_prefix`）** — 已落地

1. `navMenuUrl.ts`：`allowRootPrefix` 选项 + 单元测试
2. `menuItemDerived.ts` / `ssr.tsx`：`NavItem` 类型与 context 透传
3. `navMenuActiveState.ts`：`applyActiveState` 阶段 2（子树 scoped，不传染 Home）
4. `index.ts` 文档与 `everkm.yaml` 为 Languages 开启开关
5. README 字段表；手动验收 T-09–T-14
