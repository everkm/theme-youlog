import { Component } from "solid-js";

const PrintPage: Component = () => {
  return (
    <a
      href="javascript:youlog.print()"
      class="text-sm text-gray-600"
      onclick={() => window.print()}
    >
      打印
    </a>
  );
};

export default PrintPage;
