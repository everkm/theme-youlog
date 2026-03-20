import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

type CleanupFunction = (() => void) | null;

function initFootnoteBackButton(bodySelector: string): CleanupFunction {
  const container = document.querySelector(bodySelector) as HTMLElement | null;
  if (!container) {
    console.error(`Footnote back button container not found: ${bodySelector}`);
    return null;
  }

  const definitions = container.querySelectorAll<HTMLElement>(
    ".footnote-definition",
  );

  const cleanupCallbacks: CleanupFunction[] = [];
  const cleanup = () => {
    cleanupCallbacks.forEach((callback) => {
      callback?.();
    });
    cleanupCallbacks.length = 0;
  };

  definitions.forEach((definition) => {
    const id = definition.id;
    if (!id) {
      console.error(`Footnote definition not found: ${definition}`);
      return;
    }

    const existingBackButtons = definition.querySelectorAll<HTMLButtonElement>(
      ".footnote-back-button",
    );
    if (existingBackButtons.length > 0) {
      console.error(`Footnote back button already exists: ${definition}`);
      return;
    }

    const refs = container.querySelectorAll<HTMLElement>(
      `a[href="#${CSS.escape(id)}"]`,
    );

    if (refs.length === 0) {
      console.error(`Footnote reference not found: ${definition}`);
      return;
    }

    const lastChild = definition.lastElementChild as HTMLElement | null;
    if (!lastChild) {
      console.error(`Footnote last child not found: ${definition}`);
      return;
    }

    const hasMultipleRefs = refs.length > 1;

    refs.forEach((ref, index) => {
      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "footnote-back-button hover:text-link-hover";
      backButton.style.marginLeft = "0.8em";
      backButton.append("⤴");

      if (hasMultipleRefs) {
        const sup = document.createElement("sup");
        sup.textContent = String(index + 1);
        backButton.append(sup);
      }

      const fn = (event: MouseEvent) => {
        event.preventDefault();
        ref.scrollIntoView({ behavior: "smooth" });
        if (ref instanceof HTMLElement) {
          ref.focus({ preventScroll: true });
        }
      };

      backButton.addEventListener("click", fn);
      cleanupCallbacks.push(() => {
        backButton.removeEventListener("click", fn);
      });

      lastChild.appendChild(backButton);
    });
  });

  return cleanup;
}

function installFootnoteBackButton(bodySelector: string): void {
  let currentCleanupFn: CleanupFunction = null;

  const cleanup = () => {
    if (currentCleanupFn) {
      currentCleanupFn();
      currentCleanupFn = null;
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    currentCleanupFn = initFootnoteBackButton(bodySelector);
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    cleanup();
    currentCleanupFn = initFootnoteBackButton(bodySelector);
  });
}

export { initFootnoteBackButton, installFootnoteBackButton };
