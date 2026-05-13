import {
  db,
  roundStateTable,
  commitmentsTable,
  appUsersTable,
} from "@workspace/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { ROUNDS, ROUND_BY_SLUG } from "./rounds";
import { reservedByRound, lockRoundsForUpdate } from "./availability";
import { logger } from "./logger";
import { adminEmails } from "./auth";
import { emailRoundAdvanced, emailRecommitNeeded } from "./email";

export type RoundStatus = "upcoming" | "open" | "closed";

export interface RoundStateRow {
  slug: string;
  status: RoundStatus;
  softClosePct: number;
  openedAt: Date | null;
  closedAt: Date | null;
  updatedAt: Date;
}

/** Stable advisory-lock key for the global transition evaluator. */
const EVAL_LOCK_KEY = 794839201;

let seeded = false;

/**
 * Insert one row per catalog round on first read. Strategic Seed
 * (the first row in `ROUNDS`) defaults to `open`, every other round
 * defaults to `upcoming`. Idempotent on conflict.
 */
export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const first = ROUNDS[0]?.slug;
  for (const r of ROUNDS) {
    const isFirst = r.slug === first;
    await db
      .insert(roundStateTable)
      .values({
        slug: r.slug,
        status: isFirst ? "open" : "upcoming",
        softClosePct: 100,
        openedAt: isFirst ? new Date() : null,
      })
      .onConflictDoNothing();
  }
  seeded = true;
}

export async function getRoundStatuses(): Promise<Map<string, RoundStateRow>> {
  await ensureSeeded();
  return readStatuses(db);
}

type Executor = Parameters<typeof reservedByRound>[0];

async function readStatuses(
  executor: Executor,
): Promise<Map<string, RoundStateRow>> {
  const rows = await (executor as typeof db).select().from(roundStateTable);
  const map = new Map<string, RoundStateRow>();
  for (const r of rows) {
    map.set(r.slug, {
      slug: r.slug,
      status: (r.status as RoundStatus) ?? "upcoming",
      softClosePct: r.softClosePct,
      openedAt: r.openedAt,
      closedAt: r.closedAt,
      updatedAt: r.updatedAt,
    });
  }
  return map;
}

/**
 * Same as getRoundStatuses but reads inside a caller-provided
 * transaction so the snapshot matches subsequent writes / reads.
 */
export async function getRoundStatusesTx(
  executor: Executor,
): Promise<Map<string, RoundStateRow>> {
  return readStatuses(executor);
}

export async function getRoundStatus(slug: string): Promise<RoundStatus> {
  const map = await getRoundStatuses();
  return map.get(slug)?.status ?? "upcoming";
}

export async function getActiveRoundSlug(): Promise<string | null> {
  const map = await getRoundStatuses();
  for (const r of ROUNDS) {
    if (map.get(r.slug)?.status === "open") return r.slug;
  }
  return null;
}

export interface TransitionResult {
  closed: string[];
  opened: string[];
}

/**
 * Auto-close any `open` round that has hit its soft-close threshold or
 * passed its deadline, then open the next `upcoming` round in catalog
 * order if there is no longer any open round.
 *
 * Serialized by a global advisory lock so concurrent commit + sweep
 * + admin calls cannot double-transition.
 */
