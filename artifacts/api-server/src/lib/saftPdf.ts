import { PDFDocument, StandardFonts, rgb, degrees, type PDFPage, type PDFFont } from "pdf-lib";
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
  // individual
  legalFirstName?: string | null;
  legalLastName?: string | null;
  dateOfBirth?: string | null;
  taxIdLast4?: string | null;
  // business
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
  paymentMethod: string;
  accreditationCategory: string;
  acknowledgments: string[];
  signatureName: string;
  signedAt: string;
  signerIp: string | null;
}

const PAGE = { w: 612, h: 792, left: 56, right: 556 };

function drawHeader(page: PDFPage, helv: PDFFont, helvBold: PDFFont) {
  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0, 0.58, 0.51);
  let y = 740;
  page.drawText("AICreatesAI", {
    x: PAGE.left,
    y,
    size: 18,
    font: helvBold,
    color: ink,
  });
  page.drawText("AICA Private Sale - Draft SAFT", {
    x: PAGE.left + 110,
    y,
    size: 12,
    font: helv,
    color: dim,
  });
  y -= 24;
  page.drawText("DRAFT FOR COUNSEL REVIEW - NOT FINAL", {
    x: PAGE.left,
    y,
    size: 10,
    font: helvBold,
    color: accent,
  });
  return y - 20;
}

function drawWatermark(page: PDFPage, helvBold: PDFFont) {
  page.drawText("DRAFT", {
    x: 110,
    y: 280,
    size: 140,
    font: helvBold,
    color: rgb(0.85, 0.85, 0.85),
    rotate: degrees(-30),
    opacity: 0.25,
  });
}

function drawKv(
  page: PDFPage,
  helv: PDFFont,
  helvBold: PDFFont,
  label: string,
  value: string,
  y: number,
) {
  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  page.drawText(label, {
    x: PAGE.left,
    y,
    size: 9,
    font: helvBold,
    color: dim,
  });
  page.drawText(String(value).slice(0, 78), {
    x: PAGE.left + 130,
    y,
    size: 10,
    font: helv,
    color: ink,
  });
}

