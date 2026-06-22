/**
 * Mobile TOC bar inset contributor 工厂。
 *
 * 【库级模块 · 可复制】
 * - 职责：小屏目录标题栏高度注册为锚点 inset。
 * - 不依赖：youlog 主题选择器（indicatorId / articleSelector 可配置）。
 * - 协作：installToc（传入 anchorScroll 时自动 registerInset）。
 *
 * @module youlog_lib/widgets/toc/tocInset
 */

import type { AnchorInsetContributor } from "../../core/anchorInset";
import { nextFrame, waitForLayoutCondition } from "../../core/anchorInset";
import type { ScrollContainer } from "../../core/scrollAnchor";
import { getMobileTocBarHeight } from "./tocScrollSync";

const DEFAULT_MOBILE_TOC_MQL = "(max-width: 1023px)";
const DEFAULT_INDICATOR_ID = "mobile-toc-indicator";

export interface MobileTocBarInsetOptions {
  scrollContainer: ScrollContainer;
  headerSelector: string;
  order?: number;
  indicatorId?: string;
  articleSelector?: string;
  headingSelector?: string;
  mobileViewportMql?: string;
}

function isMobileViewport(mql: string): boolean {
  return window.matchMedia(mql).matches;
}

function hasHeadingsInArticle(
  articleSelector: string | undefined,
  headingSelector: string | undefined,
): boolean {
  if (!articleSelector || !headingSelector) {
    return true;
  }
  const article = document.querySelector<HTMLElement>(articleSelector);
  if (!article) {
    return false;
  }
  return article.querySelector(headingSelector) !== null;
}

export function createMobileTocBarInset(
  options: MobileTocBarInsetOptions,
): AnchorInsetContributor {
  const {
    scrollContainer,
    headerSelector,
    order = 20,
    indicatorId = DEFAULT_INDICATOR_ID,
    articleSelector,
    headingSelector,
    mobileViewportMql = DEFAULT_MOBILE_TOC_MQL,
  } = options;

  const measureBar = (): number => {
    if (!isMobileViewport(mobileViewportMql)) {
      return 0;
    }
    return getMobileTocBarHeight(scrollContainer, headerSelector, {
      requireSticky: false,
    });
  };

  const isLayoutSettled = (): boolean => {
    if (!isMobileViewport(mobileViewportMql)) {
      return true;
    }
    if (measureBar() > 0) {
      return true;
    }
    if (!hasHeadingsInArticle(articleSelector, headingSelector)) {
      return true;
    }
    const indicator = document.getElementById(indicatorId);
    if (!indicator) {
      return false;
    }
    return indicator.querySelector(".toc-mobile-header") !== null;
  };

  return {
    id: "mobile-toc-bar",
    order,
    measure: measureBar,
    whenReady: async () => {
      await nextFrame();
      await nextFrame();
      await waitForLayoutCondition(isLayoutSettled, { timeoutMs: 2500 });
    },
  };
}
