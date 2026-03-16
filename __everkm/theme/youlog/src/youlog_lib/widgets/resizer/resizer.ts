/**
 * 侧边栏宽度调整器
 * 实现拖动调整侧边栏宽度并持久化保存
 */
export class SidebarResizer {
  private sidebar: HTMLElement | null = null;
  private resizer: HTMLElement | null = null;
  private resizerHandle: HTMLElement | null = null;
  private minWidth: number = 200;
  private maxWidth: number = 600;
  private defaultWidth: number = 288;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private storageKey: string = "sidebar-width";

  constructor(private sidebarId: string) {}

  public setup(): void {
    this.sidebar = document.getElementById(this.sidebarId);
    if (!this.sidebar) return;

    this.createResizer();
    this.addEventListeners();
    this.setupSidebarWidthWithTailwind();
  }

  private setupSidebarWidthWithTailwind(): void {
    if (!this.sidebar) return;
    this.sidebar.classList.add("lg:w-[var(--sidebar-width)]");
  }

  private createResizer(): void {
    if (!this.sidebar) return;

    this.resizer = document.createElement("div");
    this.resizer.className =
      "absolute top-0 right-0 w-5 h-full cursor-ew-resize z-10 transition-opacity hidden lg:block";

    this.resizerHandle = document.createElement("div");
    this.resizerHandle.className =
      "absolute top-0 right-0 w-1 h-full bg-primary-200 dark:bg-primary-700 opacity-0 transition-all duration-200";

    const touchHint = document.createElement("div");
    touchHint.className =
      "absolute top-1/2 right-0 -translate-y-1/2 w-5 h-16 rounded-l-sm opacity-0 transition-opacity duration-200 bg-primary-100 dark:bg-primary-800";

    this.resizer.appendChild(touchHint);
    this.resizer.appendChild(this.resizerHandle);
    this.sidebar.appendChild(this.resizer);
  }

  private addEventListeners(): void {
    if (!this.resizer || !this.sidebar || !this.resizerHandle) return;

    this.resizer.addEventListener("mouseenter", () => this.showHighlight());
    this.resizer.addEventListener("mouseleave", () => {
      if (this.isDragging) return;
      this.hideHighlight();
    });

    this.resizer.addEventListener("mousedown", (e) => {
      this.startDrag(e.clientX);
      document.body.classList.add("select-none");
      document.body.style.cursor = "ew-resize";
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.updateWidth(e.clientX);
    });

    this.resizer.addEventListener("touchstart", (e) => {
      this.startDrag(e.touches[0].clientX);
      e.preventDefault();
    });

    document.addEventListener("touchmove", (e) => {
      if (!this.isDragging) return;
      this.updateWidth(e.touches[0].clientX);
      e.preventDefault();
    });

    document.addEventListener("touchend", () => this.endDrag());

    document.addEventListener("mouseup", () => {
      if (!this.isDragging) return;
      document.body.classList.remove("select-none");
      document.body.style.cursor = "";
      this.endDrag();
      if (this.resizer && !this.resizer.matches(":hover")) {
        this.hideHighlight();
      }
    });
  }

  private showHighlight(): void {
    if (!this.resizerHandle) return;
    this.resizerHandle.classList.add("opacity-100", "bg-brand-primary");
    this.resizerHandle.classList.remove("bg-border", "opacity-0");
  }

  private hideHighlight(): void {
    if (!this.resizerHandle) return;
    this.resizerHandle.classList.remove("opacity-100", "bg-brand-primary");
    this.resizerHandle.classList.add("bg-border", "opacity-0");
  }

  private showTouchHint(): void {
    if (!this.resizer) return;
    const touchHint = this.resizer.querySelector("div:first-child");
    if (touchHint) (touchHint as HTMLElement).classList.add("opacity-30");
  }

  private hideTouchHint(): void {
    if (!this.resizer) return;
    const touchHint = this.resizer.querySelector("div:first-child");
    if (touchHint) (touchHint as HTMLElement).classList.remove("opacity-30");
  }

  private startDrag(clientX: number): void {
    if (!this.sidebar || !this.resizer || !this.resizerHandle) return;
    this.isDragging = true;
    this.startX = clientX;
    this.startWidth = this.sidebar.offsetWidth;
    this.showHighlight();
    this.showTouchHint();
  }

  private updateWidth(clientX: number): void {
    if (!this.sidebar) return;
    const width = this.startWidth + (clientX - this.startX);
    const newWidth = Math.min(Math.max(width, this.minWidth), this.maxWidth);
    document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`);
  }

  private endDrag(): void {
    if (!this.isDragging || !this.sidebar) return;
    this.isDragging = false;
    this.hideHighlight();
    this.hideTouchHint();
    this.saveWidth(this.sidebar.offsetWidth);
  }

  private saveWidth(width: number): void {
    localStorage.setItem(this.storageKey, width.toString());
  }

  public restoreWidth(): void {
    const savedWidth = localStorage.getItem(this.storageKey);
    let validWidth = false;
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width) && width >= this.minWidth && width <= this.maxWidth) {
        document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
        validWidth = true;
      }
    }
    if (!validWidth) this.resetWidth();
  }

  public resetWidth(): void {
    if (!this.sidebar) return;
    document.documentElement.style.setProperty("--sidebar-width", `${this.defaultWidth}px`);
    localStorage.removeItem(this.storageKey);
  }
}

export function initSidebarResizer(sidebarId: string): void {
  const resizer = new SidebarResizer(sidebarId);
  resizer.restoreWidth();
  document.addEventListener("DOMContentLoaded", () => {
    resizer.setup();
  });
}
