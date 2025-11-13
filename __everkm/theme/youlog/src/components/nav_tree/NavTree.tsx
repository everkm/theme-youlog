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
  hasSiblingWithChildren?: boolean;
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
          class={isLeaf() ? "tree-node-leaf" : "tree-node-branch"}
          classList={{
            active: isActive(),
          }}
          data-depth={props.depth}
          data-node-id={props.nodeId}
          style={`--depth: ${props.depth}`}
        >
          <div
            class="node-content mb-0.5"
            classList={{
              "with-toggle": props.hasSiblingWithChildren ?? false,
              expanded: isExpanded(),
            }}
            onClick={handleToggle}
          >
            <Show when={currentNode().url}>
              <a
                href={currentNode().url}
                target={currentNode().new_window ? "_blank" : undefined}
                classList={{
                  "active-link": isActive(),
                }}
                onClick={handleNodeClick}
              >
                {currentNode().title}
              </a>
            </Show>
            <Show when={!currentNode().url}>
              <span
                classList={{
                  "active-link": isActive(),
                }}
              >
                {currentNode().title}
              </span>
            </Show>
          </div>

          <Show when={hasChildren()}>
            <ul
              classList={{
                hidden: !isExpanded(),
              }}
            >
              <For each={currentNode().children}>
                {(child) => {
                  // 检查这一层的所有兄弟节点是否至少有一个有子节点
                  const siblings = currentNode().children || [];
                  const hasSiblingWithChildren = siblings.some(
                    (sibling) => sibling.children && sibling.children.length > 0
                  );
                  return (
                    <TreeNode
                      nodeId={child.nodeId}
                      depth={props.depth + 1}
                      state={props.state}
                      onNodeClick={props.onNodeClick}
                      hasSiblingWithChildren={hasSiblingWithChildren}
                    />
                  );
                }}
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
    <nav
      ref={navElement}
      class={`nav-tree select-none${props.class ? ` ${props.class}` : ""}`}
    >
      <ul>
        <For each={rootNodes()}>
          {(node) => {
            // 检查根节点层是否至少有一个有子节点
            const rootNodesList = rootNodes();
            const hasSiblingWithChildren = rootNodesList.some(
              (sibling) => sibling.children && sibling.children.length > 0
            );
            return (
              <TreeNode
                nodeId={node.nodeId}
                depth={0}
                state={props.state}
                onNodeClick={handleNodeClick}
                hasSiblingWithChildren={hasSiblingWithChildren}
              />
            );
          }}
        </For>
      </ul>
    </nav>
  );
};

export default NavTree;
