import { Component, Show } from "solid-js";
import { MenuIcon, SettingsIcon } from "../icons";
import NavTree from "./NavTree";

interface TopHeaderProps {
  requestId: string;
  doc: PostItem;
  configValue: (path: string, defaultValue?: any) => any;
}

const TopHeader: Component<TopHeaderProps> = (props) => {
  return (
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 print:hidden">
      <div class="flex h-14 items-center justify-between px-2 md:px-4">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <button
            data-drawer-toggle="sidebar-nav"
            class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
          >
            <MenuIcon class="w-5 h-5" />
          </button>
          <div class="flex-1 min-w-0">
            <h1
              data-app-name
              class="text-lg font-semibold text-gray-900 dark:text-white truncate hidden-repeat-site-name"
            >
              {props.configValue("site.name")}
            </h1>
            <h1
              data-article-title-bar
              data-ajax-element="article-title-bar"
              class="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hidden"
            >
              {props.doc?.title || "无标题"}
            </h1>
          </div>
        </div>

        <div class="flex items-center space-x-4 flex-shrink-0">
          <Show when={props.configValue("algolia_search")}>
            <x-in-search
              app-id={props.configValue("algolia_search.app_id")}
              api-key={props.configValue("algolia_search.api_key")}
              index={props.configValue("algolia_search.index_name")}
              site={props.configValue("algolia_search.site")}
              only-button="false"
            ></x-in-search>
          </Show>

          <Show when={props.configValue("header_nav")}>
            <div id="mobile-menu-container" class="md:hidden"></div>
          </Show>

          <Show when={props.configValue("header_nav")}>
            <nav class="hidden md:block invisible" id="header-nav">
              <NavTree
                items={props.configValue("header_nav", [])}
                requestId={props.requestId}
              />
            </nav>
          </Show>

          <button
            onClick={() => (window as any).openThemeSetting()}
            class="p-1.5 text-text-secondary dark:text-text-secondary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <SettingsIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
