# page-ajax

站内无刷新导航（PJAX）。**主文档与更新日志以 [`index.ts`](./index.ts) 文件头注释为准。**

跨项目复制、入口接线、SSR 约定与 widget 协作见 [`YOULOG_LIB_README.md` §3](../../YOULOG_LIB_README.md#3-使用注意事项)。

## 快速接入

```ts
import { initPageAjax } from "youlog_lib/widgets/page-ajax";

initPageAjax({ scrollContainerSelector: "#body-main" });
```

## SSR 必配

引擎对页面结构零感知，仅依赖两个标记（head 指纹由 `src/utils/ajaxLayout.ts` 生成）：

```html
<html data-ajax-head="code=1|katex=0|custom_css=1">
  <body>
    <div id="page-shell">
      <!-- 布局内容；morph 入口 -->
    </div>
  </body>
</html>
```

需在 morph 间保留增强状态的 widget，其容器必须带**稳定唯一 `id`**，并自行 `data-processed` + `processedRegistry.register`。

## 生命周期（`pjax:*`）

其它 widget 应：

1. `pjax:before-update` — 清理（fetch 前派发）
2. `pjax:page-loaded` — 重新初始化
3. `pjax:widget:reprocess` / `pjax:widget:teardown` — 受保护容器内容变化 / 消失
4. `pjax:anchor-navigate` — hash 导航后刷新高亮（如 nav-tree）；**不**触发 `page-loaded`

详见 `index.ts` 中的契约说明。
