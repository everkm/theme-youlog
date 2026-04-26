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
  EVENT_PAGE_LOAD_BEFORE,
  EVENT_PAGE_UPDATE_BEFORE,
} from "../page-ajax/constants";
import mitt, { Emitter } from "mitt";

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

function resolveScrollContainer(selector: string): HTMLElement | null {
  const normalized = selector.trim().toLowerCase();

  // 在标准模式（有 DOCTYPE）下，真实滚动容器通常是 documentElement，而不是 body。
  if (normalized === "body" || normalized === "html") {
    return (
      (document.scrollingElement as HTMLElement | null) ||
      document.documentElement
    );
  }

  return document.querySelector<HTMLElement>(selector);
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

  const article = scrollContainer.querySelector<HTMLElement>(articleSelector);
  if (!article) {
    throw new Error(
      `[initMobileToc] article not found: "${articleSelector}" under "${scrollContainerSelector}"`,
    );
  }

  const header = document.querySelector<HTMLElement>(headerSelector);
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;

  let mobileTocContainer = document.getElementById("mobile-toc-indicator");
  if (!mobileTocContainer) {
    mobileTocContainer = document.createElement("div");
    mobileTocContainer.id = "mobile-toc-indicator";
    mobileTocContainer.style.top = `calc(var(--topbar-height, 0px) + ${TOPBAR_OFFSET}px)`;
    mobileTocContainer.style.position = "sticky";
    mobileTocContainer.style.zIndex = "5";
    if (article.firstChild) {
      article.insertBefore(mobileTocContainer, article.firstChild);
    } else {
      article.appendChild(mobileTocContainer);
    }
  }

  if (!mobileTocContainer) {
    return undefined;
  }

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

  const article = scrollContainer.querySelector<HTMLElement>(articleSelector);
  if (!(tocContainer && article)) {
    throw new Error(`${tocSelector} or ${articleSelector} is not found`);
  }

  tocContainer.innerHTML = "";
  const header = document.querySelector<HTMLElement>(headerSelector);
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;

  tocContainer.classList.remove("hidden", "mobile-active", "mobile-child");
  tocContainer.classList.add("lg:sticky", "hidden", "lg:block");
  tocContainer.style.top = `calc(var(--topbar-height, ${headerHeight}px) + ${TOPBAR_OFFSET + VERTICAL_PADDING}px)`;
  tocContainer.style.scrollBehavior = "smooth";

  const callbackHeadersHeight = () => {
    const h = document.querySelector<HTMLElement>(headerSelector);
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

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    tocEmitter.emit("stop");
  });

  document.addEventListener(EVENT_PAGE_UPDATE_BEFORE, () => {
    if (mobileTocCleanup) {
      mobileTocCleanup();
      mobileTocCleanup = undefined;
    }
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    tocEmitter.emit("update");
    // console.log("TOC: EVENT_PAGE_LOADED");

    if (tocOptions.enableMobileToc) {
      setTimeout(() => {
        mobileTocCleanup = initMobileToc(tocOptions, tocEmitter);
      }, 100);
    }
  });
}

export { initToc, installToc };
export type { TocResult };
