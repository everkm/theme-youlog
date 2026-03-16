// SolidJS指令类型定义
type DirectiveFunction = (element: HTMLElement) => void;

const autoFocus: DirectiveFunction = (el) => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      el?.focus();
    }, 100);
  });
};

export default autoFocus;
