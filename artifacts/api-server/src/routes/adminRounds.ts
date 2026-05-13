import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";
import { db, roundStateTable, commitmentsTable } from "@workspace/db";
import { and, eq, ne, sql } from "drizzle-orm";
import { ROUNDS, ROUND_BY_SLUG } from "../lib/rounds";
import { getAvailability, lockRoundsForUpdate } from "../lib/availability";
import {
  evaluateRoundTransitions,
  getRoundStatuses,
  type RoundStatus,
} from "../lib/roundStatus";
import { logAdminAction } from "../lib/audit";

const router: IRouter = Router();

router.use("/admin/rounds", requireAuth, requireAdmin);

interface AdminRoundView {
  slug: string;
  label: string;
  status: RoundStatus;
  softClosePct: number;
  openedAt: string | null;
  closedAt: string | null;
  capacity: number;
  reserved: number;
  available: number;
  pricePerTokenMillicents: number;
  hardCapCents: number;
  fundedCents: number;
  inFlightCents: number;
  fundedCount: number;
  soldPct: number;
  deadline: string;
}

async function buildView(): Promise<AdminRoundView[]> {
  const [statuses, availability, raisedRows] = await Promise.all([
    getRoundStatuses(),
    getAvailability(),
    db.execute(sql`
      SELECT round_slug,
             COALESCE(SUM(amount_cents) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0)::bigint AS funded_cents,
             COALESCE(SUM(amount_cents) FILTER (WHERE state IN ('awaiting_wire','awaiting_crypto','pending_payment')), 0)::bigint AS in_flight_cents,
             COUNT(*) FILTER (WHERE state = 'funded' OR status = 'succeeded')::int AS funded_count
        FROM commitments
       GROUP BY round_slug
    `),
  ]);
  const availMap = new Map(availability.map((a) => [a.slug, a]));
  const raisedMap = new Map(
    (raisedRows.rows as Array<Record<string, unknown>>).map((r) => [
      String(r["round_slug"] ?? ""),
      {
        fundedCents: Number(r["funded_cents"] ?? 0),
        inFlightCents: Number(r["in_flight_cents"] ?? 0),
        fundedCount: Number(r["funded_count"] ?? 0),
      },
    ]),
  );
  return ROUNDS.map((r) => {
    const state = statuses.get(r.slug);
    const avail = availMap.get(r.slug);
    const raised = raisedMap.get(r.slug);
    const sold = avail ? Math.max(0, avail.capacity - avail.available) : 0;
    return {
      slug: r.slug,
      label: r.label,
      status: (state?.status ?? "upcoming") as RoundStatus,
      softClosePct: state?.softClosePct ?? 100,
      openedAt: state?.openedAt ? state.openedAt.toISOString() : null,
      closedAt: state?.closedAt ? state.closedAt.toISOString() : null,
      capacity: r.tokensForSale,
      reserved: avail?.reserved ?? 0,
      available: avail?.available ?? r.tokensForSale,
      pricePerTokenMillicents: r.pricePerTokenMillicents,
      hardCapCents: r.hardCapCents,
      fundedCents: raised?.fundedCents ?? 0,
      inFlightCents: raised?.inFlightCents ?? 0,
      fundedCount: raised?.fundedCount ?? 0,
      soldPct: r.tokensForSale > 0 ? (sold / r.tokensForSale) * 100 : 0,
      deadline: r.deadline,
    };
  });
}

router.get("/admin/rounds", async (_req, res) => {
  res.json({ rounds: await buildView() });
});

