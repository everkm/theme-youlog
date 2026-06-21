/**
 * 侧边栏抽屉组件逻辑
 */
import { createEffect, createSignal } from "solid-js";
import { EVENT_PAGE_LOADED } from "../page-ajax/constants";
import { createBreakpoints } from "@solid-primitives/media";

const breakpoints = {
  sm: "640px",
  lg: "1024px",
  xl: "1280px",
};

export class Drawer {
  private id: string;
  private drawerState = createSignal(false);
  private get isDrawerOpen() {
    return this.drawerState[0]();
  }
  private setDrawerState(value: boolean) {
    this.drawerState[1](value);
  }
  private sidebar: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private logoTitle: HTMLElement | null = null;
  private repeatSiteName: HTMLElement | null = null;
  private clickHandler: ((e: Event) => void) | null = null;
  private listenersBound = false;

  private breakpoints = createBreakpoints(breakpoints);

  constructor(id: string) {
    this.id = id;
  }

  public setup(): void {
    this.initElements();
    this.bindEventListeners();

    createEffect(() => {
      if (this.logoTitle && this.repeatSiteName) {
        if (this.breakpoints.lg && !this.isDrawerOpen) {
          this.repeatSiteName.classList.add("hidden-repeat-site-name");
        } else {
          this.repeatSiteName.classList.remove("hidden-repeat-site-name");
        }
      }
    });
  }

  private initElements(): void {
    this.sidebar = document.getElementById(this.id);

    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.className =
        "fixed inset-0 bg-gray-500 bg-opacity-75 z-40 lg:hidden transition-opacity hidden";
      document.body.appendChild(this.overlay);
      this.overlay.addEventListener("click", () => this.close());
    }

    this.logoTitle = this.sidebar?.querySelector("[data-logo] span") || null;
    this.repeatSiteName = document.querySelector("h1[data-app-name]") || null;
  }

  private bindEventListeners(): void {
    if (!this.listenersBound) {
      this.clickHandler = (e: Event) => {
        const target = (e.target as Element | null)?.closest(
          `[data-drawer-toggle="${this.id}"], [data-drawer-close="${this.id}"]`,
        );
        if (!target) return;
        e.preventDefault();
        if (target.matches(`[data-drawer-toggle="${this.id}"]`)) {
          this.toggle();
        } else {
          this.close();
        }
      };
      document.addEventListener("click", this.clickHandler);

      window.addEventListener("resize", () => {
        if (this.isDrawerOpen) this.close();
        else this.setDrawerState(false);
      });

      document.addEventListener(EVENT_PAGE_LOADED, () => {
        this.initElements();
        if (window.innerWidth < 1024 && this.isDrawerOpen) {
          this.close();
        }
      });

      this.listenersBound = true;
    }
  }

  public toggle(): void {
    if (this.isDrawerOpen) this.close();
    else this.open();
  }

  public open(): void {
    if (this.sidebar) {
      this.showSidebar();
      if (window.innerWidth < 1024) this.showOverlay();
      this.setDrawerState(true);
    }
  }

  public close(): void {
    if (this.sidebar && window.innerWidth < 1024) {
      this.hideSidebar();
      this.hideOverlay();
      this.setDrawerState(false);
    }
  }

  private showSidebar(): void {
    if (this.sidebar) {
      this.sidebar.setAttribute("data-drawer-open", "");
      this.sidebar.classList.remove("-translate-x-full");
      this.sidebar.classList.add("translate-x-0");
    }
  }

  private hideSidebar(): void {
    if (this.sidebar) {
      this.sidebar.removeAttribute("data-drawer-open");
      this.sidebar.classList.remove("translate-x-0");
      this.sidebar.classList.add("-translate-x-full");
    }
  }

  private showOverlay(): void {
    if (this.overlay) this.overlay.classList.remove("hidden");
  }

  private hideOverlay(): void {
    if (this.overlay) this.overlay.classList.add("hidden");
  }
}

export function initDrawer(id: string): void {
  const drawer = new Drawer(id);
  const runSetup = () => drawer.setup();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSetup, { once: true });
  } else {
    runSetup();
  }
}
