// youlog_lib core 层
// 与 everkm/doc-book 协议相关的适配与类型工具、i18n、pageUrl、scrollAnchor、youlogRegister 等

export { useTranslate } from "./i18n";
export { default as getShortPageUrl } from "./pageUrl";
export { default as youlogRegister } from "./youlogRegister";
export {
  chooseScrollBehavior,
  computeScrollTopForElement,
  getAnchorScrollOffset,
  getHashFromUrl,
  getScrollTop,
  parseTopbarHeight,
  resolveAnchorTarget,
  resolveScrollContainer,
  scrollContainerToTop,
  scrollToElement,
  scrollToHash,
  type ScrollContainer,
  type ScrollToAnchorOptions,
} from "./scrollAnchor";
export type { AnchorInsetContributor } from "./anchorInset";
export { nextFrame, waitForDomContentLoaded, waitForLayoutCondition } from "./anchorInset";
export {
  createAnchorScrollService,
  type AnchorScrollService,
  type AnchorScrollServiceOptions,
  type AnchorScrollSource,
  type ScrollToHashRequest,
} from "./anchorScrollService";

