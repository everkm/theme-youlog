# PageAjax 重构方案 v5：结构透明的 PJAX

---

## 0. 变更日志

| 版本 | 日期 | 说明 |
|---|---|---|
| v5 | 2026-06-17 | **基于 `idiomorph@0.7.4` 源码核对，修正 §5 立论错误**：`beforeNodeMorphed` 返回 `false` 时 idiomorph 直接 `return oldNode`，**不会递归子节点**，单个回调即可完整保护子树。据此：删除 `beforeNodeAdded`/`beforeNodeRemoved`/`isInsideProcessed`/`data-processed` 镜像循环（全部多余）；新增**容器必须带稳定唯一 `id`** 硬性前提（idiomorph 靠 id-set 决定 morph-in-place 还是删旧建新）；重写 §9.0 方向 B；prefetch 缓存补 LRU 淘汰 + 并发去重 + 过期清理；补回初始 hash 滚动；`morphPageShell` 在 `#page-shell` 缺失时回退整页刷新 |
| v4.1 | 2026-06-17 | 修正 `beforeNodeRemoved` 语义：容器**本身**允许被 morph 移除（新页面无该 widget 时的正常情况），只保护容器内子节点；`reprocessContainers` teardown 事件补充 `container` 引用；新增"widget 动态出现/消失"场景分析 |
| v4 | 2026-06-17 | 修正三处致命缺陷（`reprocessContainers` 查询依赖、`beforeNodeAdded` 文档树错误、`isHeadCompatible` 未定义）；补充 hash-only 导航、`pjax:anchor-navigate`、编程式导航、`__everkm_base_url` 路径过滤、`nprogress`、`scrollContainerSelector`；`hashHtml` 去掉 DOMParser 改轻量实现；`RegistryEntry` 增加 `selector` 字段 |
| v3 | 2026-06-16 | 初稿：引擎零感知架构、`data-processed` 契约、`ProcessedRegistry`、三个 morph hook |

---

## 1. 设计原则

PJAX 引擎对页面结构**零感知**：

- 不预定义任何内容区域（无 `#article-main`、`#sidebar` 等硬编码）
- 不知道页面有哪些 widget
- 唯一的约定是 `#page-shell` 入口 + `data-processed` 跳过标记 + 五个事件
- 页面结构信息只存在于 widget 自身的注册行为里

> **硬性前提**：每个注册的 widget 容器必须带**全局唯一、跨页面稳定的 `id`**，且 `selector` 即该 id 选择器（如 `#sidebar-nav-tree`）。
> 原因见 §5：idiomorph 靠 id-set 决定"原地 morph"还是"删旧建新"。容器有稳定 id 时 idiomorph 必走原地 morph，`beforeNodeMorphed` 才有机会拦截并保护子树；
> 若容器只用 class / data 属性而无 id，容器内部被 widget 改写后 id-set 对不上，idiomorph 可能删旧建新，**widget 增强状态会被静默丢弃**。

```
PJAX 引擎知道的全部：
  1. 从哪里开始 morph   → #page-shell（唯一结构锚点）
  2. 哪些子树要跳过     → data-processed 标记的节点
  3. head 兼容性如何    → data-ajax-head 指纹
  4. 导航后通知谁       → 派发五个 pjax:* 事件

PJAX 引擎不知道的：
  • 页面有几列、有没有侧栏
  • nav-tree 是什么
  • TOC 在哪里
  • 任何具体的内容 selector
```

---

## 2. 核心契约

```
Widget 注册（首次 mount）：
  ① container.setAttribute("data-processed", WIDGET_ID)
  ② processedRegistry.register(WIDGET_ID, container, CONTAINER_SELECTOR)
     → 存储 { hash: hashHtml(rawHtml), el: WeakRef, selector }
     → 必须在 innerHTML 被 widget 改写之前调用，保证 hash 来自原始 SSR HTML

PJAX 导航时：
  ① morph(#page-shell, newShell, { beforeNodeMorphed: skip data-processed 容器 })
     → idiomorph 按 id-set 匹配到当前 data-processed 容器后调用 morphNode
     → beforeNodeMorphed 返回 false → 整棵子树（含子节点）被完整跳过
     → 新页面无该容器时，容器 id 不在新旧交集，idiomorph 直接移除容器（期望行为）
  ② for each registered widget:
       newEl = newDoc.querySelector(entry.selector)   ← 用 selector（= 容器 id）
       if !newEl          → dispatch pjax:widget:teardown
       if hash 相同        → 跳过（保留 widget 增强状态）
       if hash 不同        → dispatch pjax:widget:reprocess(newHtml)
                           → processedRegistry.updateHash(id, newHash)
  ③ dispatch pjax:page-loaded

注：无需把 data-processed 镜像到新文档——beforeNodeMorphed 检查的是当前 DOM 的 oldNode，
    它本就带 data-processed；新文档是否带该属性无关紧要（morph 后即丢弃）。
```

---

## 3. ProcessedRegistry

### 接口

