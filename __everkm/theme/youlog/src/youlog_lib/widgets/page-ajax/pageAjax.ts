/**
 * page-ajax 引擎实现（结构透明的 PJAX）。
 *
 * 引擎对页面结构零感知：除 `#page-shell`（morph 入口）外不含任何具体内容 selector。
 * 受保护的 widget 容器通过 `data-processed` + ProcessedRegistry 自行登记。
 *
 * 模块说明、依赖、前提条件与更新日志见同目录 `index.ts`。
 */
import { Idiomorph } from "idiomorph";
import nProgress from "nprogress";
import "./nprogress_custom.css";
import { processedRegistry } from "./processedRegistry";
import { hashHtml } from "./htmlHash";
import { buildSkipCallbacks } from "./morphCallbacks";
import { getOrFetch, prefetch } from "./prefetchCache";
import { pjaxDebug, pjaxGroup, pjaxGroupEnd, pjaxLogHtmlDiff } from "./debug";
import {
  resolveScrollContainer,
  scrollContainerToTop,
  scrollToHash,
  getAnchorScrollOffset,
  type ScrollContainer,
} from "../../core/scrollAnchor";
import type { AnchorScrollService } from "../../core/anchorScrollService";
import {
  EVENT_BEFORE_UPDATE,
  EVENT_PAGE_LOADED,
  EVENT_ANCHOR_NAVIGATE,
  EVENT_NAVIGATE,
  EVENT_WIDGET_REPROCESS,
  EVENT_WIDGET_TEARDOWN,
  PAGE_SHELL_SELECTOR,
  PAGE_HEAD_ATTR,
  PAGE_LOADING_CLASS,
} from "./constants";

// ── Options ───────────────────────────────────────────────

export interface PageAjaxOptions {
  /** 导航完成后滚动到顶部的滚动容器 CSS 选择器 */
  scrollContainerSelector?: string;
  /** 锚点滚动时在文章内解析目标（与 TOC 一致，避免命中页外重复 id） */
  articleSelector?: string;
  /**
   * 锚点滚动顶部留白（如 sticky 顶栏、小屏目录栏）；未提供时用 getAnchorScrollOffset。
   * 传入 anchorScroll 时忽略本项。
   */
  resolveAnchorScrollOffset?: (scrollContainer: ScrollContainer) => number;
  /** 统一锚点滚动服务；传入时 hash 滚动与 inset 由服务负责，首屏 hash 须由宿主 applyInitialHash */
  anchorScroll?: AnchorScrollService;
}

type RequiredOptions = Required<
  Pick<PageAjaxOptions, "scrollContainerSelector">
> &
  PageAjaxOptions;

// ── Head 兼容性 ────────────────────────────────────────────

function isHeadCompatible(newDoc: Document): boolean {
  const current = document.documentElement.getAttribute(PAGE_HEAD_ATTR);
  const next = newDoc.documentElement.getAttribute(PAGE_HEAD_ATTR);
  // 任一方未标记时不触发整页刷新（降级兼容旧模板）
  if (!current || !next) return true;
  return current === next;
}

// ── Hash 导航检测 ─────────────────────────────────────────

function isSamePathHashChange(currentHref: string, nextHref: string): boolean {
  const stripHash = (u: string) => u.split("#")[0];
  return stripHash(currentHref) === stripHash(nextHref) && currentHref !== nextHref;
}

function getUrlHash(url: string): string {
  const idx = url.indexOf("#");
  return idx >= 0 ? url.slice(idx + 1) : "";
}

// ── 滚动 ───────────────────────────────────────────────────

function dispatchAnchorNavigate(hash: string): void {
  document.dispatchEvent(
    new CustomEvent(EVENT_ANCHOR_NAVIGATE, {
      detail: { hash },
      bubbles: true,
      composed: true,
    }),
  );
}

/** 锚点导航后通知依赖 hash 的 widget（如 nav-tree 高亮）。供外部 TOC 点击等场景调用。 */
function notifyAnchorNavigate(): void {
  dispatchAnchorNavigate(getUrlHash(window.location.href));
}

