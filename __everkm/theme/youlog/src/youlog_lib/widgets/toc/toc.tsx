import "./toc.css";
import {
  TableOfContents,
  MobileToc,
  VERTICAL_PADDING,
  TocEvents,
} from "./TableOfContents";
import type { TocProps } from "./TableOfContents";
import { render } from "solid-js/web";
import {
  EVENT_PAGE_LOADED,
  EVENT_BEFORE_UPDATE,
} from "../page-ajax/constants";
import mitt, { Emitter } from "mitt";
import { resolveScrollContainer, type ScrollContainer } from "../../core/scrollAnchor";

/** 合并默认后的完整配置（不含运行时解析的 tocContainer / scrollContainer / headerHeight / callbackHeadersHeight / emitter） */
export type RequiredTocOptions = Omit<
  TocProps,
  | "tocContainer"
  | "scrollContainer"
  | "headerHeight"
  | "callbackHeadersHeight"
  | "emitter"
> & {
  tocSelector: string;
  scrollContainerSelector: string;
  headerSelector: string;
  enableMobileToc: boolean;
};

/** 对外传入 initToc/installToc；未传字段由 DEFAULT_TOC_OPTIONS 补全 */
export type TocOptions = Partial<RequiredTocOptions>;

const DEFAULT_TOC_OPTIONS: RequiredTocOptions = {
  tocSelector: "#toc",
  articleSelector: "#article-main",
  headingSelector: "h1, h2, h3, h4, h5",
  headerSelector: "header",
  offset: 10,
  highlightParents: true,
  title: "On This Page",
  enableMobileToc: true,
  scrollContainerSelector: "body",
  onAfterGoto: () => {},
};

function getMergedOptions(customOptions?: TocOptions): RequiredTocOptions {
  return {
    ...DEFAULT_TOC_OPTIONS,
    ...(customOptions || {}),
  };
}

const DEFAULT_HEADER_HEIGHT = 0;
const TOPBAR_OFFSET = -1;

function queryWithinScrollContainer(
  scrollContainer: ScrollContainer,
  selector: string,
): HTMLElement | null {
  if (scrollContainer instanceof Window) {
    return document.querySelector<HTMLElement>(selector);
  }
  return scrollContainer.querySelector<HTMLElement>(selector);
}

function resolveHeaderInScrollContainer(
  scrollContainer: ScrollContainer,
  headerSelector: string,
): HTMLElement | null {
  return queryWithinScrollContainer(scrollContainer, headerSelector);
}

/** header 在滚动容器内时叠加 --topbar-height；stack 布局 header 在外则仅保留 offset */
function resolveStickyTop(
  header: HTMLElement | null,
  headerHeight: number,
  offset: number,
): string {
  return header
    ? `calc(var(--topbar-height, ${headerHeight}px) + ${offset}px)`
    : `${offset}px`;
}

function initMobileToc(
  options: RequiredTocOptions,
  tocEmitter: Emitter<TocEvents>,
): undefined | (() => void) {
  const {
    articleSelector,
    headingSelector,
    headerSelector,
    offset,
    highlightParents,
    title,
    scrollContainerSelector,
  } = options;

  const scrollContainer = resolveScrollContainer(scrollContainerSelector);
  if (!scrollContainer) {
    throw new Error(
      `[initMobileToc] scroll container not found: "${scrollContainerSelector}"`,
    );
  }

  const article = queryWithinScrollContainer(scrollContainer, articleSelector);
  if (!article) {
    throw new Error(
      `[initMobileToc] article not found: "${articleSelector}" under "${scrollContainerSelector}"`,
    );
  }

  const header = resolveHeaderInScrollContainer(scrollContainer, headerSelector);
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;

  let mobileTocContainer = document.getElementById("mobile-toc-indicator");
  if (!mobileTocContainer) {
    mobileTocContainer = document.createElement("div");
    mobileTocContainer.id = "mobile-toc-indicator";
    if (article.firstChild) {
      article.insertBefore(mobileTocContainer, article.firstChild);
    } else {
      article.appendChild(mobileTocContainer);
    }
  }

  if (!mobileTocContainer) {
    return undefined;
  }

  // 每次都重新应用：PJAX morph 会清除内联 style（容器无 data-processed 保护）
  mobileTocContainer.style.top = resolveStickyTop(
    header,
    headerHeight,
    TOPBAR_OFFSET,
  );
  mobileTocContainer.style.position = "sticky";
  mobileTocContainer.style.zIndex = "5";

  const disposeMobileToc = render(
    () => (
      <MobileToc
        articleSelector={articleSelector}
        headingSelector={headingSelector}
        headerHeight={headerHeight}
        offset={offset}
        highlightParents={highlightParents}
        title={title}
        emitter={tocEmitter}
        scrollContainer={scrollContainer}
      />
    ),
    mobileTocContainer,
  );

  return () => {
    disposeMobileToc();
  };
}

