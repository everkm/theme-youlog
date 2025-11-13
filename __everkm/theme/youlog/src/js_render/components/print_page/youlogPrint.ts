import youlogRegister from "../../../youlogRegister";
import printJS from "print-js";

function youlogPrint() {
  const pageMain = document.getElementById("page-main");
  if (!pageMain) {
    // 如果找不到元素，回退到默认打印
    window.print();
    return;
  }

  const currentUrl = window.location.href;

  printJS({
    printable: "page-main",
    type: "html",
    header: currentUrl,
    headerStyle: "font-weight: normal; color: #666; font-size: 12px; font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;",
    targetStyles: ["*"],
    style: ``,
  });
}

function initYoulogPrint() {
  // 使用 youlogRegister 注册 print 函数
  youlogRegister({
    print: youlogPrint,
  });
}

export { initYoulogPrint };