function resolveArticleRoot(
  scrollContainer: ScrollContainer,
  articleSelector?: string,
): ParentNode {
  if (!articleSelector) {
    return document;
  }
  if (scrollContainer instanceof Window) {
    return document.querySelector(articleSelector) ?? document;
  }
  return scrollContainer.querySelector(articleSelector) ?? scrollContainer;
}

function resolveAnchorOffset(
  scrollContainer: ScrollContainer,
  opts: RequiredOptions,
): number {
  if (opts.resolveAnchorScrollOffset) {
    return opts.resolveAnchorScrollOffset(scrollContainer);
  }
  return getAnchorScrollOffset(scrollContainer);
}

function scrollToPageHash(hash: string, opts: RequiredOptions): void {
  const container = resolveScrollContainer(opts.scrollContainerSelector) ?? window;
  const root = resolveArticleRoot(container, opts.articleSelector);
  scrollToHash(
    hash,
    container,
    { behavior: "auto", offset: resolveAnchorOffset(container, opts) },
    root,
  );
}

function scrollAfterNavigation(url: string, opts: RequiredOptions): void {
  const hash = getUrlHash(url);
  requestAnimationFrame(() => {
    if (opts.anchorScroll) {
      if (hash) {
        void opts.anchorScroll.scrollToHash({
          hash,
          source: "navigation",
          behavior: "auto",
        });
      } else {
        const container =
          resolveScrollContainer(opts.scrollContainerSelector) ?? window;
        scrollContainerToTop(container, "auto");
      }
      return;
    }

    const container = resolveScrollContainer(opts.scrollContainerSelector) ?? window;
    if (hash) {
      scrollToPageHash(hash, opts);
      dispatchAnchorNavigate(hash);
    } else if (container instanceof Window) {
      container.scrollTo({ top: 0 });
    } else {
      container.scrollTop = 0;
    }
  });
}

/** 首屏（含整页刷新落地）若 URL 带 hash，滚动到对应锚点 */
function scrollToInitialHash(opts: RequiredOptions): void {
  const hash = getUrlHash(window.location.href);
  if (!hash) return;
  const run = () => {
    // 等待 widget（如小屏目录）挂载并完成布局后再测量
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToPageHash(hash, opts);
        dispatchAnchorNavigate(hash);
      });
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}

// ── Prefetch 绑定 ─────────────────────────────────────────

function bindPrefetch(): void {
  document.addEventListener("mouseover", (e) => {
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link || !isInternalLink(link)) return;
    const timer = setTimeout(() => prefetch(link.href), 80);
    link.addEventListener("mouseleave", () => clearTimeout(timer), { once: true });
  });
}

// ── 核心 morph ────────────────────────────────────────────

/** @returns 是否成功 morph；false 表示缺少 #page-shell，调用方应回退整页刷新 */
function morphPageShell(newDoc: Document): boolean {
  const current = document.querySelector(PAGE_SHELL_SELECTOR);
  const next = newDoc.querySelector(PAGE_SHELL_SELECTOR);
  if (!current || !next) return false;

  // skipIds = 当前已注册 widget；beforeNodeMorphed 命中 oldNode 上的 data-processed 即跳过整棵子树。
  // 无需镜像 data-processed 到新文档（回调只看当前 DOM 的 oldNode）。
  const skipIds = new Set(processedRegistry.getAll().keys());
  pjaxDebug("morph: 开始，skipIds =", [...skipIds]);

  // 记录 morph 前各受保护容器的节点引用，用于事后判断是否被「删旧建新」替换
  const beforeRefs = new Map<string, Element | undefined>();
  for (const [id, entry] of processedRegistry.getAll()) {
    beforeRefs.set(id, entry.el.deref());
  }

  Idiomorph.morph(current, next, {
    callbacks: buildSkipCallbacks(skipIds),
  });

  // morph 后存活性校验：live 节点是否与 morph 前同一引用，是判断 protection 是否生效的决定性证据
  for (const [id, entry] of processedRegistry.getAll()) {
    const live = document.querySelector(entry.selector);
    const beforeRef = beforeRefs.get(id);
    pjaxDebug(`morph: 完成后检查 widget="${id}" selector=${entry.selector}`, {
      stillInDom: !!live,
      sameNodeAsBefore: live === beforeRef, // false = idiomorph 替换了节点 → 状态丢失
      hasProcessedAttr: live instanceof Element
        ? live.getAttribute("data-processed")
        : null,
      converted: !!(live && live.querySelector(".nav-tree-container")), // 已转换的 Solid 树是否还在
    });
  }
  return true;
}

