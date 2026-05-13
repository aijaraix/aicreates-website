import { useEffect } from "react";

const SITE = "AIcreatesAI Invest";
const ORIGIN = "https://invest.aicreates.ai";
const DEFAULT_OG = `${ORIGIN}/og-cover.jpg`;
const DEFAULT_OG_SQUARE = `${ORIGIN}/og-square.jpg`;
const DEFAULT_OG_ALT = "AIcreatesAI Invest - Reserve Your AICA Allocation";

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

function ensureAbsolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function setAllOgImages(coverUrl: string, squareUrl: string, alt: string) {
  const props = [
    "og:image",
    "og:image:secure_url",
    "og:image:type",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
  ];
  for (const p of props) {
    document.head.querySelectorAll(`meta[property="${p}"]`).forEach((n) => n.remove());
  }
  const append = (property: string, content: string) => {
    const el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute("content", content);
    document.head.appendChild(el);
  };
  append("og:image", coverUrl);
  append("og:image:secure_url", coverUrl);
  append("og:image:type", "image/jpeg");
  append("og:image:width", "1200");
  append("og:image:height", "630");
  append("og:image:alt", alt);
  append("og:image", squareUrl);
  append("og:image:secure_url", squareUrl);
  append("og:image:type", "image/jpeg");
  append("og:image:width", "600");
  append("og:image:height", "600");
  append("og:image:alt", alt);
}

export type InvestSeoOptions = {
  title: string;
  description: string;
  path: string;
  fullTitle?: string;
  image?: string;
  squareImage?: string;
  imageAlt?: string;
};

export function useInvestSeo({
  title,
  description,
  path,
  fullTitle: fullTitleOverride,
  image = DEFAULT_OG,
  squareImage = DEFAULT_OG_SQUARE,
  imageAlt = DEFAULT_OG_ALT,
}: InvestSeoOptions) {
  useEffect(() => {
    const fullTitle = fullTitleOverride ?? `${title} | ${SITE}`;
    const url = `${ORIGIN}${path}`;
    const cover = ensureAbsolute(image);
    const square = ensureAbsolute(squareImage);

    document.title = fullTitle;
    setMeta('meta[name="description"]', "name", "description", description);
    setLink("canonical", url);

    setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:locale"]', "property", "og:locale", "en_US");
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);

    setAllOgImages(cover, square, imageAlt);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:site"]', "name", "twitter:site", "@theaicreatesai");
    setMeta('meta[name="twitter:url"]', "name", "twitter:url", url);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", cover);
    setMeta('meta[name="twitter:image:alt"]', "name", "twitter:image:alt", imageAlt);
  }, [title, description, path, image, squareImage, imageAlt]);
}
