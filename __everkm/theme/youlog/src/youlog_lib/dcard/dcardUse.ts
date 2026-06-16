import { installDcard } from "./dcard";
import {
  EVENT_BEFORE_UPDATE,
  EVENT_PAGE_LOADED,
} from "../widgets/page-ajax/constants";

function log(message: string, ...args: any[]) {
  console.log("dcard:use: " + message, ...args);
}

type UninstallDcard = (() => void) | null;

function initDcardUse(bodySelector: string): UninstallDcard {
  const el = document.querySelector(bodySelector) as HTMLElement;
  if (!el) {
    console.error(`Dcard container not found: ${bodySelector}`);
    return null;
  }
  return installDcard(el);
}

function installDcardUse(bodySelector: string) {
  let uninstallDcard: UninstallDcard = null;

  document.addEventListener(EVENT_PAGE_LOADED, () => {
    uninstallDcard = initDcardUse(bodySelector);
  });

  document.addEventListener(EVENT_BEFORE_UPDATE, () => {
    uninstallDcard?.();
  });

  document.addEventListener("DOMContentLoaded", () => {
    uninstallDcard = initDcardUse(bodySelector);
  });

  log("initialized");
}

export { installDcardUse };
