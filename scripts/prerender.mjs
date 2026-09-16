import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const { render, PAGE_META, SITE_URL } = await import(path.join(root, "dist-ssr/entry-server.js"));

const template = await readFile(path.join(dist, "index.html"), "utf8");

function applyMeta(html, meta) {
  const robots = meta.noindex ? "noindex, follow" : "index, follow, max-image-preview:large";
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.fullTitle}</title>`)
    .replace(/(<meta name="description" content=")[\s\S]*?(")/, `$1${meta.description}$2`)
    .replace(/(<link rel="canonical" href=")[\s\S]*?(")/, `$1${meta.url}$2`)
    .replace(/(<meta name="robots" content=")[\s\S]*?(")/, `$1${robots}$2`)
    .replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${meta.fullTitle}$2`)
    .replace(/(<meta property="og:description" content=")[\s\S]*?(")/, `$1${meta.description}$2`)
    .replace(/(<meta property="og:url" content=")[\s\S]*?(")/, `$1${meta.url}$2`)
    .replace(/(<meta name="twitter:title" content=")[\s\S]*?(")/, `$1${meta.fullTitle}$2`)
    .replace(/(<meta name="twitter:description" content=")[\s\S]*?(")/, `$1${meta.description}$2`);
}

const routes = Object.keys(PAGE_META);

for (const route of routes) {
  const { html, meta } = render(route);
  const page = applyMeta(template, meta).replace("<!--app-html-->", html);
  const file =
    route === "/" ? "index.html" : route === "/404" ? "404.html" : `${route.slice(1)}.html`;
  const target = path.join(dist, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, page, "utf8");
  process.stdout.write(`prerendered ${route} -> ${file}\n`);
}

const indexable = routes.filter((route) => !PAGE_META[route].noindex && route !== "/404");
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(
    (route) =>
      `  <url>\n    <loc>${SITE_URL}${route === "/" ? "/" : route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>\n    <priority>${route === "/" ? "1.0" : "0.7"}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
process.stdout.write(`wrote sitemap with ${indexable.length} urls\n`);
