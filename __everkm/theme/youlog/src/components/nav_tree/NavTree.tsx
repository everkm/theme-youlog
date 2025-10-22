import { Component, For, Show, createMemo, createEffect } from "solid-js";
import { NavTreeState, NavItem } from "./NavTreeState";
import "./NavTree.css";

/**
 * 导航树组件属性接口
 */
export interface NavTreeProps {
  /** 导航树状态管理器 */
  state: NavTreeState;
  /** 自定义CSS类名 */
  class?: string;
  /** 节点点击回调 */
  onNodeClick?: (nodeId: string, node: NavItem) => void;
}

/**
 * 树节点组件
 * 递归渲染单个树节点
 */
const TreeNode: Component<{
  nodeId: string;
  depth: number;
  state: NavTreeState;
  onNodeClick?: (nodeId: string, node: NavItem) => void;
}> = (props) => {
  const node = createMemo(() => props.state.getNode(props.nodeId));
  const hasChildren = createMemo(() => {
    const currentNode = node();
    return currentNode?.children && currentNode.children.length > 0;
  });
  const isLeaf = createMemo(() => !hasChildren());
  const isExpanded = createMemo(() => props.state.isExpanded(props.nodeId));
  const isActive = createMemo(() => props.state.isActive(props.nodeId));

  const handleToggle = () => {
    props.state.toggleExpanded(props.nodeId);
  };

  const handleNodeClick = (e: Event) => {
    e.stopPropagation();
    const currentNode = node();
    if (currentNode) {
      props.onNodeClick?.(props.nodeId, currentNode);
    }
  };

  return (
    <Show when={node()}>
      {(currentNode) => (
        <li
          class={`tree-node-${isLeaf() ? "leaf" : "branch"} ${
            isActive() ? "active" : ""
          }`}
          data-depth={props.depth}
          style={`--depth: ${props.depth}`}
        >
          <div
            class={`node-content with-toggle ${isExpanded() ? "expanded" : ""}`}
            onClick={handleToggle}
          >
            <Show when={currentNode().url}>
              <a
                href={currentNode().url}
                target={currentNode().new_window ? "_blank" : undefined}
                class={isActive() ? "active-link" : ""}
                onClick={handleNodeClick}
              >
                {currentNode().title}
              </a>
            </Show>
            <Show when={!currentNode().url}>
              <span class={isActive() ? "active-link" : ""}>
                {currentNode().title}
              </span>
            </Show>
          </div>

          <Show when={hasChildren()}>
            <ul class={isExpanded() ? "" : "hidden"}>
              <For each={currentNode().children}>
                {(child) => (
                  <TreeNode
                    nodeId={child.nodeId}
                    depth={props.depth + 1}
                    state={props.state}
                    onNodeClick={props.onNodeClick}
                  />
                )}
              </For>
            </ul>
          </Show>
        </li>
      )}
    </Show>
  );
};

/**
 * 导航树组件
 * 纯视图组件，负责渲染导航树
 */
export const NavTree: Component<NavTreeProps> = (props) => {
  const rootNodes = createMemo(() => props.state.getRootNodes());
  let navElement: HTMLElement | undefined;

  const handleNodeClick = (nodeId: string, node: NavItem) => {
    console.log("Node clicked:", nodeId, node);
    props.onNodeClick?.(nodeId, node);
  };

  return (
    <nav ref={navElement} class={`nav-tree select-none ${props.class || ""}`}>
      <ul>
        <For each={rootNodes()}>
          {(node) => (
            <TreeNode
              nodeId={node.nodeId}
              depth={0}
              state={props.state}
              onNodeClick={handleNodeClick}
            />
          )}
        </For>
      </ul>
    </nav>
  );
};

export default NavTree;
