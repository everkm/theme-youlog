import { Component, Show } from "solid-js";
import { formatDate, getHideFlag, hideStyle } from "../utils";
import Breadcrumb from "./Breadcrumb";
import PrevNextLinks from "./PrevNextLinks";
import PageNavigation from "./PageNavigation";
import YoushaComment from "./YoushaComment";
import Footer from "./Footer";
import PageQrcode from "./PageQrcode";
import PrintPage from "./PrintPage";

interface ArticleContentProps {
  requestId: string;
  doc: PostItem;
  pageContext: PageContext;
  pageNav: {
    next?: NavIndicatorItem;
    prev?: NavIndicatorItem;
  };
  configValue: (path: string, defaultValue?: any) => any;
  youlogPlatform?: string;
  youlogVersion?: string;
  versionsUrl?: string;
}

interface DocMetaProps {
  doc: PostItem;
  configValue: (path: string, defaultValue?: any) => any;
  hidePrintButton: boolean;
}

const DocMeta: Component<DocMetaProps> = (props) => {
  return (
    <div id="doc-meta" data-ajax-element="doc-meta">
      <div
        style={hideStyle(!!props.doc?.meta?.hide_meta)}
        class="text-sm flex items-center gap-4 text-gray-500 dark:text-gray-400"
      >
        <div
          class="flex items-center gap-0.5"
          data-doc-update-at={props.doc?.updated_at?.toString()}
        >
          <span class="icon-[lets-icons--date-range-light] text-base"></span>
          {formatDate(props.doc?.updated_at)}
        </div>

        <Show when={props.doc?.meta?.permalink}>
          <div
            class="flex items-center"
            data-doc-meta-permalink={props.doc?.meta?.permalink}
          >
            <span class="icon-[uil--map-pin-alt] text-base"></span>
            <a
              href={`/${props.doc?.meta?.permalink}?__not_follow`}
              target="_blank"
              data-no-ajax
            >
              https://{props.configValue("site/host", "")}/
              {props.doc?.meta?.permalink}
            </a>
          </div>
        </Show>

        <div style={hideStyle(props.hidePrintButton)}>
          <PrintPage className="hidden md:flex items-center print:hidden" />
        </div>
      </div>
      <div class="h-6 w-full print:hidden"></div>
    </div>
  );
};

const ArticleContent: Component<ArticleContentProps> = (props) => {
  let htmlContent = props.doc?.content_html || "";
  htmlContent = htmlContent.replaceAll(
    ' class="math math-',
    ' class="opacity-0 math math-',
  );

  const hidePrintButton = () =>
    getHideFlag(
      props.configValue,
      props.doc?.meta,
      "hide_print_button",
      false
    );
  const hidePageQrcode = () =>
    getHideFlag(
      props.configValue,
      props.doc?.meta,
      "hide_page_qrcode",
      false
    );

  return (
    <div class="w-full pr-0 lg:pl-4 lg:pr-8 print:w-full print:p-0 leading-relaxed relative print:static">
      <Breadcrumb navs={props.pageContext.breadcrumbs || []} />

      <div id="page-main">
        <div
          data-ajax-element="print-header"
          style={hideStyle(hidePrintButton())}
          class="hidden print:flex print:items-center print:justify-between print:gap-2 text-gray-400 dark:text-gray-500 print:text-sm"
        >
          <div>{props.configValue("site/name")}</div>
          <div class="font-sans" data-el="page-url"></div>
        </div>

        <div data-ajax-element="article-title">
          <h1
            id="article-title"
            style={hideStyle(!!props.doc?.meta?.hide_title)}
            class="text-[1.8em] font-bold text-gray-900 dark:text-white text-center mb-4 !mt-0"
          >
            {props.doc?.title || "无标题"}
          </h1>
        </div>

        <DocMeta
          doc={props.doc}
          configValue={props.configValue}
          hidePrintButton={hidePrintButton()}
        />

        <article
          id="article-main"
          data-ajax-element="article-main"
          class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none !pt-0"
        >
          <div class="markdown-body" innerHTML={htmlContent} />
          <PrevNextLinks
            requestId={props.requestId}
            qs={props.pageContext.qs || {}}
          />
        </article>

        <div data-ajax-element="page-qrcode">
          <div style={hideStyle(hidePageQrcode())}>
            <PageQrcode />
          </div>
        </div>
      </div>

      <PageNavigation pageNav={props.pageNav} />

      <YoushaComment configValue={props.configValue} />

      <Footer
        requestId={props.requestId}
        pageContext={props.pageContext}
        configValue={props.configValue}
        youlogPlatform={props.youlogPlatform}
        youlogVersion={props.youlogVersion}
        versionsUrl={props.versionsUrl}
      />
    </div>
  );
};

export default ArticleContent;
