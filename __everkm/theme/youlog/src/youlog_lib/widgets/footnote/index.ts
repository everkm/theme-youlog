import { EVENT_PAGE_LOADED } from "../page-ajax/constants";

function setupFootnoteBackButton(bodySelector: string): void {
  const container = document.querySelector(bodySelector) as HTMLElement | null;
  if (!container) return;

  const definitions = container.querySelectorAll<HTMLElement>(
    ".footnote-definition",
  );

  definitions.forEach((definition) => {
    const id = definition.id;
    if (!id) return;

    const existingBackButtons = definition.querySelectorAll<HTMLButtonElement>(
      ".footnote-back-button",
    );
    if (existingBackButtons.length > 0) return;

    const refs = container.querySelectorAll<HTMLElement>(
      `a[href="#${CSS.escape(id)}"]`,
    );

    if (refs.length === 0) return;

    const lastChild = definition.lastElementChild as HTMLElement | null;
    if (!lastChild) return;

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

      backButton.addEventListener("click", (event) => {
        event.preventDefault();
        ref.scrollIntoView({ behavior: "smooth" });
        if (ref instanceof HTMLElement) {
          ref.focus({ preventScroll: true });
        }
      });

      lastChild.appendChild(backButton);
    });
  });
}

function initFootnoteBackButton(bodySelector: string): void {
  document.addEventListener("DOMContentLoaded", () => {
    setupFootnoteBackButton(bodySelector);
  });

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    setupFootnoteBackButton(bodySelector);
  });
}

export { initFootnoteBackButton };
