import { Component, Show } from "solid-js";
import { CloseIcon } from "../icons";

interface SidebarProps {
  requestId: string;
  baseUrl: string;
  navDoc: PostItem;
  configValue: (path: string, defaultValue?: any) => any;
}

const Sidebar: Component<SidebarProps> = (props) => {
  return (
    <aside
      id="sidebar-nav"
      class="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        fixed h-dvh lg:sticky top-0 z-50
        transform transition-transform duration-300 lg:translate-x-0 -translate-x-full
        flex flex-col"
    >
      {/* Site header */}
      <Show when={!props.configValue("layout.aisde_no_header", false)}>
        <div class="flex h-14 items-center justify-between px-2 md:px-4 bg-gray-50 dark:bg-gray-900 z-10">
          <a data-logo href={`${props.baseUrl}/`} class="flex items-center gap-2">
            <Show
              when={props.configValue("site.logo")}
              fallback={
                <span class="text-lg font-medium">
                  {props.configValue("site.name")}
                </span>
              }
            >
              <img
                src={everkm.asset_base_url(props.requestId, {
                  url: String(props.configValue("site.logo")),
                })}
                alt={String(props.configValue("site.name"))}
                class="h-7 w-auto"
              />
              <Show when={!props.configValue("layout.only_display_logo")}>
                <span class="text-lg font-medium">
                  {props.configValue("site.name")}
                </span>
              </Show>
            </Show>
          </a>
          <button
            data-drawer-close="sidebar-nav"
            class="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
          >
            <CloseIcon class="w-5 h-5" />
          </button>
        </div>
      </Show>

      {/* 导航菜单内容 */}
      <nav
        id="sidebar-nav-tree"
        class="flex-1 markdown-body !py-0 px-4 !bg-transparent nav-tree invisible overflow-y-auto"
        innerHTML={props.navDoc?.content_html || ""}
      ></nav>
    </aside>
  );
};

export default Sidebar;

