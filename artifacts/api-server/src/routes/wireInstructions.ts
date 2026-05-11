import { Router, type IRouter } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { eq, and } from "drizzle-orm";
import { db, commitmentsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Asset lookup mirrors `saftPdf.ts`: in dev/source the file lives at
 * `artifacts/api-server/assets/<name>`; after esbuild bundles to `dist/`,
 * `__dirname` is `.../api-server/dist`, so `../assets/<name>` still
 * resolves into the source tree at runtime.
 */
async function loadAsset(name: string): Promise<Buffer | null> {
  const candidates = [
    path.resolve(__dirname, "../../assets", name),
    path.resolve(__dirname, "../assets", name),
  ];
  for (const p of candidates) {
    try {
      return await fs.readFile(p);
    } catch {
      // try next candidate
    }
  }
  return null;
}

/** Commitment states for which the investor still needs the wire details. */
const ELIGIBLE_STATES = new Set([
  "pending_payment",
  "awaiting_wire",
  "funded",
]);

/**
 * Verify the requesting user owns the commitment and is in a state that
 * legitimately needs the wire instructions. Returns 404 in any failure
 * case to avoid leaking commitment-existence information.
 */
async function loadEligibleCommitment(
  commitmentId: string,
  userId: string,
): Promise<boolean> {
  const rows = await db
    .select({
      state: commitmentsTable.state,
      paymentMethod: commitmentsTable.paymentMethod,
    })
    .from(commitmentsTable)
    .where(
      and(
        eq(commitmentsTable.id, commitmentId),
        eq(commitmentsTable.userId, userId),
      ),
    )
    .limit(1);
  const c = rows[0];
  if (!c) return false;
  // Investors can also see the wire details before they pick a method
  // (the SAFT confirmation step links to them), so allow any non-cancelled
  // commitment that's at least pending_payment, plus any payment method.
  if (!ELIGIBLE_STATES.has(c.state)) return false;
  return true;
}

const router: IRouter = Router();

router.get(
  "/wire-instructions/:commitId/pdf",
  requireAuth,
  async (req, res) => {
    const id = req.params["commitId"] as string | undefined;
    if (!id) {
      res.status(400).json({ error: "commitId required" });
      return;
    }
    const ok = await loadEligibleCommitment(id, req.appUser!.id);
    if (!ok) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const buf = await loadAsset("wire-instructions.pdf");
    if (!buf) {
      req.log?.error("wire-instructions.pdf missing from api-server assets");
      res.status(500).json({ error: "Asset unavailable" });
      return;
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="aica-wire-instructions.pdf"`,
    );
    res.send(buf);
  },
);

router.get(
  "/wire-instructions/:commitId/image",
  requireAuth,
  async (req, res) => {
    const id = req.params["commitId"] as string | undefined;
    if (!id) {
      res.status(400).json({ error: "commitId required" });
      return;
    }
    const ok = await loadEligibleCommitment(id, req.appUser!.id);
    if (!ok) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const buf = await loadAsset("wire-instructions.png");
    if (!buf) {
      req.log?.error("wire-instructions.png missing from api-server assets");
      res.status(500).json({ error: "Asset unavailable" });
      return;
    }
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="aica-wire-instructions.png"`,
    );
    res.send(buf);
  },
);

export default router;
