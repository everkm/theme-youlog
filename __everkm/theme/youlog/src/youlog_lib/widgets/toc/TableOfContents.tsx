import { Emitter } from "mitt";
import {
  createSignal,
  createEffect,
  onCleanup,
  For,
  Show,
  onMount,
} from "solid-js";

// 垂直高度的间距
const VERTICAL_PADDING = 20;

/** 滚动目标：window 为整页滚动，否则为可滚动元素 */
type TocScrollContainer = Window | HTMLElement;

function getScrollTop(target: TocScrollContainer): number {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

// 定义TOC事件类型
type TocEvents = {
  stop?: string; // 停止更新
  update?: string; // 重新解析TOC
};

/**
 * 目录项接口
 */
interface TocItem {
  id: string;
  text: string;
  level: number;
  parentId?: string;
}

/**
 * TableOfContents组件属性（全部必填；默认值由 toc.tsx 的 DEFAULT_TOC_OPTIONS 等统一合并后再传入）
 */
interface TocProps {
  tocContainer: HTMLElement;
  scrollContainer: TocScrollContainer;
  articleSelector: string;
  headingSelector: string;
  headerHeight: number;
  offset: number; // 滚动偏移量
  highlightParents: boolean;
  title: string; // 目录标题
  /** 非 null 时按各块高度累加；为 null 时仅使用 headerHeight */
  callbackHeadersHeight: (() => number[]) | null;
  onAfterGoto: (id: string, anchorName?: string) => void; // 回调在滚动到指定标题后执行
  /** 为 null 时不注册 mitt 监听 */
  emitter: Emitter<TocEvents> | null;
}

/**
 * MobileToc 入参（由 initMobileToc 注入；嵌套的 TableOfContents 在展开时再补全 tocContainer / callbackHeadersHeight / onAfterGoto）
 */
type MobileTocProps = Omit<
  TocProps,
  "tocContainer" | "callbackHeadersHeight" | "onAfterGoto"
> & {
  /** 移动端必须可收 stop 等事件，不使用 null */
  emitter: Emitter<TocEvents>;
};

/**
 * 解析文章内容，提取标题信息
 */
function parseTocItems(
  articleElement: HTMLElement | null,
  headingSelector: string,
): TocItem[] {
  if (!articleElement) return [];

  const headings =
    articleElement.querySelectorAll<HTMLHeadingElement>(headingSelector);
  const tocItems: TocItem[] = [];

  // 记录标题层级关系
  let previousLevel = 0;
  const levelStack: { id: string; level: number }[] = [];

  headings.forEach((heading) => {
    // 确保每个标题都有id
    if (!heading.id) {
      heading.id =
        heading.textContent?.trim().toLowerCase().replace(/\s+/g, "-") || "";
    }

    // 获取标题级别（h1=1, h2=2 等）
    const level = parseInt(heading.tagName.substring(1));

    // 处理层级栈
    if (level > previousLevel) {
      if (levelStack.length > 0) {
        levelStack.push({ id: heading.id, level });
      } else {
        levelStack.push({ id: heading.id, level });
      }
    } else if (level < previousLevel) {
      while (
        levelStack.length > 0 &&
        levelStack[levelStack.length - 1].level >= level
      ) {
        levelStack.pop();
      }
      levelStack.push({ id: heading.id, level });
    } else {
      // 同级别替换
      levelStack.pop();
      levelStack.push({ id: heading.id, level });
    }
    previousLevel = level;

    // 创建TOC项
    const item: TocItem = {
      id: heading.id,
      text: heading.textContent || "",
      level,
    };

    // 添加父级引用
    if (levelStack.length > 1) {
      item.parentId = levelStack[levelStack.length - 2].id;
    }

    tocItems.push(item);
  });

  return itemLevelJustify(tocItems);
}

function itemLevelJustify(items: TocItem[]) {
  if (items.length === 0) return items;

  let working = items;

  // 首项为 H1 且全文仅有一个 H1（多为页面主标题）时，从目录中忽略该条
  const h1Count = items.filter((item) => item.level === 1).length;
  if (items[0].level === 1 && h1Count === 1) {
    const droppedId = items[0].id;
    working = items
      .slice(1)
      .map((item) =>
        item.parentId === droppedId ? { ...item, parentId: undefined } : item,
      );
  }

  if (working.length === 0) return working;

  // 找到最小级别
  const minLevel = Math.min(...working.map((item) => item.level));

  // 如果最小级别已经是1，则不需要调整
  if (minLevel === 1) return working;

  // 计算需要向上提升的级别数
  const levelOffset = minLevel - 1;

  // 将所有项目的级别向上提升
  return working.map((item) => ({
    ...item,
    level: item.level - levelOffset,
  }));
}

/**
 * 移动端TOC组件 - 显示当前标题，点击后弹出完整目录
 */
function MobileToc(props: MobileTocProps) {
  const [tocItems, setTocItems] = createSignal<TocItem[]>([]);
  const [activeId, setActiveId] = createSignal<string>("");
  const [showToc, setShowToc] = createSignal<boolean>(false);
  const [stopSync, setStopSync] = createSignal<boolean>(false);

  let cleanUpCallback: () => void;

  // refs
  let mobileTocRef: HTMLDivElement | undefined;
  let tocContentRef: HTMLDivElement | undefined;
  let isScrollingToHeading = false;

  // computed values
  const activeTocItem = () => tocItems().find((item) => item.id === activeId());

  // console.log("MobileToc", props.articleSelector, props.headingSelector);

  // 初始化TOC数据
  onMount(() => {
    const articleElement = document.querySelector<HTMLElement>(
      props.articleSelector,
    );
    if (!articleElement) {
      throw new Error(
        `[MobileToc] article not found for selector "${props.articleSelector}"`,
      );
    }

    const items = parseTocItems(articleElement, props.headingSelector);
    setTocItems(items);

    // 初始化时设置当前活跃项
    updateActiveItem();
  });

  // 监听emitter事件
  // 不需要 update 事件, 因为每次更新都会重建。
  createEffect(() => {
    const emitter = props.emitter;

    // 监听停止更新事件 - 仅停止滚动状态同步，通常在页面加载前触发
    const onStop = () => {
      // console.log("TOC: 停止滚动同步 mobile");
      setStopSync(true);
    };

    emitter.on("stop", onStop);

    cleanUpCallback = () => {
      emitter.off("stop", onStop);
    };
  });

  onCleanup(() => {
    // console.log("MobileToc onCleanup");
    cleanUpCallback?.();
  });

  const getHeaderHeight = () => {
    const h = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--topbar-height")
        .trim() || "0",
    );

    // console.log("getHeaderHeight", h);
    return h;
  };

  // 检查是否在sticky状态
  const isSticky = () => {
    const headerOffset = getHeaderHeight();
    let isStickyState = false;
    if (mobileTocRef) {
      const rect = mobileTocRef.getBoundingClientRect();
      isStickyState = rect.top <= headerOffset;
    }
    return isStickyState;
  };

  // 计算总偏移量
  const getTotalOffset = () => {
    const headerOffset = getHeaderHeight();
    if (!mobileTocRef && !isSticky()) return headerOffset;

    const indicatorHeight = mobileTocRef?.offsetHeight || 0;

    // 只有sticky状态才考虑TOC指示器的高度
    const finalOffset = headerOffset + indicatorHeight;
    return finalOffset;
  };

  // 更新当前活跃项
  const updateActiveItem = () => {
    // 如果是由点击TOC引起的滚动，则跳过更新
    if (isScrollingToHeading) return;

    // 如果设置了停止同步，则跳过更新
    if (stopSync()) return;

    // 计算总偏移量
    const totalOffset = getTotalOffset();

    // 找到当前可见的标题
    for (let i = tocItems().length - 1; i >= 0; i--) {
      const heading = document.getElementById(tocItems()[i].id);
      if (!heading) continue;

      const rect = heading.getBoundingClientRect();
      if (rect.top - 20 <= totalOffset) {
        setActiveId(tocItems()[i].id);
        return;
      }
    }
  };

  // 监听页面滚动
  createEffect(() => {
    let ticking = false;
    const scrollEl = props.scrollContainer;

    const handleScroll = () => {
      // 如果设置了停止同步，则不处理滚动事件
      if (stopSync()) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveItem();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 浏览器对“整页滚动(=documentElement/body)”的 scroll 事件触发点不完全一致，
    // 有些情况下只会触发 window.scroll，因此这里做兼容：如果是 html/body，则监听 window。
    const isDocScrollRoot =
      scrollEl instanceof HTMLElement &&
      (scrollEl === document.documentElement || scrollEl === document.body);

    if (isDocScrollRoot) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      onCleanup(() => window.removeEventListener("scroll", handleScroll));
    } else {
      // 使用指定的滚动容器或窗口
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
      onCleanup(() => scrollEl.removeEventListener("scroll", handleScroll));
    }
  });

  // 当TOC展开时滚动到当前活跃项
  // createEffect(() => {
  //   if (showToc() && tocContentRef && activeId()) {
  //     setTimeout(() => {
  //       const activeItem = tocContentRef.querySelector(
  //         `[data-target="${activeId()}"]`,
  //       );
  //       if (activeItem) {
  //         // 滚动到活跃项
  //         activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
  //       }
  //     }, 300); // 等待动画完成
  //   }
  // });

  // 切换目录显示
  const toggleToc = (e: any) => {
    if (e) {
      e.stopPropagation(); // 阻止事件冒泡
    }

    setShowToc(!showToc());
  };

  const onAfterGoto = (id: string) => {
    setActiveId(id);
    setShowToc(false);
  };

  // 如果没有目录项，不显示
  return (
    <Show when={tocItems().length > 0}>
      <div
        ref={mobileTocRef}
        class={`toc-mobile-indicator ${showToc() ? "toc-expanded" : ""}`}
      >
        {/* 指示器/标题部分 */}
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
            {/* <span class="toc-mobile-header-label">当前位置:</span> */}
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

        {/* 目录内容区 */}
        <Show when={showToc()}>
          <div class="mobile-toc-content" ref={tocContentRef}>
            <TableOfContents
              tocContainer={mobileTocRef!}
              articleSelector={props.articleSelector}
              headingSelector={props.headingSelector}
              headerHeight={props.headerHeight}
              offset={props.offset}
              highlightParents={props.highlightParents}
              title={props.title}
              callbackHeadersHeight={() => [getTotalOffset()]}
              onAfterGoto={onAfterGoto}
              scrollContainer={props.scrollContainer}
              emitter={null}
            />
          </div>
        </Show>
      </div>
    </Show>
  );
}

