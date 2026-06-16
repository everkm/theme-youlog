# SidebarNavTree2

将侧栏 Markdown 导航转为交互式 `NavTree`。**主文档与更新日志以 [`index.ts`](./index.ts) 文件头注释为准。**

## 快速接入

```ts
import { installSidebarNavTree2 } from "youlog_lib/widgets/nav-tree";

// 无条件调用（侧栏可随 AJAX 导航动态出现）
installSidebarNavTree2();
```

## DOM 约定

```html
<nav id="sidebar-nav-tree" class="invisible">
  <ul>
    <li>章节一<ul><li><a href="/doc/a">A</a></li></ul></li>
  </ul>
</nav>

<div id="breadcrumb" data-ajax-element="breadcrumb">
  <!-- 含 [data-nav-title] 的面包屑，可选 -->
</div>
```

## 与 page-ajax

启用站内 AJAX 时，**必须**同时安装 `page-ajax`；侧栏在 `page-loaded` 时自动 mount。

未安装 page-ajax 时，仅首屏存在 `#sidebar-nav-tree` 的场景可正常工作。

## 结构要求

仅转换通过 `TreeStructureValidator` 的 `ul`/`ol`。详见 `markdownTreeParser.ts` 与 `DEFAULT_MARKDOWN_RULE`。
