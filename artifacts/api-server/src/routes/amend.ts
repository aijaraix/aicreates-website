import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";
import { db, commitmentsTable, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { amendCommitment, AMENDABLE_STATES } from "../lib/amendCommitment";
import { ROUND_BY_SLUG, getRoundLabel } from "../lib/rounds";
import { emailSaftAmended } from "../lib/email";

const router: IRouter = Router();

interface AmendBody {
  amountCents?: number;
  roundSlug?: string;
  reason?: string;
}

function portalOriginFor(req: import("express").Request): string {
  const env = process.env["PUBLIC_PORTAL_ORIGIN"];
  if (env) return env.replace(/\/$/, "");
  const host = req.get("host") ?? "localhost";
  const proto =
    req.get("x-forwarded-proto") ?? req.protocol ?? "https";
  return `${proto}://${host}`;
}

async function notifyInvestor(args: {
  to: string;
  investorName: string;
  commitmentId: string;
  previousAmountCents: number;
  newAmountCents: number;
  previousRoundSlug: string;
  newRoundSlug: string;
  newTokens: number;
  reason: string | null;
  actorKind: "investor" | "admin";
  portalUrl: string;
}): Promise<void> {
  try {
    await emailSaftAmended({
      to: args.to,
      investorName: args.investorName,
      commitmentId: args.commitmentId,
      previousAmountCents: args.previousAmountCents,
      newAmountCents: args.newAmountCents,
      previousRoundLabel: getRoundLabel(args.previousRoundSlug),
      newRoundLabel: getRoundLabel(args.newRoundSlug),
      newTokens: args.newTokens,
      reason: args.reason,
      actorKind: args.actorKind,
      portalUrl: args.portalUrl,
    });
  } catch {
    // Email failures must not block the amend — already audit-logged.
  }
}

/**
 * Investor self-service amend. Only the commitment owner may call,
 * and only while the commitment is in an amendable pre-payment state.
 */
router.post("/commitments/:id/amend", requireAuth, async (req, res) => {
  const id = String(req.params["id"] ?? "");
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const body = (req.body ?? {}) as AmendBody;
  const amountCents = Math.floor(Number(body.amountCents) || 0);
  const roundSlug = String(body.roundSlug ?? "");
  if (!roundSlug || !ROUND_BY_SLUG.has(roundSlug)) {
    res.status(400).json({ error: "Valid roundSlug required" });
    return;
  }

  const owned = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.id, id))
    .limit(1);
  const c = owned[0];
  if (!c || c.userId !== req.appUser!.id) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!AMENDABLE_STATES.includes(c.state)) {
    res.status(409).json({
      error: `Commitment in state ${c.state} cannot be amended`,
      code: "not_amendable",
    });
    return;
  }

  const result = await amendCommitment({
    commitmentId: id,
    newAmountCents: amountCents,
    newRoundSlug: roundSlug,
    reason: typeof body.reason === "string" ? body.reason.slice(0, 500) : null,
    actorEmail: req.appUser!.email,
    actorKind: "investor",
  });
  if (!result.ok) {
    res.status(result.status).json({
      error: result.error,
      code: result.code,
      ...(result.details ? { details: result.details } : {}),
    });
    return;
  }

  // Self-serve amends do not trigger an email; the investor is already
  // looking at the portal and will be redirected to /saft/:id by the UI.
  void portalOriginFor;
  res.json({ commitment: result.commitment });
});

/**
 * Admin amend. Requires a non-empty reason for the audit trail.
 */
router.post(
  "/admin/commitments/:id/amend",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = String(req.params["id"] ?? "");
    if (!id) {
      res.status(400).json({ error: "id required" });
      return;
    }
    const body = (req.body ?? {}) as AmendBody;
    const amountCents = Math.floor(Number(body.amountCents) || 0);
    const roundSlug = String(body.roundSlug ?? "");
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    if (!roundSlug || !ROUND_BY_SLUG.has(roundSlug)) {
      res.status(400).json({ error: "Valid roundSlug required" });
      return;
    }
    if (!reason) {
      res.status(400).json({
        error: "reason is required for admin amendments",
        code: "reason_required",
      });
      return;
    }

    const target = await db
      .select()
      .from(commitmentsTable)
      .where(eq(commitmentsTable.id, id))
      .limit(1);
    const c = target[0];
    if (!c) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const result = await amendCommitment({
      commitmentId: id,
      newAmountCents: amountCents,
      newRoundSlug: roundSlug,
      reason,
      actorEmail: req.appUser!.email,
      actorKind: "admin",
    });
    if (!result.ok) {
      res.status(result.status).json({
        error: result.error,
        code: result.code,
        ...(result.details ? { details: result.details } : {}),
      });
      return;
    }

    const ownerRows = await db
      .select()
      .from(appUsersTable)
      .where(eq(appUsersTable.id, c.userId))
      .limit(1);
    const owner = ownerRows[0];
    if (owner) {
      await notifyInvestor({
        to: owner.email,
        investorName: owner.fullName ?? owner.email,
        commitmentId: id,
        previousAmountCents: c.amountCents,
        newAmountCents: result.commitment.amountCents,
        previousRoundSlug: c.roundSlug,
        newRoundSlug: result.commitment.roundSlug,
        newTokens: result.commitment.tokenAllocation,
        reason,
        actorKind: "admin",
        portalUrl: `${portalOriginFor(req)}/invest/saft/${id}`,
      });
    }

    res.json({ commitment: result.commitment });
  },
);

export default router;