// ── Reprocess 检测 ────────────────────────────────────────

function reprocessContainers(newDoc: Document): void {
  for (const [id, entry] of processedRegistry.getAll()) {
    // 用 registry 中存储的 selector 查找，而非 data-processed（新文档无此属性）
    const newEl = newDoc.querySelector(entry.selector);

    if (!newEl) {
      pjaxDebug(`reprocess: widget="${id}" 新页面缺失该容器 → TEARDOWN(销毁)`);
      const container = entry.el.deref();
      // morph 已将该容器从 DOM 移除（id 不在新旧交集，走 idiomorph 默认 removeNode）。
      // 传入 container 引用（已脱离 DOM）供 widget teardown handler 做 JS 层清理。
      document.dispatchEvent(
        new CustomEvent(EVENT_WIDGET_TEARDOWN, {
          detail: { widgetId: id, container },
        }),
      );
      processedRegistry.delete(id);
      continue;
    }

    const newHash = hashHtml(newEl.innerHTML);
    if (entry.hash === newHash) {
      pjaxDebug(
        `reprocess: widget="${id}" hash 一致(${newHash}) → 保留增强状态，不重建 ✓`,
      );
      continue; // 内容未变，widget 增强状态完整保留
    }

    pjaxGroup(
      `reprocess: widget="${id}" hash 变化 → REPROCESS(整树重建，展开状态将清零!)`,
    );
    pjaxDebug(`old hash = ${entry.hash}  new hash = ${newHash}`);
    // 用「register 时记录的原始 SSR HTML」与「新页面 SSR HTML」逐字符对比，定位差异来源
    // （注：container.innerHTML 此刻已是转换后的 .nav-tree-container，不能直接当原始 HTML 比）
    pjaxLogHtmlDiff(`widget="${id}" 新旧 SSR HTML 差异`, entry.rawHtml, newEl.innerHTML);
    pjaxGroupEnd();

    const container = entry.el.deref();
    if (!container) {
      processedRegistry.delete(id);
      continue;
    }

    // dispatchEvent 同步执行：widget handler 运行后 container.innerHTML = newHtml 已完成
    document.dispatchEvent(
      new CustomEvent(EVENT_WIDGET_REPROCESS, {
        detail: { widgetId: id, newHtml: newEl.innerHTML, container },
      }),
    );

    // 以新文档的原始 HTML hash + 快照更新记录，保持 hash/diff 与 SSR HTML 形式一致
    processedRegistry.updateHash(id, newHash, newEl.innerHTML);
  }
}

// ── 导航主流程 ────────────────────────────────────────────

let navigating = false;
// 当前已渲染内容对应的 URL。popstate 时 window.location 已指向目标地址，
// 故需用它（而非 window.location.href）判断是否仅 hash 变化。
let renderedUrl = window.location.href;