/**
 * Renders the dynamic SAFT cover-sheet (one or two pages, depending
 * on overflow) in front of the source SAFT PDF. The cover captures:
 * investor identity (auto-filled from investor_profiles), per-round
 * allocation table, payment + accreditation, acknowledgments and the
 * typed signature with IP/timestamp.
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

  // Pre-build all the lines we need to draw on the cover. We'll
  // measure as we go and overflow to a second cover page if needed.
  const cover1 = doc.insertPage(0, [PAGE.w, PAGE.h]);
  let y = drawHeader(cover1, helv, helvBold);
  let page: PDFPage = cover1;

  function ensure(roomNeeded: number) {
    if (y - roomNeeded < 60) {
      // overflow — insert a second cover page right after the first
      const next = doc.insertPage(1, [PAGE.w, PAGE.h]);
      y = drawHeader(next, helv, helvBold);
      page = next;
    }
  }

  // ----- Investor block -----
  page.drawText("Investor", {
    x: PAGE.left,
    y,
    size: 11,
    font: helvBold,
    color: ink,
  });
  y -= 16;
  const p = input.profile;
  if (p.kind === "individual") {
    const fullName = `${p.legalFirstName ?? ""} ${p.legalLastName ?? ""}`.trim();
    drawKv(page, helv, helvBold, "Investor type", "Individual", y); y -= 14;
    drawKv(page, helv, helvBold, "Legal name", fullName || "(unspecified)", y); y -= 14;
    drawKv(page, helv, helvBold, "Date of birth", p.dateOfBirth || "-", y); y -= 14;
    if (p.taxIdLast4) {
      drawKv(page, helv, helvBold, "SSN/TIN (last 4)", `***-**-${p.taxIdLast4}`, y);
      y -= 14;
    }
  } else {
    drawKv(page, helv, helvBold, "Investor type", "Business / Entity", y); y -= 14;
    drawKv(page, helv, helvBold, "Entity name", p.legalEntityName || "(unspecified)", y); y -= 14;
    drawKv(page, helv, helvBold, "Entity type", p.entityType || "-", y); y -= 14;
    drawKv(page, helv, helvBold, "Formed in", p.jurisdictionOfFormation || "-", y); y -= 14;
    if (p.einLast4) {
      drawKv(page, helv, helvBold, "EIN (last 4)", `**-***${p.einLast4}`, y);
      y -= 14;
    }
    drawKv(page, helv, helvBold, "Authorized signer", p.signatoryName || "(unspecified)", y); y -= 14;
    drawKv(page, helv, helvBold, "Signer title", p.signatoryTitle || "-", y); y -= 14;
  }
  drawKv(page, helv, helvBold, "Email", p.email, y); y -= 14;
  if (p.phone) { drawKv(page, helv, helvBold, "Phone", p.phone, y); y -= 14; }
  const addr = [p.addressLine1, p.addressLine2, `${p.city}, ${p.region} ${p.postalCode}`, p.country]
    .filter(Boolean)
    .join("  ·  ");
  drawKv(page, helv, helvBold, "Address", addr, y); y -= 18;

  drawKv(page, helv, helvBold, "Commitment ID", input.commitmentId, y); y -= 18;

  // ----- Allocation table -----
  ensure(60 + 16 * (input.allocations.length + 2));
  page.drawText("Allocation", {
    x: PAGE.left,
    y,
    size: 11,
    font: helvBold,
    color: ink,
  });
  y -= 16;

  const colX = {
    round: PAGE.left,
    tokens: PAGE.left + 200,
    price: PAGE.left + 290,
    usd: PAGE.left + 360,
    tge: PAGE.left + 425,
    cliff: PAGE.left + 470,
    vest: PAGE.left + 510,
  };
  const headerRow = [
    ["Round", colX.round],
    ["Tokens", colX.tokens],
    ["Price", colX.price],
    ["USD", colX.usd],
    ["TGE", colX.tge],
    ["Cliff", colX.cliff],
    ["Vest", colX.vest],
  ] as const;
  for (const [label, x] of headerRow) {
    page.drawText(label, { x, y, size: 8, font: helvBold, color: dim });
  }
  y -= 12;
  page.drawLine({
    start: { x: PAGE.left, y: y + 6 },
    end: { x: PAGE.right, y: y + 6 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  let totalTokens = 0;
  let totalCents = 0;
  for (const a of input.allocations) {
    ensure(20);
    const usdPerToken = `$${(a.pricePerTokenMillicents / 1000).toFixed(3)}`;
    const usd = `$${(a.usdCents / 100).toLocaleString("en-US")}`;
    const cells: Array<[string, number]> = [
      [a.roundLabel, colX.round],
      [a.tokens.toLocaleString("en-US"), colX.tokens],
      [usdPerToken, colX.price],
      [usd, colX.usd],
      ["25%", colX.tge],
      ["6mo", colX.cliff],
      ["24mo", colX.vest],
    ];
    for (const [text, x] of cells) {
      page.drawText(text.slice(0, 26), { x, y, size: 9, font: helv, color: ink });
    }
    totalTokens += a.tokens;
    totalCents += a.usdCents;
    y -= 14;
  }
  ensure(20);
  page.drawLine({
    start: { x: PAGE.left, y: y + 8 },
    end: { x: PAGE.right, y: y + 8 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText("Total", { x: colX.round, y, size: 9, font: helvBold, color: ink });
  page.drawText(totalTokens.toLocaleString("en-US"), {
    x: colX.tokens,
    y,
    size: 9,
    font: helvBold,
    color: ink,
  });
  page.drawText(`$${(totalCents / 100).toLocaleString("en-US")}`, {
    x: colX.usd,
    y,
    size: 9,
    font: helvBold,
    color: accent,
  });
  y -= 22;

  // ----- Payment + accreditation -----
  ensure(60);
  drawKv(page, helv, helvBold, "Payment method", input.paymentMethod, y); y -= 14;
  drawKv(page, helv, helvBold, "Accreditation", input.accreditationCategory, y); y -= 14;
  drawKv(
    page,
    helv,
    helvBold,
    "Wallet (optional)",
    input.walletAddress
      ? `${input.walletAddress}${input.walletChain ? ` (${input.walletChain})` : ""}`
      : "(to be provided pre-TGE)",
    y,
  );
  y -= 22;

  // ----- Acknowledgments -----
  ensure(20 + input.acknowledgments.length * 12);
  page.drawText("Acknowledged:", {
    x: PAGE.left,
    y,
    size: 10,
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

  // ----- Signature -----
  ensure(50);
  y -= 6;
  page.drawText("Typed signature:", {
    x: PAGE.left,
    y,
    size: 10,
    font: helvBold,
    color: ink,
  });
  page.drawText(input.signatureName, {
    x: PAGE.left + 110,
    y: y - 2,
    size: 16,
    font: helvBold,
    color: accent,
  });
  y -= 22;
  page.drawText(`Signed ${input.signedAt}`, {
    x: PAGE.left,
    y,
    size: 8,
    font: mono,
    color: dim,
  });
  if (input.signerIp) {
    page.drawText(`Signer IP: ${input.signerIp}`, {
      x: PAGE.left + 200,
      y,
      size: 8,
      font: mono,
      color: dim,
    });
  }

  // Watermark on every cover page we produced (page 1, optionally page 2).
  drawWatermark(cover1, helvBold);
  if (page !== cover1) drawWatermark(page, helvBold);

  return Buffer.from(await doc.save());
}
