// 浏览器端入口（youlog）

import "../assets/css/base.css";
import "../assets/css/youlog.css";
// import "../assets/css/markdown.css";
import "../assets/css/markdown2.css";

import { initToc } from "../youlog_lib/widgets/toc";
import { initNavMenu } from "../youlog_lib/widgets/nav-menu";
import { setupAjaxPageLoad } from "../youlog_lib/widgets/page-ajax/pageAjax";
import { initDrawer } from "../youlog_lib/widgets/drawer";
import { initSidebarResizer } from "../youlog_lib/widgets/resizer";
import { initLazyImg } from "../youlog_lib/widgets/image-lazy";
import { initImgSwipe } from "../youlog_lib/widgets/image-swipe";
import { initSidebarNavTree2 } from "../youlog_lib/widgets/nav-tree";
import { initAppHeader } from "utils/app_header";
import { initKeywordHighlighter } from "youlog_lib/widgets/keyword-highlighter";
import { initPageQrcode } from "youlog_lib/widgets/page-qrcode";
import { initYoulogPrint } from "youlog_lib/widgets/print-page";
import { initTheme } from "layout/theme";
import { initDcardUse } from "youlog_lib/dcard";
import { initPrism } from "youlog_lib/widgets/prism";
import { initKatex } from "youlog_lib/widgets/katex";
import { initHeadingAnchor } from "youlog_lib/widgets/heading_anchor";
import { initFootnoteBackButton } from "youlog_lib/widgets/footnote";

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
      const hash = anchorName || id;
      history.pushState(null, "", `#${hash}`);
    },
  });

  // 初始化导航树
  const sidebarNavTreeContainer = document.getElementById(
    "sidebar-nav-tree",
  ) as HTMLElement | null;
  const breadcrumbEl = document.getElementById(
    "breadcrumb",
  ) as HTMLElement | null;
  if (sidebarNavTreeContainer) {
    initSidebarNavTree2({
      container: sidebarNavTreeContainer,
      breadcrumbRoot: breadcrumbEl ?? undefined,
    });
  }

  initDrawer("sidebar-nav");
  initSidebarResizer("sidebar-nav");
  initLazyImg();
  initNavMenu(document.getElementById("header-nav") as HTMLElement);
  initKeywordHighlighter("#article-main");
  initYoulogPrint();
  initDcardUse("#article-main");
  setupAjaxPageLoad();

  initPrism("#article-main");
  initKatex("#article-main");
  initHeadingAnchor("#article-main");
  initFootnoteBackButton("#article-main");

  // 初始化图片预览
  initImgSwipe("#article-main");

  // 初始化应用头部
  initAppHeader();

  // 初始化页面二维码
  initPageQrcode();

  initTheme();
}

init();
