/// <reference path="./context.d.ts" />
export {};

declare global {
  interface Everkm {
    assets(
      requestId: string,
      args: { type: "js" | "css"; section: string; cdn?: string },
    ): string;
    data(
      requestId: string,
      args: {
        src: string;
        post?: boolean;
        cache_secs?: number;
        bearer?: string;
        format?: "json" | "yaml" | "toml" | "csv";
        json_payload?: Record<string, any>;
        csv_delimiter?: string;
      },
    ): any;
    markdown_to_html(content: string): string;
    base_url(requestId: string, args?: { url?: string }): string;
    asset_base_url(requestId: string, args?: { url?: string }): string;
    posts(
      requestId: string,
      args?: FetchPostsArgs & { offset?: number; limit?: number },
    ): {
      items: PostItem[];
      total: number;
    };
    posts_tag_list(
      requestId: string,
      args?: FetchPostsArgs,
    ): Record<string, number>;
    posts_directory_list(
      requestId: string,
      args?: PostsDirectoryArgs,
    ): string[];
    post_meta(requestId: string, args: FetchPostArgs): PostItem | null;
    post_detail(requestId: string, args: FetchPostArgs): PostItem | null;
    post_neighbors(
      requestId: string,
      args: { id: string } & FetchPostsArgs,
    ): { prev_id: string | null; next_id: string | null };
    post_resources(
      requestId: string,
      args: { id?: string; path?: string; kinds?: ContentResourceKind[] },
    ): { items: ContentResource[]; total: number } | null;
    posts_resources(
      requestId: string,
      args?: FetchPostsArgs & {
        kinds?: ContentResourceKind[];
        offset?: number;
        limit?: number;
      },
    ): {
      items: Array<{ post: PostItem; resources: ContentResource[] }>;
      total: number;
    };
    has_post(requestId: string, args: { path: string }): boolean;
    nav_indicator(
      requestId: string,
      args: { from_file: string },
    ): {
      prev?: NavIndicatorItem;
      next?: NavIndicatorItem;
    };
    nav_path(requestId: string, args: NavPathArgs): LinkItem[];
    nav_tree(
      requestId: string,
      args: NavTreeArgs,
    ): {
      nodes: NavNode[];
      paths: LinkItem[];
    };
    media_remote(requestId: string, args: { url: string }): string;
    media_dimension(
      requestId: string,
      args: { file: string },
    ): {
      width: number;
      height: number;
    };
    page_query(requestId: string, args: PageQueryArgs): any;
    config(requestId: string, args: ConfigArgs): any;
    has_config(requestId: string, args: { key: string }): boolean;
    media(requestId: string, args: { file: string }): string;
    env(requestId: string, args: { name: string; default?: any }): any;
    lang(): string;
  }

  interface FetchPostsArgs {
    dir?: string;
    tags?: string[];
    exclude_tags?: string[];
    draft?: boolean;
    recursive?: boolean;
    include_myself?: boolean;
    /** 是否包含目录默认页（slug=index / index.md / 同名 foo/foo.md）；默认 false */
    include_dir_index?: boolean;
    order_by?: "created_at" | "updated_at" | "title" | "default";
    order_direction?: "asc" | "desc";
  }

  interface PostsDirectoryArgs extends FetchPostsArgs {
    prefix?: string;
    max_depth?: number;
  }

  interface FetchPostArgs {
    id?: string;
    /** logical path，或 `[[...]]` 内链（slug/标题/绝对路径；`[[./x]]` 须在当前文章页上下文） */
    path?: string;
    lazy_img?: boolean;
    exclude_tags?: string;
    /** 为 true 时：`[[...]]` 内链无法解析或文章不存在则返回 null/false；plain path 找不到时本就返回 null */
    allow_missing?: boolean;
  }

  interface NavIndicatorItem {
    link: string;
    title: string;
  }

  interface NavPathArgs {
    from_file: string;
    merge?: LinkItem[];
  }

  interface NavTreeArgs {
    from_file: string;
  }

  interface NavNode {
    text: string;
    link?: string;
    children?: NavNode[];
  }

  interface LinkItem {
    title: string;
    url: string;
  }

  interface PageQueryArgs {
    [key: string]: boolean | number | string;
  }

  interface ConfigArgs {
    key: string;
    default?: any;
  }

  type ContentResourceKind = "image" | "audio" | "video" | "other";

  interface ContentResource {
    kind: ContentResourceKind;
    src: string;
    via: "image" | "link";
    url: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    external?: boolean;
  }

  var everkm: Everkm;
}
