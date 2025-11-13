import { Component, Show } from "solid-js";
import { NextArrowIcon, PrevArrowIcon } from "../icons";

interface PageNavItem {
  title: string;
  link: string;
}

interface PageNavigationProps {
  pageNav: {
    next?: PageNavItem;
    prev?: PageNavItem;
  };
}

const PageNavigation: Component<PageNavigationProps> = (props) => {
  return (
    <div id="page-indicator" data-ajax-element="page-indicator" class="print:hidden">
      <Show when={props.pageNav.next || props.pageNav.prev}>
        <div class="mt-10 pt-8 border-t border-border dark:border-border space-y-4 md:flex md:flex-row-reverse md:items-center md:space-y-0 md:gap-8">
          <Show when={props.pageNav.next}>
            <a class="flex-1 block" href={props.pageNav.next?.link}>
              <div class="border border-border dark:border-border rounded p-4 flex flex-col items-end hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors">
                <div class="flex text-text-tertiary dark:text-text-tertiary mb-2 items-center flex-row-reverse">
                  <NextArrowIcon class="inline-block" />
                </div>
                <span class="text-lg font-medium text-text-primary dark:text-text-primary">
                  {props.pageNav.next?.title}
                </span>
              </div>
            </a>
          </Show>

          <Show when={props.pageNav.prev}>
            <a class="flex-1 block" href={props.pageNav.prev?.link}>
              <div class="border border-border dark:border-border rounded p-4 flex flex-col items-start hover:border-brand-primary dark:hover:border-brand-primary-light transition-colors">
                <div class="flex text-text-tertiary dark:text-text-tertiary mb-2 items-center">
                  <PrevArrowIcon class="inline-block" />
                </div>
                <span class="text-lg font-medium text-text-primary dark:text-text-primary">
                  {props.pageNav.prev?.title}
                </span>
              </div>
            </a>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default PageNavigation;

