# page-ajax

站内无刷新导航（PJAX）。**主文档与更新日志以 [`index.ts`](./index.ts) 文件头注释为准。**

## 快速接入

```ts
import { installAjaxPageLoad } from "youlog_lib/widgets/page-ajax";

installAjaxPageLoad({ scrollContainerSelector: "#body-main" });
```

## SSR 必配（分级导航）

主题侧需输出布局与 head 指纹（youlog 主题参考 `src/utils/ajaxLayout.ts`）：

```html
<html data-ajax-head="code=1|katex=0|custom_css=1">
  <body>
    <div id="page-shell" data-ajax-layout="page=book|stack=0|nav=1|...">
      <!-- 布局内容 -->
    </div>
  </body>
</html>
```

内容块继续使用 `data-ajax-element="title"` 等标记做快路径同步。

## 生命周期

其它 widget 应：

1. `page-update-before` — 清理
2. `page-loaded` — 重新初始化

详见 `index.ts` 中的事件表。
