function getShortPageUrl() {
  let url = new URL(window.location.href);

  // 优化为短地址。
  // 判断文件名，如果是以 `xxx-[0-9a-f]{12}(.p\d+)?\.html` 结尾, 可以替换为 /r-{12位十六进制字符}{分页后缀}.html。
  const pathname = window.location.pathname;
  const filename = pathname.split("/").pop() || "";
  const match = filename.match(/^.+?-([0-9a-f]{12})(\..+)?\.html$/);
  if (match) {
    const hexId = match[1]; // 12位十六进制字符
    const pageSuffix = match[2] || ""; // 可选的分页后缀，如 .p1
    const shortPath = `/view-${hexId}${pageSuffix}.html`;
    url = new URL(shortPath, window.location.origin);
  }

  return url;
}

export default getShortPageUrl;
