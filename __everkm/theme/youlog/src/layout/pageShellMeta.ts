/**
 * page-shell 布局 meta 同步（主题专用，不随 youlog_lib 复制）。
 *
 * PJAX morph 后 idiomorph 会同步 SSR 输出的 data-*；此处作为换页后的客户端校正，
 * 按正文是否含 heading 更新 data-has-headings，驱动小屏 scroll-padding fallback。
 */

export function syncPageShellHasHeadings(
  articleSelector: string,
  headingSelector: string,
): void {
  const shell = document.getElementById("page-shell");
  if (!shell) {
    return;
  }

  const article = document.querySelector<HTMLElement>(articleSelector);
  const hasHeadings = !!article?.querySelector(headingSelector);

  if (hasHeadings) {
    shell.setAttribute("data-has-headings", "1");
  } else {
    shell.removeAttribute("data-has-headings");
  }
}
