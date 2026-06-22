/**
 * Topbar inset contributor 工厂。
 *
 * 【库级模块 · 可复制】
 * - 职责：将顶栏高度注册为锚点 inset（适用于 scrollContainer 为 window 或顶栏在容器外的布局）。
 * - 前提：宿主已安装 topbar height watcher 写入 `--topbar-height`，或 header 元素可测量。
 * - 协作：installTopbarHeightWatcher（可选 anchorScroll 注入时注册）。
 *
 * @module youlog_lib/widgets/topbar/topbarInset
 */

import type { AnchorInsetContributor } from "../../core/anchorInset";
import { parseTopbarHeight, type ScrollContainer } from "../../core/scrollAnchor";
import { nextFrame, waitForLayoutCondition } from "../../core/anchorInset";

export interface TopbarInsetOptions {
  headerSelector?: string;
  order?: number;
  /** 为 true 时 measure 始终读 CSS 变量 --topbar-height */
  useCssVar?: boolean;
}

export function createTopbarInset(options: TopbarInsetOptions = {}): AnchorInsetContributor {
  const {
    headerSelector = "header",
    order = 0,
    useCssVar = true,
  } = options;

  const measure = (): number => {
    if (useCssVar) {
      return parseTopbarHeight();
    }
    const header = document.querySelector<HTMLElement>(headerSelector);
    return header?.offsetHeight ?? 0;
  };

  return {
    id: "topbar",
    order,
    measure,
    whenReady: async () => {
      await nextFrame();
      await waitForLayoutCondition(() => measure() > 0, { timeoutMs: 1500 });
    },
  };
}

/** 滚动容器内的 sticky header（非 window 根滚动时使用） */
export function createScrollContainerHeaderInset(options: {
  scrollContainer: ScrollContainer;
  headerSelector: string;
  id?: string;
  order?: number;
  /** 返回 false 时不计入高度（如 stack 布局 header 在容器外） */
  isActive?: () => boolean;
}): AnchorInsetContributor {
  const {
    scrollContainer,
    headerSelector,
    id = "scroll-container-header",
    order = 10,
    isActive,
  } = options;

  const resolveHeader = (): HTMLElement | null => {
    if (isActive && !isActive()) {
      return null;
    }
    if (scrollContainer instanceof Window) {
      return document.querySelector<HTMLElement>(headerSelector);
    }
    return scrollContainer.querySelector<HTMLElement>(headerSelector);
  };

  return {
    id,
    order,
    measure: () => resolveHeader()?.offsetHeight ?? 0,
    whenReady: async () => {
      await nextFrame();
      await waitForLayoutCondition(() => {
        const header = resolveHeader();
        return !isActive || isActive() ? header !== null : true;
      }, { timeoutMs: 1500 });
    },
  };
}
