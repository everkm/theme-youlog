import { Component, Show } from "solid-js";

interface PrevNextLinksProps {
  requestId: string;
  qs: Record<string, any>;
}

const PrevNextLinks: Component<PrevNextLinksProps> = (props) => {
  // 只需 url_path / path / title（均在 PostView 元数据里）；用 post_meta，避免 3× 全量 md→HTML。
  // 见 everkm-publish stuff/km/260922-Plan-渲染调度死锁根治.md §4.3
  const prevPost = (() => {
    const id = props.qs?.prev;
    if (!id) return undefined;
    try {
      return everkm.post_meta(props.requestId, { id: String(id) });
    } catch (e) {
      return undefined;
    }
  })();

  const nextPost = (() => {
    const id = props.qs?.next;
    if (!id) return undefined;
    try {
      return everkm.post_meta(props.requestId, { id: String(id) });
    } catch (e) {
      return undefined;
    }
  })();

  return (
    <Show when={prevPost || nextPost}>
      <div class="mt-10 pt-8 border-t border-border dark:border-border space-y-2 print:hidden">
        <Show when={prevPost}>
          <div class="gap-2 flex items-center">
            <span class="text-text-secondary dark:text-text-secondary">
              上一篇:
            </span>
            <a class="hover:text-[--link-hover]" href={prevPost?.url_path || prevPost?.path}>
              {prevPost?.title}
            </a>
          </div>
        </Show>

        <Show when={nextPost}>
          <div class="gap-2 flex items-center">
            <span class="text-text-secondary dark:text-text-secondary">
              下一篇:
            </span>
            <a class="hover:text-[--link-hover]" href={nextPost?.url_path || nextPost?.path}>
              {nextPost?.title}
            </a>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default PrevNextLinks;
