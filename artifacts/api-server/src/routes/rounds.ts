import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { getActiveRound, ROUNDS, ROUND_BY_SLUG } from "../lib/rounds";
import { getActiveRoundSlug, getRoundStatuses } from "../lib/roundStatus";

const router: IRouter = Router();

router.get("/rounds/active", async (_req, res) => {
  const activeSlug = await getActiveRoundSlug();
  // When no round is currently `open`, fall back to the last catalog
  // round so the public scoreboard still renders, but signal the
  // truth via `status` and `hasActive` so consumers can degrade.
  const fallback = ROUNDS[ROUNDS.length - 1] ?? getActiveRound();
  const round =
    (activeSlug ? ROUND_BY_SLUG.get(activeSlug) : undefined) ?? fallback;
  const hasActive = activeSlug !== null;
  const result = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE state = 'funded' OR status = 'succeeded') AS funded_count,
      COUNT(DISTINCT user_id) FILTER (WHERE state = 'funded' OR status = 'succeeded') AS funded_investors,
      COUNT(*) FILTER (WHERE state IN ('pending_saft','pending_payment','awaiting_wire','awaiting_crypto')) AS in_flight_count,
      COUNT(*) AS total_commitments,
      COALESCE(SUM(amount_cents) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0) AS funded_cents,
      COALESCE(SUM(token_allocation) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0) AS allocated_tokens,
      COALESCE(SUM(amount_cents) FILTER (WHERE state IN ('awaiting_wire','awaiting_crypto','pending_payment')), 0) AS in_flight_cents
    FROM commitments
    WHERE round_slug = ${round.slug}
  `);
  const row = (result.rows[0] ?? {}) as Record<string, unknown>;
  res.json({
    round,
    hasActive,
    status: hasActive ? "open" : "closed",
    raised: {
      fundedCents: Number(row["funded_cents"] ?? 0),
      inFlightCents: Number(row["in_flight_cents"] ?? 0),
      allocatedTokens: Number(row["allocated_tokens"] ?? 0),
      fundedCount: Number(row["funded_count"] ?? 0),
      fundedInvestors: Number(row["funded_investors"] ?? 0),
      inFlightCount: Number(row["in_flight_count"] ?? 0),
      totalCommitments: Number(row["total_commitments"] ?? 0),
    },
  });
});

router.get("/rounds", async (_req, res) => {
  // Enrich the static catalog with the live server-side `isOpen` flag
  // computed from `round_state`. The amend pickers use this so the
  // options match what the server will actually accept (the static
  // `open` flag in `lib/rounds.ts` can drift from real round state).
  const map = await getRoundStatuses();
  const rounds = ROUNDS.map((r) => ({
    ...r,
    isOpen: map.get(r.slug)?.status === "open",
  }));
  res.json({ rounds });
});

export default router;
