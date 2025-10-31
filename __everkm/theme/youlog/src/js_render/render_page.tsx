import { renderToStringAsync } from "solid-js/web";
import { Component, For, Show } from "solid-js";
import RootLayout from "./layout";
import {
  HomeIcon,
  ChevronRightIcon,
  MenuIcon,
  CloseIcon,
  NextArrowIcon,
  PrevArrowIcon,
  SettingsIcon,
  LightningIcon,
} from "./icons";
import { formatDate, getConfigValue } from "./utils";
import PrevNextLinks from "./PrevNextLinks";

interface NavItem {
  title: string;
  url?: string;
  new_window?: boolean;
  children?: NavItem[];
}

const NavTree: Component<{ items: NavItem[]; requestId: string }> = (props) => {
  return (
    <ul>
      <For each={props.items}>
        {(item) => (
          <li>
            <a
              href={item.url || everkm.base_url(props.requestId, { url: "/" })}
              target={item.new_window !== false ? "_blank" : undefined}
            >
              {item.title}
            </a>
            <Show when={item.children}>
              <NavTree items={item.children!} requestId={props.requestId} />
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
};

interface BreadcrumbProps {
  navs: BreadcrumbResolved[];
}

const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  return (
    <div
      id="breadcrumb"
      data-ajax-element="breadcrumb"
      class="text-text-tertiary dark:text-text-tertiary text-[0.95em] mx-auto flex items-center flex-wrap relative -top-5"
    >
      <For each={props.navs}>
        {(nav) => (
          <>
            <Show when={!nav.is_first}>
              <ChevronRightIcon />
            </Show>
            {!nav.is_last ? (
              <a
                class="text-text-primary dark:text-text-primary hover:text-brand-primary dark:hover:text-brand-primary-light transition-colors inline-flex items-center"
                href={nav.url || "javascript:void(0)"}
              >
                {nav.is_first ? (
                  <HomeIcon />
                ) : (
                  <span data-nav-title>{nav.title}</span>
                )}
              </a>
            ) : (
              <>
                {nav.is_first ? (
                  <HomeIcon />
                ) : (
                  <span data-nav-title>{nav.title}</span>
                )}
              </>
            )}
          </>
        )}
      </For>
    </div>
  );
};

interface BookPageProps {
  props: PageContext;
}

const BookPage: Component<BookPageProps> = (props) => {
  const pageContext = props.props;
  const requestId = pageContext.request_id;

  // 获取文档详情
  const doc = (() => {
    const post = pageContext.post;
    if (!post) return null;
    return everkm.post_detail(requestId, {
      path: post.path,
    });
  })();

  // 获取 summary 文件路径
  const summaryFile = (() => {
    const qs = pageContext.qs;
    return qs?.summary || "/_SUMMARY.md";
  })();

  // 获取导航文档（用于首屏渲染导航 HTML）
  const navDoc = (() => {
    const path = summaryFile;
    if (!path) return null;
    return everkm.post_detail(requestId, { path });
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
      <aside
        id="sidebar-nav"
        class="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          fixed h-dvh lg:sticky top-0 z-50
          transform transition-transform duration-300 lg:translate-x-0 -translate-x-full
          flex flex-col"
      >
        {/* Site header */}
        <Show when={!configValue("layout.aisde_no_header", false)}>
          <div class="flex h-14 items-center justify-between px-2 md:px-4 bg-gray-50 dark:bg-gray-900 z-10">
            <a data-logo href={`${baseUrl}/`} class="flex items-center gap-2">
              <Show
                when={configValue("site.logo")}
                fallback={
                  <span class="text-lg font-medium">
                    {configValue("site.name")}
                  </span>
                }
              >
                <img
                  src={everkm.asset_base_url(requestId, {
                    url: String(configValue("site.logo")),
                  })}
                  alt={String(configValue("site.name"))}
                  class="h-7 w-auto"
                />
                <Show when={!configValue("layout.only_display_logo")}>
                  <span class="text-lg font-medium">
                    {configValue("site.name")}
                  </span>
                </Show>
              </Show>
            </a>
            <button
              data-drawer-close="sidebar-nav"
              class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            >
              <CloseIcon class="w-5 h-5" />
            </button>
          </div>
        </Show>

        {/* 导航菜单内容 */}
        <nav
          id="sidebar-nav-tree"
          class="flex-1 markdown-body !py-0 px-4 !bg-transparent nav-tree invisible overflow-y-auto"
          innerHTML={navDoc?.content_html || ""}
        ></nav>
      </aside>

      {/* 右侧内容区 */}
      <div id="body-main" class="flex-1 flex flex-col overflow-auto">
        {/* 顶部导航 */}
        <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div class="flex h-14 items-center justify-between px-2 md:px-4">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <button
                data-drawer-toggle="sidebar-nav"
                class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <MenuIcon class="w-5 h-5" />
              </button>
              <div class="flex-1 min-w-0">
                <h1
                  data-app-name
                  class="text-lg font-semibold text-gray-900 dark:text-white truncate hidden-repeat-site-name"
                >
                  {configValue("site.name")}
                </h1>
                <h1
                  data-article-title-bar
                  data-ajax-element="article-title-bar"
                  class="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hidden"
                >
                  {doc?.title || "无标题"}
                </h1>
              </div>
            </div>

            <div class="flex items-center space-x-4 flex-shrink-0">
              <Show when={configValue("algolia_search")}>
                <x-in-search
                  app-id={configValue("algolia_search.app_id")}
                  api-key={configValue("algolia_search.api_key")}
                  index={configValue("algolia_search.index_name")}
                  site={configValue("algolia_search.site")}
                  only-button="false"
                ></x-in-search>
              </Show>

              <Show when={configValue("header_nav")}>
                <div id="mobile-menu-container" class="md:hidden"></div>
              </Show>

              <Show when={configValue("header_nav")}>
                <nav class="hidden md:block invisible" id="header-nav">
                  <NavTree
                    items={configValue("header_nav", [])}
                    requestId={requestId}
                  />
                </nav>
              </Show>

              <button
                onClick={() => (window as any).openThemeSetting()}
                class="p-1.5 text-text-secondary dark:text-text-secondary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <SettingsIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <div class="flex-1">
          <div class="container mx-auto px-4 py-8">
            <div class="flex flex-col lg:flex-row">
              {/* 左侧：正文内容 */}
              <div class="w-full lg:w-3/4 pr-0 lg:pl-4 lg:pr-8 leading-relaxed relative">
                <Breadcrumb navs={pageContext.breadcrumbs || []} />

                <h1
                  id="article-title"
                  data-ajax-element="article-title"
                  class="text-4xl font-bold text-gray-900 dark:text-white text-center mb-4 !mt-0"
                >
                  {doc?.title || "无标题"}
                </h1>

                <div data-ajax-element="doc-meta" class="">
                  <Show when={!doc?.meta?.hide_meta}>
                    <div class="doc-meta">
                      <span data-doc-update-at={doc?.updated_at?.toString()}>
                        更新于{formatDate(doc?.updated_at)}
                      </span>
                      <Show when={doc?.meta?.uno}>
                        <span data-doc-meta-uno={doc?.meta?.uno}>
                          <a href={`/${doc?.meta?.uno}`} target="_blank">
                            地址编号: {doc?.meta?.uno}
                          </a>
                        </span>
                      </Show>
                    </div>
                    {/* 下边距填充 */}
                    <div class="h-2 w-full"></div>
                  </Show>
                </div>

                <article
                  id="article-main"
                  data-ajax-element="article-main"
                  class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none markdown-body !pt-0"
                >
                  <div innerHTML={doc?.content_html || ""} />
                  <PrevNextLinks
                    requestId={requestId}
                    qs={pageContext.qs || {}}
                  />
                </article>

                <Show when={configValue("yousha")}>
                  <yousha-comment
                    community={configValue("yousha.community")}
                  ></yousha-comment>
                </Show>

                {/* 分页导航（基于目录的上一页/下一页）*/}
                <div id="page-indicator" data-ajax-element="page-indicator">
                  <Show when={pageNav.next || pageNav.prev}>
                    <div class="mt-10 pt-8 border-t border-border dark:border-border space-y-4 md:flex md:flex-row-reverse md:items-center md:space-y-0 md:gap-8">
                      <Show when={pageNav.next}>
                        <a class="flex-1 block" href={pageNav.next?.link}>
                          <div class="border border-border dark:border-border rounded p-4 flex flex-col items-end hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors">
                            <div class="flex text-text-tertiary dark:text-text-tertiary mb-2 items-center flex-row-reverse">
                              <NextArrowIcon class="inline-block" />
                            </div>
                            <span class="text-lg font-medium text-text-primary dark:text-text-primary">
                              {pageNav.next?.title}
                            </span>
                          </div>
                        </a>
                      </Show>

                      <Show when={pageNav.prev}>
                        <a class="flex-1 block" href={pageNav.prev?.link}>
                          <div class="border border-border dark:border-border rounded p-4 flex flex-col items-start hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors">
                            <div class="flex text-text-tertiary dark:text-text-tertiary mb-2 items-center">
                              <PrevArrowIcon class="inline-block" />
                            </div>
                            <span class="text-lg font-medium text-text-primary dark:text-text-primary">
                              {pageNav.prev?.title}
                            </span>
                          </div>
                        </a>
                      </Show>
                    </div>
                  </Show>
                </div>

                {/* bottom */}
                <div class="mt-10 pt-8 flex flex-col items-center justify-center gap-2">
                  {/* bottom nav */}
                  <div class="flex items-center flex-wrap justify-center gap-2 text-sm text-text-secondary dark:text-text-secondary">
                    <For each={configValue("bottom_nav", []) as NavItem[]}>
                      {(item, index) => (
                        <>
                          <a
                            href={item.url}
                            target={
                              item.new_window !== false ? "_blank" : undefined
                            }
                            class="hover:text-text-secondary hover:underline dark:hover:text-text-secondary transition-colors"
                          >
                            {item.title}
                          </a>
                          {index() <
                            configValue("bottom_nav", []).length - 1 && (
                            <span class="text-text-quaternary dark:text-text-quaternary">
                              |
                            </span>
                          )}
                        </>
                      )}
                    </For>
                  </div>

                  {/* youlog platform */}
                  <div class="text-text-tertiary dark:text-text-tertiary text-sm text-center flex flex-wrap justify-center items-center">
                    <Show when={youlogPlatform}>
                      <span>
                        <a
                          href={youlogPlatform}
                          target="_blank"
                          class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
                        >
                          Youlog
                        </a>
                        <span class="mx-2 text-text-quaternary dark:text-text-quaternary">
                          |
                        </span>
                      </span>
                    </Show>

                    <Show when={youlogVersion}>
                      <span>
                        <youlog-version
                          class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors cursor-pointer"
                          {...{ "version-list-url": versionsUrl }}
                          version={youlogVersion}
                        ></youlog-version>
                      </span>
                    </Show>
                  </div>

                  {/* copy right and beian */}
                  <div class="text-text-tertiary dark:text-text-tertiary text-sm text-center flex flex-wrap justify-center items-center gap-4">
                    <Show when={configValue("copyright")}>
                      <span>
                        {configValue("copyright.from_year")
                          ? `©${configValue(
                              "copyright.from_year"
                            )}-${new Date().getFullYear()}`
                          : `©${new Date().getFullYear()}`}{" "}
                        <Show when={configValue("copyright.text")}>
                          <Show
                            when={configValue("copyright.link")}
                            fallback={configValue("copyright.text")}
                          >
                            <a
                              href={configValue("copyright.link")}
                              target="_blank"
                              class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
                            >
                              {configValue("copyright.text")}
                            </a>
                          </Show>
                        </Show>
                      </span>
                    </Show>

                    <Show
                      when={
                        configValue("beian") && configValue("beian").length > 0
                      }
                    >
                      <span>
                        <For each={configValue("beian", []) as any[]}>
                          {(beian: any, index) => (
                            <>
                              <a
                                href={beian.link}
                                target="_blank"
                                class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
                              >
                                {beian.text}
                              </a>
                              {index() <
                                configValue("beian", []).length - 1 && (
                                <span class="mx-2 text-text-quaternary dark:text-text-quaternary">
                                  |
                                </span>
                              )}
                            </>
                          )}
                        </For>
                      </span>
                    </Show>

                    <span class="flex items-center">
                      <LightningIcon class="w-4 h-4 inline-block" />
                      <a
                        href="https://youlog.theme.everkm.com"
                        target="_blank"
                        title={`Powered by everkm-publish@v${pageContext.everkm_publish_version} with theme youlog@v${pageContext.theme_version}`}
                        class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
                      >
                        Youlog
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              {/* 右侧：TOC目录 */}
              <div class="w-full lg:w-1/4 mt-8 lg:mt-0">
                <div id="toc" class="mb-6 text-[0.9em]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
