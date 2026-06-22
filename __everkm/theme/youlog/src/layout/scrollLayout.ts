import {
  resolveScrollContainer,
  type ScrollContainer,
} from "../youlog_lib/core/scrollAnchor";
import { resolveTocGotoHeadersHeight } from "../youlog_lib/widgets/toc/tocScrollSync";

/**
 * youlog 主题滚动布局约定（与 book.tsx 等 SSR 结构对应）。
 * 浏览器端 widget 初始化、锚点滚动等应引用此处，避免选择器散落多处。
 */
export const YOULOG_SCROLL_LAYOUT = {
  scrollContainerSelector: "#body-main",
  articleSelector: "#article-main",
  headerSelector: "header",
  tocSelector: "#toc",
  /** 锚点 / 目录跳转时，标题与 sticky 顶栏之间的额外间距（px） */
  anchorExtraOffset: 10,
} as const;

export type YoulogScrollLayout = typeof YOULOG_SCROLL_LAYOUT;

/** 解析当前页面的主滚动容器（#body-main） */
export function getYoulogScrollContainer(): ScrollContainer | null {
  return resolveScrollContainer(YOULOG_SCROLL_LAYOUT.scrollContainerSelector);
}

/** 锚点 / 目录跳转时的顶部留白（sticky 顶栏 + 小屏目录栏 + 额外间距） */
export function resolveYoulogAnchorScrollOffset(
  scrollContainer: ScrollContainer,
): number {
  return (
    resolveTocGotoHeadersHeight(
      scrollContainer,
      YOULOG_SCROLL_LAYOUT.headerSelector,
    ) + YOULOG_SCROLL_LAYOUT.anchorExtraOffset
  );
}
