import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { ROUNDS, ROUND_BY_SLUG, type RoundDef } from "./rounds";

/**
 * States that consume capacity. Funded purchases are obviously locked
 * in; in-flight states reserve capacity until they fail / are reaped.
 */
export const RESERVING_STATES = [
  "pending_saft",
  "pending_payment",
  "awaiting_wire",
  "awaiting_crypto",
  "funded",
  // legacy values kept for back-compat
  "pending",
  "succeeded",
];

/**
 * Pre-payment "soft" states that can be reaped after a TTL when the
 * investor abandons the cart. Anything beyond these (awaiting_wire/
 * awaiting_crypto/funded) is considered active and never expires
 * automatically.
 */
export const EXPIRABLE_STATES = ["pending_saft", "pending_payment", "pending"];

/** Days before an unfunded pending commitment frees its tokens. */
export const PENDING_COMMITMENT_TTL_DAYS = 7;

/**
 * Anything with `.execute()` and the drizzle query builder shape -
 * either the global `db` or a tx handle from `db.transaction(...)`.
 * Drizzle's tx and base db share the query API but not their full
 * types (the tx is missing `$client`), so this is the narrow surface
 * we actually use.
 */
type TxArg = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = typeof db | TxArg;

export interface RoundAvailability {
  slug: string;
  label: string;
  pricePerTokenMillicents: number;
  capacity: number;
  reserved: number;
  available: number;
  open: boolean;
}

/**
 * Stable 31-bit hash of a round slug for use as a pg_advisory_xact_lock
 * key. Must be deterministic across processes and DB connections.
 */
function roundLockKey(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  // Force into a positive 31-bit range to keep advisory key stable.
  return Math.abs(h) % 2_147_483_647;
}

/**
 * Take a transaction-scoped advisory lock per round slug. Serializes
 * concurrent capacity reservations against the same round so the
 * read-then-insert sequence in POST /commitments is race-free.
 *
 * Must be called inside an active transaction. Lock auto-releases on
 * commit/rollback.
 */
export async function lockRoundsForUpdate(
  tx: Executor,
  slugs: string[],
): Promise<void> {
  // Sort to avoid deadlocks across concurrent multi-round commits.
  const unique = Array.from(new Set(slugs)).sort();
  for (const s of unique) {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${roundLockKey(s)})`);
  }
}

/**
 * Sum of `tokens` from commitment_allocations whose parent commitment
 * is in a reserving state, plus a fallback to the legacy single-round
 * sum on `commitments.token_allocation` for commitments that have no
 * commitment_allocations rows (created before multi-round cart).
 *
 * Pass `executor` = the transaction handle when called inside a tx so
 * the read sees the same snapshot as subsequent writes.
 */
async function reservedByRound(
  executor: Executor = db,
): Promise<Map<string, number>> {
  // Lazy sweep: a pending_saft / pending_payment row older than the TTL
  // no longer reserves capacity (acts as an inline reaper). Active
  // states (awaiting_*, funded) always reserve regardless of age.
  const ttlDays = PENDING_COMMITMENT_TTL_DAYS;
  const expirableSql = sql`ARRAY[${sql.join(
    EXPIRABLE_STATES.map((s) => sql`${s}`),
    sql`, `,
  )}]::text[]`;
  const reservingFilter = sql`(
    c.state = ANY(${RESERVING_STATES})
    AND (
      NOT (c.state = ANY(${expirableSql}))
      OR c.created_at > now() - (${ttlDays}::int * INTERVAL '1 day')
    )
  )`;

  const fromAllocations = await executor.execute(sql`
    SELECT ca.round_slug AS round_slug,
           COALESCE(SUM(ca.tokens), 0)::int AS tokens
      FROM commitment_allocations ca
      JOIN commitments c ON c.id = ca.commitment_id
     WHERE ${reservingFilter}
     GROUP BY ca.round_slug
  `);

  // Legacy: commitments with NO commitment_allocations rows.
  const fromLegacy = await executor.execute(sql`
    SELECT c.round_slug AS round_slug,
           COALESCE(SUM(c.token_allocation), 0)::int AS tokens
      FROM commitments c
     WHERE ${reservingFilter}
       AND NOT EXISTS (
         SELECT 1 FROM commitment_allocations ca WHERE ca.commitment_id = c.id
       )
     GROUP BY c.round_slug
  `);

  const map = new Map<string, number>();
  for (const row of fromAllocations.rows as Array<Record<string, unknown>>) {
    const slug = String(row["round_slug"] ?? "");
    const tokens = Number(row["tokens"] ?? 0);
    map.set(slug, tokens);
  }
  for (const row of fromLegacy.rows as Array<Record<string, unknown>>) {
    const slug = String(row["round_slug"] ?? "");
    const tokens = Number(row["tokens"] ?? 0);
    map.set(slug, (map.get(slug) ?? 0) + tokens);
  }
  return map;
}

export async function getAvailability(): Promise<RoundAvailability[]> {
  const reserved = await reservedByRound();
  return ROUNDS.map((r: RoundDef) => {
    const used = reserved.get(r.slug) ?? 0;
    const available = Math.max(0, r.tokensForSale - used);
    return {
      slug: r.slug,
      label: r.label,
      pricePerTokenMillicents: r.pricePerTokenMillicents,
      capacity: r.tokensForSale,
      reserved: used,
      available,
      open: r.open,
    };
  });
}

export interface CapacityViolation {
  roundSlug: string;
  requested: number;
  available: number;
}

/**
 * Validates a list of {roundSlug, tokens} against current availability.
 * Returns an empty array on success; otherwise a list of per-round
 * violations including the current `available` after concurrent
 * commitments are subtracted.
 *
 * Pass `executor` = the transaction handle when called from inside a
 * `db.transaction` so the read uses the tx snapshot. To make the check
 * fully race-free, callers MUST first take per-round advisory locks via
 * `lockRoundsForUpdate(tx, slugs)`.
 */
export async function validateCapacity(
  requested: Array<{ roundSlug: string; tokens: number }>,
  executor: Executor = db,
): Promise<CapacityViolation[]> {
  const grouped = new Map<string, number>();
  for (const r of requested) {
    if (!ROUND_BY_SLUG.has(r.roundSlug)) {
      return [{ roundSlug: r.roundSlug, requested: r.tokens, available: 0 }];
    }
    grouped.set(r.roundSlug, (grouped.get(r.roundSlug) ?? 0) + r.tokens);
  }
  const reserved = await reservedByRound(executor);
  const violations: CapacityViolation[] = [];
  for (const [slug, want] of grouped) {
    const round = ROUND_BY_SLUG.get(slug)!;
    const available = Math.max(0, round.tokensForSale - (reserved.get(slug) ?? 0));
    if (want > available) {
      violations.push({ roundSlug: slug, requested: want, available });
    }
  }
  return violations;
}
