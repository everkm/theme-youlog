/**
 * 折叠连续空白符后做 djb2 hash。
 * SSR 生成的 HTML 属性顺序稳定，无需 DOMParser 规范化。
 * 注意：必须始终对同一"形式"的 HTML 比较（统一用原始 SSR innerHTML）。
 */
export function hashHtml(html: string): string {
  const normalized = html.replace(/\s+/g, " ").trim();
  let h = 5381;
  for (let i = 0; i < normalized.length; i++) {
    h = (((h << 5) + h) ^ normalized.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}
