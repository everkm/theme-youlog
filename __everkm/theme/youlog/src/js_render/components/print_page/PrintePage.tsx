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
      打印
    </a>
  );
};

export default PrintPage;
