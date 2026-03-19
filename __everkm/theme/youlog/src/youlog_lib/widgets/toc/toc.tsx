import "./toc.css";
import {
  TableOfContents,
  MobileToc,
  VERTICAL_PADDING,
  TocItem,
  TocEvents,
} from "./TableOfContents";
import type { TocProps } from "./TableOfContents";
import { render } from "solid-js/web";
import {
  EVENT_PAGE_LOADED,
  EVENT_PAGE_LOAD_BEFORE,
} from "../page-ajax/constants";
import mitt, { Emitter } from "mitt";

interface TocOptions extends Omit<
  TocProps,
  "tocContainer" | "headerHeight" | "callbackHeadersHeight" | "emitter"
> {
  tocSelector?: string;
  headerSelector?: string;
  enableMobileToc?: boolean;
}

const DEFAULT_HEADER_HEIGHT = 0;

function initMobileToc(
  options: TocOptions,
  tocEmitter: Emitter<TocEvents>,
): undefined | (() => void) {
  const {
    articleSelector = "#article-main",
    headingSelector = "h1, h2, h3, h4",
    headerSelector = "header",
    offset = 10,
    highlightParents = true,
    title = "On This Page",
    scrollContainer,
  } = options;

  const article = document.querySelector<HTMLElement>(articleSelector);
  if (!article) return undefined;

  const header = document.querySelector<HTMLElement>(headerSelector);
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;

  let mobileTocContainer = document.getElementById("mobile-toc-indicator");
  if (!mobileTocContainer) {
    mobileTocContainer = document.createElement("div");
    mobileTocContainer.id = "mobile-toc-indicator";
    mobileTocContainer.style.top = `${headerHeight + 2}px`;
    mobileTocContainer.style.position = "sticky";
    mobileTocContainer.style.zIndex = "5";
    if (article.firstChild) {
      article.insertBefore(mobileTocContainer, article.firstChild);
    } else {
      article.appendChild(mobileTocContainer);
    }
  }

  if (mobileTocContainer) {
    return render(
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
  }
}

function generateToc(
  options: TocOptions = {},
  tocEmitter: Emitter<TocEvents>,
): void {
  const {
    tocSelector = "#toc",
    articleSelector = "#article-main",
    headingSelector = "h1, h2, h3, h4, h5",
    headerSelector = "header",
    offset = 10,
    highlightParents = true,
    title = "On This Page",
    onAfterGoto,
    scrollContainer,
  } = options;

  // console.log("generateToc", options);

  const tocContainer = document.querySelector<HTMLElement>(tocSelector);
  const article = document.querySelector<HTMLElement>(articleSelector);
  if (!(tocContainer && article)) {
    console.warn(`${tocSelector} or ${articleSelector} is not found`);
    return;
  }

  tocContainer.innerHTML = "";
  const header = document.querySelector<HTMLElement>(headerSelector);
  const headerHeight = header ? header.offsetHeight : DEFAULT_HEADER_HEIGHT;
  const stickyTop = headerHeight + VERTICAL_PADDING;

  tocContainer.classList.remove("hidden", "mobile-active", "mobile-child");
  tocContainer.classList.add("lg:sticky", "hidden", "lg:block");
  tocContainer.style.top = `${stickyTop}px`;
  tocContainer.style.scrollBehavior = "smooth";

  const callbackHeadersHeight = () => {
    const h = document.querySelector<HTMLElement>(headerSelector);
    return [h ? h.offsetHeight : DEFAULT_HEADER_HEIGHT];
  };
  document.documentElement.style.setProperty(
    "--topbar-height",
    `${callbackHeadersHeight()}px`,
  );

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

const DEFAULT_TOC_OPTIONS: TocOptions = {
  tocSelector: "#toc",
  articleSelector: "#article-main",
  headingSelector: "h1, h2, h3, h4, h5",
  headerSelector: "header",
  offset: 10,
  highlightParents: true,
  title: "On This Page",
  enableMobileToc: true,
  scrollContainer: document.body || undefined,
};

interface TocResult {
  tocEmitter: Emitter<TocEvents>;
  mobileTocCleanup?: () => void;
  options: TocOptions;
}

function initToc(customOptions?: TocOptions): TocResult {
  const options: TocOptions = {
    ...DEFAULT_TOC_OPTIONS,
    ...customOptions,
  };
  let mobileTocCleanup: undefined | (() => void);
  const tocEmitter = mitt<TocEvents>();

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
  let { tocEmitter, mobileTocCleanup, options: tocOptions } = initToc(options);

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    tocEmitter.emit("stop");
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    tocEmitter.emit("update");

    setTimeout(() => {
      if (mobileTocCleanup) {
        mobileTocCleanup();
        mobileTocCleanup = undefined;
      }
      mobileTocCleanup = initMobileToc(tocOptions, tocEmitter);
    }, 100);
  });
}

export type { TocOptions, TocItem };
export { initToc, installToc };
