import {EVENT_PAGE_LOAD_BEFORE, EVENT_PAGE_LOADED} from 'pageAjax'
import {debounce} from 'throttle-debounce'

function watchAppHeader(): void {
  const appName = document.querySelector('h1[data-app-name]')
  const articleTitle = document.querySelector('h1[data-article-title-bar]')
  const targetElement = document.getElementById('article-title')
  let isWorking = true

  if (!appName || !articleTitle || !targetElement) {
    console.warn('Required elements not found for header animation')
    return
  }

  // 点击文章标题，滚动到页面顶部
  articleTitle.addEventListener('click', () => {
    const bodyMain = document.getElementById('body-main')
    if (bodyMain) {
      bodyMain.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  })

  const toggleAppName = (showAppName: boolean) => {
    if (showAppName) {
      // show AppName
      appName.classList.remove('hidden')
      articleTitle.classList.add('hidden')
    } else {
      // show ArticleTitle
      appName.classList.add('hidden')
      articleTitle.classList.remove('hidden')
    }
  }

  const toggleAppNameDebounce = debounce(100, (isIntersecting: boolean) => {
    if (!isWorking) {
      return
    }

    toggleAppName(isIntersecting)
  })

  document.addEventListener(EVENT_PAGE_LOAD_BEFORE, () => {
    toggleAppName(true)
    isWorking = false
  })
  document.addEventListener(EVENT_PAGE_LOADED, () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        isWorking = true
      }, 100)
    })
  })

  // 获取 header 高度的函数
  const getHeaderHeight = () => {
    return parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--header-height")
        .trim() || "0"
    );
  };

  // 监控 `#article-title` 元素的可见性，
  // 如果可见，则显示 appName 元素，
  // 否则切换 articleTitle 元素的显示
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // console.log('entry.isIntersecting', entry.isIntersecting)
        toggleAppNameDebounce(entry.isIntersecting)
      })
    },
    {
      threshold: 1,
      // 设置 rootMargin 来考虑 header 的高度
      // 使用负的 top margin 来调整相交检测的边界
      rootMargin: `-${getHeaderHeight()}px 0px 0px 0px`,
    },
  )

  // 开始观察目标元素
  observer.observe(targetElement)
}

export function initAppHeader(): void {
  document.addEventListener('DOMContentLoaded', () => {
    watchAppHeader()
  })
}
