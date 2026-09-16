# Company website relaunch — 2026-09-08

Status: IN_PROGRESS. This branch is a reviewable public-site increment, not production acceptance.
Baseline: main 50d24e4d3bedfec2d98390db3ea973ba915dd0fa.

## Reconciliation

| Surface | Classification | Result and compatibility |
| --- | --- | --- |
| AI Creates AI company identity | KEEP / EXTEND | Parent-company homepage explains Adam, Eve, EVE CXO and Hermes. Existing artwork and visual identity retained. |
| EveOS public product label | RENAME | EVE CXO; new /eve-cxo route. Existing /eve-os remains functional with the new canonical URL. Internal translation keys remain stable. |
| Seven customer-facing executives | EXTEND | Jarvis is presented as Development & Engineering alongside the existing six department identities. No backend agent registry changes. |
| Token/NeoBank promotional navigation and opportunity pitch | DEPRECATE | Replaced by product and investor enquiry navigation. /token, /neobank and other existing routes remain available. No SAFT, vesting, investor, billing, account, database or contractual records are altered. Legacy obligations still require separate reconciliation. |
| Investor access | KEEP | Existing https://invest.aicreates.ai/invest/ account link preserved. No confidential financing terms or Drive documents published. |
| Contact/newsletter transport | KEEP / FIX | Existing FormSubmit destination retained. Native contact validation restored; explicit provider acceptance required before success. Duplicate newsletter IDs corrected. |

## Verification evidence

- Web TypeScript check and production Vite build pass.
- Preview inspected at desktop width, 768px and 390px CSS viewports. These are browser viewport checks, not physical-device certification.
- Homepage artwork, hierarchy, seven departments, tablet navigation and mobile menu visually inspected.
- Product link opens /eve-cxo; product title and canonical verified; no broken loaded images in checked home/product DOM.
- Investor enquiry opens /contact?interest=Investor and selects Investor.
- Empty contact submission focuses required name; malformed email focuses email. No messages sent.
- Missing route renders the 404 view; back-home link restores homepage title and removes noindex after transition.
- No duplicate IDs or nested button/link controls in checked home DOM.
- Homepage description, canonical, Open Graph and Twitter title verified in browser DOM.

## Remaining acceptance gates

- Real message acceptance and receipt need an authorized synthetic submission and provider confirmation.
- Existing investor portal and EVE authentication need provider-backed end-to-end checks.
- Remaining legacy pages and translated claims need full content reconciliation; this increment does not certify the full site.
- Initial JS bundle is about 888 KB (262 KB gzip); performance budget/Lighthouse and broader accessibility checks remain open.
- Public deep-link HTTP status, crawler-visible route metadata, 500 behavior and hosting headers require target-host verification. The existing Pages fallback remains in place.
- Production main push auto-deploys GitHub Pages. Keep this branch unmerged until the full cutover review. No production deployment performed.

## Secondary-route reconciliation and loading — 2026-09-08

About, Business, Developers, FAQ, Press and Roadmap now align the company/product hierarchy and Adam/Eve/Hermes/Jarvis roles. Current company copy no longer presents FinPayTek as a financed company product or token rewards/settlement as an active developer program. Roadmap describes priorities, not completed phases or guaranteed dates. FAQ uses current product access links and distinguishes investor enquiries from legacy records. Current financing terms remain absent from public copy. Existing headquarters/founding/founder facts and legal policy text were preserved from the source; executed corporate/source confirmation and counsel review remain required.

Token, Litepaper and NeoBank routes remain accessible with a prominent Earlier materials context notice. They use noindex/follow and are removed from the current sitemap; /eve-cxo replaces the old sitemap product URL while /eve-os remains a compatibility route. Existing investor accounts, records, agreements and external legacy product destinations remain unchanged. This is informational presentation, not a legal determination about historical materials. The header product CTA now opens EVE CXO; the reference link remains in Resources with labels updated in six locales.

Seventeen old nested link/button controls were corrected across the nine pages (12 on current pages, five on legacy pages). FAQ questions expose expanded state and a labelled answer region. The shared SEO hook sets indexing state per page; navigating from legacy context to EVE CXO was verified to restore index/follow. Original logos, founder photo and media-kit archive remain; the ZIP was inspected and contains only the three existing logo assets.

Browser checks covered /about, /business, /developers, /roadmap, /faq, /press, /token, /litepaper and /neobank. Desktop: one H1, no broken loaded images, correct indexing state and no page overflow; legacy nested controls found during that sweep were then fixed. Both 390px and 768px review frames were checked after each H1 rendered: no horizontal overflow or nested interactive controls on all nine routes. Classic scrollbars leave 375px/753px content widths. Mobile About/FAQ and tablet legacy-banner screenshots were visually reviewed. FAQ expansion and navigation from the legacy banner to the current product passed. No form delivery or authenticated investor interaction occurred. Temporary QA files were removed.

Secondary routes now use React lazy imports with an accessible loading status while the homepage remains eager. Typecheck/build passed and navigation home → FAQ → Earlier materials passed after the change. Main JS chunk decreased from approximately 887.07kB (261.37kB gzip) to 724.75kB (229.82kB gzip); this is a bundle-size measurement, not a Core Web Vitals claim. The remaining large-chunk and pre-existing sourcemap warnings are recorded, not hidden. Production deployment, real form receipt, approved policy/disclosure review and authenticated portal acceptance remain open.
