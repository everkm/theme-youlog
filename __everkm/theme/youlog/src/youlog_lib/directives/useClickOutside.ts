import type { Accessor } from "solid-js";

// SolidJS指令类型定义
type DirectiveFunction = (
  element: HTMLElement,
  accessor: () => Accessor<() => void>
) => void | (() => void);

const clickOutside: DirectiveFunction = (el, accessor) => {
  const callback = accessor();

  const handleClick = (e: MouseEvent) => {
    if (el && !el.contains(e.target as Node)) {
      callback();
    }
  };

  document.addEventListener("click", handleClick);

  return () => document.removeEventListener("click", handleClick);
};

export default clickOutside;
