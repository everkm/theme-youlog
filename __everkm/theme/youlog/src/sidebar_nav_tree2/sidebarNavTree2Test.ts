/**
 * 测试TreeStructureValidator的字符串返回功能
 */
export function testTreeStructureValidator(): void {
  console.log("测试TreeStructureValidator字符串返回功能...");

  // 创建测试HTML
  const testHTML = `
    <div id="test-container">
      <!-- 测试用例1：标准树结构（应该通过） -->
      <ul id="test-valid">
        <li><a href="/page1">页面1</a></li>
        <li><a href="/page2">页面2</a></li>
        <li>知识库
          <ul>
            <li><a href="/page3">页面3</a></li>
            <li><a href="/page4">页面4</a></li>
          </ul>
        </li>
      </ul>

      <!-- 测试用例1.1：您提到的HTML结构 -->
      <ul id="test-valid-real">
        <li>知识库
          <ul>
            <li><a href="/youlog/index-73e0e6a994ef.html?__hs=1">食材</a></li>
            <li><a href="/youlog/index-c05c4497d45a.html">食疗养生</a></li>
          </ul>
        </li>
      </ul>

      <!-- 测试用例2：无效结构 - 非ul/ol元素 -->
      <div id="test-invalid-1">
        <li><a href="/page1">页面1</a></li>
      </div>

      <!-- 测试用例3：无效结构 - 空列表 -->
      <ul id="test-invalid-2"></ul>

      <!-- 测试用例4：无效结构 - 非li子元素 -->
      <ul id="test-invalid-3">
        <li><a href="/page1">页面1</a></li>
        <div>无效元素</div>
      </ul>

      <!-- 测试用例5：无效结构 - li为空 -->
      <ul id="test-invalid-4">
        <li><a href="/page1">页面1</a></li>
        <li></li>
      </ul>

      <!-- 测试用例6：无效结构 - 纯文本但无子列表 -->
      <ul id="test-invalid-5">
        <li><a href="/page1">页面1</a></li>
        <li>纯文本无子列表</li>
      </ul>

      <!-- 测试用例7：无效结构 - 多个元素 -->
      <ul id="test-invalid-6">
        <li><a href="/page1">页面1</a></li>
        <li><a href="/page2">页面2</a><ul><li><a href="/page3">页面3</a></li></ul></li>
      </ul>

      <!-- 测试用例8：无效结构 - 包含不允许的元素 -->
      <ul id="test-invalid-7">
        <li><a href="/page1">页面1</a></li>
        <li><div>不允许的div</div><ul><li><a href="/page3">页面3</a></li></ul></li>
      </ul>

      <!-- 测试用例9：无效结构 - ul/ol但第一个不是文本节点 -->
      <ul id="test-invalid-8">
        <li><a href="/page1">页面1</a></li>
        <li><ul><li><a href="/page3">页面3</a></li></ul></li>
      </ul>
    </div>
  `;

  // 创建测试容器
  const testContainer = document.createElement("div");
  testContainer.innerHTML = testHTML;
  document.body.appendChild(testContainer);

  // 导入验证器
  import('./sidebarNavTree2').then(({ TreeStructureValidator }) => {
    
    // 测试有效结构
    const validElement = document.getElementById("test-valid");
    const validResult = TreeStructureValidator.validateTreeStructure(validElement!);
    console.log("有效结构测试:", validResult === "" ? "通过" : `失败: ${validResult}`);

    // 测试您提到的HTML结构
    const validRealElement = document.getElementById("test-valid-real");
    const validRealResult = TreeStructureValidator.validateTreeStructure(validRealElement!);
    console.log("真实HTML结构测试:", validRealResult === "" ? "通过" : `失败: ${validRealResult}`);

    // 测试DOMTreeParser解析功能
    import('./sidebarNavTree2').then(({ DOMTreeParser }) => {
      const parsedItems = DOMTreeParser.parseToNavItems(validRealElement!);
      console.log("解析结果:", parsedItems);
    });

    // 测试无效结构1 - 非ul/ol元素
    const invalid1 = document.getElementById("test-invalid-1");
    const invalid1Result = TreeStructureValidator.validateTreeStructure(invalid1!);
    console.log("无效结构1测试:", invalid1Result);

    // 测试无效结构2 - 空列表
    const invalid2 = document.getElementById("test-invalid-2");
    const invalid2Result = TreeStructureValidator.validateTreeStructure(invalid2!);
    console.log("无效结构2测试:", invalid2Result);

    // 测试无效结构3 - 非li子元素
    const invalid3 = document.getElementById("test-invalid-3");
    const invalid3Result = TreeStructureValidator.validateTreeStructure(invalid3!);
    console.log("无效结构3测试:", invalid3Result);

    // 测试无效结构4 - li为空
    const invalid4 = document.getElementById("test-invalid-4");
    const invalid4Result = TreeStructureValidator.validateTreeStructure(invalid4!);
    console.log("无效结构4测试:", invalid4Result);

    // 测试无效结构5 - 纯文本但无子列表
    const invalid5 = document.getElementById("test-invalid-5");
    const invalid5Result = TreeStructureValidator.validateTreeStructure(invalid5!);
    console.log("无效结构5测试:", invalid5Result);

    // 测试无效结构6 - 多个元素
    const invalid6 = document.getElementById("test-invalid-6");
    const invalid6Result = TreeStructureValidator.validateTreeStructure(invalid6!);
    console.log("无效结构6测试:", invalid6Result);

    // 测试无效结构7 - 包含不允许的元素
    const invalid7 = document.getElementById("test-invalid-7");
    const invalid7Result = TreeStructureValidator.validateTreeStructure(invalid7!);
    console.log("无效结构7测试:", invalid7Result);

    // 测试无效结构8 - ul/ol但第一个不是文本节点
    const invalid8 = document.getElementById("test-invalid-8");
    const invalid8Result = TreeStructureValidator.validateTreeStructure(invalid8!);
    console.log("无效结构8测试:", invalid8Result);

    // 清理测试容器
    setTimeout(() => {
      document.body.removeChild(testContainer);
      console.log("测试完成，已清理测试容器");
    }, 3000);

  }).catch(error => {
    console.error("测试失败:", error);
  });
}

// 如果是在浏览器环境中，可以手动调用测试
if (typeof window !== 'undefined') {
  // 添加测试按钮到页面
  const testButton = document.createElement('button');
  testButton.textContent = '测试TreeStructureValidator';
  testButton.style.cssText = `
    position: fixed;
    top: 50px;
    right: 10px;
    z-index: 9999;
    padding: 10px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  testButton.onclick = testTreeStructureValidator;
  document.body.appendChild(testButton);
}