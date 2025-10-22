# NavTree 组件 (状态管理版本)

一个基于 SolidJS 的导航树组件，采用状态与视图分离的架构设计，支持展开/折叠、路径匹配、活动状态管理等功能。

## 架构设计

### 状态与视图分离

- **NavTreeState**: 状态管理类，负责所有业务逻辑和状态管理
- **NavTree**: 纯视图组件，只负责渲染
- **NavItem**: 增强的数据结构，包含 `nodeId` 和 `idPath`

### 核心特性

- ✅ 状态与视图完全分离
- ✅ 树形结构状态管理
- ✅ 基于 ID 的递归访问
- ✅ 全局唯一节点ID (`nodeId`)
- ✅ SolidJS 响应式优化 (`createMemo`)
- ✅ 智能祖先节点展开
- ✅ Solid Store 响应式状态管理
- ✅ 事件驱动的交互模式
- ✅ 完整的 TypeScript 类型支持
- ✅ 生命周期管理

## 使用方法

### 基本用法

```tsx
import { NavTree } from './NavTree';
import { NavTreeState, NavItem } from './NavTreeState';

const navItems: NavItem[] = [
  {
    nodeId: "home",
    title: "首页",
    url: "/"
  },
  {
    nodeId: "docs",
    title: "文档",
    children: [
      {
        nodeId: "getting-started",
        title: "快速开始",
        url: "/docs/getting-started"
      }
    ]
  }
];

function App() {
  const navTreeState = new NavTreeState(navItems);
  
  return (
    <NavTree 
      state={navTreeState}
      onNodeClick={(nodeId, node) => console.log(nodeId, node)}
    />
  );
}
```

### 高级配置

```tsx
const navTreeState = new NavTreeState(navItems, {
  autoExpandCurrentPath: true,
  enableBreadcrumbToggle: true,
  scrollToActiveLink: true,
  scrollDelay: 100
});
```

## API 参考

### NavItem 接口

```typescript
interface NavItem {
  /** 节点唯一标识符 */
  nodeId: string;
  /** 节点标题 */
  title: string;
  /** 节点链接 */
  url?: string;
  /** 是否在新窗口打开 */
  new_window?: boolean;
  /** 子节点列表 */
  children?: NavItem[];
}
```

### NavTreeState 类

#### 构造函数
```typescript
constructor(items: NavItem[], config?: Partial<NavTreeConfig>)
```

#### 主要方法

```typescript
// 获取节点
getNode(nodeId: string): NavItem | undefined

// 获取节点路径
getNodePath(nodeId: string): string[] | null

// 获取根节点列表
getRootNodes(): NavItem[]

// 获取子节点列表
getChildNodes(nodeId: string): NavItem[]

// 检查节点是否展开
isExpanded(nodeId: string): boolean

// 检查节点是否为活动状态
isActive(nodeId: string): boolean

// 切换节点展开状态
toggleExpanded(nodeId: string): void

// 设置节点展开状态
setExpanded(nodeId: string, expanded: boolean): void

// 设置节点活动状态
setActive(nodeId: string, active: boolean): void

// 更新活动状态（基于当前路径）
updateActiveState(): void

// 按文本路径切换节点
toggleByTextPath(textPath: string[]): void

// 销毁状态管理器
destroy(): void
```

### NavTreeProps 接口

```typescript
interface NavTreeProps {
  /** 导航树状态管理器 */
  state: NavTreeState;
  /** 自定义CSS类名 */
  class?: string;
  /** 节点点击回调 */
  onNodeClick?: (nodeId: string, node: NavItem) => void;
}
```

## 状态管理

### 状态结构

```typescript
interface NavTreeStateData {
  /** 树形结构数据 */
  tree: NavItem[];
  /** 展开的节点ID集合 */
  expandedIds: Set<string>;
  /** 活动的节点ID集合 */
  activeIds: Set<string>;
}
```

### 状态更新

所有状态更新都通过 `NavTreeState` 类的方法进行，确保状态的一致性和可预测性：

