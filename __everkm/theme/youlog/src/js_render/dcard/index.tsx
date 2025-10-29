import { renderToStringAsync } from "solid-js/web";
import DcardList from "./list";

async function renderDcard(name: string, props: any) {
  let html = await renderToStringAsync(() => {
    switch (name) {
      case "list2":
        return <DcardList {...props} />;
      default:
        throw new Error(`Dcard ${name} not found`);
    }
  });
  return html;
}

export { renderDcard };