```ts
// src/youlog_lib/widgets/page-ajax/processedRegistry.ts

export interface RegistryEntry {
  hash: string            // 原始 SSR innerHTML 的规范化 hash
  el: WeakRef<Element>    // 弱引用，不阻止 GC
  selector: string        // 用于在新文档中定位对应元素；必须是稳定唯一的 id 选择器（见 §1 硬性前提、§5）
}

export interface ProcessedRegistry {
  /** 初次注册：必须在 widget 改写 container.innerHTML 之前调用 */
  register(id: string, container: Element, selector: string): void
  /** 重处理后更新 hash（取新文档中的原始 HTML hash，而非 widget 转换后的 hash） */
  updateHash(id: string, newHash: string): void
  has(id: string): boolean
  getAll(): ReadonlyMap<string, RegistryEntry>
  delete(id: string): void
  clear(): void
}
```

### 实现

```ts
export class ProcessedRegistryImpl implements ProcessedRegistry {
  private entries = new Map<string, RegistryEntry>()

  register(id: string, container: Element, selector: string): void {
    this.entries.set(id, {
      hash: hashHtml(container.innerHTML),
      el: new WeakRef(container),
      selector,
    })
  }

  updateHash(id: string, newHash: string): void {
    const entry = this.entries.get(id)
    if (!entry) return
    this.entries.set(id, { ...entry, hash: newHash })
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }

  getAll(): ReadonlyMap<string, RegistryEntry> {
    return this.entries
  }

  delete(id: string): void {
    this.entries.delete(id)
  }

  clear(): void {
    this.entries.clear()
  }
}

export const processedRegistry = new ProcessedRegistryImpl()
```

---

## 4. htmlHash

DOMParser 规范化代价较高，SSR 生成的 HTML 属性顺序稳定，空白折叠已足够消除差异。

```ts
// src/youlog_lib/widgets/page-ajax/htmlHash.ts

/**
 * 折叠连续空白符后做 djb2 hash。
 * SSR 生成的 HTML 属性顺序稳定，无需 DOMParser。
 * 注意：必须对同一"形式"的 HTML 比较（始终用原始 SSR innerHTML）。
 */
export function hashHtml(html: string): string {
  const normalized = html.replace(/\s+/g, " ").trim()
  let h = 5381
  for (let i = 0; i < normalized.length; i++) {
    h = (((h << 5) + h) ^ normalized.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}
```

---

## 5. MorphCallbacks（单 hook 完整跳过）

### idiomorph 的真实行为（已核对 `idiomorph@0.7.4` 源码）

`morphNode` 在调用子节点递归**之前**先判断 `beforeNodeMorphed`：

```ts
// node_modules/idiomorph/dist/idiomorph.esm.js（节选）
function morphNode(oldNode, newContent, ctx) {
  if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false) {
    return oldNode            // ← 直接返回，不进入 morphAttributes / morphChildren
  }
  morphAttributes(oldNode, newContent, ctx)
  morphChildren(ctx, oldNode, newContent)
  ...
}
```

结论：**`beforeNodeMorphed` 返回 `false` 即完整保护整棵子树**（属性、文本、子节点全部不动）。
因此只需要这**一个**回调，无需 `beforeNodeAdded` / `beforeNodeRemoved` / 祖先遍历 / `data-processed` 镜像。

回调首参 `oldNode` 是当前 DOM 节点（本就带 `data-processed`），判断只看它即可。

### 两个关键前提（缺一不可）

1. **容器有稳定唯一 `id`**（§1 硬性前提）。idiomorph 的 `createPersistentIds` / `isSoftMatch` 用 id 决定匹配：
   - 容器 id 在新旧文档都存在 → 进 `persistentIds` → 必走 `morphNode`（原地 morph）→ `beforeNodeMorphed` 得以拦截。
   - 无稳定 id → 退化为按 tagName 软匹配，widget 改写内部后极易"删旧建新"，状态丢失。
2. **widget 消失时无需额外处理**：新页面无该容器 → 容器 id 不在新旧交集 → 不进 `idMap` →
   idiomorph 走默认 `removeNode` 直接移除容器（正是期望行为，由 §7 `reprocessContainers` 派发 teardown 收尾）。

### 实现

```ts
// src/youlog_lib/widgets/page-ajax/morphCallbacks.ts
// 注：idiomorph 以 JS + JSDoc 发布，无具名 TS 导出，回调形状用本地接口约束即可。

interface MorphCallbacks {
  beforeNodeMorphed(oldNode: Node, newNode: Node): boolean
}

/**
 * 唯一回调：当前 DOM 节点是受保护的 data-processed 容器时返回 false，
 * idiomorph 据此跳过该容器及其整棵子树（不 morph 属性、不递归子节点）。
 * 首参 oldNode 为当前 DOM 节点（本就带 data-processed），无需读 newNode。
 */
export function buildSkipCallbacks(skipIds: Set<string>): MorphCallbacks {
  return {
    beforeNodeMorphed(oldNode: Node): boolean {
      if (oldNode instanceof Element) {
        const id = oldNode.getAttribute("data-processed")
        if (id && skipIds.has(id)) return false
      }
      return true
    },
  }
}
```

