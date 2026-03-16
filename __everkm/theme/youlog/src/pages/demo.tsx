import { Component } from "solid-js";

interface DemoPageProps {
  props: PageContext;
}

const DemoPage: Component<DemoPageProps> = (props) => {
  const pageContext = props.props;
  const requestId = pageContext.request_id;

  const doc = (() => {
    const post = pageContext.post;
    if (!post) throw new Error("Post not found");
    const doc = everkm.post_detail(requestId, {
      path: post.path,
    });
    if (!doc) throw new Error("Post not found");
    return doc;
  })();

  return (
    <article
      id="article-main"
      data-ajax-element="article-main"
      class="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none markdown-body !pt-0"
    >
      <h1
        id="article-title"
        data-ajax-element="article-title"
        class="text-[1.8em] font-bold text-gray-900 dark:text-white text-center mb-4 !mt-0"
      >
        {doc?.title || "无标题"}
      </h1>
      <div innerHTML={doc?.content_html || ""} />
    </article>
  );
};

export { DemoPage };
