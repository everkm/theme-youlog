import { Component, onMount } from 'solid-js';
import { NavTree } from './NavTree';
import { NavTreeState, NavItem } from './NavTreeState';

// 示例数据
const sampleNavItems: NavItem[] = [
  {
    nodeId: "home",
    title: "首页",
    url: "/",
    new_window: false
  },
  {
    nodeId: "docs",
    title: "文档",
    url: "/docs",
    children: [
      {
        nodeId: "getting-started",
        title: "快速开始",
        url: "/docs/getting-started",
        children: [
          {
            nodeId: "installation",
            title: "安装",
            url: "/docs/getting-started/installation"
          },
          {
            nodeId: "configuration",
            title: "配置",
            url: "/docs/getting-started/configuration"
          }
        ]
      },
      {
        nodeId: "api",
        title: "API 参考",
        url: "/docs/api",
        children: [
          {
            nodeId: "components",
            title: "组件",
            url: "/docs/api/components"
          },
          {
            nodeId: "utils",
            title: "工具函数",
            url: "/docs/api/utils"
          }
        ]
      }
    ]
  },
  {
    nodeId: "examples",
    title: "示例",
    url: "/examples",
    children: [
      {
        nodeId: "basic",
        title: "基础示例",
        url: "/examples/basic"
      },
      {
        nodeId: "advanced",
        title: "高级示例",
        url: "/examples/advanced"
      }
    ]
  },
  {
    nodeId: "about",
    title: "关于",
    url: "/about",
    new_window: true
  }
];

// 使用示例
export const NavTreeExample: Component = () => {
  // 创建状态管理器
  const navTreeState = new NavTreeState(sampleNavItems, {
    autoExpandCurrentPath: true,
    enableBreadcrumbToggle: true,
    scrollToActiveLink: true,
    scrollDelay: 100
  });

  // 处理节点点击
  const handleNodeClick = (nodeId: string, node: NavItem) => {
    console.log('Node clicked:', nodeId, node);
  };

  // 组件卸载时清理（如果需要的话）
  onMount(() => {
    // 状态管理器会在组件卸载时自动清理
    return () => {
      // 清理逻辑（如果需要）
    };
  });

  return (
    <div class="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <NavTree 
        state={navTreeState}
        onNodeClick={handleNodeClick}
        class="h-full overflow-y-auto"
      />
    </div>
  );
};

export default NavTreeExample;