---

## 6. PrefetchCache

缓存解析后的 `Document` 较重，必须**限容 + 过期清理 + 并发去重**，避免长会话内存无界增长、对同一 URL 重复发请求。

```ts
// src/youlog_lib/widgets/page-ajax/prefetchCache.ts

interface CacheEntry {
  doc: Document
  fetchedAt: number
}

const TTL = 30_000
const MAX_ENTRIES = 8                                   // 限容，防内存无界
const cache = new Map<string, CacheEntry>()             // Map 保留插入顺序，可当 LRU 用
const inFlight = new Map<string, Promise<Document>>()   // 并发去重

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html")
}

function isFresh(entry: CacheEntry | undefined): entry is CacheEntry {
  return !!entry && Date.now() - entry.fetchedAt < TTL
}

function store(url: string, doc: Document): void {
  cache.set(url, { doc, fetchedAt: Date.now() })
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value as string | undefined
    if (oldest === undefined) break
    cache.delete(oldest)   // 淘汰最久未用
  }
}

/** 实际请求 + 并发去重：同一 URL 在途时复用同一 Promise */
function request(url: string): Promise<Document> {
  const existing = inFlight.get(url)
  if (existing) return existing
  const p = fetch(url, { credentials: "same-origin" })
    .then(r => r.text())
    .then(parseHtml)
    .finally(() => inFlight.delete(url))
  inFlight.set(url, p)
  return p
}

/** 预取：失败静默，不影响正常导航；命中新鲜缓存或在途请求时不重复发起 */
export async function prefetch(url: string): Promise<void> {
  if (isFresh(cache.get(url)) || inFlight.has(url)) return
  try {
    store(url, await request(url))
  } catch {
    // 静默
  }
}

/** 导航取文档：新鲜缓存直接复用（用后删除，避免过期状态复用）；否则取在途/新请求 */
export async function getOrFetch(url: string): Promise<Document> {
  const entry = cache.get(url)
  if (isFresh(entry)) {
    cache.delete(url)
    return entry.doc
  }
  cache.delete(url)                 // 顺手清掉过期 entry
  return request(url)
}
```

---

## 7. PJAX 引擎主体

引擎内部除 `#page-shell` 外**没有任何具体 selector**。

