import { EVENT_PAGE_LOADED, EVENT_PAGE_LOAD_BEFORE } from "../../../pageAjax";
import { generate } from "lean-qr";
import { toSvgSource } from "lean-qr/extras/svg";

const QRCODE_SELECTOR = '[data-el="page-qrcode"]';

/**
 * 生成并渲染二维码
 */
function renderQrcode(): void {
  const container = document.querySelector<HTMLElement>(QRCODE_SELECTOR);
  if (!container) {
    console.error("页面二维码容器不存在:", QRCODE_SELECTOR);
    return;
  }

  try {
    let url = window.location.href;

    // 优化为短地址。
    // 判断文件名，如果是以 `xxx-[0-9a-f]{12}(.p\d+)?\.html` 结尾, 可以替换为 /r-{12位十六进制字符}{分页后缀}.html。
    const pathname = window.location.pathname;
    const filename = pathname.split("/").pop() || "";
    const match = filename.match(/^.+?-([0-9a-f]{12})(\..+)?\.html$/);
    if (match) {
      const hexId = match[1]; // 12位十六进制字符
      const pageSuffix = match[2] || ""; // 可选的分页后缀，如 .p1
      const shortPath = `/r-${hexId}${pageSuffix}.html`;
      url = url.replace(pathname, shortPath);
    }

    // 生成二维码
    const qrCode = generate(url);
    const svgString = toSvgSource(qrCode, {
      pad: 2,
      scale: 4,
      width: 108,
      height: 108,
    });

    // 清空容器并插入二维码 SVG
    container.innerHTML = svgString;

    console.log("页面二维码生成成功:", url);
  } catch (error) {
    console.error("生成二维码失败:", error);
    container.innerHTML = "";
  }
}

/**
 * 初始化页面二维码
 */
function initPageQrcode(): void {
  // 在 DOM 加载完成后初始化
  document.addEventListener("DOMContentLoaded", () => {
    renderQrcode();
  });

  // 在页面 AJAX 加载前清空二维码
  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    const container = document.querySelector<HTMLElement>(QRCODE_SELECTOR);
    if (container) {
      container.innerHTML = "";
    }
  });

  // 在页面 AJAX 加载后重新生成二维码
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    renderQrcode();
  });
}

export { initPageQrcode };
