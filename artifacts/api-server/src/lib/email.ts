/**
 * Transactional email via Resend. Graceful no-op when RESEND_API_KEY is
 * not configured so the rest of the portal keeps working in dev and in
 * any production where the operator hasn't wired email yet.
 *
 * Templates are intentionally inline + plain (no MJML/JSX) so this file
 * stays a single dependency-light unit. Each helper takes the bare data
 * the route already has and produces both subject + HTML + text.
 */
import { Resend } from "resend";
import { logger } from "./logger";

const FROM_DEFAULT = "AICreatesAI <hello@aicreates.ai>";
const REPLY_TO_DEFAULT = "sholom@aicreates.ai";
const BRAND_BG = "#0A0A0A";
const BRAND_FG = "#F5F5F5";
const BRAND_ACCENT = "#00F5D4";

let cachedClient: Resend | null = null;
let cachedKey: string | null = null;
let cachedKeyAt = 0;
const KEY_TTL_MS = 5 * 60 * 1000;

/**
 * Resolve a Resend API key. Two sources, in priority order:
 *
 * 1. RESEND_API_KEY env var — operator-supplied (overrides everything,
 *    used in production deploys where the connector isn't bound).
 * 2. Replit Resend connector — the user clicks "Connect" in the
 *    Integrations tab and we read credentials from the connectors-v2
 *    proxy at $REPLIT_CONNECTORS_HOSTNAME.
 *
 * Either source returning a key is sufficient. If neither resolves we
 * return null and every send is logged + skipped.
 */
async function resolveResendKey(): Promise<string | null> {
  if (process.env["RESEND_API_KEY"]) return process.env["RESEND_API_KEY"]!;

  if (cachedKey && Date.now() - cachedKeyAt < KEY_TTL_MS) return cachedKey;

  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
      ? "depl " + process.env["WEB_REPL_RENEWAL"]
      : null;
  if (!hostname || !xReplitToken) return null;

  const isProduction = process.env["REPLIT_DEPLOYMENT"] === "1";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "resend");
  url.searchParams.set("environment", isProduction ? "production" : "development");

  try {
    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
      signal: AbortSignal.timeout(5_000),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      items?: Array<{
        settings?: { api_key?: string; secret?: string; secret_key?: string };
      }>;
    };
    const s = data.items?.[0]?.settings;
    const key = s?.api_key ?? s?.secret ?? s?.secret_key ?? null;
    if (key) {
      cachedKey = key;
      cachedKeyAt = Date.now();
    }
    return key;
  } catch {
    return null;
  }
}

async function getClient(): Promise<Resend | null> {
  const key = await resolveResendKey();
  if (!key) return null;
  if (!cachedClient || cachedKey !== key) {
    cachedClient = new Resend(key);
    cachedKey = key;
    cachedKeyAt = Date.now();
  }
  return cachedClient;
}

export async function isEmailConfigured(): Promise<boolean> {
  return Boolean(await resolveResendKey());
}

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Defaults to operator inbox so investor replies land in a real mailbox. */
  replyTo?: string;
}

/**
 * Low-level send. Logs and swallows errors — emails are non-critical
 * to the API contract and must never block a webhook ack or a user
 * action like signing a SAFT.
 */
export async function sendEmail(args: SendEmailArgs): Promise<void> {
  const client = await getClient();
  if (!client) {
    logger.info(
      { to: args.to, subject: args.subject },
      "email skipped: RESEND_API_KEY not configured",
    );
    return;
  }
  try {
    const result = await client.emails.send({
      from: FROM_DEFAULT,
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo ?? REPLY_TO_DEFAULT,
    });
    if (result.error) {
      logger.warn(
        { err: result.error, to: args.to, subject: args.subject },
        "resend send returned error",
      );
    }
  } catch (err) {
    logger.error(
      { err, to: args.to, subject: args.subject },
      "resend send threw",
    );
  }
}

// ----- shared rendering helpers --------------------------------------------

function fmtUsd(amountCents: number): string {
  return `$${(amountCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${BRAND_BG};color:${BRAND_FG};font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="font-family:'Space Grotesk',Arial,sans-serif;font-size:22px;font-weight:600;letter-spacing:-0.01em;margin-bottom:8px;">AIcreatesAI</div>
    <div style="height:2px;width:48px;background:${BRAND_ACCENT};margin-bottom:24px;"></div>
    <h1 style="font-family:'Space Grotesk',Arial,sans-serif;font-size:24px;line-height:1.25;margin:0 0 16px 0;">${title}</h1>
    ${bodyHtml}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #2a2a2a;color:#A1A1AA;font-size:12px;line-height:1.5;">
      AIcreatesAI · The agentic intelligence layer<br/>
      Questions? Reply to this email and a human will respond.
    </div>
  </div>
</body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px 0;line-height:1.55;color:${BRAND_FG};">${text}</p>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#A1A1AA;font-size:13px;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:${BRAND_FG};font-size:13px;font-family:'JetBrains Mono',monospace;text-align:right;">${value}</td></tr>`;
}

