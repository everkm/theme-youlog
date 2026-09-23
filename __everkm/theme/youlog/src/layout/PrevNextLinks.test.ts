/**
 * P0：prev/next 只取元数据，不得触发 post_detail 全量渲染。
 * 场景参考 tehaochi 文章页 ?prev=&next= 链接（见 260922-Plan §4.3）。
 */
import { describe, expect, it, vi } from "vitest";

describe("PrevNextLinks post_meta contract", () => {
  it("source uses post_meta for prev/next ids", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const src = await fs.readFile(
      path.join(__dirname, "PrevNextLinks.tsx"),
      "utf8",
    );
    expect(src).toMatch(/everkm\.post_meta\(/);
    expect(src).not.toMatch(/everkm\.post_detail\(/);
  });

  it("post_meta is preferred over post_detail when only title/url needed", () => {
    const post_meta = vi.fn().mockReturnValue({
      title: "上一篇",
      url_path: "/a.html",
      path: "/a.md",
    });
    const post_detail = vi.fn();
    const everkm = { post_meta, post_detail };
    const id = "1762786855382"; // tehaochi 烧鸡腿 id 形态
    const doc = everkm.post_meta("req", { id });
    expect(doc?.title).toBe("上一篇");
    expect(post_meta).toHaveBeenCalledTimes(1);
    expect(post_detail).not.toHaveBeenCalled();
  });
});
