// Emit static HTML for every current indexable marketing route so GitHub Pages
// returns a real 200 document with route-specific SEO/social metadata instead
// of relying on the SPA 404 fallback. The inline history normalization keeps
// the existing Wouter paths (without a trailing slash) working after Pages
// redirects a directory URL such as /about -> /about/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://www.aicreates.ai";
const SITE = "AI Creates AI";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist", "public");
const defaultCover = `${ORIGIN}/social/og-default.png`;
const defaultSquare = `${ORIGIN}/social/og-square.png`;
const defaultTwitter = `${ORIGIN}/social/twitter-card.png`;

const PAGES = [
  {
    route: "/about",
    title: "About - Platform, Agents, and Company in a Box | AI Creates AI",
    description:
      "AI Creates AI is the company behind EVE CXO, with Adam for internal operations, Eve for customers and Hermes for shared orchestration.",
  },
  {
    route: "/eve-cxo",
    title: "EVE CXO — The AI Operating System for Business | AI Creates AI",
    description:
      "Eve coordinates seven departments and their specialists around your objectives, with your tools, your workspace and approval before consequential action.",
    cover: `${ORIGIN}/social/og-eve-os.png`,
    twitter: `${ORIGIN}/social/twitter-card-eve-os.png`,
    imageAlt: "EVE CXO — The AI Operating System for Business",
  },
  {
    route: "/business",
    title: "For Business - operate like a much larger company | AI Creates AI",
    description:
      "EVE CXO helps business operators coordinate seven departments, working context and approved tools.",
  },
  {
    route: "/developers",
    title: "For Developers - build on the agentic primitives | AI Creates AI",
    description:
      "The same agentic intelligence layer that powers EVE CXO - workflows, policy, memory, the Credit Ledger, and the Skills Marketplace - being developed for builders.",
  },
  {
    route: "/opportunity",
    title: "Investor relations | AI Creates AI",
    description:
      "Get to know AI Creates AI and EVE CXO. Contact the team for current investor materials and a conversation about the company.",
  },
  {
    route: "/roadmap",
    title: "Roadmap - a disciplined, phased build | AI Creates AI",
    description:
      "Current EVE CXO priorities: preservation, independent operations, coordinated workflows, building and measured expansion.",
  },
  {
    route: "/faq",
    title: "FAQ - questions, answered | AI Creates AI",
    description:
      "Questions about AI Creates AI, EVE CXO, workspace control and investor enquiries.",
  },
  {
    route: "/press",
    title: "Press and media | AI Creates AI",
    description:
      "Boilerplate, fast facts, founder bio, logo downloads, and press contact for AI Creates AI.",
  },
  {
    route: "/contact",
    title: "Contact | AI Creates AI",
    description:
      "Get in touch with AIcreatesAI - EVE CXO, strategic partnerships, investor relations, and press.",
  },
  {
    route: "/privacy",
    title: "Privacy Policy | AI Creates AI",
    description:
      "How AIcreatesAI collects, uses, and protects your information across the marketing site, products, and investor portal.",
  },
  {
    route: "/terms",
    title: "Terms of Service | AI Creates AI",
    description:
      "The terms governing use of the AIcreatesAI website, products, and investor portal.",
  },
];

const baseHtml = readFileSync(join(dist, "index.html"), "utf8");

function replaceRequired(html, label, pattern, replacement, route) {
  const next = html.replace(pattern, replacement);
  if (next === html) {
    throw new Error(`prerender-meta: ${label} did not match for ${route}`);
  }
  return next;
}

for (const page of PAGES) {
  const canonical = `${ORIGIN}${page.route}/`;
  const cover = page.cover ?? defaultCover;
  const square = page.square ?? defaultSquare;
  const twitter = page.twitter ?? defaultTwitter;
  const imageAlt = page.imageAlt ?? `${SITE} — ${page.title.replace(/ \| AI Creates AI$/, "")}`;
  let html = baseHtml;

  html = replaceRequired(
    html,
    "title",
    /<title>[\s\S]*?<\/title>/,
    `<title>${page.title}</title>`,
    page.route,
  );
  html = replaceRequired(
    html,
    "meta title",
    /<meta\s+name="title"[^>]*\/>/,
    `<meta name="title" content="${page.title}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "description",
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${page.description}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "canonical",
    /<link rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${canonical}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "robots",
    /<meta name="robots"[^>]*\/>/,
    `<meta name="robots" content="index, follow" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "og site name",
    /<meta property="og:site_name"[^>]*\/>/,
    `<meta property="og:site_name" content="${SITE}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "og url",
    /<meta property="og:url"[^>]*\/>/,
    `<meta property="og:url" content="${canonical}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "og title",
    /<meta property="og:title"[^>]*\/>/,
    `<meta property="og:title" content="${page.title}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "og description",
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${page.description}" />`,
    page.route,
  );

  const stripped = html.replace(
    /(\s*<meta (?:property="og:image[^"]*"|name="twitter:image[^"]*")[^>]*\/>)+/g,
    "",
  );
  if (stripped === html) {
    throw new Error(`prerender-meta: image metadata did not match for ${page.route}`);
  }
  html = stripped;

  html = replaceRequired(
    html,
    "og image injection",
    /<meta property="og:locale"/,
    [
      `<meta property="og:image" content="${cover}" />`,
      `    <meta property="og:image:secure_url" content="${cover}" />`,
      `    <meta property="og:image:type" content="image/png" />`,
      `    <meta property="og:image:width" content="1200" />`,
      `    <meta property="og:image:height" content="630" />`,
      `    <meta property="og:image:alt" content="${imageAlt}" />`,
      `    <meta property="og:image" content="${square}" />`,
      `    <meta property="og:image:secure_url" content="${square}" />`,
      `    <meta property="og:image:type" content="image/png" />`,
      `    <meta property="og:image:width" content="1200" />`,
      `    <meta property="og:image:height" content="1200" />`,
      `    <meta property="og:image:alt" content="${imageAlt}" />`,
      `    <meta property="og:locale"`,
    ].join("\n"),
    page.route,
  );

  html = replaceRequired(
    html,
    "twitter url",
    /<meta name="twitter:url"[^>]*\/>/,
    `<meta name="twitter:url" content="${canonical}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "twitter title",
    /<meta name="twitter:title"[^>]*\/>/,
    `<meta name="twitter:title" content="${page.title}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "twitter description",
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${page.description}" />`,
    page.route,
  );
  html = replaceRequired(
    html,
    "twitter image injection",
    /<meta name="twitter:card"/,
    `<meta name="twitter:image" content="${twitter}" />\n    <meta name="twitter:image:alt" content="${imageAlt}" />\n    <meta name="twitter:card"`,
    page.route,
  );

  const normalize = `<script>(function(){var p=${JSON.stringify(page.route)};if(location.pathname===p+"/"){history.replaceState(null,"",p+location.search+location.hash);}})();</script>`;
  html = replaceRequired(
    html,
    "route normalization",
    /<\/head>/,
    `    ${normalize}\n  </head>`,
    page.route,
  );

  const outDir = join(dist, page.route.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  console.log(`prerender-meta: wrote ${page.route}/index.html`);
}
