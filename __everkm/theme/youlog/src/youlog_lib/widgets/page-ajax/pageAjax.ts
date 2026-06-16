import ky from "ky";
import { Idiomorph } from "idiomorph";
import "./nprogress_custom.css";
import nProgress from "nprogress";
import {
  EVENT_PAGE_NAVIGATE,
  EVENT_PAGE_LOADED,
  EVENT_PAGE_LOAD_BEFORE,
  PAGE_LOADING_CLASS,
  EVENT_PAGE_UPDATE_BEFORE,
  PAGE_SHELL_SELECTOR,
  PAGE_SHELL_ATTR,
  PAGE_HEAD_ATTR,
} from "./constants";

let lastFullUrl: string | null = null;

export interface PjaxOptions {
  /** 导航完成后滚动到顶部的滚动容器 CSS 选择器 */
  scrollContainerSelector?: string;
}

export type RequiredPjaxOptions = Required<PjaxOptions>;

type PageUpdateMode = "elements" | "shell" | "reload";

function getMergedOptions(opts: PjaxOptions): RequiredPjaxOptions {
  return {
    scrollContainerSelector: opts.scrollContainerSelector ?? "#body-main",
  };
}

function getCurrentFullUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return (
    window.location.pathname + window.location.search + window.location.hash
  );
}

function setupPageLoading() {
  nProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    speed: 200,
    trickleSpeed: 100,
  });
}

function getHeadFingerprint(doc: Document): string | null {
  return doc.documentElement.getAttribute(PAGE_HEAD_ATTR);
}

function getShellElement(doc: Document): Element | null {
  return doc.querySelector(PAGE_SHELL_SELECTOR);
}

function getShellFingerprint(shell: Element | null): string | null {
  return shell?.getAttribute(PAGE_SHELL_ATTR) ?? null;
}

function resolveUpdateMode(doc: Document): PageUpdateMode {
  const currentHead = getHeadFingerprint(document);
  const nextHead = getHeadFingerprint(doc);
  if (currentHead && nextHead && currentHead !== nextHead) {
    return "reload";
  }

  const currentShell = getShellElement(document);
  const nextShell = getShellElement(doc);
  if (!currentShell || !nextShell) {
    return "elements";
  }

  const currentLayout = getShellFingerprint(currentShell);
  const nextLayout = getShellFingerprint(nextShell);
  if (currentLayout === nextLayout) {
    return "elements";
  }

  return "shell";
}

function syncElementsByDataAttribute(doc: Document) {
  const currentElements = document.querySelectorAll("[data-ajax-element]");

  currentElements.forEach((currentElement) => {
    const elementId = currentElement.getAttribute("data-ajax-element");
    if (!elementId) {
      console.warn("元素缺少 data-ajax-element 值:", currentElement);
      return;
    }

    const nextElement = doc.querySelector(
      `[data-ajax-element="${elementId}"]`,
    );

    if (nextElement) {
      currentElement.innerHTML = nextElement.innerHTML;
    } else {
      currentElement.innerHTML = "";
    }
  });
}

function syncPageTitle(doc: Document) {
  const nextTitle = doc.querySelector('[data-ajax-element="title"]');
  if (!nextTitle?.textContent) return;

  document.title = nextTitle.textContent;
  const currentTitle = document.querySelector('[data-ajax-element="title"]');
  if (currentTitle) {
    currentTitle.textContent = nextTitle.textContent;
  }
}

function morphPageShell(doc: Document) {
  const currentShell = getShellElement(document);
  const nextShell = getShellElement(doc);
  if (!currentShell || !nextShell) return;

  Idiomorph.morph(currentShell, nextShell);
}

function scrollToTop(opts: RequiredPjaxOptions) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      document
        .querySelector(opts.scrollContainerSelector)
        ?.scrollTo({ top: 0, behavior: "smooth" });
    }, 30);
  });
}

async function applyPageUpdate(
  doc: Document,
  mode: PageUpdateMode,
  opts: RequiredPjaxOptions,
): Promise<boolean> {
  if (mode === "reload") {
    return false;
  }

  document.dispatchEvent(
    new CustomEvent(EVENT_PAGE_UPDATE_BEFORE, {
      bubbles: true,
      composed: true,
    }),
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      if (mode === "shell") {
        morphPageShell(doc);
      } else {
        syncElementsByDataAttribute(doc);
      }
      syncPageTitle(doc);
      resolve();
    });
  });

  scrollToTop(opts);
  return true;
}

