import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
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

export interface SaftRenderInput {
  commitmentId: string;
  amountUsd: number;
  roundLabel: string;
  tokenAllocation: number;
  legalName: string;
  entityType: "individual" | "entity";
  email: string;
  address: string;
  jurisdiction: string;
  taxIdLast4: string;
  walletAddress?: string;
  paymentMethod: string;
  accreditationCategory: string;
  acknowledgments: string[];
  signatureName: string;
  signedAt: string;
  signerIp: string | null;
}

/**
 * Renders a draft SAFT cover sheet + acknowledgments overlay onto the
 * source SAFT PDF. The overlay is intentionally a top-level cover page
 * so reviewers can read both the captured intent AND the original
 * agreement without needing pixel-perfect field positioning.
 */
export async function renderSaftPdf(input: SaftRenderInput): Promise<Buffer> {
  const template = await loadTemplate();
  const doc = template
    ? await PDFDocument.load(template)
    : await PDFDocument.create();

  const cover = doc.insertPage(0, [612, 792]);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const ink = rgb(0.07, 0.07, 0.07);
  const dim = rgb(0.4, 0.4, 0.4);
  const accent = rgb(0, 0.58, 0.51);

  let y = 740;
  const left = 56;

  cover.drawText("AICreatesAI", {
    x: left,
    y,
    size: 18,
    font: helvBold,
    color: ink,
  });
  cover.drawText("AICA Private Sale - Draft SAFT", {
    x: left + 110,
    y,
    size: 12,
    font: helv,
    color: dim,
  });
  y -= 28;
  cover.drawText("DRAFT FOR COUNSEL REVIEW - NOT FINAL", {
    x: left,
    y,
    size: 10,
    font: helvBold,
    color: accent,
  });
  y -= 24;

  const lines: Array<[string, string] | []> = [
    ["Commitment ID", input.commitmentId],
    ["Round", input.roundLabel],
    ["Amount", `$${input.amountUsd.toLocaleString("en-US")} USD`],
    [
      "Token allocation",
      `${input.tokenAllocation.toLocaleString("en-US")} AICA`,
    ],
    ["Payment method", input.paymentMethod],
    [],
    ["Investor name", input.legalName],
    [
      "Investor type",
      input.entityType === "entity" ? "Entity" : "Individual",
    ],
    ["Email", input.email],
    ["Jurisdiction", input.jurisdiction],
    ["Address", input.address],
    ["Tax ID (last 4)", input.taxIdLast4 ? `***-**-${input.taxIdLast4}` : "-"],
    ["Wallet (optional)", input.walletAddress ?? "(to be provided pre-TGE)"],
    [],
    ["Accreditation", input.accreditationCategory],
  ];

  for (const row of lines) {
    if (row.length === 0) {
      y -= 8;
      continue;
    }
    const [label, value] = row;
    cover.drawText(label, {
      x: left,
      y,
      size: 9,
      font: helvBold,
      color: dim,
    });
    cover.drawText(String(value).slice(0, 70), {
      x: left + 130,
      y,
      size: 10,
      font: helv,
      color: ink,
    });
    y -= 16;
  }

  y -= 8;
  cover.drawText("Acknowledged:", {
    x: left,
    y,
    size: 10,
    font: helvBold,
    color: ink,
  });
  y -= 14;
  for (const a of input.acknowledgments) {
    cover.drawText(`[x] ${a}`, {
      x: left,
      y,
      size: 9,
      font: helv,
      color: ink,
    });
    y -= 12;
  }

  y -= 16;
  cover.drawText("Typed signature:", {
    x: left,
    y,
    size: 10,
    font: helvBold,
    color: ink,
  });
  cover.drawText(input.signatureName, {
    x: left + 110,
    y: y - 2,
    size: 16,
    font: helvBold,
    color: accent,
  });
  y -= 24;
  cover.drawText(`Signed ${input.signedAt}`, {
    x: left,
    y,
    size: 8,
    font: mono,
    color: dim,
  });
  if (input.signerIp) {
    cover.drawText(`Signer IP: ${input.signerIp}`, {
      x: left + 200,
      y,
      size: 8,
      font: mono,
      color: dim,
    });
  }

  // Diagonal "DRAFT" watermark across the cover page.
  cover.drawText("DRAFT", {
    x: 110,
    y: 280,
    size: 140,
    font: helvBold,
    color: rgb(0.85, 0.85, 0.85),
    rotate: degrees(-30),
    opacity: 0.25,
  });

  return Buffer.from(await doc.save());
}
