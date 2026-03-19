// 简单的 i18n 实现

import { isServer } from "solid-js/web";

const DEFAULT_LANG = "en";

function getCurrentLang() {
  if (isServer) {
    if (typeof everkm === "undefined") {
      return DEFAULT_LANG;
    }
    return everkm.lang();
  }
  return document.documentElement.lang || DEFAULT_LANG;
}

function useTranslate(
  customTranslations: Record<string, Record<string, string>>,
) {
  return (key: string, params?: Record<string, string | boolean | number>) => {
    const keyTranslations = customTranslations[key] || {};
    const lang = getCurrentLang();
    let translated = keyTranslations[lang] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translated = translated.replace(`{${k}}`, v.toString());
      });
    }
    return translated;
  };
}

export { getCurrentLang, useTranslate };
