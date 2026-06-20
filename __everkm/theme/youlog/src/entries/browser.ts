// 浏览器端入口（youlog）

import "../assets/css/base.css";
import "../assets/css/youlog.css";
// import "../assets/css/markdown.css";
import "../assets/css/markdown2.css";

import { installToc } from "../youlog_lib/widgets/toc";
import { installNavMenu } from "../youlog_lib/widgets/nav-menu";
import { initPageAjax, notifyAnchorNavigate } from "../youlog_lib/widgets/page-ajax";
import { initDrawer } from "../youlog_lib/widgets/drawer";
import { initSidebarResizer } from "../youlog_lib/widgets/resizer";
import { installLazyImg } from "../youlog_lib/widgets/image-lazy";
import { installImgSwipe } from "../youlog_lib/widgets/image-swipe/imgSwipe";
import { installSidebarNavTree2 } from "../youlog_lib/widgets/nav-tree";
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
import { installTopbarHeightWatcher } from "youlog_lib/widgets/topbar";

function install() {
  installTopbarHeightWatcher("header");
  installToc({
    tocSelector: "#toc",
    articleSelector: "#article-main",
    headingSelector: "h1, h2, h3, h4",
    headerSelector: "header",
    offset: 10,
    highlightParents: false,
    title: "目录",
    enableMobileToc: true,
    scrollContainerSelector: "#body-main",
    onAfterGoto: (id: string, anchorName?: string) => {
      const hash = anchorName || id;
      if (hash.length) {
        history.pushState(null, "", `#${hash}`);
        notifyAnchorNavigate();
      } else {
        history.pushState(null, "", window.location.pathname);
      }
    },
  });

  // 初始化导航树（侧栏可能随 AJAX 导航动态出现）
  installSidebarNavTree2();

  initDrawer("sidebar-nav");
  initSidebarResizer("sidebar-nav");
  installLazyImg("#article-main");
  installNavMenu({
    mobileMenuContainerSelector: "#mobile-menu-container",
  });
  installKeywordHighlighter("#article-main");
  installYoulogPrint();
  installDcardUse("#article-main");
  initPageAjax({ scrollContainerSelector: "#body-main" });
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

install();
