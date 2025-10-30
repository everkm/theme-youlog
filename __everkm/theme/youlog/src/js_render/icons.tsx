import { Component } from "solid-js";

// Home Icon
export const HomeIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

// Chevron Right Icon (用于面包屑)
export const ChevronRightIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "w-3 h-3 mx-1 inline-flex items-center"}
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
  </svg>
);

// Menu Icon (Hamburger)
export const MenuIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "w-5 h-5"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

// Close Icon
export const CloseIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "w-5 h-5"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Next Arrow Icon
export const NextArrowIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "inline-block"}
    viewBox="0 0 24 24"
    width="1.5em"
    height="1.5em"
  >
    <path
      fill="currentColor"
      d="M13.2929 19.7071C12.9024 19.3166 12.9024 18.6834 13.2929 18.2929L18.5858 13L3 13C2.44772 13 2 12.5523 2 12C2 11.4477 2.44771 11 3 11L18.5858 11L13.2929 5.70711C12.9024 5.31658 12.9024 4.68342 13.2929 4.29289C13.6834 3.90237 14.3166 3.90237 14.7071 4.29289L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L14.7071 19.7071C14.3166 20.0976 13.6834 20.0976 13.2929 19.7071Z"
    />
  </svg>
);

// Prev Arrow Icon
export const PrevArrowIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "inline-block"}
    viewBox="0 0 24 24"
    width="1.5em"
    height="1.5em"
  >
    <path
      fill="currentColor"
      d="M10.7071 4.29289C11.0976 4.68342 11.0976 5.31658 10.7071 5.70711L5.41421 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H5.41421L10.7071 18.2929C11.0976 18.6834 11.0976 19.3166 10.7071 19.7071C10.3166 20.0976 9.68342 20.0976 9.29289 19.7071L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L9.29289 4.29289C9.68342 3.90237 10.3166 3.90237 10.7071 4.29289Z"
    />
  </svg>
);

// Settings Icon (主题设置)
export const SettingsIcon: Component<{ class?: string }> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class={props.class || "w-5 h-5"}
    viewBox="0 0 16 16"
  >
    <path
      fill="currentColor"
      d="M12 13q-.68 0-1.21-.236a1.95 1.95 0 0 1-.841-.707q-.305-.472-.305-1.17q0-.591.217-.993a1.8 1.8 0 0 1 .591-.647q.374-.245.85-.369q.48-.125 1.01-.175q.618-.064.998-.12q.379-.06.55-.175c.171-.115.171-.191.171-.342v-.028q0-.438-.277-.679q-.273-.24-.776-.24q-.531 0-.845.236a1.2 1.2 0 0 0-.231.221c-.147.187-.355.348-.592.328l-.845-.068c-.301-.025-.516-.312-.392-.587a2.4 2.4 0 0 1 .369-.577q.406-.475 1.05-.73q.646-.259 1.5-.26a4.5 4.5 0 0 1 1.13.14q.545.139.965.429q.424.29.67.748q.245.451.245 1.09v4.28a.5.5 0 0 1-.5.5h-.866a.5.5 0 0 1-.5-.5v-.484h-.055a2 2 0 0 1-.457.586q-.286.249-.688.393a2.9 2.9 0 0 1-.928.138zm.563-1.36q.434 0 .767-.171q.333-.176.522-.471c.189-.295.189-.42.189-.67v-.753q-.092.06-.254.111q-.157.046-.356.088a18 18 0 0 1-.397.07l-.36.05a2.4 2.4 0 0 0-.605.162a1 1 0 0 0-.402.3a.73.73 0 0 0-.143.462q0 .402.291.614q.295.208.748.208"
    />
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M5.47 1.34a.501.501 0 0 0-.949.009l-3.28 10.3a.5.5 0 0 1-.476.348H.496a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 0-1h-.474a.25.25 0 0 1-.238-.326l.422-1.33a.5.5 0 0 1 .476-.348h2.86a.5.5 0 0 1 .476.346l.43 1.33a.25.25 0 0 1-.238.327h-.219a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-.034a.5.5 0 0 1-.473-.339l-3.52-10.3zM5.846 9a.175.175 0 0 0 .166-.229l-1.25-3.85a.175.175 0 0 0-.333 0l-1.22 3.85A.175.175 0 0 0 3.376 9z"
      clip-rule="evenodd"
    />
  </svg>
);

// Lightning Icon (用于底部主题链接)
export const LightningIcon: Component<{ class?: string }> = (props) => (
  <svg
    class={props.class || "w-4 h-4 inline-block"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

export const NavigateNextIcon: Component<{ class?: string }> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1024 1024"
  >
    <path
      fill="currentColor"
      d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0"
    />
  </svg>
);

export const NavigatePrevIcon: Component<{ class?: string }> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1024 1024"
  >
    <path
      fill="currentColor"
      d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0"
    />
  </svg>
);
