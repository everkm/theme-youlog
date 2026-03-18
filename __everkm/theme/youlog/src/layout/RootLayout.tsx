import { Component, Show } from "solid-js";
import { Katex } from "youlog_lib/widgets/katex/ssr";
import { Prism } from "youlog_lib/widgets/prism/ssr";

const RootLayout: Component<{ context: PageContext; children?: any }> = (
  props,
) => {
  const ctx = props.context;
  const cfg = ctx.config || {};
  const baseUrl = everkm.base_url(ctx.request_id);
  const lang = ctx.lang || "";
  const siteName = (cfg.site?.name as string) || "";
  const postTitle = (ctx.post?.title as string) || "";
  const pageTitle = (postTitle ? `${postTitle} | ` : "") + siteName;
  const metaDesc = (ctx.post?.meta?.description as string) || "";
  const metaKeywords = (ctx.post?.meta?.keywords as string) || "";
  const themeColor = (cfg.theme_color as string) || undefined;
  const customCss = (cfg.custom_css as string) || undefined;

  const features = cfg.features || {};
  const hasCodeHighlight = features.code_highlight ?? true;
  const hasKatex = features.katex_formula ?? false;

  return (
    <html lang={lang} class="light">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title data-ajax-element="title">{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content={metaKeywords} />
        <meta
          name="generator"
          content={`everkm-publish@v${ctx.everkm_publish_version}`}
        />
        <meta name="theme" content={`${ctx.theme_name}@${ctx.theme_version}`} />
        <Show when={!!customCss}>
          <link
            rel="stylesheet"
            href={everkm.asset_base_url(ctx.request_id, {
              url: customCss!,
            })}
          />
        </Show>
        <Show when={!!themeColor}>
          <meta name="theme-color" content={themeColor} />
        </Show>
        <script
          innerHTML={`
          window.__everkm_lang = ${JSON.stringify(lang)}; 
          window.__everkm_base_url = ${JSON.stringify(baseUrl + "/")};
          window.__everkm_features_code_highlight = ${JSON.stringify(hasCodeHighlight)};
          window.__everkm_features_katex_formula = ${JSON.stringify(hasKatex)};
          `}
        ></script>
        <Show when={hasCodeHighlight}>
          <Prism />
        </Show>
        <Show when={hasKatex}>
          <Katex />
        </Show>
      </head>
      <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {props.children}
      </body>
    </html>
  );
};

export { RootLayout };
