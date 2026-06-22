/**
 * idiomorph morph 回调：保护已注册 widget 的容器子树。
 *
 * 关键事实（已核对 idiomorph@0.7.4 源码）：`morphNode` 在递归子节点之前先调用
 * `beforeNodeMorphed`，返回 `false` 时直接 `return oldNode`，**不会** morph 属性、
 * 也**不会**递归子节点。因此单个 `beforeNodeMorphed` 即可完整保护整棵子树，
 * 无需 `beforeNodeAdded` / `beforeNodeRemoved`。
 *
 * 首参 `oldNode` 是当前 DOM 节点（本就带 `data-processed`），判断只看它即可，
 * 无需把 `data-processed` 镜像到新文档。
 *
 * 前提：受保护容器必须有稳定唯一 `id`，否则 idiomorph 可能"删旧建新"而非原地 morph，
 * 导致 widget 状态丢失（见 processedRegistry / index 说明）。
 */
import { pjaxDebug, pjaxWarn } from "./debug";

export interface MorphCallbacks {
  beforeNodeMorphed(oldNode: Node, newNode: Node): boolean;
  /**
   * 诊断用：idiomorph 决定移除某节点时回调。
   * 若被保护的 widget 容器（data-processed 命中 skipIds）走到这里，说明 idiomorph
   * 选择了「删旧建新」而非原地 morph，protection 失效 —— 这是 navtree 被重建的主因之一。
   */
  beforeNodeRemoved(node: Node): boolean;
}

export function buildSkipCallbacks(skipIds: Set<string>): MorphCallbacks {
  return {
    beforeNodeMorphed(oldNode: Node): boolean {
      if (oldNode instanceof Element) {
        const id = oldNode.getAttribute("data-processed");
        if (id && skipIds.has(id)) {
          pjaxDebug(
            `morph: SKIP 子树（原地保护 ✓） data-processed="${id}"`,
            oldNode,
          );
          return false;
        }
      }
      return true;
    },
    beforeNodeRemoved(node: Node): boolean {
      if (node instanceof Element) {
        const id = node.getAttribute("data-processed");
        if (id && skipIds.has(id)) {
          pjaxWarn(
            `morph: ⚠️ 正在移除受保护节点 data-processed="${id}"（idiomorph 删旧建新，protection 失效！）`,
            node,
          );
        }
      }
      // 诊断阶段不改变行为，始终允许移除
      return true;
    },
  };
}
