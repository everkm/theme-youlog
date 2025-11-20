/**
 * dcard 资源加载模块
 *
 * 功能说明：
 * 1. 资源缓存机制
 *    - 使用 Set<string> 缓存已加载的资源 URL
 *    - 避免重复加载相同资源，节省带宽和时间
 *    - CSS 链接也会检查是否已存在
 *
 * 2. 资源加载等待
 *    - 使用 Promise.all() 等待所有资源加载完成
 *    - 每个资源返回独立的 Promise
 *    - JS 脚本：监听 onload/onerror 事件
 *    - CSS 样式：检测样式表是否已加载
 *
 * 3. 事件触发
 *    - EVENT_DCARD_INSTALL：所有资源加载完成后需要初始化时触发
 *    - EVENT_DCARD_UNINSTALL：dcard 卸载时触发
 *    - EVENT_DCARD_ASSETS_ERROR：任何资源加载失败时触发
 *    - 事件包含详细信息：dcardName、assets、element 等
 *
 * 4. 错误处理
 *    - JSON 解析错误处理
 *    - 资源加载失败处理
 *    - 不支持的文件类型处理
 *
 * 5. 安装与卸载
 *    - installDcard：安装 dcard，加载资源并触发安装事件
 *    - uninstallDcard：卸载 dcard，触发卸载事件
 *
 * 使用示例：
 * ```html
 * <!-- 每个 script 标签表示一个 dcard -->
 * <script type="application/json" data-dcard="player">
 * {
 *   "js": [
 *     "/assets/player.js"
 *   ],
 *   "css": [
 *     "/assets/player.css"
 *   ]
 * }
 * </script>
 * ```
 *
 * ```javascript
 * import { installDcard, uninstallDcard, EVENT_DCARD_INSTALL, EVENT_DCARD_UNINSTALL, EVENT_DCARD_ASSETS_ERROR } from './dcard';
 *
 * // 安装 dcard
 * const container = document.getElementById('container');
 * installDcard(container);
 *
 * // 监听 dcard 安装完成事件
 * document.addEventListener('dcard:install', (event) => {
 *   const { dcardName, js, css, element } = event.detail;
 *   console.log(`dcard [${dcardName}] 安装完成`, { js, css });
 * });
 *
 * // 监听 dcard 卸载事件
 * document.addEventListener('dcard:uninstall', (event) => {
 *   const { dcardName, element } = event.detail;
 *   console.log(`dcard [${dcardName}] 卸载`);
 * });
 *
 * // 监听加载失败事件
 * document.addEventListener('dcard:assets:error', (event) => {
 *   const { dcardName, error } = event.detail;
 *   console.error(`dcard [${dcardName}] 加载失败:`, error);
 * });
 *
 * // 卸载 dcard
 * uninstallDcard(container);
 * ```
 *
 * 特性说明：
 * - 每个标签独立处理：每个 script[type='application/json'][data-dcard] 标签代表一个独立的 dcard
 * - 明确类型分离：通过 js 和 css 数组明确区分资源类型，不再通过文件扩展名判断
 * - 并行加载：同一 dcard 的所有资源并行加载，提高效率
 * - 缓存优化：已加载的资源不会重复加载
 * - 事件通知：安装/卸载时通过事件通知，便于后续初始化和清理
 */

interface IDcard {
  js?: string[];
  css?: string[];
}

//  当dcard assets 加载完成后需要初始化时触发
const EVENT_DCARD_INSTALL = "dcard:install";

//  当dcard 卸载时触发
const EVENT_DCARD_UNINSTALL = "dcard:uninstall";

//  当dcard assets加载失败时触发
const EVENT_DCARD_ASSETS_ERROR = "dcard:assets:error";

// 已加载资源的缓存，避免重复加载
const loadedAssetsCache = new Set<string>();

/**
 * 加载单个 JS 资源
 * @param asset 资源 URL
 * @returns Promise，加载成功 resolve，失败 reject
 */
