import { Component, For, Show } from "solid-js";

export interface NavItem {
  title: string;
  url?: string;
  new_window?: boolean;
  children?: NavItem[];
  [key: string]: unknown;
}

interface NavMenuProps {
  items: NavItem[];
  requestId: string;
  defaultNewWindow?: boolean;
  withContext?: boolean;
}

const NavMenuInner: Component<NavMenuProps> = (props) => (
  <ul>
    <For each={props.items}>
      {(item) => (
        <li>
          <a
            href={item.url || "#"}
            target={
              (item.new_window ?? props.defaultNewWindow) !== false
                ? "_blank"
                : undefined
            }
            data-nav-menu-context={
              props.withContext
                ? JSON.stringify({ ...item, children: undefined })
                : undefined
            }
          >
            {item.title}
          </a>
          <Show when={item.children}>
            <NavMenuInner
              items={item.children!}
              requestId={props.requestId}
              defaultNewWindow={props.defaultNewWindow}
              withContext={props.withContext}
            />
          </Show>
        </li>
      )}
    </For>
  </ul>
);

const NavMenu: Component<NavMenuProps> = (props) => (
  <div data-role="nav-menu">
    <NavMenuInner {...props} />
  </div>
);

export default NavMenu;
