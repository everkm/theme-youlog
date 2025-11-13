import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  TreeStructureValidator,
  DOMTreeParser,
  TreeConverter,
  TreeScanner,
} from "./sidebarNavTree2";

describe("TreeStructureValidator", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("有效结构验证", () => {
    it("应该通过标准树结构验证", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><a href="/page2">页面2</a></li>
          <li>知识库
            <ul>
              <li><a href="/page3">页面3</a></li>
              <li><a href="/page4">页面4</a></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).toBe("");
    });

    it("应该通过真实HTML结构验证", () => {
      const html = `
        <ul>
          <li>知识库
            <ul>
              <li><a href="/youlog/index-73e0e6a994ef.html?__hs=1">食材</a></li>
              <li><a href="/youlog/index-c05c4497d45a.html">食疗养生</a></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).toBe("");
    });

    it("应该通过 p>a 结构验证", () => {
      const html = `
        <ul>
          <li><p><a href="/page1">页面1</a></p></li>
          <li><p><a href="/page2">页面2</a></p>
            <ul>
              <li><p><a href="/page3">页面3</a></p></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).toBe("");
    });

    it("应该通过混合 a 和 p>a 结构验证", () => {
      const html = `
        <ul>
          <li><a href="/page1">直接链接</a></li>
          <li><p><a href="/page2">P标签内的链接</a></p></li>
          <li>分类
            <ul>
              <li><a href="/page3">直接链接</a></li>
              <li><p><a href="/page4">P标签内的链接</a></p></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).toBe("");
    });

    it("应该通过 p>文本 + ul 结构验证", () => {
      const html = `
        <ul>
          <li><p><a href="/page1">页面1</a></p></li>
          <li><p>知识库</p>
            <ul>
              <li><a href="/page2">页面2</a></li>
              <li><a href="/page3">页面3</a></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).toBe("");
    });
  });

  describe("无效结构验证", () => {
    it("应该拒绝非ul/ol元素", () => {
      const html = `<div><li><a href="/page1">页面1</a></li></div>`;
      container.innerHTML = html;
      const div = container.querySelector("div")!;
      const result = TreeStructureValidator.validateTreeStructure(div);
      expect(result).not.toBe("");
      expect(result).toContain("必须是ul或ol");
    });

    it("应该拒绝空列表", () => {
      const html = `<ul></ul>`;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("不能为空");
    });

    it("应该拒绝非li子元素", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <div>无效元素</div>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("必须是li");
    });

    it("应该拒绝空的li元素", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("不能为空");
    });

    it("应该拒绝纯文本但无子列表的li", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li>纯文本无子列表</li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
    });

    it("应该拒绝多个a元素", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><a href="/page2">页面2</a><a href="/page3">页面3</a></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("只能包含一个a元素");
    });

    it("应该拒绝包含不允许的元素", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><div>不允许的div</div><ul><li><a href="/page3">页面3</a></li></ul></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("包含不允许的元素");
    });

    it("应该拒绝ul/ol但第一个不是文本节点", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><ul><li><a href="/page3">页面3</a></li></ul></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("第一个子节点必须是文本节点");
    });

    it("应该拒绝p标签内没有a标签", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><p>没有链接的P标签</p></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).not.toBe("");
      expect(result).toContain("包含不允许的元素");
    });

    it("应该允许p标签内没有a标签但有子列表", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><p>知识库</p>
            <ul>
              <li><a href="/page3">页面3</a></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const result = TreeStructureValidator.validateTreeStructure(ul);
      expect(result).toBe("");
    });
  });
});

