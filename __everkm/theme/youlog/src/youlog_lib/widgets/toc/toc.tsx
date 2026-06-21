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
  EVENT_WIDGET_TEARDOWN,
} from "../page-ajax/constants";
import { processedRegistry } from "../page-ajax/processedRegistry";
import mitt, { Emitter } from "mitt";
import { resolveScrollContainer, type ScrollContainer } from "../../core/scrollAnchor";
import {
  createTocScrollSync,
  getMobileTocBarHeight,
  type TocScrollSync,
} from "./tocScrollSync";
import { syncTocContainerMaxHeight } from "./tocContainerLayout";

/** 合并默认后的完整配置（不含运行时解析的 tocContainer / scrollContainer / headerHeight / callbackHeadersHeight / emitter） */
export type RequiredTocOptions = Omit<
  TocProps,
  | "tocContainer"
  | "scrollContainer"
  | "headerHeight"
  | "callbackHeadersHeight"
  | "emitter"
  | "scrollSync"
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

const TOC_WIDGET_ID = "toc";

function getMergedOptions(customOptions?: TocOptions): RequiredTocOptions {
  return {
    ...DEFAULT_TOC_OPTIONS,
    ...(customOptions || {}),
  };
}

const DEFAULT_HEADER_HEIGHT = 0;
const TOPBAR_OFFSET = -1;

let desktopTocDispose: (() => void) | undefined;
let desktopTocMounted = false;

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

function createScrollSyncForOptions(
  options: RequiredTocOptions,
  scrollContainer: ScrollContainer,
): TocScrollSync {
  return createTocScrollSync({
    scrollContainer,
    articleSelector: options.articleSelector,
    headingSelector: options.headingSelector,
    headerSelector: options.headerSelector,
  });
}

/** 桌面端高亮：仅容器内 header；小屏跳转：header + sticky 时 TOC bar */
function createDesktopGotoHeadersHeight(
  scrollContainer: ScrollContainer,
  headerSelector: string,
) {
  return () => {
    const h = resolveHeaderInScrollContainer(scrollContainer, headerSelector);
    return [h ? h.offsetHeight : DEFAULT_HEADER_HEIGHT];
  };
}

function createMobileGotoHeadersHeight(
  scrollContainer: ScrollContainer,
  headerSelector: string,
) {
  return () => {
    const h = resolveHeaderInScrollContainer(scrollContainer, headerSelector);
    const base = h ? h.offsetHeight : DEFAULT_HEADER_HEIGHT;
    const bar = getMobileTocBarHeight(scrollContainer, headerSelector, {
      requireSticky: false,
    });
    return [base + bar];
  };
}

/** PJAX morph 保护：#toc 子树由 Solid 管理，须跳过 idiomorph 以免被 SSR 空容器覆盖 */
function ensureTocMorphProtection(
  tocContainer: HTMLElement,
  tocSelector: string,
): void {
  if (processedRegistry.has(TOC_WIDGET_ID)) {
    return;
  }
  tocContainer.setAttribute("data-processed", TOC_WIDGET_ID);
  processedRegistry.register(TOC_WIDGET_ID, tocContainer, tocSelector);
}

function applyDesktopTocContainerStyles(
  tocContainer: HTMLElement,
  options: RequiredTocOptions,
  scrollContainer: ScrollContainer,
): void {
  const header = resolveHeaderInScrollContainer(
    scrollContainer,
    options.headerSelector,
  );
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;
  const stickyTopOffset = TOPBAR_OFFSET + VERTICAL_PADDING;

  tocContainer.classList.remove("hidden", "mobile-active", "mobile-child");
  tocContainer.classList.add("lg:sticky", "hidden", "lg:block");
  tocContainer.style.top = resolveStickyTop(
    header,
    headerHeight,
    stickyTopOffset,
  );
  tocContainer.style.scrollBehavior = "auto";
}

function renderDesktopTocTree(
  options: RequiredTocOptions,
  tocContainer: HTMLElement,
  scrollContainer: ScrollContainer,
  tocEmitter: Emitter<TocEvents>,
  scrollSync: TocScrollSync,
): () => void {
  const header = resolveHeaderInScrollContainer(
    scrollContainer,
    options.headerSelector,
  );
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;

  return render(
    () => (
      <TableOfContents
        tocContainer={tocContainer}
        articleSelector={options.articleSelector}
        headingSelector={options.headingSelector}
        headerHeight={headerHeight}
        offset={options.offset}
        highlightParents={options.highlightParents}
        title={options.title}
        callbackHeadersHeight={createDesktopGotoHeadersHeight(
          scrollContainer,
          options.headerSelector,
        )}
        onAfterGoto={options.onAfterGoto}
        emitter={tocEmitter}
        scrollContainer={scrollContainer}
        scrollSync={scrollSync}
      />
    ),
    tocContainer,
  );
}

function unmountDesktopToc(): void {
  desktopTocDispose?.();
  desktopTocDispose = undefined;
  desktopTocMounted = false;
}

