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
 *   "assets": [
 *     "/assets/player.js",
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
 *   const { dcardName, assets, element } = event.detail;
 *   console.log(`dcard [${dcardName}] 安装完成`, assets);
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
 * - 自动判断类型：根据文件后缀（.js 或 .css）自动创建对应元素
 * - 并行加载：同一 dcard 的所有资源并行加载，提高效率
 * - 缓存优化：已加载的资源不会重复加载
 * - 事件通知：安装/卸载时通过事件通知，便于后续初始化和清理
 */

interface IDcard {
  assets: string[];
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
 * 加载单个资源（JS 或 CSS）
 * @param asset 资源 URL
 * @param parent 父元素
 * @returns Promise，加载成功 resolve，失败 reject
 */
function loadAsset(asset: string, parent: HTMLElement): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查缓存，如果已加载则直接返回
    if (loadedAssetsCache.has(asset)) {
      resolve();
      return;
    }

    if (asset.endsWith(".js") || asset.includes(".js?")) {
      const script = document.createElement("script");
      script.src = asset;
      script.type = "text/javascript";
      script.async = true;

      script.onload = () => {
        loadedAssetsCache.add(asset);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${asset}`));
      };

      parent.appendChild(script);
    } else if (asset.endsWith(".css") || asset.includes(".css?")) {
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

      parent.appendChild(link);
      // CSS 加载检测
      checkLoaded();
    } else {
      // 不支持的文件类型
      reject(new Error(`Unsupported asset type: ${asset}`));
    }
  });
}

/**
 * 安装 dcard，加载资源并触发安装事件
 * @param parent 父元素
 */
function installDcard(parent: HTMLElement) {
  const elements = parent.querySelectorAll("script[type='application/json']");
  if (!elements.length) {
    return;
  }

  // 处理每个 dcard
  Array.from(elements).forEach(async (element) => {
    const dcardName = element.getAttribute("data-dcard");
    if (!dcardName) {
      return;
    }

    let dcardData: IDcard;
    try {
      dcardData = JSON.parse(element.textContent || "{}") as IDcard;
    } catch (e) {
      console.error(`解析 dcard 数据失败 [${dcardName}]:`, e);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_ASSETS_ERROR, {
          detail: { dcardName, error: e, element },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    if (
      !dcardData ||
      !Array.isArray(dcardData.assets) ||
      dcardData.assets.length === 0
    ) {
      return;
    }

    try {
      // 并行加载所有资源
      await Promise.all(
        dcardData.assets.map((asset) => loadAsset(asset, parent))
      );

      // 所有资源加载完成，触发安装事件
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_INSTALL, {
          detail: { dcardName, assets: dcardData.assets, element },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      // 资源加载失败，触发 error 事件
      console.error(`dcard 资源加载失败 [${dcardName}]:`, error);
      element.dispatchEvent(
        new CustomEvent(EVENT_DCARD_ASSETS_ERROR, {
          detail: { dcardName, error, assets: dcardData.assets, element },
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
        detail: { dcardName, element },
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
