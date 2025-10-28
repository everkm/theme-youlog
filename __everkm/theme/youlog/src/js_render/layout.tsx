import { Component, Show } from "solid-js";

const RootLayout: Component<{ context: PageContext; children?: any }> = (
  props
) => {
  const ctx = () => props.context;
  const cfg = () => ctx().config || {};
  const baseUrl = () => everkm.base_url({});
  const assetBase = () => everkm.asset_base_url({});
  const lang = () => ctx().lang || "";
  const siteName = () => (cfg().site?.name as string) || "";
  const postTitle = () => (ctx().post?.title as string) || "";
  const pageTitle = () => (postTitle() ? `${postTitle()} | ` : "") + siteName();
  const metaDesc = () => (ctx().post?.meta?.description as string) || "";
  const metaKeywords = () => (ctx().post?.meta?.keywords as string) || "";
  const themeColor = () => (cfg().theme_color as string) || undefined;
  const customCss = () => (cfg().custom_css as string) || undefined;

  return (
    <html lang={lang()} class="light">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title data-ajax-element="title">{pageTitle()}</title>
        <meta name="description" content={metaDesc()} />
        <meta name="keywords" content={metaKeywords()} />
        <meta
          name="generator"
          content={`everkm-publish@v${ctx().everkm_publish_version}`}
        />
        <meta
          name="theme"
          content={`${ctx().theme_name}@${ctx().theme_version}`}
        />
        <Show when={!!customCss()}>
          <link
            rel="stylesheet"
            href={everkm.asset_base_url({ url: customCss()! })}
          />
        </Show>
        <Show when={!!themeColor()}>
          <meta name="theme-color" content={themeColor()} />
        </Show>
        <script
          innerHTML={`window.__everkm_lang = ${JSON.stringify(
            lang()
          )}; window.__everkm_base_url = ${JSON.stringify(baseUrl() + "/")};`}
        />
      </head>
      <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {props.children}
      </body>
    </html>
  );
};

export default RootLayout;