/**
 * TableOfContents组件
 */
function TableOfContents(props: TocProps) {
  const [tocItems, setTocItems] = createSignal<TocItem[]>([]);
  const [activeId, setActiveId] = createSignal<string>("");
  const [containerHeight, setContainerHeight] = createSignal<string>("auto");
  const [stopSync, setStopSync] = createSignal<boolean>(false);

  // 是否由TOC内部操作引起的滚动
  let isScrollingToHeading = false;
  let tocContainerRef: HTMLElement | undefined;

  onMount(() => {
    tocContainerRef = props.tocContainer;
    if (!tocContainerRef) {
      throw new Error(
        "[TableOfContents] tocContainer is missing (must be a valid HTMLElement)",
      );
    }

    // 初始化TOC数据
    const articleElement = document.querySelector<HTMLElement>(
      props.articleSelector,
    );
    if (!articleElement) {
      throw new Error(
        `[TableOfContents] article not found for selector "${props.articleSelector}"`,
      );
    }

    const items = parseTocItems(articleElement, props.headingSelector);
    setTocItems(items);

    // 计算TOC容器高度
    const updateContainerHeight = () => {
      const currentHeaderHeight = calculateHeaderHeight();
      const windowHeight = window.innerHeight;
      // 使用常量垂直偏移
      const calculatedHeight =
        windowHeight - currentHeaderHeight - VERTICAL_PADDING * 2;
      setContainerHeight(`${calculatedHeight}px`);

      // 直接设置容器高度
      if (tocContainerRef) {
        tocContainerRef.style.maxHeight = `${calculatedHeight}px`;
      }
    };

    // 初始计算
    updateContainerHeight();

    // 窗口大小变化时重新计算
    window.addEventListener("resize", updateContainerHeight);

    onCleanup(() =>
      window.removeEventListener("resize", updateContainerHeight),
    );
  });

  // 计算所有header的高度
  const calculateHeaderHeight = () => {
    if (props.callbackHeadersHeight !== null) {
      const heights = props.callbackHeadersHeight();
      return heights.reduce((sum, height) => sum + height, 0);
    }
    return props.headerHeight;
  };

  const getArticleElement = () => {
    return document.querySelector<HTMLElement>(props.articleSelector);
  };

  // 监听emitter事件
  createEffect(() => {
    const emitter = props.emitter;
    if (emitter === null) return;

    // 监听停止更新事件 - 仅停止滚动状态同步，通常在页面加载前触发
    const onStop = () => {
      // console.log("TOC: 停止滚动同步");
      setStopSync(true);
    };

    // 监听更新事件 - 页面加载后触发，重新解析内容并恢复滚动同步
    const onUpdate = () => {
      // console.log("TOC: 更新内容并恢复滚动同步");
      // 重新解析文章内容
      const articleElement = getArticleElement();
      if (!articleElement) {
        throw new Error(
          `[TableOfContents] article not found on update for selector "${props.articleSelector}"`,
        );
      }
      const items = parseTocItems(articleElement, props.headingSelector);
      setTocItems(items);

      // 启用滚动同步
      setStopSync(false);
    };

    emitter.on("stop", onStop);
    emitter.on("update", onUpdate);

    onCleanup(() => {
      emitter.off("stop", onStop);
      emitter.off("update", onUpdate);
    });
  });

  createEffect(() => {
    // 确保tocItems更新后，更新活跃项
    if (tocItems().length > 0) {
      updateActiveItem();
    }
  });

  // 更新当前活跃项
  const updateActiveItem = () => {
    // 如果是由点击TOC引起的滚动，则跳过更新
    if (isScrollingToHeading) return;

    // 如果设置了停止同步，则跳过更新
    if (stopSync()) return;

    const headerOffset = calculateHeaderHeight();
    // 计算总偏移量
    const totalOffset = headerOffset + 20; // 增加top 判断的阈值

    // 找到当前可见的标题
    const items = tocItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const heading = document.getElementById(items[i].id);
      if (!heading) {
        console.error("heading not found", items[i].id);
        continue;
      }

      const rect = heading.getBoundingClientRect();
      if (rect.top <= totalOffset) {
        setActiveId(items[i].id);
        return;
      }
    }
  };

  // 滚动到指定标题
  const scrollToHeading = (id: string) => {
    let targetHeading = document.getElementById(id);
    if (!targetHeading) {
      const anchors = getArticleElement()?.querySelectorAll("a.heading-anchor");
      if (anchors) {
        for (const anchor of Array.from(anchors)) {
          if (anchor.getAttribute("name") === id) {
            targetHeading = anchor as HTMLElement;
            break;
          }
        }
      }

      if (!targetHeading) {
        console.error("TOC: targetHeading not found", id);
        return;
      }
    }

    // 标记为TOC内部引起的滚动
    isScrollingToHeading = true;

    const headerHeight = calculateHeaderHeight();

    // 计算最终的偏移位置
    const elementPosition = targetHeading.getBoundingClientRect().top;
    const offsetPosition = getScrollTop(props.scrollContainer);
    const totalOffset =
      elementPosition + offsetPosition - headerHeight - props.offset;

    // 平滑滚动到目标位置
    const scrollElement = props.scrollContainer;
    scrollElement.scrollTo({
      top: totalOffset,
      behavior: "smooth",
    });
    // console.log("scrollToHeading", totalOffset, scrollElement);

    // 更新活跃ID
    setActiveId(id);

    // 滚动结束后取消标记
    setTimeout(() => {
      isScrollingToHeading = false;
    }, 1000);

    // 回调
    let anchorName: string | undefined = undefined;
    const anchorEl = document
      .getElementById(id)
      ?.querySelector("a.heading-anchor");
    if (anchorEl) {
      anchorName = anchorEl.getAttribute("name") || undefined;
    }
    props.onAfterGoto(id, anchorName);
  };

  // 回到顶部
  const scrollToTop = () => {
    const scrollElement = props.scrollContainer;
    scrollElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setActiveId("");

    // 回调
    props.onAfterGoto("");
  };

  // 确保当前活跃链接在视图内
  createEffect(() => {
    const activeIdValue = activeId();
    if (!activeIdValue) return;

    const tocContainer = tocContainerRef || props.tocContainer;
    if (!tocContainer) return;

    // 获取容器和活跃链接
    const activeLink = tocContainer.querySelector(
      `[data-target="${activeIdValue}"]`,
    ) as HTMLElement;
    if (!activeLink) return;

    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = tocContainer.getBoundingClientRect();

    if (linkRect.top < containerRect.top) {
      tocContainer.scrollTop += linkRect.top - containerRect.top - 10;
    } else if (linkRect.bottom > containerRect.bottom) {
      tocContainer.scrollTop += linkRect.bottom - containerRect.bottom + 10;
    }
  });

  // 监听页面滚动
  createEffect(() => {
    let ticking = false;
    const scrollEl = props.scrollContainer;

    const handleScroll = () => {
      // 如果设置了停止同步，则不处理滚动事件
      if (stopSync()) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveItem();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 浏览器对“整页滚动(=documentElement/body)”的 scroll 事件触发点不完全一致，
    // 有些情况下只会触发 window.scroll，因此这里做兼容：如果是 html/body，则监听 window。
    const isDocScrollRoot =
      scrollEl instanceof HTMLElement &&
      (scrollEl === document.documentElement || scrollEl === document.body);

    if (isDocScrollRoot) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      onCleanup(() => window.removeEventListener("scroll", handleScroll));
    } else {
      // 监听滚动事件
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
      onCleanup(() => scrollEl.removeEventListener("scroll", handleScroll));
    }
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
        {/* 目录标题作为第一个项目，使用div而非链接 */}
        <div class="toc-item toc-title-item">
          <div
            class="toc-title toc-title-clickable cursor-pointer"
            onClick={scrollToTop}
          >
            {props.title}
          </div>
        </div>

        {/* 目录项目列表 */}
        <For each={tocItems()}>
          {(item) => {
            // 创建一个响应式的计算属性来检查当前项是否活跃
            const isActive = () => item.id === activeId();
            const isParentOfActive = () =>
              props.highlightParents &&
              tocItems().some(
                (i) => i.id === activeId() && i.parentId === item.id,
              );

            // 动态计算class名称
            const getClassName = () => {
              let className = "toc-link";

              // 根据级别添加样式
              if (item.level === 1) className += " toc-link-h1";
              else if (item.level === 2) className += " toc-link-h2";
              else if (item.level === 3) className += " toc-link-h3";
              else if (item.level === 4) className += " toc-link-h4";
              else if (item.level === 5) className += " toc-link-h5";

              // 添加活跃状态
              if (isActive()) className += " toc-link-active";
              if (isParentOfActive()) className += " toc-link-parent-active";

              return className;
            };

            return (
              <div class="toc-item">
                <a
                  href={`#${item.id}`}
                  class={getClassName()}
                  data-target={item.id}
                  data-level={item.level}
                  data-parent={item.parentId}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(item.id);
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
  TocItem,
  TocProps,
  MobileTocProps,
};
