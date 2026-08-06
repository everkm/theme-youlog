import { Component, For } from "solid-js";

type DcardItemsProps = FetchPostsArgs & {
  page_context: PageContext;
  limit?: number;
  /** 最大列数；按容器宽度自动减少列数，超长标题单行省略 */
  cols?: number | string;
};

const COL_GAP = "1.5em";
const ROW_GAP = "0.5em";
/** 单列最小宽度：容器不够放下更多列时自动降列 */
const COL_MIN = "8em";

function normalizeCols(cols: number | string | undefined): number | undefined {
  if (cols === undefined || cols === null || cols === "") return undefined;
  const n = typeof cols === "number" ? cols : Number(cols);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.floor(n);
}

const DcardItems: Component<DcardItemsProps> = (props) => {
  const ctx = props.page_context;
  const requestId = ctx.request_id;

  const { items } = everkm.posts(requestId, {
    dir: props.dir,
    recursive: props.recursive ?? true,
    tags: props.tags,
    exclude_tags: props.exclude_tags,
    categories: props.categories,
    include_myself: props.include_myself,
    include_dir_index: props.include_dir_index,
    limit: props.limit && props.limit > 0 ? Math.floor(props.limit) : undefined,
    order_by: props.order_by,
    order_direction: props.order_direction,
  });

  const cols = normalizeCols(props.cols);

  // 宽时最多 cols 列；窄时按 COL_MIN 自动降列（相对列表容器宽度，非视口）
  const gridTemplateColumns = cols
    ? `repeat(auto-fit, minmax(min(100%, max(${COL_MIN}, calc((100% - (${cols} - 1) * ${COL_GAP}) / ${cols}))), 1fr))`
    : undefined;

  return (
    <ul
      class={cols ? "dcard-items-grid" : undefined}
      style={
        cols
          ? {
              display: "grid",
              "grid-template-columns": gridTemplateColumns,
              gap: `${ROW_GAP} ${COL_GAP}`,
            }
          : undefined
      }
    >
      <For each={items}>
        {(doc) => (
          <li class={cols ? "min-w-0 !mb-0" : undefined}>
            <a
              href={doc.url_path}
              class={cols ? "block truncate" : undefined}
              title={cols ? doc.title : undefined}
            >
              {doc.title}
            </a>
          </li>
        )}
      </For>
    </ul>
  );
};

export default DcardItems;