describe("DOMTreeParser", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("解析标准结构", () => {
    it("应该正确解析简单的链接列表", () => {
      const html = `
        <ul>
          <li><a href="/page1">页面1</a></li>
          <li><a href="/page2">页面2</a></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe("页面1");
      expect(items[0].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page1$/);
      expect(items[1].title).toBe("页面2");
      expect(items[1].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page2$/);
    });

    it("应该正确解析嵌套结构", () => {
      const html = `
        <ul>
          <li>知识库
            <ul>
              <li><a href="/page1">页面1</a></li>
              <li><a href="/page2">页面2</a></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("知识库");
      expect(items[0].url).toBeUndefined();
      expect(items[0].children).toHaveLength(2);
      expect(items[0].children![0].title).toBe("页面1");
      expect(items[0].children![1].title).toBe("页面2");
    });
  });

  describe("解析 p>a 结构", () => {
    it("应该正确解析 p>a 结构", () => {
      const html = `
        <ul>
          <li><p><a href="/page1">页面1</a></p></li>
          <li><p><a href="/page2">页面2</a></p></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe("页面1");
      expect(items[0].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page1$/);
      expect(items[1].title).toBe("页面2");
      expect(items[1].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page2$/);
    });

    it("应该正确解析 p>a 嵌套结构", () => {
      const html = `
        <ul>
          <li><p><a href="/page1">页面1</a></p>
            <ul>
              <li><p><a href="/page2">页面2</a></p></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe("页面1");
      expect(items[0].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page1$/);
      expect(items[0].children).toHaveLength(1);
      expect(items[0].children![0].title).toBe("页面2");
      expect(items[0].children![0].url).toMatch(
        /^https?:\/\/localhost(:\d+)?\/page2$/
      );
    });

    it("应该正确解析混合 a 和 p>a 结构", () => {
      const html = `
        <ul>
          <li><a href="/page1">直接链接</a></li>
          <li><p><a href="/page2">P标签内的链接</a></p></li>
          <li>分类
            <ul>
              <li><a href="/page3">直接链接</a></li>
              <li><p><a href="/page4">P标签内的链接</a></p></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items).toHaveLength(3);
      expect(items[0].title).toBe("直接链接");
      expect(items[0].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page1$/);
      expect(items[1].title).toBe("P标签内的链接");
      expect(items[1].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page2$/);
      expect(items[2].title).toBe("分类");
      expect(items[2].children).toHaveLength(2);
      expect(items[2].children![0].title).toBe("直接链接");
      expect(items[2].children![1].title).toBe("P标签内的链接");
    });

    it("应该正确解析 p>文本 + ul 结构", () => {
      const html = `
        <ul>
          <li><p><a href="/page1">页面1</a></p></li>
          <li><p>知识库</p>
            <ul>
              <li><a href="/page2">页面2</a></li>
              <li><a href="/page3">页面3</a></li>
            </ul>
          </li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);
      
      expect(items).toHaveLength(2);
      expect(items[0].title).toBe("页面1");
      expect(items[0].url).toMatch(/^https?:\/\/localhost(:\d+)?\/page1$/);
      expect(items[1].title).toBe("知识库");
      expect(items[1].url).toBeUndefined();
      expect(items[1].children).toHaveLength(2);
      expect(items[1].children![0].title).toBe("页面2");
      expect(items[1].children![1].title).toBe("页面3");
    });
  });

  describe("解析特殊属性", () => {
    it('应该正确解析 target="_blank" 属性', () => {
      const html = `
        <ul>
          <li><a href="/page1" target="_blank">新窗口打开</a></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items[0].new_window).toBe(true);
    });

    it('应该正确解析 p>a 结构中的 target="_blank" 属性', () => {
      const html = `
        <ul>
          <li><p><a href="/page1" target="_blank">新窗口打开</a></p></li>
        </ul>
      `;
      container.innerHTML = html;
      const ul = container.querySelector("ul")!;
      const items = DOMTreeParser.parseToNavItems(ul);

      expect(items[0].new_window).toBe(true);
    });
  });
});

describe("TreeConverter", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    TreeConverter.clearConvertedElements();
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it("应该拒绝转换无效的树结构", () => {
    const html = `
      <ul>
        <li><div>无效元素</div></li>
      </ul>
    `;
    container.innerHTML = html;
    const ul = container.querySelector("ul")!;

    const result = TreeConverter.convertToNavTree(ul);
    expect(result).toBe(false);
    expect(TreeConverter.getConvertedCount()).toBe(0);
  });

  // 注意：TreeConverter 的完整测试需要实际的 SolidJS 渲染环境
  // 在实际项目中，这些测试应该在集成测试或 E2E 测试中完成
});

describe("TreeScanner", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-scanner-container";
    document.body.appendChild(container);
    TreeConverter.clearConvertedElements();
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it("应该能够扫描容器中的列表元素", () => {
    const html = `
      <ul>
        <li><a href="/page1">页面1</a></li>
      </ul>
      <ul>
        <li><a href="/page2">页面2</a></li>
      </ul>
      <ul>
        <li><div>无效结构</div></li>
      </ul>
    `;
    container.innerHTML = html;

    // 验证扫描功能可以正常调用（不抛出错误）
    expect(() => {
      TreeScanner.scanContainer(container);
    }).not.toThrow();
  });

  // 注意：TreeScanner 的完整转换测试需要实际的 SolidJS 渲染环境
  // 在实际项目中，这些测试应该在集成测试或 E2E 测试中完成
});