```ts
// src/youlog_lib/widgets/page-ajax/pageAjax.ts

import { Idiomorph } from "idiomorph"
import nProgress from "nprogress"
import "./nprogress_custom.css"
import { processedRegistry } from "./processedRegistry"
import { hashHtml } from "./htmlHash"
import { buildSkipCallbacks } from "./morphCallbacks"
import { getOrFetch, prefetch } from "./prefetchCache"
import {
  EVENT_BEFORE_UPDATE,
  EVENT_PAGE_LOADED,
  EVENT_ANCHOR_NAVIGATE,
  EVENT_NAVIGATE,
  EVENT_WIDGET_REPROCESS,
  EVENT_WIDGET_TEARDOWN,
  PAGE_HEAD_ATTR,
  PAGE_LOADING_CLASS,
} from "./constants"

// ── Options ───────────────────────────────────────────────

export interface PageAjaxOptions {
  scrollContainerSelector?: string
}

// ── Ready Guard ───────────────────────────────────────────
// 防止 widget 注册完成前触发导航，registry 为空导致 morph 全量处理本该 skip 的子树。
// 初始值为 true：widget 在模块加载时同步执行 mount()，无需等待。
//
// 适用前提：仅当存在【异步注册】的 widget（mount 延迟到 page-loaded 之后的微/宏任务）时才需要。
// 若所有 widget 都在 page-loaded 的同步监听里完成 mount（本主题现状），
// 则 `navigating` 并发锁已足够，此 guard 可整体省略。保留与否取决于 widget 注册时机约束。

let widgetsReady = true

document.addEventListener(EVENT_PAGE_LOADED, () => {
  queueMicrotask(() => { widgetsReady = true })
})
document.addEventListener(EVENT_BEFORE_UPDATE, () => {
  widgetsReady = false
})

async function waitForWidgets(): Promise<void> {
  if (widgetsReady) return
  await new Promise<void>(resolve => {
    document.addEventListener(EVENT_PAGE_LOADED, () => resolve(), { once: true })
  })
}

// ── Head 兼容性 ────────────────────────────────────────────

function isHeadCompatible(newDoc: Document): boolean {
  const current = document.documentElement.getAttribute(PAGE_HEAD_ATTR)
  const next = newDoc.documentElement.getAttribute(PAGE_HEAD_ATTR)
  // 任一方未标记时不触发整页刷新（降级兼容旧模板）
  if (!current || !next) return true
  return current === next
}

// ── Hash-only 导航检测 ─────────────────────────────────────

function isSamePathHashChange(currentHref: string, nextHref: string): boolean {
  const stripHash = (u: string) => u.split("#")[0]
  return stripHash(currentHref) === stripHash(nextHref) && currentHref !== nextHref
}

function getUrlHash(url: string): string {
  const idx = url.indexOf("#")
  return idx >= 0 ? url.slice(idx + 1) : ""
}

// ── 滚动 ───────────────────────────────────────────────────

function scrollAfterNavigation(url: string, opts: Required<PageAjaxOptions>): void {
  const hash = getUrlHash(url)
  requestAnimationFrame(() => {
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "auto" })
      document.dispatchEvent(
        new CustomEvent(EVENT_ANCHOR_NAVIGATE, { detail: { hash } })
      )
    } else {
      const container = document.querySelector(opts.scrollContainerSelector)
      if (container) {
        container.scrollTop = 0
      } else {
        window.scrollTo({ top: 0 })
      }
    }
  })
}

// ── Prefetch 绑定 ─────────────────────────────────────────

function bindPrefetch(): void {
  document.addEventListener("mouseover", (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>("a[href]")
    if (!link || !isInternalLink(link)) return
    const timer = setTimeout(() => prefetch(link.href), 80)
    link.addEventListener("mouseleave", () => clearTimeout(timer), { once: true })
  })
}

// ── 核心 morph ────────────────────────────────────────────

/** @returns 是否成功 morph；false 表示缺少 #page-shell，调用方应回退整页刷新 */
function morphPageShell(newDoc: Document): boolean {
  const current = document.querySelector("#page-shell")
  const next = newDoc.querySelector("#page-shell")
  if (!current || !next) return false

  // skipIds = 当前已注册 widget；beforeNodeMorphed 命中 oldNode 上的 data-processed 即跳过整棵子树。
  // 无需镜像 data-processed 到新文档（回调只看当前 DOM 的 oldNode）。
  const skipIds = new Set(processedRegistry.getAll().keys())

  Idiomorph.morph(current, next, {
    callbacks: buildSkipCallbacks(skipIds),
  })
  return true
}

// ── Reprocess 检测 ────────────────────────────────────────

function reprocessContainers(newDoc: Document): void {
  for (const [id, entry] of processedRegistry.getAll()) {
    // 用 registry 中存储的 selector 查找，而非 data-processed（新文档无此属性）
    const newEl = newDoc.querySelector(entry.selector)

    if (!newEl) {
      const container = entry.el.deref()
      // morph 已将该容器从 DOM 移除（id 不在新旧交集，走 idiomorph 默认 removeNode）。
      // 传入 container 引用（已脱离 DOM）供 widget teardown handler 做 JS 层清理。
      document.dispatchEvent(
        new CustomEvent(EVENT_WIDGET_TEARDOWN, { detail: { widgetId: id, container } })
      )
      processedRegistry.delete(id)
      continue
    }

    const newHash = hashHtml(newEl.innerHTML)
    if (entry.hash === newHash) continue  // 内容未变，widget 增强状态完整保留

    const container = entry.el.deref()
    if (!container) {
      processedRegistry.delete(id)
      continue
    }

    // dispatchEvent 同步执行：widget handler 运行后 container.innerHTML = newHtml 已完成
    document.dispatchEvent(
      new CustomEvent(EVENT_WIDGET_REPROCESS, {
        detail: { widgetId: id, newHtml: newEl.innerHTML, container },
      })
    )

    // 以新文档的原始 HTML hash 更新记录，保持 hash 与 SSR HTML 形式一致
    processedRegistry.updateHash(id, newHash)
  }
}

// ── 导航主流程 ────────────────────────────────────────────

let navigating = false

async function handleNavigation(
  url: string,
  opts: Required<PageAjaxOptions>,
): Promise<void> {
  if (navigating) return

  // Hash-only 变化：不发请求，直接滚动 + 通知
  if (isSamePathHashChange(location.href, url)) {
    history.pushState({}, "", url)
    scrollAfterNavigation(url, opts)
    return
  }

  navigating = true
  try {
    await waitForWidgets()

    document.dispatchEvent(new CustomEvent(EVENT_BEFORE_UPDATE))
    document.body.classList.add(PAGE_LOADING_CLASS)
    nProgress.start()

    let newDoc: Document
    try {
      newDoc = await getOrFetch(url)
    } catch {
      location.href = url
      return
    }

    if (!isHeadCompatible(newDoc)) {
      location.href = url
      return
    }

    // #page-shell 缺失（异常模板）→ 整页刷新兜底，避免"导航成功但页面未变"
    if (!morphPageShell(newDoc)) {
      location.href = url
      return
    }

    document.title = newDoc.title
    history.pushState({}, "", url)
    reprocessContainers(newDoc)
    document.dispatchEvent(
      new CustomEvent(EVENT_PAGE_LOADED, { detail: { url } })
    )
    scrollAfterNavigation(url, opts)

  } finally {
    navigating = false
    nProgress.done()
    document.body.classList.remove(PAGE_LOADING_CLASS)
  }
}

// ── 初始化 ────────────────────────────────────────────────

export function initPageAjax(options: PageAjaxOptions = {}): void {
  const opts: Required<PageAjaxOptions> = {
    scrollContainerSelector: options.scrollContainerSelector ?? "#body-main",
  }

  nProgress.configure({ showSpinner: false, minimum: 0.1, speed: 200, trickleSpeed: 100 })

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual"
  }

  bindPrefetch()
  bindLinkInterceptor(opts)
  bindPopState(opts)
  bindProgrammaticNavigate(opts)

  // 首屏带 #anchor 进入时滚动到锚点（v4 遗漏，补回）
  scrollToInitialHash(opts)
}

/** 首屏（含整页刷新落地）若 URL 带 hash，滚动到对应锚点 */
function scrollToInitialHash(opts: Required<PageAjaxOptions>): void {
  const hash = getUrlHash(location.href)
  if (!hash) return
  const run = () =>
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "auto" })
    })
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true })
  } else {
    run()
  }
}

function bindLinkInterceptor(opts: Required<PageAjaxOptions>): void {
  document.addEventListener("click", (e) => {
    // 用 composedPath 兼容 shadow DOM / 内嵌结构（保持现有行为，优于单次 closest）
    const link = e.composedPath().find(
      (n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement
    )
    if (!link || link.hasAttribute("data-no-ajax")) return
    // 修饰键 / 非左键 / download 交给浏览器默认行为
    if (e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
        link.hasAttribute("download")) return
    if (!isInternalLink(link)) return
    e.preventDefault()
    handleNavigation(link.href, opts)
  }, { capture: true, passive: false })
}

function bindPopState(opts: Required<PageAjaxOptions>): void {
  window.addEventListener("popstate", () => {
    handleNavigation(location.href, opts)
  })
}

function bindProgrammaticNavigate(opts: Required<PageAjaxOptions>): void {
  window.addEventListener(EVENT_NAVIGATE, (e: Event) => {
    const url = (e as CustomEvent<{ url: string }>).detail?.url
    if (url) handleNavigation(url, opts)
  })
}

function isInternalLink(link: HTMLAnchorElement): boolean {
  const rawHref = link.getAttribute("href") ?? ""
  // 排除 javascript: / mailto: / tel: 等非导航协议（hostname 为空也会被下方挡掉，这里显式更清晰）
  if (/^(javascript|mailto|tel):/i.test(rawHref)) return false
  if (link.target === "_blank") return false
  if (link.hostname !== location.hostname) return false
  // 保持与现有逻辑一致：检查 __everkm_base_url 路径前缀
  const base: string = (window as any).__everkm_base_url ?? "/"
  const prefix = base.endsWith("/") ? base : base + "/"
  return link.pathname.startsWith(prefix)
}

export { type PageAjaxOptions as PjaxOptions }
```

