export {};

declare global {
    interface PageContext {
        config: Record<string, any>;
        host: string | null;
        env_is_preview: boolean;
        theme_version: string;
        theme_name: string;
        everkm_publish_version: string;
        page_path: string;
        page_path_base: string;
        lang: string;
        post: PostItem | null;
        breadcrumbs: BreadcrumbResolved[] | null;
        qs: Record<string, any>;
        tpl_path: string;
    }

    interface PostItem {
        id: string;
        title: string;
        meta: Record<string, any>;
        dir: string;
        path: string;
        url_path: string;
        slug: string;
        summary: string;
        date: number;
        update_at: number;
        draft: boolean;
        tags: string[];
        categories: string[];
        weight: number;
        template?: string | null;
    }

    interface BreadcrumbResolved {
        title: string;
        url: string;
        is_first: boolean;
        is_last: boolean;
    }

}