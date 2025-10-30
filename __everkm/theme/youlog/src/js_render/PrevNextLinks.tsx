import { Component, Show } from "solid-js";

interface PrevNextLinksProps {
  requestId: string;
  qs: Record<string, any>;
}

const PrevNextLinks: Component<PrevNextLinksProps> = (props) => {
  const prevPost = (() => {
    const id = props.qs?.prev;
    if (!id) return undefined;
    try {
      return everkm.post_detail(props.requestId, { id: String(id) });
    } catch (e) {
      return undefined;
    }
  })();

  const nextPost = (() => {
    const id = props.qs?.next;
    if (!id) return undefined;
    try {
      return everkm.post_detail(props.requestId, { id: String(id) });
    } catch (e) {
      return undefined;
    }
  })();

  return (
    <div class="mt-10 pt-8 border-t border-border dark:border-border space-y-2">
      <Show when={prevPost}>
        <div class="space-x-2">
          <span class="text-text-secondary dark:text-text-secondary">
            上一篇:
          </span>
          <a class="flex-1 block" href={prevPost?.url_path || prevPost?.path}>
            {prevPost?.title}
          </a>
        </div>
      </Show>

      <Show when={nextPost}>
        <div class="space-x-2">
          <span class="text-text-secondary dark:text-text-secondary">
            下一篇:
          </span>
          <a class="flex-1 block" href={nextPost?.url_path || nextPost?.path}>
            {nextPost?.title}
          </a>
        </div>
      </Show>
    </div>
  );
};

export default PrevNextLinks;
