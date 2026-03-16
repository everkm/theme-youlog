import {
  EVENT_PAGE_LOADED,
  EVENT_PAGE_LOAD_BEFORE,
} from "../page-ajax/constants";

export interface IPlaceHolderContext {
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

export function svgPlaceholder(ctx: IPlaceHolderContext) {
  const width = ctx.width || 300;
  const height = ctx.height || 200;
  const text = ctx.text || `${width}×${height}`;
  const fontFamily = ctx.fontFamily || "sans-serif";
  const fontWeight = ctx.fontWeight || "bold";
  const fontSize = ctx.fontSize || Math.floor(Math.min(width, height) * 0.1);
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

export function setupLazyImg(container: HTMLElement, attr = "data-src") {
  const observer = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (item.isIntersecting) {
        loadImage(item.target);
        observer.unobserve(item.target);
      }
    });
  });

  const loadImage = function (image: Element) {
    const img = new Image();
    img.onload = function () {
      image.setAttribute("src", img.src);
      image.removeAttribute(attr);
    };
    img.onerror = function () {
      image.setAttribute(
        "src",
        svgPlaceholder({
          text: "图片加载失败",
          width: parseInt(image.getAttribute("width") || "0") || 300,
          height: parseInt(image.getAttribute("height") || "0") || 200,
        }),
      );
    };
    const src = image.getAttribute(attr);
    if (src) {
      img.src = src;
    }
  };

  const imageToLazy = container.querySelectorAll<HTMLImageElement>(`img[${attr}]`);
  imageToLazy.forEach(function (image) {
    observer.observe(image);
  });

  return () => {
    observer.disconnect();
  };
}

export function initLazyImg() {
  let currentCleanupFn: (() => void) | null = null;

  const setup = () => {
    if (currentCleanupFn) {
      currentCleanupFn();
      currentCleanupFn = null;
    }

    const article = document.querySelector<HTMLElement>("article");
    if (article) {
      currentCleanupFn = setupLazyImg(article);
    }
  };

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    if (currentCleanupFn) {
      currentCleanupFn();
      currentCleanupFn = null;
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    setup();
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    setup();
  });
}
