/**
 * 获取或创建 youlog 对象，并将传入的对象扩展到 youlog 命名空间中
 * @param extensions 要扩展到 youlog 命名空间的对象
 * @returns youlog 对象
 */
function youlogRegister(extensions?: Record<string, any>): any {
  // 确保 youlog 对象存在
  if (!(window as any).youlog) {
    (window as any).youlog = {};
  }

  // 如果 youlog 是函数，调用它获取对象并注册到 window
  let youlog: any;
  if (typeof (window as any).youlog === "function") {
    youlog = (window as any).youlog();
    (window as any).youlog = youlog;
  } else {
    youlog = (window as any).youlog;
  }

  // 如果传入了扩展对象，将其属性扩展到 youlog 对象上
  if (extensions) {
    Object.assign(youlog, extensions);
  }

  return youlog;
}

export default youlogRegister;

