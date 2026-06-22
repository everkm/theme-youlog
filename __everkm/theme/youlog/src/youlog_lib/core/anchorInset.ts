/**
 * Anchor inset 类型与通用 helper。
 *
 * 【库级模块 · 可复制】
 * - 职责：定义 sticky 区域 contributor 契约；提供 DOM / 布局等待 helper。
 * - 不依赖：主题 layout、youlog 专有选择器。
 * - 协作：anchorScrollService（聚合 inset）、widgets 内 create*Inset 工厂。
 *
 * @module youlog_lib/core/anchorInset
 */

/** 影响锚点顶部留白的 UI 区域（由宿主或 widget 注册） */
export interface AnchorInsetContributor {
  /** 页面生命周期内唯一；重复 register 同 id 会覆盖并 warn */
  id: string;
  /** 数值越小越靠近视口顶（绘制顺序） */
  order: number;
  /** 同步测量高度（px）；无 DOM 时返回 0 */
  measure: () => number;
  /** 首次布局就绪；省略则视为立即 ready */
  whenReady?: () => Promise<void>;
}

export interface WaitForLayoutOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export function waitForDomContentLoaded(): Promise<void> {
  if (document.readyState !== "loading") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

/** 轮询直到 predicate 为 true 或超时（超时也 resolve，不 reject） */
export async function waitForLayoutCondition(
  predicate: () => boolean,
  options: WaitForLayoutOptions = {},
): Promise<void> {
  const { timeoutMs = 2000, intervalMs = 16 } = options;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (predicate()) {
      return;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
