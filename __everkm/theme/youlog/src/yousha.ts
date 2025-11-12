function youshaCommentPostUrl() {
  const u = new URL(window.location.href);

  // 获取 origin + pathname
  let pathname = u.pathname;

  // 如果最后以 .p[\d+].html 结尾，则替换为 .html
  pathname = pathname.replace(/\.p\d+\.html$/, ".html");

  // 如果路径以 /index.html 结尾，则替换为空
  if (pathname.endsWith("/index.html")) {
    pathname = pathname.replace("/index.html", "/");
  }

  return u.origin + pathname;
}

function youshaCommentOwnerUrl() {
  let postUrl = youshaCommentPostUrl();
  const u = new URL(postUrl);

  let pathname = u.pathname;

  // 如果路径以特殊ID结尾（格式：/任意内容-{12位十六进制字符}.html），转换为 /view-{ID}.html
  const idMatch = pathname.match(/^\/.+-([0-9a-f]{12})\.html$/);
  if (idMatch) {
    pathname = `/view-${idMatch[1]}.html`;
  }

  return u.origin + pathname;
}

(window as any).youshaCommentPostUrl = youshaCommentPostUrl;
(window as any).youshaCommentOwnerUrl = youshaCommentOwnerUrl;