// ----- templates ------------------------------------------------------------

export interface SaftSignedEmail {
  to: string;
  investorName: string;
  commitmentId: string;
  totalCents: number;
  totalTokens: number;
  paymentMethod: "card" | "ach" | "crypto" | "wire";
  portalUrl: string;
}

export async function emailSaftSigned(args: SaftSignedEmail): Promise<void> {
  const subject = "Your SAFT is signed - next: complete payment";
  const methodLabel: Record<string, string> = {
    card: "Card / Apple Pay / Google Pay",
    ach: "Bank transfer (ACH)",
    crypto: "Crypto",
    wire: "Wire transfer",
  };
  const html = shell(
    "Your SAFT is signed",
    [
      p(`Hi ${args.investorName},`),
      p(
        `Your Simple Agreement for Future Tokens has been signed and recorded. The next step is funding your commitment.`,
      ),
      `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px 0;">${[
        row("Commitment", args.commitmentId),
        row("Amount", fmtUsd(args.totalCents)),
        row("Tokens", `${args.totalTokens.toLocaleString()} AICA`),
        row("Payment method", methodLabel[args.paymentMethod] ?? args.paymentMethod),
      ].join("")}</table>`,
      `<p style="margin:0 0 16px 0;"><a href="${args.portalUrl}" style="display:inline-block;background:${BRAND_ACCENT};color:#0A0A0A;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Continue to checkout</a></p>`,
      p("If you have questions, reply to this email."),
    ].join(""),
  );
  const text = `Your SAFT is signed.\n\nCommitment: ${args.commitmentId}\nAmount: ${fmtUsd(args.totalCents)}\nTokens: ${args.totalTokens.toLocaleString()} AICA\nPayment method: ${methodLabel[args.paymentMethod] ?? args.paymentMethod}\n\nContinue to checkout: ${args.portalUrl}\n`;
  await sendEmail({ to: args.to, subject, html, text });
}

export interface PaymentReceivedEmail {
  to: string;
  investorName: string;
  commitmentId: string;
  amountCents: number;
  tokens: number;
  receiptUrl?: string | null;
  dashboardUrl: string;
}

export async function emailPaymentReceived(
  args: PaymentReceivedEmail,
): Promise<void> {
  const subject = `Payment received - ${fmtUsd(args.amountCents)} AICA commitment funded`;
  const html = shell(
    "Payment received",
    [
      p(`Hi ${args.investorName},`),
      p(
        `Your commitment is funded. Tokens will vest per your SAFT (6-month cliff, 24-month linear vest).`,
      ),
      `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px 0;">${[
        row("Commitment", args.commitmentId),
        row("Amount", fmtUsd(args.amountCents)),
        row("Tokens", `${args.tokens.toLocaleString()} AICA`),
      ].join("")}</table>`,
      `<p style="margin:0 0 16px 0;"><a href="${args.dashboardUrl}" style="display:inline-block;background:${BRAND_ACCENT};color:#0A0A0A;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Open dashboard</a>${args.receiptUrl ? ` &nbsp; <a href="${args.receiptUrl}" style="color:${BRAND_ACCENT};text-decoration:none;font-weight:500;">View Stripe receipt</a>` : ""}</p>`,
      p("Thanks for backing AICreatesAI."),
    ].join(""),
  );
  const text = `Payment received.\n\nCommitment: ${args.commitmentId}\nAmount: ${fmtUsd(args.amountCents)}\nTokens: ${args.tokens.toLocaleString()} AICA\n\nDashboard: ${args.dashboardUrl}\n${args.receiptUrl ? `Stripe receipt: ${args.receiptUrl}\n` : ""}`;
  await sendEmail({ to: args.to, subject, html, text });
}

export interface WireInstructionsEmail {
  to: string;
  investorName: string;
  commitmentId: string;
  amountCents: number;
  tokens: number;
  bank: {
    beneficiary: string;
    beneficiaryAddress: string;
    bankName: string;
    bankBranch: string;
    accountNumber: string;
    routingNumber: string;
    achRouting: string;
    swift: string;
    swiftForeign: string;
    intermediaryUS: string;
    intermediaryForeign: string;
    memo: string;
    reference: string;
  };
}

