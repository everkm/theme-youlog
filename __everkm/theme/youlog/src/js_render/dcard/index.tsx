import DcardList from "./list";

function renderDcard(name: string, props: any) {
  switch (name) {
    case "list2":
      return <DcardList {...props} />;
    default:
      throw new Error(`Dcard ${name} not found`);
  }
}

export { renderDcard };
