// SSR 入口：renderPage 从 pages，renderDcard 从 dcard
import { renderPage } from "../pages";
import { renderDcard } from "../dcard";

function ping() {
  return "pong";
}

export { ping, renderPage, renderDcard };

