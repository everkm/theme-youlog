import { Component, For, Show } from "solid-js";
import { HomeIcon, ChevronRightIcon } from "../icons";

interface BreadcrumbProps {
  navs: BreadcrumbResolved[];
}

const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  return (
    <div
      id="breadcrumb"
      data-ajax-element="breadcrumb"
      class="text-text-tertiary dark:text-text-tertiary text-[0.95em] mx-auto flex items-center flex-wrap relative -top-5 print:hidden"
    >
      <Show when={props.navs.length > 1}>
        <For each={props.navs}>
          {(nav) => (
            <>
              <Show when={!nav.is_first}>
                <ChevronRightIcon />
              </Show>
              {!nav.is_last ? (
                <a
                  class="text-text-primary dark:text-text-primary hover:text-brand-primary dark:hover:text-brand-primary-light transition-colors inline-flex items-center"
                  href={nav.url || "javascript:void(0)"}
                >
                  {nav.is_first ? (
                    <HomeIcon class="w-[1.2em] h-[1.2em]" />
                  ) : (
                    <span data-nav-title>{nav.title}</span>
                  )}
                </a>
              ) : (
                <>
                  {nav.is_first ? (
                    <HomeIcon class="w-[1.2em] h-[1.2em]" />
                  ) : (
                    <span data-nav-title>{nav.title}</span>
                  )}
                </>
              )}
            </>
          )}
        </For>
      </Show>
    </div>
  );
};

export default Breadcrumb;