async function setStatus(
  slug: string,
  next: RoundStatus,
  actorEmail: string,
  action: string,
): Promise<{ autoClosed: string[] }> {
  const now = new Date();
  const set: Record<string, unknown> = { status: next, updatedAt: now };
  if (next === "open") set["openedAt"] = now;
  if (next === "closed") set["closedAt"] = now;
  const autoClosed: string[] = [];
  await db.transaction(async (tx) => {
    // Hold per-round advisory locks for every round so concurrent
    // commits (which take the same locks via lockRoundsForUpdate)
    // cannot insert into a round whose status we are about to change.
    await lockRoundsForUpdate(
      tx,
      ROUNDS.map((r) => r.slug),
    );
    // Single-active-round invariant: when promoting one round to open,
    // close every other currently-open round in the same tx.
    if (next === "open") {
      const others = await tx
        .select({ slug: roundStateTable.slug })
        .from(roundStateTable)
        .where(
          and(
            eq(roundStateTable.status, "open"),
            ne(roundStateTable.slug, slug),
          ),
        );
      if (others.length > 0) {
        await tx
          .update(roundStateTable)
          .set({ status: "closed", closedAt: now, updatedAt: now })
          .where(
            and(
              eq(roundStateTable.status, "open"),
              ne(roundStateTable.slug, slug),
            ),
          );
        for (const o of others) autoClosed.push(o.slug);
      }
    }
    await tx
      .insert(roundStateTable)
      .values({
        slug,
        status: next,
        softClosePct: 100,
        openedAt: next === "open" ? now : null,
        closedAt: next === "closed" ? now : null,
      })
      .onConflictDoUpdate({ target: roundStateTable.slug, set });
  });
  await logAdminAction({
    actorEmail,
    action,
    targetType: "round",
    targetId: slug,
    details: { status: next, autoClosed },
  });
  return { autoClosed };
}

router.post("/admin/rounds/:slug/open", async (req, res) => {
  const slug = req.params["slug"];
  if (!slug || !ROUND_BY_SLUG.has(slug)) {
    res.status(400).json({ error: "Unknown round" });
    return;
  }
  await setStatus(slug, "open", req.appUser!.email, "round_open");
  res.json({ ok: true, rounds: await buildView() });
});

router.post("/admin/rounds/:slug/close", async (req, res) => {
  const slug = req.params["slug"];
  if (!slug || !ROUND_BY_SLUG.has(slug)) {
    res.status(400).json({ error: "Unknown round" });
    return;
  }
  await setStatus(slug, "closed", req.appUser!.email, "round_close");
  res.json({ ok: true, rounds: await buildView() });
});

router.post("/admin/rounds/:slug/reopen", async (req, res) => {
  const slug = req.params["slug"];
  if (!slug || !ROUND_BY_SLUG.has(slug)) {
    res.status(400).json({ error: "Unknown round" });
    return;
  }
  await setStatus(slug, "open", req.appUser!.email, "round_reopen");
  res.json({ ok: true, rounds: await buildView() });
});

router.patch("/admin/rounds/:slug", async (req, res) => {
  const slug = req.params["slug"];
  if (!slug || !ROUND_BY_SLUG.has(slug)) {
    res.status(400).json({ error: "Unknown round" });
    return;
  }
  const body = (req.body ?? {}) as { softClosePct?: number };
  if (typeof body.softClosePct !== "number") {
    res.status(400).json({ error: "softClosePct required" });
    return;
  }
  const pct = Math.max(1, Math.min(100, Math.round(body.softClosePct)));
  await db
    .insert(roundStateTable)
    .values({ slug, softClosePct: pct })
    .onConflictDoUpdate({
      target: roundStateTable.slug,
      set: { softClosePct: pct, updatedAt: new Date() },
    });
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "round_set_soft_close",
    targetType: "round",
    targetId: slug,
    details: { softClosePct: pct },
  });
  // A lower soft-close threshold may immediately trigger an auto-close.
  await evaluateRoundTransitions({ reason: "admin" });
  res.json({ ok: true, rounds: await buildView() });
});

router.post("/admin/rounds/evaluate", async (req, res) => {
  const result = await evaluateRoundTransitions({ reason: "admin" });
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "round_evaluate",
    targetType: "round",
    targetId: null,
    details: result as unknown as Record<string, unknown>,
  });
  res.json({ ok: true, result, rounds: await buildView() });
});

// Helper to silence unused import warning when commitmentsTable is not used.
void commitmentsTable;
void eq;

export default router;
