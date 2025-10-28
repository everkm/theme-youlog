/// <reference path="./context.d.ts" />
export {};

declare global {
  interface Everkm {
    assets(args: { type: 'js' | 'css'; section: string; cdn?: string }): string;
    data(args: {
      src: string;
      post?: boolean;
      cache_secs?: number;
      bearer?: string;
      format?: 'json' | 'yaml' | 'toml' | 'csv';
      json_payload?: Record<string, any>;
      csv_delimiter?: string;
    }): any;
    markdown_to_html(content: string): string;
    base_url(args?: { url?: string }): string;
    asset_base_url(args: { url?: string }): string;
    posts(args: FetchPostsArgs): PostItem[];
    posts_tag_list(args: FetchPostsArgs): Record<string, number>;
    posts_category_list(args: FetchPostsArgs): Record<string, number>;
    posts_directory_list(args: PostsDirectoryArgs): string[];
    post_meta(args: FetchPostArgs): PostItem;
    post_detail(args: FetchPostArgs): PostItem;
    has_post(args: { path: string }): boolean;
    nav_indicator(args: { from_file: string, __page_path: string }): {
      prev?: NavIndicatorItem;
      next?: NavIndicatorItem;
    };
    nav_path(args: NavPathArgs): LinkItem[];
    media_remote(args: { url: string }): string;
    media_dimension(args: { file: string }): {
      width: number;
      height: number;
    };
    page_query(args: PageQueryArgs): any;
    config(args: ConfigArgs): any;
    has_config(args: { key: string }): boolean;
    media(args: { file: string }): string;
    env(args: { name: string, default?: any }): any;
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
