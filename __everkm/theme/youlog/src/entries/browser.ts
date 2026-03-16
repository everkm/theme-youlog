// 浏览器端入口（youlog）

import "../assets/css/base.css";
import "../assets/css/youlog.css";
import "../assets/css/markdown.css";

import { initToc } from "../youlog_lib/widgets/toc";
import { initLeftDrawer } from "../utils/left_drawer";
import { convertLinkWithCurrentLocation } from "utils/nav_menu_transform";
import { initNavMenu } from "../youlog_lib/widgets/nav-menu";
import { setupAjaxPageLoad } from "../youlog_lib/widgets/page-ajax/pageAjax";
import { initDrawer } from "../youlog_lib/widgets/drawer";
import { initSidebarResizer } from "../youlog_lib/widgets/resizer";
import { initLazyImg } from "../youlog_lib/widgets/image-lazy";
import { initImgSwipe } from "../youlog_lib/widgets/image-swipe";
import { initSidebarNavTree2 } from "../youlog_lib/widgets/nav-tree";
import { initAppHeader } from "layout/appHeader";
import { initKeywordHighlighter } from "youlog_lib/widgets/keyword-highlighter";
import { initPageQrcode } from "youlog_lib/widgets/page-qrcode";
import { initYoulogPrint } from "youlog_lib/widgets/print-page";
import { initTheme } from "layout/theme";
import { initDcardUse } from "youlog_lib/dcard";

function init() {
  initToc({
    tocSelector: "#toc",
    articleSelector: "#article-main",
    headingSelector: "h1, h2, h3, h4",
    headerSelector: "header",
    offset: 10,
    highlightParents: true,
    title: "目录",
    enableMobileToc: true,
    scrollContainer: document.getElementById("body-main") || undefined,
    onAfterGoto: (id: string, anchorName?: string) => {
      location.hash = anchorName || id;
    },
  });

  initSidebarNavTree2();
  initDrawer("sidebar-nav");
  initSidebarResizer("sidebar-nav");
  initLazyImg();

  // 初始化应用头部
  initAppHeader();

  // 初始化关键词高亮
  initKeywordHighlighter("#article-main");

  // 初始化页面二维码
  initPageQrcode();

  // 初始化图片预览
  initImgSwipe();

  initYoulogPrint();

  initTheme();

  initDcardUse();

  setupAjaxPageLoad();

  // const primaryNav = document.getElementById("primary-nav");
  // if (primaryNav) {
  //   initNavMenu(primaryNav as HTMLElement, convertLinkWithCurrentLocation);
  // }
}

init();
