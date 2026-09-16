import { useEffect } from "react";
import { resolveMeta } from "../lib/pageMeta";

function upsert(selector, tag, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tag);
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
}

export default function Seo({ path }) {
  const meta = resolveMeta(path);

  useEffect(() => {
    document.title = meta.fullTitle;
    upsert('meta[name="description"]', "meta", { name: "description", content: meta.description });
    upsert('link[rel="canonical"]', "link", { rel: "canonical", href: meta.url });
    upsert('meta[property="og:title"]', "meta", { property: "og:title", content: meta.fullTitle });
    upsert('meta[property="og:description"]', "meta", { property: "og:description", content: meta.description });
    upsert('meta[property="og:url"]', "meta", { property: "og:url", content: meta.url });
    upsert('meta[name="twitter:title"]', "meta", { name: "twitter:title", content: meta.fullTitle });
    upsert('meta[name="twitter:description"]', "meta", { name: "twitter:description", content: meta.description });
    upsert('meta[name="robots"]', "meta", {
      name: "robots",
      content: meta.noindex ? "noindex, follow" : "index, follow, max-image-preview:large",
    });
  }, [meta.fullTitle, meta.description, meta.url, meta.noindex]);

  return null;
}
