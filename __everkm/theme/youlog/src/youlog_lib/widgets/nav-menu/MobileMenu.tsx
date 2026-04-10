import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import type { MenuItem } from "./nav_menu";

interface AccordionItemProps {
  item: MenuItem;
  level?: number;
}

const AccordionItem = (props: AccordionItemProps) => {
  const [isOpen, setIsOpen] = createSignal(false); //props.item.active || false);
  const level = () => props.level || 0;
  const hasChildren = () =>
    props.item.children && props.item.children.length > 0;

  const handleItemClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (hasChildren()) {
      e.preventDefault();
      setIsOpen(!isOpen());
    }
  };

  return (
    <div
      class={`${level() === 0 ? "border-b border-border dark:border-border" : level() === 1 ? "mb-2" : ""}`}
    >
      <div
        class={`flex items-center justify-between cursor-pointer ${level() === 0 ? "py-3 px-2" : level() === 1 ? "py-2 px-2 my-1" : "py-1.5 px-2"}`}
        onClick={handleItemClick}
      >
        <Show
          when={!hasChildren()}
          fallback={
            <span
              class={`${level() === 0 ? "text-lg" : "text-base"} font-medium ${props.item.active ? "text-brand-primary dark:text-brand-primary-light" : ""}`}
              style={{ flex: 1 }}
            >
              {props.item.text}
            </span>
          }
        >
          <a
            href={props.item.link}
            class={`${level() === 0 ? "text-lg" : "text-base"} font-medium ${props.item.active ? "text-brand-primary dark:text-brand-primary-light" : ""}`}
            style={{ flex: 1 }}
          >
            {props.item.text}
          </a>
        </Show>
        <Show when={hasChildren()}>
          <svg
            viewBox="0 0 24 24"
            width={level() === 0 ? "24" : "20"}
            height={level() === 0 ? "24" : "20"}
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={`transform transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen() ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Show>
      </div>
      <Show when={hasChildren()}>
        <div
          class={`overflow-hidden transition-all duration-300 ${isOpen() ? "max-h-dvh opacity-100 py-1" : "max-h-0 opacity-0 py-0"} ${level() === 0 ? "pl-6" : "pl-4"}`}
        >
          <div
            class={`border-l border-border dark:border-border ${level() === 0 ? "pl-3" : "pl-2"} ${level() >= 1 ? "mt-1" : ""}`}
          >
            <For each={props.item.children}>
              {(child) => <AccordionItem item={child} level={level() + 1} />}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

export interface MobileMenuProps {
  items: MenuItem[];
  isOpen: boolean;
  onClose?: () => void;
}

export const MobileMenu = (props: MobileMenuProps) => {
  createEffect(() => {
    if (props.isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    onCleanup(() => {
      document.body.classList.remove("overflow-hidden");
    });
  });

  const handleClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && props.onClose) {
      props.onClose();
    }
  };

  return (
    <div
      class={`fixed top-[var(--topbar-height)] h-[calc(100vh-var(--topbar-height))] bottom-0 left-0 right-0 z-40 bg-surface dark:bg-surface overflow-y-auto transform transition-transform duration-300 ${props.isOpen ? "translate-y-0" : "translate-y-full"}`}
      onClick={handleClick}
    >
      <div class="container mx-auto px-4 py-4">
        <nav>
          <For each={props.items}>
            {(item) => <AccordionItem item={item} />}
          </For>
        </nav>
      </div>
    </div>
  );
};