export async function evaluateRoundTransitions(
  opts: {
    reason?: "commit" | "sweep" | "admin";
    notify?: boolean;
  } = {},
): Promise<TransitionResult> {
  const reason = opts.reason ?? "sweep";
  const notify = opts.notify !== false;
  const result: TransitionResult = { closed: [], opened: [] };

  await ensureSeeded();

  await db.transaction(async (tx) => {
    // Take the global evaluator lock so two transition sweeps can't
    // overlap, AND take every per-round advisory lock so a concurrent
    // commit (which holds per-round locks) cannot insert into a round
    // whose status this tx is about to flip.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${EVAL_LOCK_KEY})`);
    await lockRoundsForUpdate(
      tx,
      ROUNDS.map((r) => r.slug),
    );
    const stateRows = await tx.select().from(roundStateTable);
    const stateMap = new Map(stateRows.map((r) => [r.slug, r] as const));
    const reserved = await reservedByRound(tx);
    const now = new Date();

    // Pass 1: close any open round that hit soft-close or deadline.
    for (const round of ROUNDS) {
      const state = stateMap.get(round.slug);
      if (!state || state.status !== "open") continue;
      const used = reserved.get(round.slug) ?? 0;
      const available = Math.max(0, round.tokensForSale - used);
      const sold = Math.max(0, round.tokensForSale - available);
      const soldPct =
        round.tokensForSale > 0 ? (sold / round.tokensForSale) * 100 : 0;
      const deadlinePassed = round.deadline
        ? new Date(round.deadline).getTime() <= now.getTime()
        : false;
      const hitSoftClose = soldPct >= state.softClosePct;
      if (hitSoftClose || deadlinePassed) {
        await tx
          .update(roundStateTable)
          .set({ status: "closed", closedAt: now, updatedAt: now })
          .where(eq(roundStateTable.slug, round.slug));
        result.closed.push(round.slug);
      }
    }

    // Pass 2: if no round is open, promote the next upcoming one.
    const stillOpen = ROUNDS.some((r) => {
      if (result.closed.includes(r.slug)) return false;
      return stateMap.get(r.slug)?.status === "open";
    });
    if (!stillOpen) {
      for (const round of ROUNDS) {
        const state = stateMap.get(round.slug);
        if (!state) continue;
        if (result.closed.includes(round.slug)) continue;
        if (state.status === "upcoming") {
          await tx
            .update(roundStateTable)
            .set({ status: "open", openedAt: now, updatedAt: now })
            .where(eq(roundStateTable.slug, round.slug));
          result.opened.push(round.slug);
          break;
        }
      }
    }
  });

  if (
    notify &&
    (result.closed.length > 0 || result.opened.length > 0)
  ) {
    sendTransitionNotifications(result, reason).catch((err) => {
      logger.error({ err }, "round transition notifications failed");
    });
  }

  if (result.closed.length || result.opened.length) {
    logger.info(
      { closed: result.closed, opened: result.opened, reason },
      "round transitions applied",
    );
  }

  return result;
}

async function sendTransitionNotifications(
  t: TransitionResult,
  reason: string,
): Promise<void> {
  const admins = adminEmails();
  if (admins.length > 0) {
    await emailRoundAdvanced({
      to: admins,
      reason,
      closed: t.closed.map((s) => ({
        slug: s,
        label: ROUND_BY_SLUG.get(s)?.label ?? s,
      })),
      opened: t.opened.map((s) => {
        const r = ROUND_BY_SLUG.get(s);
        return {
          slug: s,
          label: r?.label ?? s,
          pricePerTokenMillicents: r?.pricePerTokenMillicents ?? 0,
        };
      }),
    });
  }

  if (t.closed.length === 0) return;

  const portalOrigin = process.env["PUBLIC_PORTAL_ORIGIN"] ?? "";
  const newRoundSlug = t.opened[0];
  const newRound = newRoundSlug ? ROUND_BY_SLUG.get(newRoundSlug) : undefined;

  const rows = await db
    .select({
      commitmentId: commitmentsTable.id,
      email: appUsersTable.email,
      fullName: appUsersTable.fullName,
      roundSlug: commitmentsTable.roundSlug,
    })
    .from(commitmentsTable)
    .leftJoin(appUsersTable, eq(appUsersTable.id, commitmentsTable.userId))
    .where(
      and(
        inArray(commitmentsTable.roundSlug, t.closed),
        inArray(commitmentsTable.state, ["pending_saft", "pending_payment"]),
      ),
    );

  for (const row of rows) {
    if (!row.email) continue;
    await emailRecommitNeeded({
      to: row.email,
      investorName: row.fullName ?? "there",
      commitmentId: row.commitmentId,
      closedRoundLabel:
        ROUND_BY_SLUG.get(row.roundSlug)?.label ?? row.roundSlug,
      newRoundLabel: newRound?.label ?? null,
      newRoundPriceLabel: newRound
        ? `$${(newRound.pricePerTokenMillicents / 1000).toFixed(3)} / AICA`
        : null,
      portalUrl: portalOrigin ? `${portalOrigin}/invest` : "/invest",
    });
  }
}

let sweepTimer: NodeJS.Timeout | null = null;

/** Periodic sweep so deadline-only transitions still fire with no commits. */
export function startRoundSweep(intervalMs = 60_000): void {
  if (sweepTimer) return;
  sweepTimer = setInterval(() => {
    evaluateRoundTransitions({ reason: "sweep" }).catch((err) =>
      logger.error({ err }, "round sweep failed"),
    );
  }, intervalMs);
  // Don't keep the event loop alive on shutdown.
  sweepTimer.unref?.();
}
