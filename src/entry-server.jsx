import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { resolveMeta } from "./lib/pageMeta";

export function render(url) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
  return { html, meta: resolveMeta(url) };
}

export { INDEXABLE_ROUTES, PAGE_META, SITE_URL } from "./lib/pageMeta";
