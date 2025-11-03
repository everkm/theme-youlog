import { Component, For, Show } from "solid-js";
import {
  PrevArrowIcon,
  NextArrowIcon,
  NavigateNextIcon,
  NavigatePrevIcon,
} from "../icons";
import { formatDate } from "../utils";

interface DcardListProps {
  page_context: PageContext;
  dir?: string;
  include_subfolders?: boolean;
  exclude_tags?: string[];
  page_size?: number;
}

const DcardList: Component<DcardListProps> = (props) => {
  const ctx = props.page_context;
  const requestId = ctx.request_id;
  const qs = ctx.qs || {};
  const pageNo = (() => {
    const n = Number(qs.page ?? 1);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  })();
  const pageSize = props.page_size && props.page_size > 0 ? props.page_size : 6;

  // 共享查询条件
  const baseArgs = {
    dir: props.dir,
    recursive: props.include_subfolders ?? true,
    exclude_tags: props.exclude_tags,
  } as const;

  // 当前页偏移量
  const currentOffset = (pageNo - 1) * pageSize;

  const { items, total } = everkm.posts(requestId, {
    ...baseArgs,
    offset: currentOffset,
    limit: pageSize,
  });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pagePathBase = ctx.page_path_base;

  const pageUrl = (page: number) => {
    let qs = everkm.page_query(requestId, {
      page: "",
    });
    let url =
      page <= 1 ? `${pagePathBase}.html` : `${pagePathBase}.p${page}.html`;
    if (qs) {
      url += `?${qs}`;
    }
    return url;
  };

  // 构建某一条目的链接，包含 prev/next 查询参数
  const buildItemHref = (doc: PostItem): string => {
    const params: string[] = [];
    if (doc.prev_id) params.push(`prev=${encodeURIComponent(doc.prev_id)}`);
    if (doc.next_id) params.push(`next=${encodeURIComponent(doc.next_id)}`);
    if (params.length === 0) return doc.url_path;

    const sep = doc.url_path.includes("?") ? "&" : "?";
    return `${doc.url_path}${sep}${params.join("&")}`;
  };

  return (
    <>
      <ol>
        <For each={items}>
          {(doc) => (
            <li>
              <a href={buildItemHref(doc)} target="_blank">
                {doc.title}
              </a>
              <Show when={doc.weight > 0}>
                <span class="!text-red-500 mark-top"></span>
              </Show>
              <div class="text-gray-500 dark:text-gray-400 font-light text-[90%] number flex items-center gap-2">
                <span>{formatDate(doc.updated_at, "YYYY-MM-DD HH:mm")}</span>
                <Show when={doc.date !== doc.updated_at}>
                  <em class="text-gray-500 text-[90%]">updated</em>
                </Show>
              </div>
            </li>
          )}
        </For>
      </ol>

      <Show when={pageCount > 1}>
        <div class="space-x-6 flex !mt-10 text-normal items-center justify-center">
          <Show when={pageNo > 1}>
            <div class="flex items-center space-x-1">
              <a
                href={pageUrl(pageNo - 1)}
                class="flex items-center gap-0.5 p-1.5 rounded-md hover:bg-brand-primary-subtle dark:hover:bg-brand-primary-subtle-light transition-colors"
              >
                <NavigatePrevIcon />
              </a>
            </div>
          </Show>

          {/* 跳转分页 */}
          <div
            x-data={`{
              currentPage: ${pageNo},
              totalPages: ${pageCount},
              baseUrl: '${pagePathBase}',
              pageQuery: '${ctx.env_is_preview ? "" : ""}',
              goToPage() {
                const page = parseInt(this.currentPage);
                if (page >= 1 && page <= this.totalPages) {
                  let url;
                  if (page === 1) {
                    url = this.baseUrl + '.html';
                  } else {
                    url = this.baseUrl + '.p' + page + '.html';
                  }
                  window.dispatchEvent(new CustomEvent('page-navigate', { detail: { url } }));
                }
              }
            }`}
            x-init={`currentPage = ${pageNo}`}
          >
            <select
              x-model="currentPage"
              x-on:change="goToPage()"
              class="text-gray-600 text-sm rounded pl-1 py-1 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {/* 渲染选项列表 */}
              <For each={Array.from({ length: pageCount }, (_, i) => i + 1)}>
                {(p) => (
                  <option
                    value={p}
                    selected={p === pageNo}
                  >{`${p} / ${pageCount}`}</option>
                )}
              </For>
            </select>
          </div>

          <Show when={total > pageSize * pageNo}>
            <div class="flex items-center space-x-1">
              <a
                href={pageUrl(pageNo + 1)}
                class="flex items-center gap-0.5 p-1.5 rounded-md hover:bg-brand-primary-subtle dark:hover:bg-brand-primary-subtle-light transition-colors"
              >
                <NavigateNextIcon />
              </a>
            </div>
          </Show>
        </div>
      </Show>
    </>
  );
};

export default DcardList;
