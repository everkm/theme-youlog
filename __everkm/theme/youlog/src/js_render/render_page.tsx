import { renderToStringAsync } from "solid-js/web";
import { Component, Show } from "solid-js";
import RootLayout from "./layout";
import { getConfigValue } from "./utils";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import ArticleContent from "./components/ArticleContent";
import TOC from "./components/TOC";
import { YoushaCommentScript } from "./components/YoushaComment";

interface BookPageProps {
  props: PageContext;
}

const BookPage: Component<BookPageProps> = (props) => {
  const pageContext = props.props;
  const requestId = pageContext.request_id;

  // 获取文档详情
  const doc = (() => {
    const post = pageContext.post;
    if (!post) throw new Error("Post not found");
    const doc = everkm.post_detail(requestId, {
      path: post.path,
    });
    if (!doc) throw new Error("Post not found");
    return doc;
  })();

  // 获取 summary 文件路径
  const summaryFile = (() => {
    const qs = pageContext.qs;
    return qs?.summary || "/_SUMMARY.md";
  })();

  // 获取导航文档（用于首屏渲染导航 HTML）
  const navDoc = (() => {
    const path = summaryFile;
    if (!path) throw new Error("Summary file not found");
    const doc = everkm.post_detail(requestId, { path });
    if (!doc) throw new Error("Post not found");
    return doc;
  })();

  // 获取导航指示器
  const pageNav = everkm.nav_indicator(requestId, {
    from_file: summaryFile,
  });

  // 获取配置项
  const config = pageContext.config;
  const configValue = (path: string, defaultValue: any = undefined) => {
    return getConfigValue(config, path, defaultValue);
  };

  // 获取 base URL
  const baseUrl = everkm.base_url(requestId);

  // Youlog 相关环境变量
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

  return (
    <div class="flex h-dvh">
      {/* 导航侧边栏 */}
      <Sidebar
        requestId={requestId}
        baseUrl={baseUrl}
        navDoc={navDoc}
        configValue={configValue}
      />

      {/* 右侧内容区 */}
      <div id="body-main" class="flex-1 flex flex-col overflow-auto">
        {/* 顶部导航 */}
        <TopHeader requestId={requestId} doc={doc} configValue={configValue} />

        {/* 主内容区 */}
        <div class="flex-1">
          <div class="container mx-auto px-4 py-8">
            <div class="flex flex-col lg:flex-row">
              {/* 左侧：正文内容 */}
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

              {/* 右侧：TOC目录 */}
              <TOC />
            </div>
          </div>
        </div>
      </div>

      {/* yousha-comment script */}
      <YoushaCommentScript configValue={configValue} />
    </div>
  );
};

async function renderPage(compName: string, props: any) {
  const html = await renderToStringAsync(() => {
    switch (compName) {
      case "book":
        return (
          <RootLayout context={props}>
            <BookPage props={props} />
          </RootLayout>
        );
      default:
        throw new Error(`Page ${compName} not found`);
    }
  });
  // 在 SSR 阶段直接注入 CSS 与 JS
  const cssYoulog =
    everkm.assets(props.request_id, { type: "css", section: "youlog" }) || "";
  const cssSearch =
    everkm.assets(props.request_id, {
      type: "css",
      section: "plugin-in-search",
    }) || "";
  const jsYoulog =
    everkm.assets(props.request_id, { type: "js", section: "youlog" }) || "";
  const jsSearch =
    everkm.assets(props.request_id, {
      type: "js",
      section: "plugin-in-search",
    }) || "";
  const alpine = `<script src="${everkm.asset_base_url(
    props.request_id
  )}/assets/alpinejs@3.14.9.js" defer></script>`;

  const withCss = html.replace(
    /<\/head>/i,
    `${cssYoulog}${cssSearch}${alpine}</head>`
  );
  const withJs = withCss.replace(/<\/body>/i, `${jsYoulog}${jsSearch}</body>`);
  return `<!DOCTYPE html>${withJs}`;
}

export { renderPage };