---

## 8. 事件常量

```ts
// src/youlog_lib/widgets/page-ajax/constants.ts

// ── 生命周期（PJAX 引擎派发） ──────────────────────────────
/** 即将写入 DOM；widget 应在此断开 observer、清理第三方实例 */
export const EVENT_BEFORE_UPDATE   = "pjax:before-update"
/** DOM 已更新、history 已推进；widget 在此重新初始化 */
export const EVENT_PAGE_LOADED     = "pjax:page-loaded"
/** hash / anchor 导航完成（含 hash-only 变化）；不触发 page-loaded */
export const EVENT_ANCHOR_NAVIGATE = "pjax:anchor-navigate"

// ── Widget 协作（PJAX 引擎派发，widget 监听） ─────────────
/** Widget 容器内容有变化，需用新 HTML 重建 */
export const EVENT_WIDGET_REPROCESS = "pjax:widget:reprocess"
/** Widget 容器在新页面中不存在，需销毁 */
export const EVENT_WIDGET_TEARDOWN  = "pjax:widget:teardown"

// ── 编程式导航（外部代码派发到 window，引擎监听） ─────────
/** window.dispatchEvent(new CustomEvent(EVENT_NAVIGATE, { detail: { url } })) */
export const EVENT_NAVIGATE         = "pjax:navigate"

// ── DOM 标记 ──────────────────────────────────────────────
/** <html> 上的 head 资源指纹；不一致时触发整页刷新 */
export const PAGE_HEAD_ATTR         = "data-ajax-head"
/** 导航进行中加在 document.body 的 class */
export const PAGE_LOADING_CLASS     = "page-loading"

// ── 以下全部删除 ──────────────────────────────────────────
// PAGE_SHELL_ATTR（data-ajax-layout）
// NAV_TREE_SELECTOR, NAV_TREE_FINGERPRINT_ATTR
// NAV_TREE_SOURCE_MARKUP_ATTR, NAV_TREE_SOURCE_TEXT_ATTR
// AJAX_ELEMENT_NAV_TREE
// EVENT_PAGE_LOAD_BEFORE, EVENT_PAGE_UPDATE_BEFORE, EVENT_PAGE_NAVIGATE
// EVENT_ANCHOR_NAVIGATE（旧名，无命名空间）
```

---

## 9. Widget 适配模式

