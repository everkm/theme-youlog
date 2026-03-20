import {
  EVENT_PAGE_LOAD_BEFORE,
  EVENT_PAGE_LOADED,
} from "../page-ajax/constants";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

type CleanupFunction = (() => void) | null;

interface IImgSwipeItem {
  width: number;
  height: number;
  src: string;
}

function initImgSwipe(selector: string): CleanupFunction {
  const box = document.querySelector<HTMLElement>(selector);
  if (!box) return null;

  const images = box.querySelectorAll<HTMLImageElement>("img");
  if (images.length === 0) return null;

  const imgList: IImgSwipeItem[] = [];
  images.forEach((image) => {
    const width = parseInt(image.getAttribute("width") || "0") || 0;
    const height = parseInt(image.getAttribute("height") || "0") || 0;
    const src = image.getAttribute("src") || "";

    if (width > 0 && height > 0 && src) {
      imgList.push({ width, height, src });
      image.setAttribute("data-pswp-index", (imgList.length - 1).toString());
    }
  });

  if (imgList.length === 0) return null;

  const lightbox = new PhotoSwipeLightbox({
    dataSource: imgList,
    pswpModule: () => import("photoswipe"),
  });
  lightbox.init();

  const clickHandler = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    const index = parseInt(target.getAttribute("data-pswp-index") || "-1");
    if (index === -1) return;
    lightbox.loadAndOpen(index);
  };

  box.addEventListener("click", clickHandler);

  return () => {
    box.removeEventListener("click", clickHandler);
    lightbox?.destroy();
  };
}

function installImgSwipe(bodySelector: string): void {
  let currentCleanupFn: CleanupFunction = null;

  const cleanup = () => {
    if (currentCleanupFn) {
      currentCleanupFn();
      currentCleanupFn = null;
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    currentCleanupFn = initImgSwipe(bodySelector);
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    cleanup();
    currentCleanupFn = initImgSwipe(bodySelector);
  });

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    cleanup();
  });
}

export { initImgSwipe, installImgSwipe };
