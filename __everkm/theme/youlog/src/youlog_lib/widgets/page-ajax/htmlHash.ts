/**
 * 计算 HTML 片段的内容指纹（djb2），用于判断受保护 widget 容器的 SSR 内容是否变化。
 *
 * ⚠️ 关键：SSR（everkm）输出的元素**属性顺序并不稳定**（如 `<img width height>` 与
 * `<img height width>` 在不同页面/不同次渲染间会调换，疑似 Rust 端 HashMap 迭代顺序随机）。
 * 若直接对原始字符串求 hash，这类「伪差异」会被误判为内容变化，导致 nav-tree 等被无谓重建
 * （表现为点击后侧栏先折叠再展开）。
 *
 * 因此先把 HTML 规范化为「标签小写 + 属性按名排序 + 空白折叠」的标准形式，
 * 使 hash 对属性顺序、空白与序列化来源（live DOM vs DOMParser）都不敏感，只反映**结构与内容**。
 */

/** djb2 字符串 hash */
function djb2(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (((h << 5) + h) ^ input.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;

/** 递归输出规范化片段：属性按名排序，消除属性顺序不稳定带来的伪差异 */
function serializeCanonical(node: Node, out: string[]): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === NODE_TYPE_ELEMENT) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      out.push("<", tag);
      const attrs = Array.from(el.attributes)
        .map((a) => `${a.name}="${a.value}"`)
        .sort();
      for (const a of attrs) {
        out.push(" ", a);
      }
      out.push(">");
      serializeCanonical(el, out);
      out.push("</", tag, ">");
    } else if (child.nodeType === NODE_TYPE_TEXT) {
      out.push(child.nodeValue ?? "");
    }
    // 注释 / 其它节点类型对内容判定无意义，忽略
  }
}

/**
 * 规范化 HTML：标签小写 + 属性按名排序 + 空白折叠。
 * 无 DOM 环境（理论上不会发生，浏览器/测试均有 document）降级为仅空白折叠。
 */
function canonicalizeHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/\s+/g, " ").trim();
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const out: string[] = [];
  serializeCanonical(tpl.content, out);
  return out.join("").replace(/\s+/g, " ").trim();
}

/**
 * 对 HTML 片段做规范化后求 hash。
 * 注意：比较双方必须都经过本函数（同一规范化口径），故内部统一规范化即可保证一致。
 */
export function hashHtml(html: string): string {
  return djb2(canonicalizeHtml(html));
}
