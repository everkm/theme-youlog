/**
 * Prefetch 缓存：hover 预取页面 HTML，导航命中时省去一次请求。
 *
 * 缓存解析后的 Document 较重，因此：
 * - 限容（MAX_ENTRIES）+ LRU 淘汰，防长会话内存无界增长
 * - 过期清理（TTL）
 * - 并发去重（inFlight），同一 URL 在途时复用同一 Promise
 *
 * 模块说明见同目录 `index.ts`。
 */
interface CacheEntry {
  doc: Document;
  fetchedAt: number;
}

const TTL = 30_000;
const MAX_ENTRIES = 8;
const cache = new Map<string, CacheEntry>(); // Map 保留插入顺序，可当 LRU 用
const inFlight = new Map<string, Promise<Document>>();

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function isFresh(entry: CacheEntry | undefined): entry is CacheEntry {
  return !!entry && Date.now() - entry.fetchedAt < TTL;
}

function store(url: string, doc: Document): void {
  cache.set(url, { doc, fetchedAt: Date.now() });
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** 实际请求 + 并发去重：同一 URL 在途时复用同一 Promise */
function request(url: string): Promise<Document> {
  const existing = inFlight.get(url);
  if (existing) return existing;
  const p = fetch(url, { credentials: "same-origin" })
    .then((r) => r.text())
    .then(parseHtml)
    .finally(() => inFlight.delete(url));
  inFlight.set(url, p);
  return p;
}

/** 预取：失败静默，不影响正常导航；命中新鲜缓存或在途请求时不重复发起 */
export async function prefetch(url: string): Promise<void> {
  if (isFresh(cache.get(url)) || inFlight.has(url)) return;
  try {
    store(url, await request(url));
  } catch {
    // 静默
  }
}

/** 导航取文档：新鲜缓存直接复用（用后删除，避免过期状态复用）；否则取在途/新请求 */
export async function getOrFetch(url: string): Promise<Document> {
  const entry = cache.get(url);
  if (isFresh(entry)) {
    cache.delete(url);
    return entry.doc;
  }
  cache.delete(url); // 顺手清掉过期 entry
  return request(url);
}
