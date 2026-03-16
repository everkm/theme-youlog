function getShortPageUrl() {
  let url = new URL(window.location.href);

  const pathname = window.location.pathname;
  const filename = pathname.split("/").pop() || "";
  const match = filename.match(/^.+?-([0-9a-f]{12})(\..+)?\.html$/);
  if (match) {
    const hexId = match[1];
    const pageSuffix = match[2] || "";
    const shortPath = `/v-${hexId}${pageSuffix}.html`;
    url = new URL(shortPath, window.location.origin);
  }

  return url;
}

export default getShortPageUrl;
