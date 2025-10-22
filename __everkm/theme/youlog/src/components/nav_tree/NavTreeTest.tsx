import { Component, onMount } from 'solid-js';
import { NavTree } from './NavTree';
import { NavTreeState, NavItem } from './NavTreeState';

// 测试数据
const testNavItems: NavItem[] = [
  {
    nodeId: "home",
    title: "首页",
    url: "/",
    new_window: false
  },
  {
    nodeId: "products",
    title: "产品",
    children: [
      {
        nodeId: "features",
        title: "功能特性",
        url: "/features",
        children: [
          {
            nodeId: "core-features",
            title: "核心功能",
            url: "/features/core"
          },
          {
            nodeId: "advanced-features",
            title: "高级功能",
            url: "/features/advanced"
          }
        ]
      },
      {
        nodeId: "pricing",
        title: "定价",
        url: "/pricing"
      }
    ]
  },
  {
    nodeId: "docs",
    title: "文档",
    url: "/docs",
    children: [
      {
        nodeId: "getting-started",
        title: "快速开始",
        url: "/docs/getting-started"
      },
      {
        nodeId: "api-reference",
        title: "API 参考",
        url: "/docs/api"
      }
    ]
  },
  {
    nodeId: "contact",
    title: "联系我们",
    url: "/contact",
    new_window: true
  }
];

export const NavTreeTest: Component = () => {
  // 创建状态管理器
  const navTreeState = new NavTreeState(testNavItems, {
    autoExpandCurrentPath: true,
    enableBreadcrumbToggle: true,
    scrollToActiveLink: true,
    scrollDelay: 100
  });

  // 处理节点点击
  const handleNodeClick = (nodeId: string, node: NavItem) => {
    console.log('Node clicked:', nodeId, node);
  };

  // 测试状态管理方法
  const testStateMethods = () => {
    console.log('Testing state methods:');
    
    // 测试获取节点
    const homeNode = navTreeState.getNode('home');
    console.log('Home node:', homeNode);
    
    // 测试获取根节点
    const rootNodes = navTreeState.getRootNodes();
    console.log('Root nodes:', rootNodes);
    
    // 测试获取子节点
    const productChildren = navTreeState.getChildNodes('products');
    console.log('Product children:', productChildren);
    
    // 测试展开状态
    console.log('Is products expanded:', navTreeState.isExpanded('products'));
    
    // 测试切换展开状态（会展开祖先节点）
    navTreeState.toggleExpanded('products');
    console.log('After toggle - Is products expanded:', navTreeState.isExpanded('products'));
    
    // 测试深度嵌套节点的展开（应该展开所有祖先节点）
    const deepNodeId = navTreeState.state.tree[1]?.children?.[0]?.children?.[0]?.nodeId;
    if (deepNodeId) {
      console.log('Testing deep node expansion:', deepNodeId);
      navTreeState.toggleExpanded(deepNodeId);
      console.log('Deep node expanded:', navTreeState.isExpanded(deepNodeId));
      console.log('Parent expanded:', navTreeState.isExpanded(navTreeState.state.tree[1]?.children?.[0]?.nodeId || ''));
      console.log('Root expanded:', navTreeState.isExpanded(navTreeState.state.tree[1]?.nodeId || ''));
    }
    
    // 测试活动状态
    console.log('Is home active:', navTreeState.isActive('home'));
    navTreeState.setActive('home', true);
    console.log('After set active - Is home active:', navTreeState.isActive('home'));
  };

  // 组件卸载时清理（如果需要的话）
  onMount(() => {
    // 延迟执行测试，确保状态已初始化
    setTimeout(testStateMethods, 100);
    
    return () => {
      // 清理逻辑（如果需要）
    };
  });

  return (
    <div class="min-h-screen bg-gray-100 dark:bg-gray-800">
      <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          NavTree 组件测试 (状态管理版本)
        </h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：导航树 */}
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              导航树组件
            </h2>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <NavTree 
                state={navTreeState}
                onNodeClick={handleNodeClick}
                class="h-96"
              />
            </div>
          </div>
          
          {/* 右侧：状态信息 */}
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              状态信息
            </h2>
            <div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <strong>状态管理器:</strong> NavTreeState
              </div>
              <div>
                <strong>根节点数:</strong> {navTreeState.state.tree.length}
              </div>
              <div>
                <strong>展开节点数:</strong> {navTreeState.state.expandedIds.size}
              </div>
              <div>
                <strong>活动节点数:</strong> {navTreeState.state.activeIds.size}
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                测试数据
              </h3>
              <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-40">
{JSON.stringify(testNavItems, null, 2)}
              </pre>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                状态管理方法
              </h3>
              <div class="space-y-2 text-sm">
                <div>• <code>getNode(nodeId)</code> - 获取节点</div>
                <div>• <code>getRootNodes()</code> - 获取根节点</div>
                <div>• <code>getChildNodes(nodeId)</code> - 获取子节点</div>
                <div>• <code>toggleExpanded(nodeId)</code> - 切换展开状态</div>
                <div>• <code>setActive(nodeId, active)</code> - 设置活动状态</div>
                <div>• <code>updateActiveState()</code> - 更新活动状态</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            架构说明
          </h2>
          <div class="prose dark:prose-invert max-w-none">
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>状态与视图分离:</strong> NavTreeState 管理所有状态，NavTree 只负责渲染</li>
              <li>• <strong>全局唯一ID:</strong> 每个节点都有 nodeId 和 idPath</li>
              <li>• <strong>Solid Store:</strong> 使用 createStore 管理响应式状态</li>
              <li>• <strong>事件驱动:</strong> 所有交互通过状态管理器处理</li>
              <li>• <strong>类型安全:</strong> 完整的 TypeScript 类型定义</li>
              <li>• <strong>生命周期管理:</strong> 支持创建和销毁状态管理器</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavTreeTest;