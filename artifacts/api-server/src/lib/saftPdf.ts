import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedTemplate: Buffer | null = null;

async function loadTemplate(): Promise<Buffer | null> {
  if (cachedTemplate) return cachedTemplate;
  const candidates = [
    path.resolve(__dirname, "../../assets/saft-template.pdf"),
    path.resolve(__dirname, "../assets/saft-template.pdf"),
    path.resolve(process.cwd(), "artifacts/api-server/assets/saft-template.pdf"),
  ];
  for (const p of candidates) {
    try {
      cachedTemplate = await fs.readFile(p);
      return cachedTemplate;
    } catch {
      // try next
    }
  }
  return null;
}

export const COMPANY_EIN = "39-2333854";
export const COMPANY_NAME = "AIcreatesAI Inc.";
export const COMPANY_ADDRESS = "8310 Byron Avenue, Miami Beach, Florida 33141";

export interface SaftAllocationLine {
  roundSlug: string;
  roundLabel: string;
  tokens: number;
  pricePerTokenMillicents: number;
  usdCents: number;
}

export interface SaftProfileForPdf {
  kind: "individual" | "business";
  email: string;
  phone?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  legalFirstName?: string | null;
  legalLastName?: string | null;
  dateOfBirth?: string | null;
  taxIdLast4?: string | null;
  legalEntityName?: string | null;
  entityType?: string | null;
  jurisdictionOfFormation?: string | null;
  einLast4?: string | null;
  signatoryName?: string | null;
  signatoryTitle?: string | null;
}

export interface SaftRenderInput {
  commitmentId: string;
  profile: SaftProfileForPdf;
  allocations: SaftAllocationLine[];
  walletAddress?: string;
  walletChain?: string | null;
  paymentMethod: "fiat" | "card" | "ach" | "wire" | "crypto" | string;
  accreditationCategory: string;
  acknowledgments: string[];
  signatureName: string;
  signedAt: string;
  signerIp: string | null;
}

const PAGE = { w: 612, h: 792, left: 56, right: 556 };

function investorLegalName(p: SaftProfileForPdf): string {
  if (p.kind === "business") {
    return (p.legalEntityName ?? "").trim() || "(unspecified entity)";
  }
  return `${p.legalFirstName ?? ""} ${p.legalLastName ?? ""}`
    .trim()
    .replace(/\s+/g, " ") || "(unspecified)";
}

function investorAddress(p: SaftProfileForPdf): string {
  return [
    p.addressLine1,
    p.addressLine2,
    `${p.city}, ${p.region} ${p.postalCode}`,
    p.country,
  ]
    .filter((s) => !!s && String(s).trim().length > 0)
    .join(", ");
}

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtTokenPriceMillicents(mc: number): string {
  // millicents → USD with up to 4 decimals
  return `$${(mc / 1000).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  })}`;
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function drawHeader(page: PDFPage, helv: PDFFont, helvBold: PDFFont) {
  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0, 0.58, 0.51);
  let y = 750;
  page.drawText("AIcreatesAI Inc.", {
    x: PAGE.left,
    y,
    size: 16,
    font: helvBold,
    color: ink,
  });
  page.drawText("Simple Agreement for Future Tokens", {
    x: PAGE.left + 130,
    y: y + 1,
    size: 10,
    font: helv,
    color: dim,
  });
  y -= 18;
  page.drawText("$AICA Private Placement - Execution Cover Sheet", {
    x: PAGE.left,
    y,
    size: 10,
    font: helvBold,
    color: accent,
  });
  y -= 8;
  page.drawLine({
    start: { x: PAGE.left, y },
    end: { x: PAGE.right, y },
    thickness: 0.6,
    color: rgb(0, 0.58, 0.51),
  });
  return y - 22;
}

function drawKv(
  page: PDFPage,
  helv: PDFFont,
  helvBold: PDFFont,
  label: string,
  value: string,
  y: number,
  opts?: { valueAccent?: boolean },
) {
  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0, 0.58, 0.51);
  page.drawText(label, {
    x: PAGE.left,
    y,
    size: 9,
    font: helvBold,
    color: dim,
  });
  page.drawText(String(value).slice(0, 86), {
    x: PAGE.left + 165,
    y,
    size: 10,
    font: helv,
    color: opts?.valueAccent ? accent : ink,
  });
}

/**
 * Renders an execution-ready SAFT. Builds a populated cover sheet
 * (capturing every {{...}} field referenced in the source template) +
 * acknowledgments + typed signature, then attaches the unmodified
 * source SAFT body. The cover sheet is the executed instrument; the
 * body is the boilerplate template it incorporates by reference.
 *
 * The cover surfaces, in order: investor legal name, investor email,
 * investor address, purchase amount, round name, token price, token
 * allocation, execution date, wallet address, company EIN.
 */
export async function renderSaftPdf(input: SaftRenderInput): Promise<Buffer> {
  const template = await loadTemplate();
  const doc = template
    ? await PDFDocument.load(template)
    : await PDFDocument.create();

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0, 0.58, 0.51);

  // Insert cover at the very front.
  const cover1 = doc.insertPage(0, [PAGE.w, PAGE.h]);
  let y = drawHeader(cover1, helv, helvBold);
  let page: PDFPage = cover1;

  function ensure(roomNeeded: number) {
    if (y - roomNeeded < 60) {
      const next = doc.insertPage(1, [PAGE.w, PAGE.h]);
      y = drawHeader(next, helv, helvBold);
      page = next;
    }
  }

  // --- Aggregate primary fields ---
  const investorName = investorLegalName(input.profile);
  const investorAddr = investorAddress(input.profile);
  const totalCents = input.allocations.reduce((s, a) => s + a.usdCents, 0);
  const totalTokens = input.allocations.reduce((s, a) => s + a.tokens, 0);
  // Pick the dominant round label (first allocation; if multiple, list).
  const roundName =
    input.allocations.length === 0
      ? "(unspecified round)"
      : input.allocations.length === 1
        ? input.allocations[0]!.roundLabel
        : input.allocations
            .map((a) => a.roundLabel)
            .join(" + ");
  // Blended price = totalCents / totalTokens (in USD). For single-line
  // allocation this matches the round price exactly; for multi-line we
  // expose the blended price.
  const blendedPriceMillicents =
    totalTokens > 0
      ? Math.round((totalCents * 10) / totalTokens)
      : input.allocations[0]?.pricePerTokenMillicents ?? 0;

  // ----- Section: Parties -----
  page.drawText("Parties", {
    x: PAGE.left,
    y,
    size: 11,
    font: helvBold,
    color: ink,
  });
  y -= 16;
  drawKv(page, helv, helvBold, "Company", COMPANY_NAME, y); y -= 14;
  drawKv(page, helv, helvBold, "Company address", COMPANY_ADDRESS, y); y -= 14;
  drawKv(page, helv, helvBold, "Company EIN", COMPANY_EIN, y); y -= 14;
  drawKv(page, helv, helvBold, "Investor legal name", investorName, y); y -= 14;
  drawKv(page, helv, helvBold, "Investor email", input.profile.email, y); y -= 14;
  drawKv(page, helv, helvBold, "Investor address", investorAddr, y); y -= 14;
  if (input.profile.kind === "business") {
    if (input.profile.signatoryName) {
      drawKv(
        page,
        helv,
        helvBold,
        "Authorized signer",
        `${input.profile.signatoryName}${
          input.profile.signatoryTitle ? `, ${input.profile.signatoryTitle}` : ""
        }`,
        y,
      );
      y -= 14;
    }
  }
  y -= 8;

  // ----- Section: Subscription -----
  ensure(120);
  page.drawText("Subscription", {
    x: PAGE.left,
    y,
    size: 11,
    font: helvBold,
    color: ink,
  });
  y -= 16;
  drawKv(page, helv, helvBold, "Purchase amount", fmtUsd(totalCents), y, {
    valueAccent: true,
  });
  y -= 14;
  drawKv(page, helv, helvBold, "Round", roundName, y); y -= 14;
  drawKv(
    page,
    helv,
    helvBold,
    "Token price",
    `${fmtTokenPriceMillicents(blendedPriceMillicents)} per $AICA`,
    y,
  );
  y -= 14;
  drawKv(
    page,
    helv,
    helvBold,
    "Estimated token allocation",
    `${totalTokens.toLocaleString("en-US")} $AICA`,
    y,
    { valueAccent: true },
  );
  y -= 14;
  drawKv(page, helv, helvBold, "Execution date", fmtDate(input.signedAt), y);
  y -= 14;
  drawKv(
    page,
    helv,
    helvBold,
    "Investor wallet address",
    input.walletAddress
      ? `${input.walletAddress}${input.walletChain ? ` (${input.walletChain})` : ""}`
      : "(to be provided pre-TGE)",
    y,
  );
  y -= 14;
  drawKv(page, helv, helvBold, "Payment method", input.paymentMethod, y); y -= 14;
  drawKv(page, helv, helvBold, "Accreditation", input.accreditationCategory, y);
  y -= 18;

  // ----- Section: Allocation breakdown (when multi-line) -----
  if (input.allocations.length > 1) {
    ensure(40 + 14 * (input.allocations.length + 2));
    page.drawText("Allocation breakdown", {
      x: PAGE.left,
      y,
      size: 11,
      font: helvBold,
      color: ink,
    });
    y -= 16;
    const colX = {
      round: PAGE.left,
      tokens: PAGE.left + 220,
      price: PAGE.left + 320,
      usd: PAGE.left + 420,
    };
    for (const [label, x] of [
      ["Round", colX.round],
      ["Tokens", colX.tokens],
      ["Price", colX.price],
      ["USD", colX.usd],
    ] as const) {
      page.drawText(label, { x, y, size: 8, font: helvBold, color: dim });
    }
    y -= 12;
    page.drawLine({
      start: { x: PAGE.left, y: y + 6 },
      end: { x: PAGE.right, y: y + 6 },
      thickness: 0.4,
      color: rgb(0.8, 0.8, 0.8),
    });
    for (const a of input.allocations) {
      ensure(20);
      const cells: Array<[string, number]> = [
        [a.roundLabel, colX.round],
        [a.tokens.toLocaleString("en-US"), colX.tokens],
        [fmtTokenPriceMillicents(a.pricePerTokenMillicents), colX.price],
        [fmtUsd(a.usdCents), colX.usd],
      ];
      for (const [text, x] of cells) {
        page.drawText(text.slice(0, 32), {
          x,
          y,
          size: 9,
          font: helv,
          color: ink,
        });
      }
      y -= 14;
    }
    y -= 8;
  }

  // ----- Section: Acknowledgments -----
  ensure(20 + input.acknowledgments.length * 12);
  page.drawText("Acknowledged by Investor", {
    x: PAGE.left,
    y,
    size: 11,
    font: helvBold,
    color: ink,
  });
  y -= 14;
  for (const a of input.acknowledgments) {
    ensure(14);
    page.drawText(`[x] ${a.slice(0, 110)}`, {
      x: PAGE.left,
      y,
      size: 9,
      font: helv,
      color: ink,
    });
    y -= 12;
  }

  // ----- Section: Signature -----
  ensure(70);
  y -= 6;
  page.drawText("Signature", {
    x: PAGE.left,
    y,
    size: 11,
    font: helvBold,
    color: ink,
  });
  y -= 18;
  page.drawText("/s/", {
    x: PAGE.left,
    y,
    size: 12,
    font: helv,
    color: dim,
  });
  page.drawText(input.signatureName, {
    x: PAGE.left + 24,
    y: y - 2,
    size: 16,
    font: helvBold,
    color: accent,
  });
  y -= 18;
  page.drawLine({
    start: { x: PAGE.left, y: y + 4 },
    end: { x: PAGE.left + 320, y: y + 4 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  page.drawText(`Investor: ${investorName}`, {
    x: PAGE.left,
    y,
    size: 9,
    font: helv,
    color: ink,
  });
  y -= 14;
  page.drawText(`Signed: ${fmtDate(input.signedAt)} (${input.signedAt})`, {
    x: PAGE.left,
    y,
    size: 8,
    font: mono,
    color: dim,
  });
  if (input.signerIp) {
    y -= 12;
    page.drawText(`Signer IP: ${input.signerIp}`, {
      x: PAGE.left,
      y,
      size: 8,
      font: mono,
      color: dim,
    });
  }
  y -= 12;
  page.drawText(`Commitment ID: ${input.commitmentId}`, {
    x: PAGE.left,
    y,
    size: 8,
    font: mono,
    color: dim,
  });

  // Footer note: cover-sheet values govern the bracketed placeholders
  // that appear in the body of the SAFT below.
  page.drawText(
    "The values on this Execution Cover Sheet populate and govern the corresponding",
    { x: PAGE.left, y: 70, size: 8, font: helv, color: dim },
  );
  page.drawText(
    "{{placeholder}} fields in the body of the SAFT that follows.",
    { x: PAGE.left, y: 60, size: 8, font: helv, color: dim },
  );

  return Buffer.from(await doc.save());
}

export interface CountersignInput {
  countersignerName: string;
  countersignerTitle?: string | null;
  countersignedAt: string;
  commitmentId: string;
  investorLegalName: string;
  signedAtIso: string;
}

/**
 * Appends a single-page "Counterparty Signature" addendum to an
 * already-signed SAFT PDF, producing the fully-executed instrument.
 * The original signed pages are preserved unchanged; the addendum is
 * the binding company countersignature applied by an authorized
 * AICreatesAI officer from the admin console.
 */
export async function appendCountersignPage(
  signedPdf: Buffer,
  input: CountersignInput,
): Promise<Buffer> {
  const doc = await PDFDocument.load(signedPdf);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0, 0.58, 0.51);
  const page = doc.addPage([PAGE.w, PAGE.h]);
  let y = drawHeader(page, helv, helvBold);
  page.drawText("Counterparty Signature - Fully Executed", {
    x: PAGE.left, y, size: 12, font: helvBold, color: accent,
  });
  y -= 22;
  page.drawText(
    `${COMPANY_NAME} hereby executes and accepts this Simple Agreement for`,
    { x: PAGE.left, y, size: 10, font: helv, color: ink },
  );
  y -= 13;
  page.drawText(
    `Future Tokens with ${input.investorLegalName}, originally signed by the`,
    { x: PAGE.left, y, size: 10, font: helv, color: ink },
  );
  y -= 13;
  page.drawText(
    `Investor on ${fmtDate(input.signedAtIso)}. Countersignature is binding upon both parties.`,
    { x: PAGE.left, y, size: 10, font: helv, color: ink },
  );
  y -= 30;
  page.drawText("Company", { x: PAGE.left, y, size: 11, font: helvBold, color: ink });
  y -= 16;
  drawKv(page, helv, helvBold, "Entity", COMPANY_NAME, y); y -= 14;
  drawKv(page, helv, helvBold, "Address", COMPANY_ADDRESS, y); y -= 14;
  drawKv(page, helv, helvBold, "EIN", COMPANY_EIN, y); y -= 24;
  page.drawText("Authorized Signatory", { x: PAGE.left, y, size: 11, font: helvBold, color: ink });
  y -= 22;
  page.drawText("/s/", { x: PAGE.left, y, size: 12, font: helv, color: dim });
  page.drawText(input.countersignerName, {
    x: PAGE.left + 24, y: y - 2, size: 16, font: helvBold, color: accent,
  });
  y -= 18;
  page.drawLine({
    start: { x: PAGE.left, y: y + 4 }, end: { x: PAGE.left + 320, y: y + 4 },
    thickness: 0.5, color: rgb(0.7, 0.7, 0.7),
  });
  page.drawText(
    `Name: ${input.countersignerName}${input.countersignerTitle ? `, ${input.countersignerTitle}` : ""}`,
    { x: PAGE.left, y, size: 9, font: helv, color: ink },
  );
  y -= 14;
  page.drawText(`For and on behalf of ${COMPANY_NAME}`, {
    x: PAGE.left, y, size: 9, font: helv, color: ink,
  });
  y -= 14;
  page.drawText(
    `Countersigned: ${fmtDate(input.countersignedAt)} (${input.countersignedAt})`,
    { x: PAGE.left, y, size: 8, font: mono, color: dim },
  );
  y -= 12;
  page.drawText(`Commitment ID: ${input.commitmentId}`, {
    x: PAGE.left, y, size: 8, font: mono, color: dim,
  });
  return Buffer.from(await doc.save());
}
