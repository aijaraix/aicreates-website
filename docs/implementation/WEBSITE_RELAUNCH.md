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
