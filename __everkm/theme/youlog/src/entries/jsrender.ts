// JSRender 入口：供 everkm-publish 调用，与 Tera 对等的 JS 渲染层
import { renderPage } from "../pages";
import { renderDcard } from "../dcard";

function ping() {
  return "pong";
}

export { ping, renderPage, renderDcard };
