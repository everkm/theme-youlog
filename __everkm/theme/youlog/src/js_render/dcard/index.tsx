import { renderToStringAsync } from "solid-js/web";
import DcardList from "./list";
import DcardItems from "./items";

async function renderDcard(name: string, props: any) {
  let html = await renderToStringAsync(() => {
    switch (name) {
      case "list2":
        return <DcardList {...props} />;
      case "items":
        return <DcardItems {...props} />;
      default:
        throw new Error(`Dcard ${name} not found`);
    }
  });
  return html;
}

export { renderDcard };