### 9.0 Widget 动态出现 / 消失场景

页面结构在导航间变化时（如某些页面有侧栏 nav-tree、某些没有），以下两个方向均由机制自然覆盖：

#### 方向 A：当前页无 widget → 新页有

```
当前 registry：无 "nav-tree" 条目
↓
skipIds 不含 "nav-tree"
↓
morphPageShell：beforeNodeMorphed 不命中（当前 DOM 无 data-processed="nav-tree" 节点）
↓
morph 正常将 #sidebar-nav-tree 从新文档插入当前 DOM  ✓
↓
reprocessContainers：registry 无条目，跳过
↓
pjax:page-loaded → widget 的 page-loaded handler 调用 mount()
  → document.querySelector("#sidebar-nav-tree") 找到新插入的容器
  → 注册 + 初始化  ✓
```

#### 方向 B：当前页有 widget → 新页无

```
当前 registry：有 "nav-tree" → skipIds 含 "nav-tree"
↓
morphPageShell：
  新文档无 #sidebar-nav-tree → "sidebar-nav-tree" 不在新旧文档 id 交集
                            → 不进 persistentIds / idMap
  idiomorph morphChildren 走到该层 → 当前容器无新内容可匹配
                                   → removeNode（容器不在 idMap）→ 默认移除  ✓
  （beforeNodeMorphed 根本不会被调用，因为该节点不是 morph 目标而是被移除目标）
  #sidebar-nav-tree 从当前 DOM 中移除
↓
reprocessContainers：
  newDoc.querySelector("#sidebar-nav-tree") → null
  派发 pjax:widget:teardown（含已脱离 DOM 的 container 引用）
  registry.delete("nav-tree")  ✓
↓
pjax:page-loaded → widget 的 page-loaded handler：
  processedRegistry.has("nav-tree") → false → 调用 mount()
  mount() 内 document.querySelector("#sidebar-nav-tree") → null → 提前返回  ✓
```

> 关键：方向 B 不再依赖 `beforeNodeRemoved`。容器消失是 idiomorph 默认 `removeNode` 的自然结果
> （容器 id 不在交集 → 不进 `idMap` → 直接 `node.parentNode.removeChild`）。v4.1 的 `beforeNodeRemoved`
> "允许容器自身移除"分支属于多余防御，已删除。

#### 方向 B 返回：再次导航回有 nav-tree 的页面

```
registry 已无 "nav-tree"，DOM 已无 #sidebar-nav-tree
↓
同方向 A 流程，morph 插入容器，page-loaded 触发 mount()  ✓
```

---

### 9.1 标准模式（适用所有 widget）

关键约定：
1. 容器必须带**稳定唯一 `id`**，`WIDGET_SEL` 用该 id 选择器（§1 硬性前提、§5）。
2. `register()` 必须在 widget 改写 `container.innerHTML` **之前**调用，
   确保 hash 记录的是原始 SSR HTML，与后续导航中从新文档取到的 HTML 保持同一形式。

```ts
const WIDGET_ID    = "my-widget"   // 全局唯一（registry / data-processed 标识）
const WIDGET_SEL   = "#my-widget"  // 必须是稳定唯一的 id 选择器（idiomorph 据此原地 morph 而非删旧建新）

function mount(): void {
  const container = document.querySelector(WIDGET_SEL)
  if (!container) return

  if (!processedRegistry.has(WIDGET_ID)) {
    container.setAttribute("data-processed", WIDGET_ID)
    // ① register 在 innerHTML 改写前
    processedRegistry.register(WIDGET_ID, container, WIDGET_SEL)
  }

  // ② widget 自身初始化（可改写 innerHTML）
}

document.addEventListener("pjax:before-update", () => {
  // 断开 observer、清理第三方实例
})

document.addEventListener("pjax:page-loaded", () => {
  if (!processedRegistry.has(WIDGET_ID)) mount()
  // 若 widget 已注册（内容未变），可在此做轻量更新（如高亮刷新）
})

document.addEventListener("pjax:widget:reprocess", (e: Event) => {
  const { widgetId, newHtml, container } = (e as CustomEvent).detail
  if (widgetId !== WIDGET_ID) return
  container.innerHTML = newHtml  // 引擎已更新 hash，此处只需重建 widget
  // 重新初始化...
})

// 容器消失时清理（morph 已将容器移出 DOM，container 引用已脱离文档，无需再 remove()）
document.addEventListener("pjax:widget:teardown", (e: Event) => {
  const { widgetId, container } = (e as CustomEvent).detail
  if (widgetId !== WIDGET_ID) return
  // 销毁 JS 实例、清理定时器、解除事件绑定...
})

mount()  // 首次页面加载（同步执行）
```

---

### 9.2 nav-tree 适配（重构 `sidebarNavTree2.ts`）

移除 `navTreeSync.ts` 的所有依赖（指纹比较由 registry hash 替代）。
移除 `lastMountedNavFingerprint`、`shouldRebuildNavTree`、`NAV_TREE_FINGERPRINT_ATTR` 相关逻辑。

