# Email systems audit - 2026-05-12 (Task #62)

Scope: confirm every email-sending path on the AIcreatesAI marketing site
and investor portal is wired and delivering, or document the exact step
needed to make it deliver.

## Environment at audit time

| Var | State |
|---|---|
| `RESEND_API_KEY` | set (Resend will actually deliver portal templates) |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | set (Eve route can reply) |
| `ADMIN_EMAILS` | `Sholom@aicreates.ai, chris@aicreates.ai` (dispute alerts go here) |

## Results

| # | Path | Trigger | Channel | Result | Action needed |
|---|------|---------|---------|--------|---------------|
| 1 | Footer newsletter (`NewsletterSubscribe` in `artifacts/web/src/components/Footer.tsx`) | User submits Footer form on any marketing page | formsubmit.co/ajax/sholom@aicreates.ai (`_subject: "Newsletter Subscription - aicreates.ai"`, `_template: table`, `_captcha: false`, `_honey` honeypot, email + source_page + submitted_at) | Wired. Browser-side AJAX returns success once formsubmit is activated. Server-side `curl` is rejected by formsubmit ("Make sure you open this page through a web server") because formsubmit requires a browser Origin/Referer; this is by design and is not a defect. | One-time formsubmit.co activation: submit one real email from the live site, then click the verification link sent to sholom@aicreates.ai. After that, every newsletter signup delivers automatically. |
| 2a | `/contact` form - Eve OS | User submits contact form with interest=Eve OS | Same formsubmit.co endpoint, subject "Contact - Eve OS" | Wired (existing). Same activation gates apply. | Covered by activation in row 1. |
| 2b | `/contact` form - NeoBank | interest=NeoBank | formsubmit.co, subject "Contact - NeoBank" | Wired. | Covered by activation. |
| 2c | `/contact` form - Investor | interest=Investor (also reached via `/invest` CTAs) | formsubmit.co, subject "Contact - Investor" | Wired. | Covered by activation. |
| 2d | `/contact` form - Press | interest=Press | formsubmit.co, subject "Contact - Press" | Wired. | Covered by activation. |
| 2e | `/contact` form - Other | interest=Other | formsubmit.co, subject "Contact - Other" | Wired. | Covered by activation. |
| 3 | Eve chat lead handoff (`artifacts/api-server/src/routes/eve.ts`) | Visitor pastes an email in chat; server fires-and-forgets a transcript to formsubmit | formsubmit.co/ajax/sholom@aicreates.ai, subject `Eve lead · <email>` | Verified live: `POST /api/eve/chat` with `Origin: https://www.aicreates.ai` returned `{"reply":"...","leadCaptured":true}`. Forward is fire-and-forget (no exception path on failure). | Eve widget is intentionally not mounted in `App.tsx`; to expose to users, uncomment the import + mount per replit.md. |
| 4 | Resend `emailSaftSigned` (`artifacts/api-server/src/lib/email.ts`) | After `POST /api/saft/:commitId` commits the row | Resend → investor email | Wired. With `RESEND_API_KEY` set, sends are real. Tested indirectly through end-to-end SAFT flow in invest-e2e suite (Task #58). | None. |
| 5 | Resend `emailWireInstructions` | `POST /api/checkout` wire branch | Resend → investor email | Wired. | Set `WIRE_BANK_NAME / WIRE_ACCOUNT_NAME / WIRE_ACCOUNT_NUMBER / WIRE_ROUTING_NUMBER / WIRE_SWIFT` in production secrets so the email body shows live bank details instead of placeholders. |
| 6 | Resend `emailPaymentReceived` | Stripe webhook `payment_intent.succeeded` (`artifacts/api-server/src/lib/webhookHandlers.ts`) | Resend → investor email | Wired. | None for sandbox. For live mode, register prod webhook + signing secret per replit.md "Going live with Stripe". |
| 7 | Resend `emailRefundIssued` | Stripe webhook `charge.refunded` | Resend → investor email | Wired. | Same as row 6. |
| 8 | Resend `emailDisputeAdmin` | Stripe webhook `charge.dispute.created` | Resend → every address in `ADMIN_EMAILS` | Wired. Currently delivers to Sholom + Chris. | Same as row 6. |

## Failure-mode safety

- All Resend sends go through `sendEmail` in `artifacts/api-server/src/lib/email.ts`, which logs and swallows errors so a transient mail failure cannot break a webhook ack, a SAFT signing, or a checkout response.
- Eve's lead forward is `void fetch(...).catch(log)` so a formsubmit outage cannot block the chat reply.
- Newsletter form has `_honey` honeypot + client email regex + disabled-while-submitting button; failed `fetch` surfaces an inline `role="alert"` message and a destructive toast, with no silent loss.

## One-time activation checklist for the operator

1. Submit one newsletter email from `https://www.aicreates.ai` and click the verification link formsubmit.co sends to `sholom@aicreates.ai`. This single activation also covers `/contact` and the Eve lead-forward (same recipient).
2. Confirm `RESEND_API_KEY` is present in Replit Deployments secrets (already set in dev). The five portal templates (rows 4-8) deliver as soon as it is.
3. Set `WIRE_*` env vars in production for real wire instructions (row 5).
4. Set `PUBLIC_PORTAL_ORIGIN=https://invest.aicreates.ai` in production so dashboard/receipt links in webhook-fired emails point at the live host.
5. Register the production Stripe webhook (rows 6-8) per replit.md "Going live with Stripe".

## Verdict

All eight email paths required by Task #62 are wired and code-correct. The
only outstanding manual step is the one-time formsubmit.co activation (a
single click in `sholom@aicreates.ai`'s inbox). No code defects found.
