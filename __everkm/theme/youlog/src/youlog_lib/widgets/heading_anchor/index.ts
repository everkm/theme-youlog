import { showToast } from "../../toast";
import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

function initHeadingAnchor(bodySelector: string): void {
  const container = document.querySelector(bodySelector) as HTMLElement | null;
  if (!container) {
    console.error(`Heading anchor container not found: ${bodySelector}`);
    return;
  }

  const anchors =
    container.querySelectorAll<HTMLAnchorElement>(".heading-anchor");

  anchors.forEach((anchor) => {
    // 避免重复插入
    if (anchor.dataset.svgInjected === "true") return;

    anchor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="m10 17.55l-1.77 1.72a2.47 2.47 0 0 1-3.5-3.5l4.54-4.55a2.46 2.46 0 0 1 3.39-.09l.12.1a1 1 0 0 0 1.4-1.43a3 3 0 0 0-.18-.21a4.46 4.46 0 0 0-6.09.22l-4.6 4.55a4.48 4.48 0 0 0 6.33 6.33L11.37 19A1 1 0 0 0 10 17.55M20.69 3.31a4.49 4.49 0 0 0-6.33 0L12.63 5A1 1 0 0 0 14 6.45l1.73-1.72a2.47 2.47 0 0 1 3.5 3.5l-4.54 4.55a2.46 2.46 0 0 1-3.39.09l-.12-.1a1 1 0 0 0-1.4 1.43a3 3 0 0 0 .23.21a4.47 4.47 0 0 0 6.09-.22l4.55-4.55a4.49 4.49 0 0 0 .04-6.33" />
</svg>
`;

    anchor.dataset.svgInjected = "true";

    anchor.onclick = () => {
      showToast("Copied to clipboard");
      navigator.clipboard.writeText(anchor.href);
    };
  });
}

function installHeadingAnchor(bodySelector: string): void {
  document.addEventListener("DOMContentLoaded", () => {
    initHeadingAnchor(bodySelector);
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    initHeadingAnchor(bodySelector);
  });
}

export { initHeadingAnchor, installHeadingAnchor };
