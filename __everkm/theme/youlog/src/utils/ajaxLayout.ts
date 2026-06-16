import { getConfigValue, getDisplayFlag } from "./index";

export interface AjaxPageFingerprintInput {
  page: string;
  stack?: boolean;
  hasNav?: boolean;
  config: Record<string, any>;
  docMeta?: Record<string, any>;
}

/**
 * 布局骨架指纹：影响 page-shell DOM 结构的配置
 */
export function buildAjaxLayoutFingerprint(
  input: Omit<AjaxPageFingerprintInput, "docMeta">,
): string {
  const { page, stack = false, hasNav = false, config } = input;
  return [
    `page=${page}`,
    `stack=${stack ? 1 : 0}`,
    `nav=${hasNav ? 1 : 0}`,
    `sidebar_header=${getConfigValue(config, "layout.aisde_no_header", false) ? 0 : 1}`,
    `only_logo=${getConfigValue(config, "layout.only_display_logo", false) ? 1 : 0}`,
    `algolia=${getConfigValue(config, "algolia_search") ? 1 : 0}`,
    `header_nav=${getConfigValue(config, "header_nav") ? 1 : 0}`,
  ].join("|");
}

/**
 * 文档级显示开关指纹：影响 page-shell 内条件渲染块
 */
export function buildAjaxDocFingerprint(
  config: Record<string, any>,
  docMeta?: Record<string, any>,
): string {
  return [
    `print=${getDisplayFlag(config, docMeta, "print", true) ? 1 : 0}`,
    `qrcode=${getDisplayFlag(config, docMeta, "page_qrcode", true) ? 1 : 0}`,
  ].join("|");
}

export function buildAjaxPageFingerprint(
  input: AjaxPageFingerprintInput,
): string {
  return `${buildAjaxLayoutFingerprint(input)};${buildAjaxDocFingerprint(input.config, input.docMeta)}`;
}

/**
 * head 资源指纹：变化时需整页刷新以加载不同的 CSS/JS
 */
export function buildAjaxHeadFingerprint(config: Record<string, any>): string {
  const features = config.features || {};
  const codeHighlight = features.code_highlight ?? true;
  const katexFormula = features.katex_formula ?? false;
  const customCss = config.custom_css ? "1" : "0";
  return [
    `code=${codeHighlight ? 1 : 0}`,
    `katex=${katexFormula ? 1 : 0}`,
    `custom_css=${customCss}`,
  ].join("|");
}
