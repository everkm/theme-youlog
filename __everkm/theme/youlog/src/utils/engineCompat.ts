/**
 * 新旧引擎兼容层。
 *
 * 背景：`everkm.post_detail` / `nav_indicator` / `nav_path` / `nav_tree`
 * 在新引擎中改为返回 Promise（渲染入口统一 await 取数，根治嵌套 API
 * 调用的调度死锁）；旧引擎仍是同步返回值。主题需要在两类引擎上都能跑。
 *
 * 用法：调用点一律写 `await maybeAwait(everkm.post_detail(...))`。
 * 运行时自动判断：返回值是 Promise（或 thenable）就等待其结果，
 * 否则原样通过，调用方无感知。
 */
export function maybeAwait<T>(value: MaybePromise<T>): Promise<T> {
  return Promise.resolve(value);
}
