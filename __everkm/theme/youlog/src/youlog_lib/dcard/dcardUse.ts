import { installDcard, uninstallDcard } from "./dcard";
import {
  EVENT_PAGE_LOAD_BEFORE,
  EVENT_PAGE_LOADED,
} from "../widgets/page-ajax/constants";

function log(message: string, ...args: any[]) {
  console.log("dcard:use: " + message, ...args);
}

function initDcardUse(bodySelector: string = "#article-main") {
  const doDispatch = () => {
    const el = document.querySelector(bodySelector) as HTMLElement;
    if (el) {
      installDcard(el);
    }
  };

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    doDispatch();
  });

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    const el = document.querySelector(bodySelector) as HTMLElement;
    if (el) {
      uninstallDcard(el);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    doDispatch();
  });

  log("initialized");
}

export { initDcardUse };
