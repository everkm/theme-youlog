# SidebarNavTree2 - 通用导航树转换器

## 概述

`sidebarNavTree2.ts` 是 nav-tree widget 的一部分，能够自动扫描页面中符合特定结构的 `ul`/`ol` 元素，并将其转换为使用 SolidJS 的 `NavTree` 组件渲染的交互式导航树。

## 功能特性

- **自动扫描**: 自动扫描页面中所有可转换的树结构元素
- **结构验证**: 严格验证 `ul`/`ol` 结构是否符合要求
- **递归解析**: 递归解析嵌套的树结构为 `NavItem` 数据
- **动态替换**: 使用 SolidJS 的 `NavTree` 组件替换原始渲染
- **事件监听**: 监听页面加载事件，处理动态内容
- **防重复转换**: 避免重复转换同一元素

## 使用方法

```typescript
import { installSidebarNavTree2, TreeScanner, TreeConverter, TreeStructureValidator } from "youlog_lib";

installSidebarNavTree2();

// 或手动扫描容器
const container = document.getElementById("my-container");
if (container) TreeScanner.scanContainer(container);
```

## 注意事项

1. 只有完全符合要求的 `ul`/`ol` 结构才会被转换
2. 已转换的元素会被标记，避免重复处理
3. 需要容器 `#sidebar-nav-tree` 或手动调用 `TreeScanner.scanContainer(container)`
