# SidebarNavTree2 - 通用导航树转换器

## 概述

`sidebarNavTree2.ts` 是一个通用的导航树转换模块，它能够自动扫描页面中所有符合特定结构的 `ul`/`ol` 元素，并将它们转换为使用 SolidJS 的 `NavTree` 组件渲染的交互式导航树。

## 功能特性

- **自动扫描**: 自动扫描页面中所有可转换的树结构元素
- **结构验证**: 严格验证 `ul`/`ol` 结构是否符合要求
- **递归解析**: 递归解析嵌套的树结构为 `NavItem` 数据
- **动态替换**: 使用 SolidJS 的 `NavTree` 组件替换原始渲染
- **事件监听**: 监听页面加载事件，处理动态内容
- **防重复转换**: 避免重复转换同一元素

## 支持的结构

### 标准树结构

```html
<ul>
  <li><a href="/youlog/">特好吃序</a></li>
  <li><a href="/youlog/shipu/?__hs=1">食谱</a></li>
  <li><a href="/youlog/index-009ea233db47.html">调味</a></li>
  <li><a href="/youlog/zuo-fan-ji-qiao-7105777d2323.html">做饭技巧</a></li>
  <li>知识库
    <ul>
      <li><a href="/youlog/index-73e0e6a994ef.html?__hs=1">食材</a></li>
      <li><a href="/youlog/index-c05c4497d45a.html">食疗养生</a></li>
      <li>食品安全
        <ul>
          <li><a href="/youlog/peiliaobiao-6727e09fefde.html">配料表</a></li>
          <li><a href="/youlog/tianjiaji-5e4d1d2fa76e.html">食品添加剂</a></li>
          <li><a href="/youlog/zhuanjiyin-shipin-63bb0fa91815.html">转基因食品</a></li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```

### 结构要求

1. **根元素**: 必须是 `ul` 或 `ol`
2. **直接子元素**: 所有直接子元素必须是 `li`
3. **li 内容**: 每个 `li` 可以包含：
   - 一个 `a` 标签（叶子节点）
   - 纯文本 + 子 `ul`/`ol`（分支节点）
4. **嵌套结构**: 支持无限层级的嵌套

## 核心类

### TreeStructureValidator

负责验证 DOM 结构是否符合树结构要求。

```typescript
class TreeStructureValidator {
  static isValidTreeStructure(element: HTMLElement): boolean
  private static validateLiStructure(liElement: HTMLLIElement): boolean
}
```

### MarkdownTreeParser

负责将 markdown 转换的 HTML 结构解析为 `NavItem` 树。

```typescript
class MarkdownTreeParser {
  parse(element: HTMLElement): NavItem[]
  static quickValidate(element: HTMLElement): boolean
}
```

### TreeConverter

负责将 DOM 树转换为 `NavTree` 组件。

```typescript
class TreeConverter {
  static convertToNavTree(element: HTMLElement): boolean
  static getConvertedCount(): number
  static clearConvertedElements(): void
}
```

### TreeScanner

负责扫描页面中所有可转换的元素。

```typescript
class TreeScanner {
  static scanAndConvertAll(): void
  static scanContainer(container: HTMLElement): void
}
```

## 使用方法

### 基本使用

```typescript
import { initSidebarNavTree2 } from './sidebar_nav_tree/sidebarNavTree2';

// 初始化（通常在页面加载时调用）
initSidebarNavTree2();
```

### 手动扫描特定容器

```typescript
import { TreeScanner } from './sidebar_nav_tree/sidebarNavTree2';

const container = document.getElementById('my-container');
TreeScanner.scanContainer(container);
```

### 手动转换单个元素

```typescript
import { TreeConverter, TreeStructureValidator } from './sidebar_nav_tree/sidebarNavTree2';

const element = document.getElementById('my-tree');
if (TreeStructureValidator.isValidTreeStructure(element)) {
  TreeConverter.convertToNavTree(element);
}
```

## 配置选项

转换后的 `NavTree` 使用以下默认配置：

```typescript
const defaultConfig = {
  autoExpandCurrentPath: true,    // 自动展开当前路径
  enableBreadcrumbToggle: true,  // 启用breadcrumb切换功能
  scrollToActiveLink: true,       // 滚动到活动链接
  scrollDelay: 100               // 滚动延迟时间(ms)
};
```

## 事件监听

模块会自动监听以下事件：

- `DOMContentLoaded`: 页面初始加载完成
- `EVENT_PAGE_LOADED`: 页面内容更新（AJAX加载）

## 测试功能

在开发环境中，模块会加载测试功能：

```typescript
// 测试文件位置
import './sidebar_nav_tree/sidebarNavTree2Test';

// 手动运行测试
runSidebarNavTree2Tests();
```

测试功能包括：
- 结构验证测试
- DOM解析测试
- 转换功能测试
- 扫描功能测试

## 注意事项

1. **结构严格性**: 只有完全符合要求的 `ul`/`ol` 结构才会被转换
2. **防重复转换**: 已转换的元素会被标记，避免重复处理
3. **性能考虑**: 大量元素转换可能影响页面性能，建议在合适的时机调用
4. **兼容性**: 需要支持 SolidJS 和现代浏览器环境

## 错误处理

模块包含完善的错误处理机制：

- 结构验证失败时会跳过转换
- 解析失败时会记录错误日志
- 转换失败时会回退到原始渲染

## 调试信息

模块会输出详细的调试信息到控制台：

```javascript
console.log("开始扫描可转换的树元素...");
console.log("元素结构不符合要求，跳过转换:", element);
console.log("成功转换元素为NavTree:", element, navItems);
console.log(`扫描完成，共转换了 ${convertedCount} 个元素`);
```