```ts
// src/youlog_lib/widgets/nav-tree/sidebarNavTree2.ts

import { processedRegistry } from "../page-ajax/processedRegistry"

const WIDGET_ID   = "nav-tree"
const WIDGET_SEL  = "#sidebar-nav-tree"
const HIGHLIGHT_DELAY = 150

let installed = false

function scheduleHighlight(): void {
  setTimeout(() => NavTreeManager.getInstance().refreshHighlight(), HIGHLIGHT_DELAY)
}

function mount(): void {
  const container = document.querySelector(WIDGET_SEL) as HTMLElement | null
  if (!container) return

  if (!processedRegistry.has(WIDGET_ID)) {
    container.setAttribute("data-processed", WIDGET_ID)
    // register 必须在 TreeScanner.scanContainer 之前（保证 hash = 原始 SSR HTML）
    processedRegistry.register(WIDGET_ID, container, WIDGET_SEL)
  }

  TreeScanner.scanContainer(container)
  container.classList.remove("invisible")
  scheduleHighlight()
}

function installSidebarNavTree2(options: SidebarNavTreeOptions = {}): void {
  if (installed) {
    mount()
    return
  }
  installed = true

  const { breadcrumbTitleSelector = "[data-nav-title]" } = options
  const manager = NavTreeManager.getInstance()
  manager.setBreadcrumbTitleSelector(breadcrumbTitleSelector)
  BreadcrumbManager.setupClickHandler(
    manager,
    options.breadcrumbRoot ?? undefined,
    breadcrumbTitleSelector,
  )

  document.addEventListener("pjax:before-update", () => {
    NavTreeManager.getInstance().clearStaleStates()
    TreeConverter.pruneConvertedElements()
  })

  document.addEventListener("pjax:page-loaded", () => {
    if (!processedRegistry.has(WIDGET_ID)) {
      mount()
    } else {
      // nav-tree 未变化（hash 匹配），仅刷新当前页高亮
      scheduleHighlight()
    }
  })

  document.addEventListener("pjax:widget:reprocess", (e: Event) => {
    const { widgetId, newHtml, container } = (e as CustomEvent).detail
    if (widgetId !== WIDGET_ID) return

    // 清理旧状态
    NavTreeManager.getInstance().unregisterContainer(container)
    TreeConverter.pruneConvertedElements()

    // 用新 SSR HTML 重建（container.innerHTML 此时被重置为原始列表）
    container.innerHTML = newHtml
    TreeScanner.scanContainer(container)
    container.classList.remove("invisible")
    scheduleHighlight()
  })

  document.addEventListener("pjax:widget:teardown", (e: Event) => {
    const { widgetId } = (e as CustomEvent).detail
    if (widgetId !== WIDGET_ID) return
    NavTreeManager.getInstance().clearStaleStates()
    TreeConverter.clearConvertedElements()
  })

  document.addEventListener("pjax:anchor-navigate", scheduleHighlight)

  mount()
}
```

#### 同步移除的内部逻辑

| 删除项 | 替代方案 |
|---|---|
| `lastMountedNavFingerprint` | `processedRegistry` hash |
| `shouldRebuildNavTree` | `reprocessContainers` hash 比较 |
| `NAV_TREE_FINGERPRINT_ATTR`（`data-nav-fingerprint`） | 不再需要，SSR 模板同步删除 |
| `markNavTreeSource` / `captureRawNavMarkup` | 不再需要 |
| `NAV_TREE_SOURCE_MARKUP_ATTR` / `NAV_TREE_SOURCE_TEXT_ATTR` | 不再需要 |
| 导入 `navTreeSync.ts` 的所有符号 | 全部移除 |

---

### 9.3 TOC 适配

TOC 从 `#article-main` 动态生成，无独立 SSR 片段，无需注册。
`#article-main` 未被任何 widget 注册，morph 正常更新后重新生成即可。

```ts
// src/youlog_lib/widgets/toc/toc.tsx

document.addEventListener("pjax:page-loaded", () => {
  const source = document.querySelector("#article-main")
  const target = document.querySelector("#toc")
  if (source && target) generateToc(source, target)
})
```

---

### 9.4 app-header 适配（IntersectionObserver）

```ts
// src/utils/app_header.ts

let observer: IntersectionObserver | null = null

function init(): void {
  observer?.disconnect()
  const target = document.querySelector("#article-title")
  if (!target) return
  observer = new IntersectionObserver(handleIntersect, { threshold: 0 })
  observer.observe(target)
}

document.addEventListener("pjax:before-update", () => observer?.disconnect())
document.addEventListener("pjax:page-loaded", init)

init()
```

---

## 10. 文件变更清单

### 新增

