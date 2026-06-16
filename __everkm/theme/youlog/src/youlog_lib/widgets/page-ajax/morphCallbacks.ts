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
export interface MorphCallbacks {
  beforeNodeMorphed(oldNode: Node, newNode: Node): boolean;
}

export function buildSkipCallbacks(skipIds: Set<string>): MorphCallbacks {
  return {
    beforeNodeMorphed(oldNode: Node): boolean {
      if (oldNode instanceof Element) {
        const id = oldNode.getAttribute("data-processed");
        if (id && skipIds.has(id)) return false;
      }
      return true;
    },
  };
}
