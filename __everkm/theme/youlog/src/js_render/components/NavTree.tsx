import { Component, For, Show } from "solid-js";

interface NavItem {
  title: string;
  url?: string;
  new_window?: boolean;
  children?: NavItem[];
}

interface NavTreeProps {
  items: NavItem[];
  requestId: string;
}

const NavTree: Component<NavTreeProps> = (props) => {
  return (
    <ul>
      <For each={props.items}>
        {(item) => (
          <li>
            <a
              href={item.url || everkm.base_url(props.requestId, { url: "/" })}
              target={item.new_window !== false ? "_blank" : undefined}
            >
              {item.title}
            </a>
            <Show when={item.children}>
              <NavTree items={item.children!} requestId={props.requestId} />
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
};

export default NavTree;