async function loadPageContent(
  url: string,
  opts: RequiredPjaxOptions,
): Promise<boolean> {
  try {
    document.body.classList.add(PAGE_LOADING_CLASS);
    nProgress.start();

    const response = await ky.get(url).text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const mode = resolveUpdateMode(doc);

    return await applyPageUpdate(doc, mode, opts);
  } catch (error) {
    console.error("加载页面失败:", error);
    return false;
  } finally {
    nProgress.done();
    document.body.classList.remove(PAGE_LOADING_CLASS);
  }
}

function isOnlyHashChange(oldUrl: string, newUrl: string): boolean {
  const stripHash = (url: string) => url.split("#")[0];
  return stripHash(oldUrl) === stripHash(newUrl);
}

function dispatchPageLoaded(url: string) {
  document.dispatchEvent(
    new CustomEvent(EVENT_PAGE_LOADED, {
      detail: { url },
      bubbles: true,
      composed: true,
    }),
  );
}

async function handleNavigation(
  url: string,
  opts: RequiredPjaxOptions,
): Promise<void> {
  try {
    if (lastFullUrl && isOnlyHashChange(lastFullUrl, url)) {
      lastFullUrl = url;
      window.history.pushState(null, document.title, url);
      return;
    }

    document.dispatchEvent(
      new CustomEvent(EVENT_PAGE_LOAD_BEFORE, { detail: { url } }),
    );

    const success = await loadPageContent(url, opts);
    if (success) {
      lastFullUrl = url;
      window.history.pushState(null, document.title, url);
      requestAnimationFrame(() => {
        dispatchPageLoaded(url);
      });
    } else {
      window.location.href = url;
    }
  } catch (error) {
    console.error("页面导航处理错误:", error);
    window.location.href = url;
  }
}

async function handlePopState(opts: RequiredPjaxOptions): Promise<void> {
  try {
    const currentUrl = getCurrentFullUrl();

    if (lastFullUrl && isOnlyHashChange(lastFullUrl, currentUrl)) {
      lastFullUrl = currentUrl;
      return;
    }

    const success = await loadPageContent(currentUrl, opts);
    if (success) {
      dispatchPageLoaded(currentUrl);
      lastFullUrl = currentUrl;
    } else {
      window.location.reload();
    }
  } catch (error) {
    console.error("历史记录导航错误:", error);
    window.location.reload();
  }
}

function shouldHandleLink(element: HTMLElement | null): boolean {
  if (!element || element.tagName !== "A") return false;

  let href = (element as HTMLAnchorElement).getAttribute("href") || "";
  if (href.startsWith("javascript:")) {
    return false;
  }

  if (href.length === 0) {
    return true;
  }

  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return false;
  }

  const hrefFull = new URL(href, window.location.href);

  if (href.startsWith("http:") || href.startsWith("https:")) {
    const currentOrigin = window.location.origin;
    if (currentOrigin !== hrefFull.origin) {
      return false;
    }
  }

  href = hrefFull.pathname;

  let capturePrefix = (window as any).__everkm_base_url || "/";
  if (!capturePrefix.endsWith("/")) {
    capturePrefix = capturePrefix + "/";
  }

  const isBeginWithBaseUrl = href.startsWith(capturePrefix);
  if (!isBeginWithBaseUrl) {
    return false;
  }

  return isBeginWithBaseUrl;
}

function installAjaxPageLoad(opts: PjaxOptions) {
  const mergedOpts = getMergedOptions(opts);
  setupPageLoading();

  lastFullUrl = getCurrentFullUrl();

  document.addEventListener(
    "click",
    (event) => {
      const path = event.composedPath() as HTMLElement[];
      const linkElement = path.find(
        (el) => el instanceof HTMLElement && el.tagName === "A",
      ) as HTMLAnchorElement | undefined;

      if (!linkElement) return;
      if (linkElement.hasAttribute("data-no-ajax")) return;

      if (shouldHandleLink(linkElement)) {
        event.preventDefault();
        const href = linkElement.getAttribute("href") as string;
        handleNavigation(href, mergedOpts);
      }
    },
    { capture: true, passive: false },
  );

  window.addEventListener("popstate", () => {
    handlePopState(mergedOpts);
  });

  window.addEventListener(EVENT_PAGE_NAVIGATE, (event: Event) => {
    const customEvent = event as CustomEvent<{ url: string }>;
    handleNavigation(customEvent.detail.url, mergedOpts);
  });
}

export { installAjaxPageLoad };
