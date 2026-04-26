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

export { initTopbarHeightWatcher };
