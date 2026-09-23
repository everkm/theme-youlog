/** everkm-publish JsRender 稳定错误码：页 / 组件不存在 → HTTP 404 */
export const PAGE_NOT_FOUND = "PAGE_NOT_FOUND";

/** 抛给引擎的「页不存在」错误（须带 `code`，勿仅靠 message） */
export function pageNotFound(message: string): Error {
  const err = new Error(message);
  (err as Error & { code: string }).code = PAGE_NOT_FOUND;
  return err;
}
