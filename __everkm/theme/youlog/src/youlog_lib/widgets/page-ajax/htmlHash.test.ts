import { describe, it, expect } from "vitest";
import { hashHtml } from "./htmlHash";

describe("hashHtml", () => {
  it("对空白差异不敏感", () => {
    expect(hashHtml("<ul>\n  <li>a</li>\n</ul>")).toBe(
      hashHtml("<ul> <li>a</li> </ul>"),
    );
  });

  it("对元素属性顺序不敏感（nav 折叠/重建 bug 的根因）", () => {
    // 真实日志中的伪差异：SSR 输出 <img> 的 width/height 顺序不稳定
    const a =
      '<p><a href="/youlog/"><img alt="" src="/x.png" width="442px" height="200px"></a></p>';
    const b =
      '<p><a href="/youlog/"><img alt="" src="/x.png" height="200px" width="442px"></a></p>';
    expect(hashHtml(a)).toBe(hashHtml(b));
  });

  it("内容/结构真正变化时 hash 不同", () => {
    expect(hashHtml("<ul><li>a</li></ul>")).not.toBe(
      hashHtml("<ul><li>b</li></ul>"),
    );
    expect(hashHtml('<a href="/a">x</a>')).not.toBe(
      hashHtml('<a href="/b">x</a>'),
    );
  });

  it("标签大小写归一", () => {
    expect(hashHtml("<DIV><SPAN>x</SPAN></DIV>")).toBe(
      hashHtml("<div><span>x</span></div>"),
    );
  });
});
