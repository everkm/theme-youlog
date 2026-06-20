import { Emitter } from "mitt";
import { createSignal, createEffect, onCleanup, For, Show, onMount } from "solid-js";
import {
  getAnchorScrollOffset,
  resolveAnchorTarget,
  scrollToElement,
  type ScrollContainer,
} from "../../core/scrollAnchor";
import { parseTocItems, VERTICAL_PADDING, type TocItem } from "./tocParsing";
import type { TocScrollSync } from "./tocScrollSync";
import {
  scrollActiveTocLinkIntoView,
  syncTocContainerMaxHeight,
} from "./tocContainerLayout";

/** @deprecated 使用 ScrollContainer */
type TocScrollContainer = ScrollContainer;

type TocEvents = {
  stop?: string;
  update?: string;
};

interface TocProps {
  tocContainer: HTMLElement;
  scrollContainer: TocScrollContainer;
  articleSelector: string;
  headingSelector: string;
  headerHeight: number;
  offset: number;
  /**
   * 滚动同步时是否高亮当前活跃条目的父级标题。
   *
   * 目录项通过 `parentKey` 形成层级。滚动文章时 `scrollSync.activeId` 指向当前可见标题；
   * 为 `true` 时，若某条目的 `key` 等于活跃项的 `parentKey`，会额外加上 `toc-link-parent-active`
   *（文字色加深）；活跃项本身仍使用 `toc-link-active`（品牌色背景 + 左边框）。
   * 为 `false` 时仅高亮当前标题，父级保持默认样式。`installToc` 默认 `true`，youlog 主题传入 `false`。
   */
  highlightParents: boolean;
  title: string;
  callbackHeadersHeight: (() => number[]) | null;
  onAfterGoto: (id: string, anchorName?: string) => void;
  emitter: Emitter<TocEvents> | null;
  scrollSync: TocScrollSync;
}

type MobileTocProps = Omit<
  TocProps,
  "tocContainer" | "callbackHeadersHeight"
> & {
  emitter: Emitter<TocEvents>;
  callbackGotoHeadersHeight: () => number[];
};

