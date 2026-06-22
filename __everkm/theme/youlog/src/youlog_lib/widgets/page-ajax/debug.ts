/**
 * PJAX 调试日志工具（默认关闭，零运行时开销）。
 *
 * 开启方式（无需重新打包，控制台执行后即生效，无需刷新）：
 *   window.__PJAX_DEBUG__ = true
 * 关闭：
 *   window.__PJAX_DEBUG__ = false
 *
 * 用于定位「nav-tree 等受保护 widget 在 PJAX 导航后被意外重建」类问题：
 * 关键决策点（morph 保护、reprocess hash 比对、widget mount/rebuild）都会打日志。
 */

export function pjaxDebugEnabled(): boolean {
  return (window as any).__PJAX_DEBUG__ === true;
}

/** 普通调试日志（带 [pjax] 前缀，仅在开启时输出） */
export function pjaxDebug(message: string, ...args: any[]): void {
  if (!pjaxDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log(`%c[pjax]%c ${message}`, "color:#0a7", "color:inherit", ...args);
}

/** 警告级调试日志（用于「protection 失效」等异常路径，仅在开启时输出） */
export function pjaxWarn(message: string, ...args: any[]): void {
  if (!pjaxDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.warn(`[pjax] ${message}`, ...args);
}

/** 折叠分组开始（与 pjaxGroupEnd 配对） */
export function pjaxGroup(message: string): void {
  if (!pjaxDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.group(`%c[pjax]%c ${message}`, "color:#0a7", "color:inherit");
}

/** 折叠分组结束 */
export function pjaxGroupEnd(): void {
  if (!pjaxDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.groupEnd();
}

/** 与 htmlHash 一致的空白折叠规范化，便于 diff 时与 hash 口径一致 */
function normalizeForDiff(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

/**
 * 打印两段 HTML 的首个差异点附近的上下文，用于定位「为什么 hash 不一致」。
 * 这是排查 reprocess 误触发的关键：能直接看出是相对链接、激活态标记还是其它内容变了。
 * 仅在 debug 开启时执行（含较重的字符串比较，务必保持开关保护）。
 */
export function pjaxLogHtmlDiff(
  label: string,
  oldHtml: string,
  newHtml: string,
): void {
  if (!pjaxDebugEnabled()) return;

  const a = normalizeForDiff(oldHtml);
  const b = normalizeForDiff(newHtml);

  if (a === b) {
    pjaxDebug(`${label}: 规范化后内容相同（hash 差异疑似出现在规范化口径之外）`);
    return;
  }

  // 找到首个不同字符位置
  const min = Math.min(a.length, b.length);
  let i = 0;
  while (i < min && a[i] === b[i]) i++;

  const ctx = 100;
  const from = Math.max(0, i - ctx);
  const to = i + ctx;

  pjaxGroup(
    `${label}: 内容不同（首个差异 @ index ${i}，长度 old=${a.length} new=${b.length}）`,
  );
  // eslint-disable-next-line no-console
  console.log("公共前缀 …", JSON.stringify(a.slice(from, i)));
  // eslint-disable-next-line no-console
  console.log("OLD 差异处 →", JSON.stringify(a.slice(i, to)));
  // eslint-disable-next-line no-console
  console.log("NEW 差异处 →", JSON.stringify(b.slice(i, to)));
  pjaxGroupEnd();
}