async function handleNavigation(
  url: string,
  opts: RequiredOptions,
  fromPopState = false,
): Promise<void> {
  if (navigating) return;

  pjaxDebug(
    `=== 导航开始 url=${url} fromPopState=${fromPopState} renderedUrl=${renderedUrl}`,
  );

  // 相对「当前已渲染页面」仅 hash 变化：不发请求，直接滚动 + 通知
  if (isSamePathHashChange(renderedUrl, url)) {
    pjaxDebug("导航：仅 hash 变化，不 fetch、不 morph（navtree 不应重建）");
    if (!fromPopState) window.history.pushState(null, "", url);
    renderedUrl = url;
    scrollAfterNavigation(url, opts);
    return;
  }

  navigating = true;
  try {
    document.dispatchEvent(new CustomEvent(EVENT_BEFORE_UPDATE));
    document.body.classList.add(PAGE_LOADING_CLASS);
    nProgress.start();

    let newDoc: Document;
    try {
      newDoc = await getOrFetch(url);
    } catch {
      window.location.href = url;
      return;
    }

    if (!isHeadCompatible(newDoc)) {
      window.location.href = url;
      return;
    }

    // #page-shell 缺失（异常模板）→ 整页刷新兜底，避免"导航成功但页面未变"
    if (!morphPageShell(newDoc)) {
      window.location.href = url;
      return;
    }

    document.title = newDoc.title;
    if (!fromPopState) window.history.pushState(null, "", url);
    renderedUrl = url;
    reprocessContainers(newDoc);
    document.dispatchEvent(new CustomEvent(EVENT_PAGE_LOADED, { detail: { url } }));
    scrollAfterNavigation(url, opts);
  } finally {
    navigating = false;
    nProgress.done();
    document.body.classList.remove(PAGE_LOADING_CLASS);
  }
}

// ── 初始化 ────────────────────────────────────────────────

function initPageAjax(options: PageAjaxOptions = {}): void {
  const opts: RequiredOptions = {
    scrollContainerSelector: options.scrollContainerSelector ?? "#body-main",
    articleSelector: options.articleSelector,
    resolveAnchorScrollOffset: options.resolveAnchorScrollOffset,
    anchorScroll: options.anchorScroll,
  };

  nProgress.configure({ showSpinner: false, minimum: 0.1, speed: 200, trickleSpeed: 100 });

  renderedUrl = window.location.href;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  bindPrefetch();
  bindLinkInterceptor(opts);
  bindPopState(opts);
  bindProgrammaticNavigate(opts);

  // 未注入 anchorScroll 时保留 legacy 首屏 hash 滚动
  if (!opts.anchorScroll) {
    scrollToInitialHash(opts);
  }
}

function bindLinkInterceptor(opts: RequiredOptions): void {
  document.addEventListener(
    "click",
    (e) => {
      // 用 composedPath 兼容 shadow DOM / 内嵌结构
      const link = e
        .composedPath()
        .find((n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement);
      if (!link || link.hasAttribute("data-no-ajax")) return;
      // 修饰键 / 非左键 / download 交给浏览器默认行为
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        link.hasAttribute("download")
      )
        return;
      if (!isInternalLink(link)) return;
      e.preventDefault();
      handleNavigation(link.href, opts);
    },
    { capture: true, passive: false },
  );
}

function bindPopState(opts: RequiredOptions): void {
  window.addEventListener("popstate", () => {
    handleNavigation(window.location.href, opts, true);
  });
}

function bindProgrammaticNavigate(opts: RequiredOptions): void {
  window.addEventListener(EVENT_NAVIGATE, (e: Event) => {
    const url = (e as CustomEvent<{ url: string }>).detail?.url;
    if (url) handleNavigation(url, opts);
  });
}

function isInternalLink(link: HTMLAnchorElement): boolean {
  const rawHref = link.getAttribute("href") ?? "";
  // 排除 javascript: / mailto: / tel: 等非导航协议
  if (/^(javascript|mailto|tel):/i.test(rawHref)) return false;
  if (link.target === "_blank") return false;
  if (link.hostname !== window.location.hostname) return false;
  // 检查 __everkm_base_url 路径前缀
  const base: string = (window as any).__everkm_base_url ?? "/";
  const prefix = base.endsWith("/") ? base : base + "/";
  return link.pathname.startsWith(prefix);
}

export { initPageAjax, notifyAnchorNavigate };
