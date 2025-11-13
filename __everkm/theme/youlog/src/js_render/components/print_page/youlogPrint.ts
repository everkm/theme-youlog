import youlogRegister from "../../../youlogRegister";

function youlogPrint() {
  window.print();
}

function initYoulogPrint() {
  // 使用 youlogRegister 注册 print 函数
  youlogRegister({
    print: youlogPrint,
  });
}

export { initYoulogPrint };
