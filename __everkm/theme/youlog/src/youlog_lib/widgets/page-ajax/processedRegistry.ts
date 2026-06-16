/**
 * ProcessedRegistry — PJAX 引擎与 widget 之间的"已处理容器"登记表。
 *
 * widget 首次 mount 时注册容器（id + selector + 原始 SSR innerHTML 的 hash）；
 * PJAX 导航时引擎据此：
 * - morph 阶段跳过这些容器子树（见 morphCallbacks）
 * - morph 后比对新文档对应容器的 hash，决定 reprocess / teardown
 *
 * 模块说明见同目录 `index.ts`。
 */
import { hashHtml } from "./htmlHash";

export interface RegistryEntry {
  /** 原始 SSR innerHTML 的规范化 hash */
  hash: string;
  /** 弱引用，不阻止 GC */
  el: WeakRef<Element>;
  /** 用于在新文档中定位对应元素；必须是稳定唯一的 id 选择器 */
  selector: string;
}

export interface ProcessedRegistry {
  /** 初次注册：必须在 widget 改写 container.innerHTML 之前调用 */
  register(id: string, container: Element, selector: string): void;
  /** 重处理后更新 hash（取新文档中的原始 HTML hash，而非 widget 转换后的 hash） */
  updateHash(id: string, newHash: string): void;
  has(id: string): boolean;
  getAll(): ReadonlyMap<string, RegistryEntry>;
  delete(id: string): void;
  clear(): void;
}

class ProcessedRegistryImpl implements ProcessedRegistry {
  private entries = new Map<string, RegistryEntry>();

  register(id: string, container: Element, selector: string): void {
    this.entries.set(id, {
      hash: hashHtml(container.innerHTML),
      el: new WeakRef(container),
      selector,
    });
  }

  updateHash(id: string, newHash: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.entries.set(id, { ...entry, hash: newHash });
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  getAll(): ReadonlyMap<string, RegistryEntry> {
    return this.entries;
  }

  delete(id: string): void {
    this.entries.delete(id);
  }

  clear(): void {
    this.entries.clear();
  }
}

export const processedRegistry: ProcessedRegistry = new ProcessedRegistryImpl();
