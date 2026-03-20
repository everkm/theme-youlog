import {
  EVENT_PAGE_LOADED,
  EVENT_PAGE_LOAD_BEFORE,
} from "../page-ajax/constants";

const PLACEHOLDER_DEFAULT_WIDTH = 300;
const PLACEHOLDER_DEFAULT_HEIGHT = 180;
const PLACEHOLDER_FONT_RATIO = 0.16;

interface IPlaceHolderContext {
  width?: number;
  height?: number;
  text?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: number;
  dy?: number;
  bgColor?: string;
  textColor?: string;
  dataUri?: boolean;
  charset?: string;
}

function svgPlaceholder(ctx: IPlaceHolderContext) {
  const width = ctx.width || PLACEHOLDER_DEFAULT_WIDTH;
  const height = ctx.height || PLACEHOLDER_DEFAULT_HEIGHT;
  const text = ctx.text || `${width}×${height}`;
  const fontFamily = ctx.fontFamily || "sans-serif";
  const fontWeight = ctx.fontWeight || "bold";
  const fontSize =
    ctx.fontSize ||
    Math.floor(Math.min(width, height) * PLACEHOLDER_FONT_RATIO);
  const dy = ctx.dy || fontSize * 0.35;
  const bgColor = ctx.bgColor || "#ddd";
  const textColor = ctx.textColor || "rgba(0,0,0,0.3)";
  const dataUri = ctx.dataUri ?? true;
  const charset = ctx.charset || "UTF-8";

  const str = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect fill="${bgColor}" width="${width}" height="${height}"/>
        <text fill="${textColor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" x="50%" y="50%" text-anchor="middle">${text}</text>
      </svg>`;

  const cleaned = str
    .replace(/[\t\n\r]/gim, "")
    .replace(/\s\s+/g, " ")
    .replace(/'/gim, "\\i");

  if (dataUri) {
    const encoded = encodeURIComponent(cleaned)
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    return `data:image/svg+xml;charset=${charset},${encoded}`;
  }
  return cleaned;
}

function setupLazyImg(container: HTMLElement, attr = "data-src") {
  const loadImage = function (image: Element) {
    const imgEl = image as HTMLImageElement;
    const src = imgEl.getAttribute(attr);
    if (!src) return;

    // 直接让目标 img 元素去加载图片，避免通过中转 Image 对象导致的二次请求
    imgEl.onload = function () {
      imgEl.removeAttribute(attr);
    };
    imgEl.onerror = function () {
      imgEl.setAttribute(
        "src",
        svgPlaceholder({
          text: "Image loading failed",
          width:
            parseInt(imgEl.getAttribute("width") || "0") ||
            PLACEHOLDER_DEFAULT_WIDTH,
          height:
            parseInt(imgEl.getAttribute("height") || "0") ||
            PLACEHOLDER_DEFAULT_HEIGHT,
        }),
      );
    };

    imgEl.src = src;
  };

  const observer = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (item.isIntersecting) {
        loadImage(item.target);
        observer.unobserve(item.target);
      }
    });
  });

  const imageToLazy = container.querySelectorAll<HTMLImageElement>(
    `img[${attr}]`,
  );
  imageToLazy.forEach(function (image) {
    observer.observe(image);
  });

  return () => {
    observer.disconnect();
  };
}

type TCleanupFn = (() => void) | null;

function initLazyImg(bodySelector: string): TCleanupFn {
  let currentCleanupFn: TCleanupFn = null;

  const article = document.querySelector<HTMLElement>(bodySelector);
  if (article) {
    currentCleanupFn = setupLazyImg(article);
  }

  return currentCleanupFn;
}

function installLazyImg(bodySelector: string) {
  let currentCleanupFn: TCleanupFn = null;

  const cleanup = () => {
    if (currentCleanupFn) {
      currentCleanupFn();
      currentCleanupFn = null;
    }
  };

  const setup = () => {
    cleanup();
    currentCleanupFn = initLazyImg(bodySelector);
  };

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    cleanup();
  });

  document.addEventListener("DOMContentLoaded", () => {
    setup();
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    setup();
  });
}

export { installLazyImg, initLazyImg };