/** 首次挂载桌面 TOC（Solid 单例，PJAX 后仅 emit update） */
function mountDesktopToc(
  options: RequiredTocOptions,
  tocEmitter: Emitter<TocEvents>,
  scrollSync: TocScrollSync,
): boolean {
  if (desktopTocMounted) {
    return true;
  }

  const tocContainer = document.querySelector<HTMLElement>(options.tocSelector);
  const scrollContainer = resolveScrollContainer(options.scrollContainerSelector);
  if (!tocContainer || !scrollContainer) {
    return false;
  }

  const article = queryWithinScrollContainer(
    scrollContainer,
    options.articleSelector,
  );
  if (!article) {
    return false;
  }

  ensureTocMorphProtection(tocContainer, options.tocSelector);
  applyDesktopTocContainerStyles(tocContainer, options, scrollContainer);
  desktopTocDispose = renderDesktopTocTree(
    options,
    tocContainer,
    scrollContainer,
    tocEmitter,
    scrollSync,
  );
  desktopTocMounted = true;
  syncTocContainerMaxHeight(tocContainer, scrollContainer);
  return true;
}

/** PJAX 换页后增量刷新桌面 TOC，不 remount Solid */
function refreshDesktopToc(
  options: RequiredTocOptions,
  tocEmitter: Emitter<TocEvents>,
): boolean {
  const tocContainer = document.querySelector<HTMLElement>(options.tocSelector);
  const scrollContainer = resolveScrollContainer(options.scrollContainerSelector);
  if (!tocContainer || !scrollContainer || !desktopTocMounted) {
    return false;
  }

  applyDesktopTocContainerStyles(tocContainer, options, scrollContainer);
  tocContainer.scrollTop = 0;
  syncTocContainerMaxHeight(tocContainer, scrollContainer);
  tocEmitter.emit("update");
  return true;
}

function initMobileToc(
  options: RequiredTocOptions,
  tocEmitter: Emitter<TocEvents>,
  scrollSync: TocScrollSync,
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
    return undefined;
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
        scrollSync={scrollSync}
        callbackGotoHeadersHeight={createMobileGotoHeadersHeight(
          scrollContainer,
          headerSelector,
        )}
        onAfterGoto={options.onAfterGoto}
      />
    ),
    mobileTocContainer,
  );

  return () => {
    disposeMobileToc();
    mobileTocContainer?.remove();
  };
}

function mountToc(
  options: RequiredTocOptions,
  tocEmitter: Emitter<TocEvents>,
  scrollSync: TocScrollSync,
): Pick<TocResult, "mobileTocCleanup"> {
  mountDesktopToc(options, tocEmitter, scrollSync);
  let mobileTocCleanup: undefined | (() => void);
  if (options.enableMobileToc) {
    mobileTocCleanup = initMobileToc(options, tocEmitter, scrollSync);
  }
  return { mobileTocCleanup };
}

interface TocResult {
  tocEmitter: Emitter<TocEvents>;
  scrollSync: TocScrollSync;
  mobileTocCleanup?: () => void;
  options: RequiredTocOptions;
}

function initToc(customOptions?: TocOptions): TocResult | undefined {
  const options = getMergedOptions(customOptions);
  const tocEmitter = mitt<TocEvents>();

  const targetSelector = options.tocSelector;
  if (!targetSelector) {
    return undefined;
  }
  const targetElement = document.querySelector(targetSelector);
  if (!targetElement) {
    return undefined;
  }

  const scrollContainer = resolveScrollContainer(options.scrollContainerSelector);
  if (!scrollContainer) {
    throw new Error(`${options.scrollContainerSelector} is not found`);
  }

  const scrollSync = createScrollSyncForOptions(options, scrollContainer);
  const { mobileTocCleanup } = mountToc(options, tocEmitter, scrollSync);

  return {
    tocEmitter,
    scrollSync,
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
  let { tocEmitter, scrollSync, mobileTocCleanup, options: tocOptions } = result;

  document.addEventListener(EVENT_BEFORE_UPDATE, () => {
    tocEmitter.emit("stop");
    scrollSync.stop();
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
      scrollSync.stop();
      unmountDesktopToc();
      return;
    }

    if (desktopTocMounted) {
      refreshDesktopToc(tocOptions, tocEmitter);
    } else {
      mountDesktopToc(tocOptions, tocEmitter, scrollSync);
    }

    scrollSync.resume();

    if (tocOptions.enableMobileToc) {
      mobileTocCleanup = initMobileToc(tocOptions, tocEmitter, scrollSync);
    }
  });

  document.addEventListener(EVENT_WIDGET_TEARDOWN, (e: Event) => {
    const { widgetId } = (e as CustomEvent<{ widgetId: string }>).detail;
    if (widgetId !== TOC_WIDGET_ID) {
      return;
    }
    tocEmitter.emit("stop");
    scrollSync.stop();
    unmountDesktopToc();
  });
}

export { initToc, installToc };
export type { TocResult };
