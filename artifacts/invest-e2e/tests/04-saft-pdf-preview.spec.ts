import { test, expect } from "@playwright/test";
import { inflateSync } from "node:zlib";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";

// pdf-lib emits FlateDecode-compressed content streams AND encodes
// drawn text as hex strings using WinAnsiEncoding for the standard
// Helvetica font (e.g. `<4149...> Tj` instead of `(AICreatesAI) Tj`).
// To assert on the rendered text we (1) walk every `stream...endstream`
// block, (2) zlib-inflate each, and (3) decode every `<HEX>` literal in
// the resulting content stream as latin1 bytes. The concatenation lets
// us substring-match for visible labels like "Allocation".
function extractRenderedText(pdf: Buffer): string {
  const out: string[] = [];
  const text = pdf.toString("latin1");
  const re = /\bstream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length;
    const end = text.indexOf("endstream", start);
    if (end < 0) continue;
    let stop = end;
    if (pdf[stop - 1] === 0x0a) stop -= 1;
    if (pdf[stop - 1] === 0x0d) stop -= 1;
    let decoded: string;
    try {
      decoded = inflateSync(pdf.subarray(start, stop)).toString("latin1");
    } catch {
      re.lastIndex = end + "endstream".length;
      continue;
    }
    // Decode every <HEX> literal so visible labels become greppable.
    const withHex = decoded.replace(/<([0-9A-Fa-f\s]+)>/g, (_, hex) => {
      const clean = hex.replace(/\s+/g, "");
      if (clean.length % 2 !== 0) return "";
      let s = "";
      for (let i = 0; i < clean.length; i += 2) {
        s += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
      }
      return s;
    });
    out.push(withHex);
    re.lastIndex = end + "endstream".length;
  }
  return out.join("\n");
}

test.describe("SAFT PDF preview", () => {
  test("the live preview endpoint renders a real PDF auto-filled from the profile", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 2_500);

    // The simplified preview endpoint pulls investor + allocation data
    // from the DB (profile + commitment_allocations); the request body
    // only carries the in-progress wizard fields. With a fresh draft we
    // can pass an empty body and still get a valid PDF back.
    const res = await page.request.post(`/api/saft/${c.id}/preview`, {
      data: {
        paymentMethod: "wire",
        accreditationCategory: "net-worth",
        signatureName: "Portal Investor",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("application/pdf");
    const body = await res.body();
    expect(body.length).toBeGreaterThan(500);
    expect(body.slice(0, 4).toString("latin1")).toBe("%PDF");

    // Inflate every FlateDecode stream and assert the decoded text
    // contains the per-round allocation table (round label, "Allocation"
    // header, "Acknowledged" boilerplate). This protects against silent
    // regressions where the PDF endpoint returns a valid-but-empty cover
    // page with no allocations baked in.
    const text = extractRenderedText(body);
    expect(text).toContain("Allocation");
    expect(text).toContain("Strategic Seed");
    expect(text).toContain("Acknowledged");
  });
});
