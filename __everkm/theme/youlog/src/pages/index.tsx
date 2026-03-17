import { renderToStringAsync } from "solid-js/web";
import { RootLayout } from "../layout/RootLayout";
import { BookPage } from "./book";

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
    props.request_id,
  )}/assets/alpinejs@3.14.9.js" defer></script>`;

  // 使用第一个 `</script>` 标签后面的内容替换为 CSS, 是为了避免 youlog css 覆盖 prism
  const withCss = html.replace(
    /<\/script>/i,
    `</script>${cssYoulog}${cssSearch}${alpine}`,
  );
  const withJs = withCss.replace(/<\/body>/i, `${jsYoulog}${jsSearch}</body>`);
  return `<!DOCTYPE html>${withJs}`;
}

export { renderPage };
