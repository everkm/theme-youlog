export interface AjaxPageFingerprintInput {
  page: string;
  stack?: boolean;
  hasNav?: boolean;
  configValue: (path: string, defaultValue?: any) => any;
}

/**
 * 布局骨架指纹：影响 page-shell DOM 结构的配置
 */
export function buildAjaxLayoutFingerprint(
  input: AjaxPageFingerprintInput,
): string {
  const { page, stack = false, hasNav = false, configValue } = input;
  return [
    `page=${page}`,
    `stack=${stack ? 1 : 0}`,
    `nav=${hasNav ? 1 : 0}`,
    `sidebar_header=${configValue("layout/aisde_no_header", false) ? 0 : 1}`,
    `only_logo=${configValue("layout/only_display_logo", false) ? 1 : 0}`,
    `algolia=${configValue("algolia_search", null) ? 1 : 0}`,
    `header_nav=${configValue("header_nav", null) ? 1 : 0}`,
  ].join("|");
}

export function buildAjaxPageFingerprint(
  input: AjaxPageFingerprintInput,
): string {
  return buildAjaxLayoutFingerprint(input);
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
