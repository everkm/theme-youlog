import type { Accessor } from "solid-js";

// SolidJS指令类型定义
type DirectiveFunction = (
  element: HTMLElement,
  accessor: Accessor<(isVisible: boolean) => void>
) => void | (() => void);

const observeVisibility: DirectiveFunction = (el, accessor) => {
  const callback = accessor();

  const observer = new IntersectionObserver(
    ([entry]) => callback(entry.isIntersecting),
    { threshold: 0.1 }
  );

  observer.observe(el);

  return () => observer.disconnect();
};

export default observeVisibility;