function generateToc(
  options: RequiredTocOptions,
  tocEmitter: Emitter<TocEvents>,
): void {
  const {
    tocSelector,
    articleSelector,
    headingSelector,
    headerSelector,
    offset,
    highlightParents,
    title,
    onAfterGoto,
    scrollContainerSelector,
  } = options;

  // console.log("generateToc", options);

  const tocContainer = document.querySelector<HTMLElement>(tocSelector);
  const scrollContainer = resolveScrollContainer(scrollContainerSelector);
  if (!scrollContainer) {
    throw new Error(`${scrollContainerSelector} is not found`);
  }

  const article = queryWithinScrollContainer(scrollContainer, articleSelector);
  if (!(tocContainer && article)) {
    throw new Error(`${tocSelector} or ${articleSelector} is not found`);
  }

  tocContainer.innerHTML = "";
  const header = resolveHeaderInScrollContainer(scrollContainer, headerSelector);
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;
  const stickyTopOffset = TOPBAR_OFFSET + VERTICAL_PADDING;

  tocContainer.classList.remove("hidden", "mobile-active", "mobile-child");
  tocContainer.classList.add("lg:sticky", "hidden", "lg:block");
  tocContainer.style.top = resolveStickyTop(
    header,
    headerHeight,
    stickyTopOffset,
  );
  tocContainer.style.scrollBehavior = "smooth";

  const callbackHeadersHeight = () => {
    const h = resolveHeaderInScrollContainer(scrollContainer, headerSelector);
    return [h ? h.offsetHeight : DEFAULT_HEADER_HEIGHT];
  };
  render(
    () => (
      <TableOfContents
        tocContainer={tocContainer}
        articleSelector={articleSelector}
        headingSelector={headingSelector}
        headerHeight={headerHeight}
        offset={offset}
        highlightParents={highlightParents}
        title={title}
        callbackHeadersHeight={callbackHeadersHeight}
        onAfterGoto={onAfterGoto}
        emitter={tocEmitter}
        scrollContainer={scrollContainer}
      />
    ),
    tocContainer,
  );
}

interface TocResult {
  tocEmitter: Emitter<TocEvents>;
  mobileTocCleanup?: () => void;
  options: RequiredTocOptions;
}

function initToc(customOptions?: TocOptions): TocResult | undefined {
  const options = getMergedOptions(customOptions);
  let mobileTocCleanup: undefined | (() => void);
  const tocEmitter = mitt<TocEvents>();

  // check target selector is valid
  const targetSelector = options.tocSelector;
  if (!targetSelector) {
    return undefined;
  }
  const targetElement = document.querySelector(targetSelector);
  if (!targetElement) {
    return undefined;
  }

  generateToc(options, tocEmitter);
  if (options.enableMobileToc) {
    mobileTocCleanup = initMobileToc(options, tocEmitter);
  }

  return {
    tocEmitter,
    mobileTocCleanup,
    options,
  };
}

function installToc(options?: TocOptions): void {
  document.addEventListener("DOMContentLoaded", () => {
    doSetupToc(options);
  });
}

function doSetupToc(options?: TocOptions): void {
  const result = initToc(options);
  if (!result) {
    return;
  }
  let { tocEmitter, mobileTocCleanup, options: tocOptions } = result;

  document.addEventListener(EVENT_BEFORE_UPDATE, () => {
    tocEmitter.emit("stop");
    if (mobileTocCleanup) {
      mobileTocCleanup();
      mobileTocCleanup = undefined;
    }
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    const tocContainer = document.querySelector<HTMLElement>(
      tocOptions.tocSelector,
    );
    if (!tocContainer) {
      tocEmitter.emit("stop");
      return;
    }

    // shell morph 或 data-ajax-element 同步后 #toc 已是新节点，需完整重挂 Solid 组件
    generateToc(tocOptions, tocEmitter);

    if (tocOptions.enableMobileToc) {
      setTimeout(() => {
        mobileTocCleanup = initMobileToc(tocOptions, tocEmitter);
      }, 100);
    }
  });
}

export { initToc, installToc };
export type { TocResult };