```tsx
// 切换展开状态
navTreeState.toggleExpanded('docs');

// 设置活动状态
navTreeState.setActive('home', true);

// 更新活动状态
navTreeState.updateActiveState();
```

## 事件处理

### 节点点击事件

```tsx
const handleNodeClick = (nodeId: string, node: NavItem) => {
  console.log('Node clicked:', nodeId, node);
  // 处理节点点击逻辑
};

<NavTree 
  state={navTreeState}
  onNodeClick={handleNodeClick}
/>
```

### 展开/折叠事件

展开/折叠通过状态管理器自动处理，具有智能的祖先节点展开逻辑：

```tsx
// 手动切换（会自动展开祖先节点）
navTreeState.toggleExpanded('deepNodeId');

// 设置展开状态（会自动展开祖先节点）
navTreeState.setExpanded('deepNodeId', true);

// 按文本路径切换
navTreeState.toggleByTextPath(['文档', 'API参考']);
```

**重要特性**: 当展开一个节点时，会自动确保其所有祖先节点也处于展开状态，保证树形结构的正确显示。

## 路径匹配

组件支持多种路径匹配策略：

1. **精确匹配** - 完全匹配当前路径
2. **前缀匹配** - 当前路径是目标路径的前缀
3. **自动更新** - 监听浏览器历史变化

## 生命周期管理

```tsx
import { onMount } from 'solid-js';

function App() {
  const navTreeState = new NavTreeState(navItems);
  
  onMount(() => {
    // 组件挂载时的初始化
    navTreeState.updateActiveState();
    
    return () => {
      // 组件卸载时清理
      navTreeState.destroy();
    };
  });
  
  return <NavTree state={navTreeState} />;
}
```

## 样式定制

组件使用与原有版本相同的 CSS 类名，确保样式兼容：

- `.nav-tree` - 导航树容器
- `.tree-node-leaf` - 叶子节点
- `.tree-node-branch` - 分支节点
- `.node-content` - 节点内容
- `.with-toggle` - 可切换的节点
- `.expanded` - 展开状态
- `.active` - 活动状态
- `.active-link` - 活动链接
- `.hidden` - 隐藏状态

## 性能优化

### SolidJS 响应式优化

组件使用 `createMemo` 进行性能优化，避免不必要的重新计算：

```tsx
const TreeNode: Component<{...}> = (props) => {
  // ✅ 使用 createMemo 缓存计算结果
  const node = createMemo(() => props.state.getNode(props.nodeId));
  const hasChildren = createMemo(() => {
    const currentNode = node();
    return currentNode?.children && currentNode.children.length > 0;
  });
  const isExpanded = createMemo(() => props.state.isExpanded(props.nodeId));
  const isActive = createMemo(() => props.state.isActive(props.nodeId));
  
  // ❌ 避免直接函数调用
  // const node = () => props.state.getNode(props.nodeId);
};
```

### 优化效果

- **缓存计算**: `createMemo` 只在依赖变化时重新计算
- **细粒度更新**: 只有相关节点会重新渲染
- **避免重复计算**: 相同的计算结果会被缓存
- **更好的性能**: 特别是在大型树结构中表现优异

## 最佳实践

1. **状态管理**: 始终通过 `NavTreeState` 类管理状态，避免直接操作 DOM
2. **性能优化**: 使用 `createMemo` 缓存计算结果，避免不必要的重新计算
3. **类型安全**: 使用 TypeScript 确保类型安全
4. **事件处理**: 通过回调函数处理业务逻辑，保持组件的纯净性
5. **树形结构**: 利用递归访问模式，保持代码简洁

## 迁移指南

从旧版本迁移到状态管理版本：

1. 将 `NavItem` 数据添加 `nodeId` 字段
2. 创建 `NavTreeState` 实例
3. 将 `NavTree` 组件的 `items` 属性替换为 `state` 属性
4. 通过状态管理器处理所有交互逻辑