function MobileToc(props: MobileTocProps) {
  const [tocItems, setTocItems] = createSignal<TocItem[]>([]);
  const [showToc, setShowToc] = createSignal(false);

  let mobileTocRef: HTMLDivElement | undefined;

  const activeId = props.scrollSync.activeId;
  const activeTocItem = () => tocItems().find((item) => item.key === activeId());

  onMount(() => {
    const articleElement = document.querySelector<HTMLElement>(
      props.articleSelector,
    );
    if (!articleElement) {
      throw new Error(
        `[MobileToc] article not found for selector "${props.articleSelector}"`,
      );
    }
    setTocItems(parseTocItems(articleElement, props.headingSelector));
  });

  createEffect(() => {
    const onStop = () => props.scrollSync.stop();

    const onUpdate = () => {
      const articleElement = document.querySelector<HTMLElement>(
        props.articleSelector,
      );
      if (!articleElement) {
        setTocItems([]);
        setShowToc(false);
        return;
      }
      setTocItems(parseTocItems(articleElement, props.headingSelector));
      setShowToc(false);
    };

    props.emitter.on("stop", onStop);
    props.emitter.on("update", onUpdate);
    onCleanup(() => {
      props.emitter.off("stop", onStop);
      props.emitter.off("update", onUpdate);
    });
  });

  const toggleToc = (e: Event) => {
    e.stopPropagation();
    setShowToc(!showToc());
  };

  const handleAfterGoto = (id: string, anchorName?: string) => {
    setShowToc(false);
    props.onAfterGoto(id, anchorName);
  };

  return (
    <Show when={tocItems().length > 0}>
      <div
        ref={mobileTocRef}
        class={`toc-mobile-indicator ${showToc() ? "toc-expanded" : ""}`}
      >
        <div class="toc-mobile-header" onClick={toggleToc}>
          <div class="toc-mobile-header-left">
            <svg
              class="toc-mobile-header-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <div class="toc-mobile-header-title">
            {activeTocItem()?.text || props.title}
          </div>
          <svg
            class={`toc-mobile-header-arrow ${showToc() ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <Show when={showToc()}>
          <div class="mobile-toc-content">
            <TableOfContents
              tocContainer={mobileTocRef!}
              articleSelector={props.articleSelector}
              headingSelector={props.headingSelector}
              headerHeight={props.headerHeight}
              offset={props.offset}
              highlightParents={props.highlightParents}
              title={props.title}
              callbackHeadersHeight={props.callbackGotoHeadersHeight}
              onAfterGoto={handleAfterGoto}
              scrollContainer={props.scrollContainer}
              emitter={null}
              scrollSync={props.scrollSync}
            />
          </div>
        </Show>
      </div>
    </Show>
  );
}

function TableOfContents(props: TocProps) {
  const [tocItems, setTocItems] = createSignal<TocItem[]>([]);
  const activeId = props.scrollSync.activeId;
  let tocContainerRef: HTMLElement | undefined;

  onMount(() => {
    tocContainerRef = props.tocContainer;
    if (!tocContainerRef) {
      throw new Error(
        "[TableOfContents] tocContainer is missing (must be a valid HTMLElement)",
      );
    }

    const articleElement = document.querySelector<HTMLElement>(
      props.articleSelector,
    );
    if (!articleElement) {
      throw new Error(
        `[TableOfContents] article not found for selector "${props.articleSelector}"`,
      );
    }

    setTocItems(parseTocItems(articleElement, props.headingSelector));

    const shouldLimitHeight = () =>
      tocContainerRef?.classList.contains("lg:sticky") ?? false;

    const updateContainerHeight = () => {
      if (!tocContainerRef || !shouldLimitHeight()) return;
      syncTocContainerMaxHeight(tocContainerRef, props.scrollContainer);
    };

    updateContainerHeight();
    window.addEventListener("resize", updateContainerHeight);

    let resizeObserver: ResizeObserver | undefined;
    if ("ResizeObserver" in window && tocContainerRef) {
      resizeObserver = new ResizeObserver(updateContainerHeight);
      resizeObserver.observe(tocContainerRef);
      if (!(props.scrollContainer instanceof Window)) {
        resizeObserver.observe(props.scrollContainer);
      }
    }

    onCleanup(() => {
      window.removeEventListener("resize", updateContainerHeight);
      resizeObserver?.disconnect();
    });
  });

  const calculateHeaderHeight = () => {
    if (props.callbackHeadersHeight !== null) {
      const heights = props.callbackHeadersHeight();
      return heights.reduce((sum, height) => sum + height, 0);
    }
    return props.headerHeight;
  };

  const getArticleElement = () =>
    document.querySelector<HTMLElement>(props.articleSelector);

  createEffect(() => {
    const emitter = props.emitter;
    if (emitter === null) return;

    const onStop = () => {
      props.scrollSync.stop();
    };

    const onUpdate = () => {
      props.scrollSync.setActiveId("");

      const articleElement = getArticleElement();
      if (!articleElement) {
        setTocItems([]);
        return;
      }

      setTocItems(parseTocItems(articleElement, props.headingSelector));

      const tocContainer = tocContainerRef || props.tocContainer;
      if (tocContainer?.classList.contains("lg:sticky")) {
        tocContainer.scrollTop = 0;
        syncTocContainerMaxHeight(tocContainer, props.scrollContainer);
      }
    };

    emitter.on("stop", onStop);
    emitter.on("update", onUpdate);
    onCleanup(() => {
      emitter.off("stop", onStop);
      emitter.off("update", onUpdate);
    });
  });

  const getScrollOffset = () => {
    if (props.callbackHeadersHeight !== null) {
      const heights = props.callbackHeadersHeight();
      return heights.reduce((sum, height) => sum + height, 0) + props.offset;
    }
    return getAnchorScrollOffset(props.scrollContainer, props.offset);
  };

  const scrollToHeading = (item: TocItem) => {
    const article = getArticleElement();
    const targetHeading = resolveAnchorTarget(item.id, article ?? document);
    if (!targetHeading) {
      console.error("TOC: targetHeading not found", item.id);
      return;
    }

    props.scrollSync.beginGoto(item.key);

    scrollToElement(targetHeading, props.scrollContainer, {
      offset: getScrollOffset(),
      behavior: "auto",
    });

    let anchorName: string | undefined;
    if (targetHeading.matches("a.heading-anchor")) {
      anchorName = targetHeading.getAttribute("name") || undefined;
    } else {
      const anchorEl = targetHeading.querySelector("a.heading-anchor");
      anchorName = anchorEl?.getAttribute("name") || undefined;
    }
    props.onAfterGoto(item.id, anchorName);
  };

  const scrollToTop = () => {
    props.scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    props.scrollSync.setActiveId("");
    props.onAfterGoto("");
  };

  createEffect(() => {
    const activeIdValue = activeId();
    if (!activeIdValue) return;

    const tocContainer = tocContainerRef || props.tocContainer;
    if (!tocContainer) return;

    const activeLink = tocContainer.querySelector(
      `[data-target="${activeIdValue}"]`,
    ) as HTMLElement | null;
    if (!activeLink) return;

    requestAnimationFrame(() => {
      if (tocContainer.classList.contains("lg:sticky")) {
        syncTocContainerMaxHeight(tocContainer, props.scrollContainer);
      }
      scrollActiveTocLinkIntoView(tocContainer, activeLink);
    });
  });

  return (
    <Show
      when={tocItems().length > 0}
      fallback={
        <>
          <div class="toc-item toc-title-item">
            <div class="toc-title">{props.title}</div>
          </div>
          <div class="toc-empty">No Table of Contents</div>
        </>
      }
    >
      <>
        <div class="toc-item toc-title-item">
          <div
            class="toc-title toc-title-clickable cursor-pointer"
            onClick={scrollToTop}
          >
            {props.title}
          </div>
        </div>

        <For each={tocItems()}>{(item) => {
            const isActive = () => item.key === activeId();
            const isParentOfActive = () =>
              props.highlightParents &&
              tocItems().some(
                (i) => i.key === activeId() && i.parentKey === item.key,
              );

            const getClassName = () => {
              let className = "toc-link truncate";
              if (item.level === 1) className += " toc-link-h1";
              else if (item.level === 2) className += " toc-link-h2";
              else if (item.level === 3) className += " toc-link-h3";
              else if (item.level === 4) className += " toc-link-h4";
              else if (item.level === 5) className += " toc-link-h5";
              if (isActive()) className += " toc-link-active";
              if (isParentOfActive()) className += " toc-link-parent-active";
              return className;
            };

            return (
              <div class="toc-item">
                <a
                  href={`#${item.id}`}
                  class={getClassName()}
                  data-target={item.key}
                  data-anchor={item.id}
                  data-level={item.level}
                  data-parent={item.parentKey}
                  data-no-ajax
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(item);
                  }}
                >
                  {item.text}
                </a>
              </div>
            );
          }}
        </For>
      </>
    </Show>
  );
}

export { VERTICAL_PADDING, MobileToc, TableOfContents };
export type {
  TocScrollContainer,
  TocEvents,
  TocProps,
  MobileTocProps,
};
export type { TocItem } from "./tocParsing";
