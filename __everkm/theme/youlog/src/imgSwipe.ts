import { EVENT_PAGE_LOAD_BEFORE, EVENT_PAGE_LOADED } from "pageAjax";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
// import PhotoSwipe from "photoswipe";

let currentCleanupFn: (() => void) | null = null;
let lightbox: PhotoSwipeLightbox | null = null;

const IMG_BOX_SELECTOR = "#article-main";

interface IImgSwipeItem {
  width: number;
  height: number;
  src: string;
}

function setup() {
  if (currentCleanupFn) {
    currentCleanupFn();
    currentCleanupFn = null;
  }

  const box = document.querySelector<HTMLElement>(IMG_BOX_SELECTOR);
  if (!box) {
    return;
  }

  const images = box.querySelectorAll<HTMLImageElement>("img");
  if (images.length === 0) {
    return;
  }

  const imgList: IImgSwipeItem[] = [];
  images.forEach((image) => {
    const width = parseInt(image.getAttribute("width") || "0") || 0;
    const height = parseInt(image.getAttribute("height") || "0") || 0;
    const src = image.getAttribute("src") || "";

    if (width > 0 && height > 0 && src) {
      imgList.push({
        width,
        height,
        src,
      });
      image.setAttribute("data-pswp-index", (imgList.length - 1).toString());
    }
  });

  lightbox = new PhotoSwipeLightbox({
    dataSource: imgList,
    pswpModule: () => import("photoswipe"),
  });
  lightbox.init();

  currentCleanupFn = () => {
    lightbox?.destroy();
    lightbox = null;
  };
}

function imageClickHandleAgent() {
  const box = document.querySelector<HTMLElement>(IMG_BOX_SELECTOR);
  if (!box) {
    return;
  }

  box.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "IMG") {
      const index = parseInt(target.getAttribute("data-pswp-index") || "-1");
      if (index === -1) {
        return;
      }

      lightbox?.loadAndOpen(index);
    }
  });
}

function initImgSwipe() {
  document.addEventListener("DOMContentLoaded", () => {
    setup();
    imageClickHandleAgent();
  });
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    setup();
  });
  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    if (currentCleanupFn) {
      currentCleanupFn();
      currentCleanupFn = null;
    }
  });
}

export { initImgSwipe };
