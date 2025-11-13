import { Component, Show } from "solid-js";
import { formatDate } from "../utils";
import Breadcrumb from "./Breadcrumb";
import PrevNextLinks from "../PrevNextLinks";
import PageNavigation from "./PageNavigation";
import YoushaComment from "./YoushaComment";
import Footer from "./Footer";

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
}

const DocMeta: Component<DocMetaProps> = (props) => {
  return (
    <div data-ajax-element="doc-meta">
      <Show when={!props.doc?.meta?.hide_meta}>
        <div class="text-sm flex items-center justify-start gap-4 text-gray-500 dark:text-gray-400 ">
          <span data-doc-update-at={props.doc?.updated_at?.toString()}>
            更新于{formatDate(props.doc?.updated_at)}
          </span>
          <Show when={props.doc?.meta?.uno}>
            <span data-doc-meta-uno={props.doc?.meta?.uno}>
              <a href={`/${props.doc?.meta?.uno}`} target="_blank">
                地址编号: {props.doc?.meta?.uno}
              </a>
            </span>
          </Show>
        </div>
        {/* 下边距填充 */}
        <div class="h-8 w-full"></div>
      </Show>
    </div>
  );
};

const ArticleContent: Component<ArticleContentProps> = (props) => {
  return (
    <div class="w-full lg:w-3/4 pr-0 lg:pl-4 lg:pr-8 leading-relaxed relative">
      <Breadcrumb navs={props.pageContext.breadcrumbs || []} />

      <h1
        id="article-title"
        data-ajax-element="article-title"
        class="text-4xl font-bold text-gray-900 dark:text-white text-center mb-4 !mt-0"
      >
        {props.doc?.title || "无标题"}
      </h1>

      <DocMeta doc={props.doc} />

      <article
        id="article-main"
        data-ajax-element="article-main"
        class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none markdown-body !pt-0"
      >
        <div innerHTML={props.doc?.content_html || ""} />
        <PrevNextLinks
          requestId={props.requestId}
          qs={props.pageContext.qs || {}}
        />
      </article>

      {/* 分页导航（基于目录的上一页/下一页）*/}
      <PageNavigation pageNav={props.pageNav} />

      {/* yousha-comment */}
      <YoushaComment configValue={props.configValue} />

      {/* bottom */}
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
