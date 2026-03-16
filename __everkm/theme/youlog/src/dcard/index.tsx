import { renderToStringAsync } from "solid-js/web";
import { DcardList, DcardItems } from "youlog_lib/dcard";

export async function renderDcard(name: string, props: any) {
  const html = await renderToStringAsync(() => {
    switch (name) {
      case "list2":
        return <DcardList page_context={props.page_context} {...props} />;
      case "items":
        return <DcardItems page_context={props.page_context} {...props} />;
      default:
        throw new Error(`Dcard ${name} not found`);
    }
  });
  return html;
}
