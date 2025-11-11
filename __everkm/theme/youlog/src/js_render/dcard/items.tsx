import { Component, For } from "solid-js";

type DcardItemsProps = FetchPostsArgs & {
  page_context: PageContext;
  limit?: number;
};

const DcardItems: Component<DcardItemsProps> = (props) => {
  const ctx = props.page_context;
  const requestId = ctx.request_id;

  const params = {
    dir: props.dir,
    recursive: props.recursive ?? true,
    tags: props.tags,
    exclude_tags: props.exclude_tags,
    categories: props.categories,
    limit: props.limit && props.limit > 0 ? Math.floor(props.limit) : undefined,
  };
  console.log(params);

  const { items } = everkm.posts(requestId, {
    dir: props.dir,
    recursive: props.recursive ?? true,
    tags: props.tags,
    exclude_tags: props.exclude_tags,
    categories: props.categories,
    limit: props.limit && props.limit > 0 ? Math.floor(props.limit) : undefined,
  });

  return (
    <ul>
      <For each={items}>
        {(doc) => (
          <li>
            <a href={doc.url_path}>{doc.title}</a>
          </li>
        )}
      </For>
    </ul>
  );
};

export default DcardItems;