function loadJS(asset: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查缓存，如果已加载则直接返回
    if (loadedAssetsCache.has(asset)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = asset;
    script.type = "text/javascript";
    script.async = true;

    // onload 事件在脚本下载并执行完成后触发
    // 注意：对于 async 脚本，onload 表示脚本本身执行完成
    // 如果脚本内部有异步操作（如 setTimeout、fetch 等），
    // onload 不会等待这些异步操作完成
    script.onload = () => {
      loadedAssetsCache.add(asset);
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${asset}`));
    };

    document.getElementsByTagName("head")[0].appendChild(script);
  });
}

/**
 * 加载单个 CSS 资源
 * @param asset 资源 URL
 * @returns Promise，加载成功 resolve，失败 reject
 */
function loadCSS(asset: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查缓存，如果已加载则直接返回
    if (loadedAssetsCache.has(asset)) {
      resolve();
      return;
    }

    // 检查是否已经存在相同的 CSS 链接
    const existingLink = document.querySelector(`link[href="${asset}"]`);
    if (existingLink) {
      loadedAssetsCache.add(asset);
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.href = asset;
    link.rel = "stylesheet";

    // CSS 加载完成的检测
    const checkLoaded = () => {
      try {
        // 检查样式表是否已加载
        const sheets = document.styleSheets;
        for (let i = 0; i < sheets.length; i++) {
          if (sheets[i].href === asset || sheets[i].ownerNode === link) {
            loadedAssetsCache.add(asset);
            resolve();
            return;
          }
        }
        // 如果还没加载完成，继续等待
        setTimeout(checkLoaded, 50);
      } catch (e) {
        // 跨域样式表可能无法访问，假设已加载
        loadedAssetsCache.add(asset);
        resolve();
      }
    };

    link.onerror = () => {
      reject(new Error(`Failed to load stylesheet: ${asset}`));
    };

    document.getElementsByTagName("head")[0].appendChild(link);
    // CSS 加载检测
    checkLoaded();
  });
}

function log(message: string, ...args: any[]) {
  console.log("installDcard: " + message, ...args);
}

function error_log(message: string, ...args: any[]) {
  console.error("installDcard: " + message, ...args);
}

/**
 * 安装 dcard，加载资源并触发安装事件
 * @param parent 父元素
 */
function installDcard(parent: HTMLElement) {
  const elements = parent.querySelectorAll("script[type='application/json']");
  if (!elements.length) {
    // log("no dcard elements found", parent);
    return;
  }

  // 处理每个 dcard
  Array.from(elements).forEach(async (element) => {
    const dcardName = element.getAttribute("data-dcard");
    if (!dcardName) {
      log("no dcard name found", element);
      return;
    }

    let dcardData: IDcard;
    try {
      dcardData = JSON.parse(element.textContent || "{}") as IDcard;
    } catch (e) {
      error_log(`解析 dcard 数据失败 [${dcardName}]:`, e);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_ASSETS_ERROR, {
          detail: { dcardName, error: e, element, container: parent },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    const jsAssets = Array.isArray(dcardData.js) ? dcardData.js : [];
    const cssAssets = Array.isArray(dcardData.css) ? dcardData.css : [];

    if (jsAssets.length === 0 && cssAssets.length === 0) {
      log("no assets found", dcardName);
      return;
    }

    log("assets found", dcardName, { js: jsAssets, css: cssAssets });

    try {
      // 并行加载所有资源
      const loadPromises: Promise<void>[] = [];

      // 加载 JS 资源
      for (const asset of jsAssets) {
        loadPromises.push(loadJS(asset));
      }

      // 加载 CSS 资源
      for (const asset of cssAssets) {
        loadPromises.push(loadCSS(asset));
      }

      await Promise.all(loadPromises);

      // 所有资源加载完成，触发安装事件
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_INSTALL, {
          detail: {
            dcardName,
            js: jsAssets,
            css: cssAssets,
            element,
            container: parent,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      // 资源加载失败，触发 error 事件
      error_log(`dcard 资源加载失败 [${dcardName}]:`, error);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_ASSETS_ERROR, {
          detail: {
            dcardName,
            error,
            js: jsAssets,
            css: cssAssets,
            element,
            container: parent,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  });
}

/**
 * 卸载 dcard，触发卸载事件
 * @param parent 父元素
 */
function uninstallDcard(parent: HTMLElement) {
  const elements = parent.querySelectorAll("script[type='application/json']");
  if (!elements.length) {
    return;
  }

  for (const element of Array.from(elements)) {
    const dcardName = element.getAttribute("data-dcard");
    if (!dcardName) {
      continue;
    }
    element.dispatchEvent(
      new CustomEvent(EVENT_DCARD_UNINSTALL, {
        detail: { dcardName, element, container: parent },
        bubbles: true,
        composed: true,
      })
    );
  }
}

export {
  installDcard,
  uninstallDcard,
  EVENT_DCARD_INSTALL,
  EVENT_DCARD_ASSETS_ERROR,
  EVENT_DCARD_UNINSTALL,
};
