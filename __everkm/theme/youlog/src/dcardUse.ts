import { installDcard, uninstallDcard } from "dcard";
import { EVENT_PAGE_LOAD_BEFORE, EVENT_PAGE_LOADED } from "pageAjax";

function initDcardUse() {
  const bodySelector = "#article-main";
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    const el = document.querySelector(bodySelector) as HTMLElement;
    if (el) {
      installDcard(el);
    }
  });
  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    const el = document.querySelector(bodySelector) as HTMLElement;
    if (el) {
      uninstallDcard(el);
    }
  });
}

export { initDcardUse };