| 文件 | 说明 |
|---|---|
| `page-ajax/processedRegistry.ts` | Registry 实现（含 `selector` 字段、`updateHash`） |
| `page-ajax/processedRegistry.test.ts` | 单元测试 |
| `page-ajax/htmlHash.ts` | 轻量规范化 hash |
| `page-ajax/htmlHash.test.ts` | 空白符稳定性测试 |
| `page-ajax/morphCallbacks.ts` | 单 hook `beforeNodeMorphed`（子树完整跳过） |
| `page-ajax/morphCallbacks.test.ts` | 子树保护测试（含"容器无 id 退化"反例） |
| `page-ajax/prefetchCache.ts` | Prefetch 缓存（LRU + 并发去重 + 过期清理） |

### 修改

| 文件 | 变更说明 |
|---|---|
| `page-ajax/pageAjax.ts` | 全部重写：通用 morph + reprocess；`isHeadCompatible`、hash-only 导航、shell 缺失整页回退、初始 hash 滚动、nprogress、scroll |
| `page-ajax/constants.ts` | 事件命名空间改为 `pjax:*`；删除所有旧常量；新增 `EVENT_ANCHOR_NAVIGATE`、`EVENT_NAVIGATE` |
| `page-ajax/index.ts` | 更新导出（`initPageAjax` 替换 `installAjaxPageLoad`） |
| `nav-tree/sidebarNavTree2.ts` | 接入 registry；移除指纹逻辑；适配新事件 |
| `toc/toc.tsx` | 仅响应 `pjax:page-loaded` |
| `utils/app_header.ts` | 事件名改为 `pjax:*` |
| 其余监听旧事件的 widget（约 20 处） | 机械替换 `page-loaded`/`page-update-before`/`page-load-before`/`anchor-navigate`/`page-navigate` → `pjax:*`。涉及 topbar、prism、katex、footnote、image-lazy、image-swipe、drawer、dcard、page-qrcode、keyword-highlighter、heading_anchor、print-page、nav-menu、entries/browser 等。`ekmp-themes` 仓库无引用，不受影响 |

### 删除

| 文件 | 原因 |
|---|---|
| `page-ajax/navTreeSync.ts` | 指纹比较逻辑由 registry hash 替代 |
| `page-ajax/navTreeSync.test.ts` | 同上 |
| `utils/ajaxLayout.ts` | `data-ajax-layout` 废弃，不再需要指纹生成 |
| `utils/ajaxLayout.test.ts` | 同上 |

### SSR 模板变更

| 操作 | 属性 |
|---|---|
| 删除（约 8 处） | `data-ajax-element`、`data-ajax-layout`、`data-nav-fingerprint` |
| **保留** | `data-ajax-head`（head 兼容性检测唯一依赖） |

```tsx
// RootLayout.tsx — 唯一保留的 PJAX 相关 SSR 标记
<html data-ajax-head={headFingerprint}>
```

---

## 11. 引擎感知边界

| 引擎知道的 | 引擎不知道的 |
|---|---|
| `#page-shell`（morph 入口） | 页面有几列、有没有侧栏 |
| `data-processed`（skip 标记，运行时） | nav-tree 是什么 |
| `data-ajax-head`（head 兼容性） | TOC 在哪里 |
| 五个 `pjax:*` 事件 | 任何具体的内容 selector |

新增 widget 只需遵循§9.1 注册模式，PJAX 引擎代码**零改动**。

---

## 12. 验证矩阵

| 场景 | 预期 |
|---|---|
| 同 nav 文件下文章间跳转 | nav-tree 展开状态保留，仅刷新高亮 |
| 跨 nav 文件跳转 | `pjax:widget:reprocess` 触发，nav-tree 正确重建 |
| 跳转至无侧栏页 | 容器 id 不在新旧交集 → idiomorph 默认移除容器；`teardown` 触发，registry 清理，DOM 已干净 |
| **容器无稳定 id（反例）** | idiomorph 软匹配退化为删旧建新，widget 状态丢失 → 验证"必须有 id"约束生效 |
| 再次导航回有侧栏页 | morph 插入容器；`pjax:page-loaded` 触发 `mount()`，nav-tree 正常重建 |
| 从无侧栏页直接导航到有侧栏页 | registry 无 "nav-tree"；morph 正常插入容器；`page-loaded` 触发 mount() |
| TOC 在新文章页正确生成 | 标题层级对应 |
| 代码高亮正确应用 | `pjax:page-loaded` 后重新处理 |
| 导航到 KaTeX 页面 | `data-ajax-head` 不一致 → 整页刷新 |
| 点击 anchor 链接 | 不发请求；滚动到锚点；派发 `pjax:anchor-navigate` |
| Hover 链接 80ms 后 Network | prefetch 请求已发出 |
| 点击时命中 prefetch 缓存 | 无重复请求 |
| 快速连续点击多个链接 | `navigating` flag 防并发，不错乱 |
| 浏览器前进/后退 | 内容正确（popstate → handleNavigation） |
| 导航中快速点击 | Ready guard 等待 `pjax:page-loaded` 后再导航 |
| `window.dispatchEvent(pjax:navigate)` | 编程式导航正常执行 |
| 非站点路径同主机链接 | `__everkm_base_url` 前缀过滤，不被拦截 |
| 加载中 body 有 `page-loading` class | nprogress 条显示，加载完成后消失 |
