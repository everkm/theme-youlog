// 浏览器端入口（youlog）

import "../assets/css/base.css";
import "../assets/css/youlog.css";
// import "../assets/css/markdown.css";
import "../assets/css/markdown2.css";

import { installToc } from "../youlog_lib/widgets/toc";
import { initNavMenu } from "../youlog_lib/widgets/nav-menu";
import { installAjaxPageLoad } from "../youlog_lib/widgets/page-ajax/pageAjax";
import { initDrawer } from "../youlog_lib/widgets/drawer";
import { initSidebarResizer } from "../youlog_lib/widgets/resizer";
import { installLazyImg } from "../youlog_lib/widgets/image-lazy";
import { installImgSwipe } from "../youlog_lib/widgets/image-swipe/imgSwipe";
import { initSidebarNavTree2 } from "../youlog_lib/widgets/nav-tree";
import { installAppHeader } from "utils/app_header";
import { installKeywordHighlighter } from "youlog_lib/widgets/keyword-highlighter";
import { installPageQrcode } from "youlog_lib/widgets/page-qrcode";
import { installYoulogPrint } from "youlog_lib/widgets/print-page";
import { installTheme } from "layout/theme";
import { installDcardUse } from "youlog_lib/dcard";
import { installPrism } from "youlog_lib/widgets/prism";
import { installKatex } from "youlog_lib/widgets/katex";
import { installHeadingAnchor } from "youlog_lib/widgets/heading_anchor";
import { installFootnoteBackButton } from "youlog_lib/widgets/footnote";

function init() {
  const bodyMain = document.getElementById("body-main") as HTMLElement;
  if (bodyMain) {
    installToc({
      tocSelector: "#toc",
      articleSelector: "#article-main",
      headingSelector: "h1, h2, h3, h4",
      headerSelector: "header",
      offset: 10,
      highlightParents: true,
      title: "目录",
      enableMobileToc: true,
      scrollContainerSelector: "#body-main",
      onAfterGoto: (id: string, anchorName?: string) => {
        const hash = anchorName || id;
        history.pushState(null, "", `#${hash}`);
      },
    });
  }

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
  installLazyImg("#article-main");
  initNavMenu(document.getElementById("header-nav") as HTMLElement);
  installKeywordHighlighter("#article-main");
  installYoulogPrint();
  installDcardUse("#article-main");
  installAjaxPageLoad({ scrollContainerSelector: "#body-main" });
  installHeadingAnchor("#article-main");
  installFootnoteBackButton("#article-main");

  if ((window as any).__everkm_features_code_highlight) {
    installPrism("#article-main");
  }
  if ((window as any).__everkm_features_katex_formula) {
    installKatex("#article-main");
  }

  // 初始化图片预览
  installImgSwipe("#article-main");

  // 初始化应用头部
  installAppHeader();

  // 初始化页面二维码
  installPageQrcode();

  installTheme();
}

init();
