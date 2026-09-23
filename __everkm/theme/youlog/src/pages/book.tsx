import { Component, Show } from "solid-js";
import { buildAjaxPageFingerprint } from "../utils/ajaxLayout";
import { pageNotFound } from "../utils/jsRenderError";
import Sidebar from "../layout/Sidebar";
import TopHeader from "../layout/TopHeader";
import ArticleContent from "../layout/ArticleContent";
import TOC from "../layout/TOC";
import { YoushaCommentScript } from "../layout/YoushaComment";

export type BookPageData = {
  doc: PostItem;
  navDoc: PostItem | null;
  pageNav: { prev?: NavIndicatorItem; next?: NavIndicatorItem };
};

interface BookPageProps {
  props: PageContext;
  data: BookPageData;
}

function isTruthyQuery(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  return false;
}

/** J-2：在 renderPage 入口预取嵌套 API，组件内同步读 */
export async function loadBookPageData(
  pageContext: PageContext,
): Promise<BookPageData> {
  const requestId = pageContext.request_id;
  const post = pageContext.post;
  if (!post) throw pageNotFound("Post not found");
  const doc = await everkm.post_detail(requestId, { path: post.path });
  if (!doc) throw pageNotFound("Post not found");

  const navFile = pageContext.qs?.nav_file as string | undefined;
  let navDoc: PostItem | null = null;
  let pageNav: BookPageData["pageNav"] = {};
  if (navFile) {
    try {
      navDoc =
        (await everkm.post_detail(requestId, {
          path: navFile,
          allow_missing: true,
        })) ?? null;
    } catch {
      navDoc = null;
    }
    pageNav = await everkm.nav_indicator(requestId, { from_file: navFile });
  }
  return { doc, navDoc, pageNav };
}

const BookPage: Component<BookPageProps> = (props) => {
  const pageContext = props.props;
  const requestId = pageContext.request_id;
  const { doc, navDoc, pageNav } = props.data;
  const stackLayout = isTruthyQuery(pageContext.qs?.stack);

  const configDefaultMissing = Symbol("configDefaultMissing");
  const configValue = (path: string, defaultValue: any = configDefaultMissing) => {
    if (defaultValue !== configDefaultMissing) {
      return everkm.config(requestId, { key: path, default: defaultValue });
    }
    return everkm.config(requestId, { key: path });
  };

  const baseUrl = everkm.base_url(requestId);

  const youlogPlatform = everkm.env(requestId, {
    name: "YOULOG_PLATFORM",
    default: "",
  });
  const versionsUrl = everkm.env(requestId, {
    name: "YOULOG_VERSIONS_URL",
    default: "",
  });
  const youlogVersion = everkm.env(requestId, {
    name: "YOULOG_VERSION",
    default: "",
  });

  const mainContent = (
    <div class="flex-1">
      <div class="container mx-auto px-4 py-8 print:p-0">
        <div class="flex flex-col lg:flex-row">
          <div
            data-ajax-element="article-frame"
            class={`w-full lg:w-3/4${doc?.meta?.hide_toc ? " lg:mx-auto" : ""}`}
          >
            <ArticleContent
              requestId={requestId}
              doc={doc}
              pageContext={pageContext}
              pageNav={pageNav}
              configValue={configValue}
              youlogPlatform={youlogPlatform}
              youlogVersion={youlogVersion}
              versionsUrl={versionsUrl}
            />
          </div>
          <TOC hidden={!!doc?.meta?.hide_toc} />
        </div>
      </div>
    </div>
  );

  const sidebar = (
    <Show when={navDoc}>
      {(nav) => (
        <Sidebar
          requestId={requestId}
          baseUrl={baseUrl}
          navDoc={nav()}
          configValue={configValue}
          belowHeader={stackLayout}
        />
      )}
    </Show>
  );

  const topHeader = (
    <TopHeader
      requestId={requestId}
      doc={doc}
      configValue={configValue}
      showNavToggle={!!navDoc}
      stack={stackLayout}
      baseUrl={baseUrl}
    />
  );

  const ajaxPageFingerprint = buildAjaxPageFingerprint({
    page: "book",
    stack: stackLayout,
    hasNav: !!navDoc,
    configValue,
  });
  const hasHeadings = !doc?.meta?.hide_toc;

  return (
    <div
      id="page-shell"
      data-ajax-layout={ajaxPageFingerprint}
      data-stack-layout={stackLayout ? "1" : "0"}
      data-has-headings={hasHeadings ? "1" : undefined}
      class={stackLayout ? "flex flex-col h-dvh" : "flex h-dvh"}
    >
      {stackLayout ? (
        <>
          {topHeader}
          <div class="flex flex-1 min-h-0">
            {sidebar}
            <div
              id="body-main"
              class="flex-1 flex flex-col overflow-auto print:overflow-visible min-h-0"
            >
              {mainContent}
            </div>
          </div>
        </>
      ) : (
        <>
          {sidebar}
          <div
            id="body-main"
            class="flex-1 flex flex-col overflow-auto print:overflow-visible min-h-0"
          >
            {topHeader}
            {mainContent}
          </div>
        </>
      )}

      <YoushaCommentScript configValue={configValue} />
    </div>
  );
};

export { BookPage };
