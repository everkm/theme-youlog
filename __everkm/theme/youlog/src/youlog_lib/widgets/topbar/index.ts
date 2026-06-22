import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

const DEFAULT_TOPBAR_HEIGHT = 0;

function getTopbarHeight(selector: string): number {
  const topbar = document.querySelector<HTMLElement>(selector);
  return topbar?.offsetHeight ?? DEFAULT_TOPBAR_HEIGHT;
}

function setTopbarHeightVar(height: number): void {
  document.documentElement.style.setProperty("--topbar-height", `${height}px`);
}

/**
 * 监听 topbar 高度并同步到 CSS 变量 --topbar-height
 */
function initTopbarHeightWatcher(selector: string): () => void {
  const target = document.querySelector<HTMLElement>(selector);
  const update = () => {
    setTopbarHeightVar(getTopbarHeight(selector));
  };

  update();

  let resizeObserver: ResizeObserver | undefined;
  if (target && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(target);
  }

  window.addEventListener("resize", update);

  return () => {
    resizeObserver?.disconnect();
    window.removeEventListener("resize", update);
  };
}

function installTopbarHeightWatcher(selector = "header"): void {
  let cleanup: (() => void) | undefined;

  const mount = () => {
    cleanup?.();
    cleanup = initTopbarHeightWatcher(selector);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  document.addEventListener(EVENT_PAGE_LOADED, mount);
}

export { installTopbarHeightWatcher, initTopbarHeightWatcher };
export {
  createTopbarInset,
  createScrollContainerHeaderInset,
} from "./topbarInset";
export type { TopbarInsetOptions } from "./topbarInset";
