/**
 * 脚注返回按钮：在 `.footnote-definition` 末尾插入回到引用处的按钮。
 *
 * ## 更新日志
 *
 * - 2026-07-25：清理 definition 空白文本节点；用 `.footnote-reference a` 匹配引用；readyState 挂载。
 */

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
    if (!id) return;

    // Strip whitespace text nodes (SSR HTML newlines break flex/grid layout).
    for (const node of [...definition.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
        node.remove();
      }
    }

    const existingBackButtons = definition.querySelectorAll<HTMLButtonElement>(
      ".footnote-back-button",
    );
    if (existingBackButtons.length > 0) return;

    const refs = [
      ...container.querySelectorAll<HTMLElement>(".footnote-reference a"),
    ].filter(
      (anchor) =>
        anchor.getAttribute("href") === `#${id}` || anchor.hash === `#${id}`,
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

  const mount = () => {
    cleanup();
    currentCleanupFn = initFootnoteBackButton(bodySelector);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  document.addEventListener(EVENT_PAGE_LOADED, mount);
}

export { initFootnoteBackButton, installFootnoteBackButton };
