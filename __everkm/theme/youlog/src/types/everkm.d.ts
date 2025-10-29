/// <reference path="./context.d.ts" />
export {};

declare global {
  interface Everkm {
    assets(requestId: string, args?: { type: 'js' | 'css'; section: string; cdn?: string }): string;
    data(requestId: string, args?: {
      src: string;
      post?: boolean;
      cache_secs?: number;
      bearer?: string;
      format?: 'json' | 'yaml' | 'toml' | 'csv';
      json_payload?: Record<string, any>;
      csv_delimiter?: string;
    }): any;
    markdown_to_html(content: string): string;
    base_url(requestId: string, args?: { url?: string }): string;
    asset_base_url(requestId: string, args: { url?: string }): string;
    posts(requestId: string, args: FetchPostsArgs): PostItem[];
    posts_tag_list(requestId: string, args: FetchPostsArgs): Record<string, number>;
    posts_category_list(requestId: string, args: FetchPostsArgs): Record<string, number>;
    posts_directory_list(requestId: string, args: PostsDirectoryArgs): string[];
    post_meta(requestId: string, args: FetchPostArgs): PostItem;
    post_detail(requestId: string, args: FetchPostArgs): PostItem;
    has_post(requestId: string, args: { path: string }): boolean;
    nav_indicator(requestId: string, args: { from_file: string }): {
      prev?: NavIndicatorItem;
      next?: NavIndicatorItem;
    };
    nav_path(requestId: string, args: NavPathArgs): LinkItem[];
    media_remote(requestId: string, args: { url: string }): string;
    media_dimension(requestId: string, args: { file: string }): {
      width: number;
      height: number;
    };
    page_query(requestId: string, args: PageQueryArgs): any;
    config(requestId: string, args: ConfigArgs): any;
    has_config(requestId: string, args: { key: string }): boolean;
    media(requestId: string, args: { file: string }): string;
    env(requestId: string, args: { name: string, default?: any }): any;
  }

  interface FetchPostsArgs {
    dir?: string;
    tags?: string[];
    exclude_tags?: string[];
    categories?: string[];
    draft?: boolean;
    recursive?: boolean;
  }

  interface PostsDirectoryArgs extends FetchPostsArgs {
    prefix?: string;
    max_depth?: number;
  }

  interface FetchPostArgs {
    path: string;
    lazy_img?: boolean;
    exclude_tags?: string;
  }

  interface NavIndicatorItem {
    link: string;
    title: string;
  }

  interface NavPathArgs {
    from_file: string;
    merge?: LinkItem[];
  }

  interface LinkItem {
    title: string;
    url: string;
  }

  interface PageQueryArgs {
    [key: string]: boolean | number | string;
  }

  interface ConfigArgs {
    key?: string;
    default?: any;
  }

  var everkm: Everkm;
}
