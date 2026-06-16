import { Component } from "solid-js";
import { hideStyle } from "../utils";

interface TOCProps {
  hidden?: boolean;
}

const TOC: Component<TOCProps> = (props) => {
  return (
    <div
      data-ajax-element="toc-slot"
      style={hideStyle(props.hidden)}
      class="w-full lg:w-1/4 lg:shrink-0 mt-8 lg:mt-0 print:hidden"
    >
      <div
        id="toc"
        class="mb-6 text-[0.9em] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1 overflow-y-auto"
      ></div>
    </div>
  );
};

export default TOC;