export async function emailWireInstructions(
  args: WireInstructionsEmail,
): Promise<void> {
  const subject = `Wire instructions - ${fmtUsd(args.amountCents)} commitment ${args.commitmentId.slice(0, 8)}`;
  const b = args.bank;
  const html = shell(
    "Wire transfer instructions",
    [
      p(`Hi ${args.investorName},`),
      p(
        `Please wire <strong>${fmtUsd(args.amountCents)}</strong> using the Bank of America details below. Use the reference exactly so we can match your wire to your commitment.`,
      ),
      `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px 0;">${[
        row("Beneficiary", b.beneficiary),
        row("Beneficiary address", b.beneficiaryAddress),
        row("Bank", b.bankName),
        row("Bank branch", b.bankBranch),
        row("Account #", b.accountNumber),
        row("Wire routing", b.routingNumber),
        row("ACH routing", b.achRouting),
        row("SWIFT (USD)", b.swift),
        row("SWIFT (foreign currency)", b.swiftForeign),
        row("Intermediary (USD)", b.intermediaryUS),
        row("Intermediary (foreign)", b.intermediaryForeign),
        row("Reference / memo", b.reference),
        row("Memo guidance", b.memo),
        row("Amount", fmtUsd(args.amountCents)),
        row("Commitment", args.commitmentId),
        row("Tokens", `${args.tokens.toLocaleString()} AICA`),
      ].join("")}</table>`,
      p(
        `Wires typically settle in 1-3 business days. Your dashboard will show <em>Pending - waiting admin confirmation</em> until we confirm receipt, at which point the commitment flips to Confirmed and your vesting schedule activates.`,
      ),
    ].join(""),
  );
  const text = `Wire transfer instructions.\n\nBeneficiary: ${b.beneficiary}\nBeneficiary address: ${b.beneficiaryAddress}\nBank: ${b.bankName}\nBank branch: ${b.bankBranch}\nAccount #: ${b.accountNumber}\nWire routing: ${b.routingNumber}\nACH routing: ${b.achRouting}\nSWIFT (USD): ${b.swift}\nSWIFT (foreign currency): ${b.swiftForeign}\nIntermediary (USD): ${b.intermediaryUS}\nIntermediary (foreign): ${b.intermediaryForeign}\nReference / memo: ${b.reference}\nMemo guidance: ${b.memo}\n\nAmount: ${fmtUsd(args.amountCents)}\nCommitment: ${args.commitmentId}\nTokens: ${args.tokens.toLocaleString()} AICA\n\nWires typically settle in 1-3 business days. Your dashboard will show "Pending - waiting admin confirmation" until we confirm receipt.\n`;
  await sendEmail({ to: args.to, subject, html, text });
}

export interface RefundIssuedEmail {
  to: string;
  investorName: string;
  commitmentId: string;
  amountCents: number;
  reason?: string | null;
}

export async function emailRefundIssued(
  args: RefundIssuedEmail,
): Promise<void> {
  const subject = `Refund issued - ${fmtUsd(args.amountCents)} returned`;
  const html = shell(
    "Refund issued",
    [
      p(`Hi ${args.investorName},`),
      p(
        `Your refund of <strong>${fmtUsd(args.amountCents)}</strong> for commitment ${args.commitmentId} has been issued. Card refunds typically appear in 5-10 business days; ACH refunds 3-5 business days.`,
      ),
      args.reason
        ? p(`Reason: <em style="color:#A1A1AA;">${args.reason}</em>`)
        : "",
      p("Reply to this email if you have any questions."),
    ].join(""),
  );
  const text = `Refund issued.\n\nAmount: ${fmtUsd(args.amountCents)}\nCommitment: ${args.commitmentId}\n${args.reason ? `Reason: ${args.reason}\n` : ""}\nCard refunds typically appear in 5-10 business days; ACH refunds 3-5 business days.\n`;
  await sendEmail({ to: args.to, subject, html, text });
}

export interface DisputeAdminEmail {
  to: string | string[];
  commitmentId: string;
  investorEmail: string;
  amountCents: number;
  disputeId: string;
  reason: string;
  dueByIso: string | null;
  dashboardUrl: string;
}

