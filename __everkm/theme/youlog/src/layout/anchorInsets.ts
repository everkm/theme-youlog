/**
 * youlog 主题锚点 inset 组装（主题专用，不随 youlog_lib 复制）。
 *
 * 将滚动容器内 header（非 stack 布局）注册到 AnchorScrollService。
 * 选择器来自 scrollLayout.ts，与 book.tsx SSR 结构对应。
 */

import type { AnchorScrollService } from "../youlog_lib/core/anchorScrollService";
import { createScrollContainerHeaderInset } from "../youlog_lib/widgets/topbar/topbarInset";
import {
  getYoulogScrollContainer,
  YOULOG_SCROLL_LAYOUT,
} from "./scrollLayout";

function isStackLayout(): boolean {
  return (
    document.getElementById("page-shell")?.getAttribute("data-stack-layout") ===
    "1"
  );
}

/** 注册 youlog 主题专用 anchor inset contributor */
export function registerYoulogAnchorInsets(
  anchorScroll: AnchorScrollService,
): void {
  const scrollContainer = getYoulogScrollContainer();
  if (!scrollContainer) {
    return;
  }

  anchorScroll.registerInset(
    createScrollContainerHeaderInset({
      id: "body-main-header",
      scrollContainer,
      headerSelector: YOULOG_SCROLL_LAYOUT.headerSelector,
      isActive: () => !isStackLayout(),
    }),
  );
}
