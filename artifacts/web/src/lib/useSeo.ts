import { useEffect } from "react";

const SITE = "AIcreatesAI";
const DEFAULT_OG = "https://www.aicreates.ai/opengraph.jpg";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export type SeoOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function useSeo({ title, description, path, image = DEFAULT_OG }: SeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE}`;
    const url = `https://www.aicreates.ai${path}`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', "name", "description", description);
    setLink("canonical", url);
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
  }, [title, description, path, image]);
}