export async function emailDisputeAdmin(
  args: DisputeAdminEmail,
): Promise<void> {
  const subject = `[URGENT] Stripe dispute opened - ${fmtUsd(args.amountCents)} from ${args.investorEmail}`;
  const html = shell(
    "Stripe dispute opened",
    [
      p(
        `A chargeback / dispute has been opened. You must respond before the due date or the dispute will be lost by default.`,
      ),
      `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px 0;">${[
        row("Commitment", args.commitmentId),
        row("Investor", args.investorEmail),
        row("Amount", fmtUsd(args.amountCents)),
        row("Reason", args.reason),
        row("Dispute ID", args.disputeId),
        ...(args.dueByIso
          ? [row("Respond by", new Date(args.dueByIso).toUTCString())]
          : []),
      ].join("")}</table>`,
      `<p style="margin:0 0 16px 0;"><a href="${args.dashboardUrl}" style="display:inline-block;background:${BRAND_ACCENT};color:#0A0A0A;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Open admin dashboard</a></p>`,
    ].join(""),
  );
  const text = `[URGENT] Stripe dispute opened.\n\nCommitment: ${args.commitmentId}\nInvestor: ${args.investorEmail}\nAmount: ${fmtUsd(args.amountCents)}\nReason: ${args.reason}\nDispute ID: ${args.disputeId}\n${args.dueByIso ? `Respond by: ${new Date(args.dueByIso).toUTCString()}\n` : ""}\nAdmin: ${args.dashboardUrl}\n`;
  await sendEmail({ to: args.to, subject, html, text });
}

// ---- Round transition operator notice -------------------------------------

export interface RoundAdvancedEmail {
  to: string | string[];
  reason: string;
  closed: Array<{ slug: string; label: string }>;
  opened: Array<{
    slug: string;
    label: string;
    pricePerTokenMillicents: number;
  }>;
}

export async function emailRoundAdvanced(
  args: RoundAdvancedEmail,
): Promise<void> {
  const closedLabels = args.closed.map((r) => r.label).join(", ") || "none";
  const openedLabels = args.opened.map((r) => r.label).join(", ") || "none";
  const subject = `Round transition - ${
    args.opened[0]
      ? `${args.opened[0].label} is now live`
      : args.closed[0]
        ? `${args.closed[0].label} is closed`
        : "no-op"
  }`;
  const html = shell(
    "Round transition",
    [
      p(`Trigger: <strong>${args.reason}</strong>`),
      `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 20px 0;">${[
        row("Closed", closedLabels),
        row("Opened", openedLabels),
        ...args.opened.map((r) =>
          row(
            `${r.label} price`,
            `$${(r.pricePerTokenMillicents / 1000).toFixed(3)} / AICA`,
          ),
        ),
      ].join("")}</table>`,
      p(
        "Investors with stranded pending_saft commitments on the closed round have been emailed a re-commit prompt.",
      ),
    ].join(""),
  );
  const text = `Round transition (${args.reason}).\nClosed: ${closedLabels}\nOpened: ${openedLabels}\n`;
  await sendEmail({ to: args.to, subject, html, text });
}

// ---- Investor "your round closed, re-commit" notice -----------------------

export interface RecommitNeededEmail {
  to: string;
  investorName: string;
  commitmentId: string;
  closedRoundLabel: string;
  newRoundLabel: string | null;
  newRoundPriceLabel: string | null;
  portalUrl: string;
}

export async function emailRecommitNeeded(
  args: RecommitNeededEmail,
): Promise<void> {
  const subject = args.newRoundLabel
    ? `${args.closedRoundLabel} closed - re-commit on ${args.newRoundLabel}`
    : `${args.closedRoundLabel} closed - your unfunded commitment needs to be re-issued`;
  const newRoundLine = args.newRoundLabel
    ? `<strong>${args.newRoundLabel}</strong> is now the active round${
        args.newRoundPriceLabel ? ` at ${args.newRoundPriceLabel}` : ""
      }.`
    : "A new round will be announced shortly.";
  const html = shell(
    "Your committed round just closed",
    [
      p(`Hi ${args.investorName},`),
      p(
        `Your unfunded commitment on <strong>${args.closedRoundLabel}</strong> (commitment ${args.commitmentId.slice(0, 8)}) cannot proceed because the round is now closed. ${newRoundLine}`,
      ),
      p(
        "To complete an investment, please re-commit on the active round at the new price. Your previous unfunded commitment will be ignored.",
      ),
      `<p style="margin:0 0 16px 0;"><a href="${args.portalUrl}" style="display:inline-block;background:${BRAND_ACCENT};color:#0A0A0A;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Re-commit now</a></p>`,
      p("Reply to this email if you have any questions."),
    ].join(""),
  );
  const text = `Your committed round just closed.\n\n${args.closedRoundLabel} is closed. ${args.newRoundLabel ? `${args.newRoundLabel} is now active${args.newRoundPriceLabel ? ` at ${args.newRoundPriceLabel}` : ""}.` : "A new round will be announced shortly."}\n\nRe-commit: ${args.portalUrl}\n`;
  await sendEmail({ to: args.to, subject, html, text });
}
