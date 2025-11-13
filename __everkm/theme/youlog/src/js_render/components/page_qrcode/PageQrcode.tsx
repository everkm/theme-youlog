import { Component } from "solid-js";

/**
 * 页面二维码组件（占位符）
 * 实际渲染由 pageQrcode.ts 中的 initPageQrcode 函数在客户端执行
 */
const PageQrcode: Component = () => {
  return (
    <div class="flex flex-col items-center my-6">
      <div data-el="page-qrcode" class="flex justify-center" />
      <p class="text-sm text-gray-600 text-center whitespace-nowrap w-full">扫码打开本页面</p>
    </div>
  );
};

export default PageQrcode;
