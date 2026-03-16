import { useTranslate } from "../../core";

// 翻译配置
const translations = {
  cancel: {
    zh: '取消',
    en: 'Cancel',
  },
  no_results: {
    zh: '未找到与"{wd}"相关的内容',
    en: 'No results found for "{wd}"',
  },
  to_select: {
    zh: '打开',
    en: 'Open',
  },
  to_navigate: {
    zh: '导航',
    en: 'Navigate',
  },
  to_close: {
    zh: '关闭',
    en: 'Close',
  },
  search: {
    zh: '搜索',
    en: 'Search',
  },
  search_error: {
    zh: '搜索出错',
    en: 'Search error',
  },
}

export default useTranslate(translations)
