import { Component } from "solid-js";

interface PrintPageProps {
  className?: string;
}

const PrintPage: Component<PrintPageProps> = (props) => {
  return (
    <a
      href="javascript:youlog.print()"
      class={`${props.className}`}
      onclick={() => window.print()}
    >
      <span class="icon-[prime--print] text-base"></span>
      Print
    </a>
  );
};

export default PrintPage;
