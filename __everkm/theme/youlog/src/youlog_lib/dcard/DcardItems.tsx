import { Component, For, Show } from "solid-js";

type DcardItemsProps = FetchPostsArgs & {
  page_context: PageContext;
  limit?: number;
  /** 最大列数；按容器宽度自动减少列数，超长标题单行省略 */
  cols?: number | string;
  /** Obsidian Wikilink，解析成功后追加为列表最后一项，如 `[[archives|查看全部]]` */
  more?: string;
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

/** 解析 `[[target]]` / `[[target|alias]]`；非法则返回 null */
function parseWikilink(
  raw: string | undefined,
): { target: string; alias?: string } | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const m = s.match(/^\[\[(.+)\]\]$/);
  if (!m) return null;
  const inner = m[1].trim();
  if (!inner) return null;
  const pipe = inner.indexOf("|");
  if (pipe < 0) {
    const target = inner.replace(/#.*$/, "").trim();
    return target ? { target } : null;
  }
  const target = inner.slice(0, pipe).replace(/#.*$/, "").trim();
  const alias = inner.slice(pipe + 1).trim();
  if (!target) return null;
  return alias ? { target, alias } : { target };
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

  const moreItem = (() => {
    const parsed = parseWikilink(props.more);
    if (!parsed) return null;
    try {
      const doc = everkm.post_meta(requestId, {
        path: `[[${parsed.target}]]`,
        allow_missing: true,
      });
      if (!doc) return null;
      return {
        url: doc.url_path,
        title: parsed.alias || doc.title,
      };
    } catch {
      return null;
    }
  })();

  // 宽时最多 cols 列；窄时按 COL_MIN 自动降列（相对列表容器宽度，非视口）
  const gridTemplateColumns = cols
    ? `repeat(auto-fit, minmax(min(100%, max(${COL_MIN}, calc((100% - (${cols} - 1) * ${COL_GAP}) / ${cols}))), 1fr))`
    : undefined;

  const itemClass = cols ? "min-w-0 !mb-0" : undefined;
  const linkClass = cols ? "block truncate" : undefined;

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
          <li class={itemClass}>
            <a
              href={doc.url_path}
              class={linkClass}
              title={cols ? doc.title : undefined}
            >
              {doc.title}
            </a>
          </li>
        )}
      </For>
      <Show when={moreItem}>
        <li class={itemClass}>
          <a
            href={moreItem!.url}
            class={linkClass}
            title={cols ? moreItem!.title : undefined}
          >
            {moreItem!.title}
          </a>
        </li>
      </Show>
    </ul>
  );
};

export default DcardItems;
