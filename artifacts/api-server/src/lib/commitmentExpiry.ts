import { and, inArray, isNull, lt } from "drizzle-orm";
import { db, commitmentsTable } from "@workspace/db";
import { logger } from "./logger";

const EXPIRY_DAYS = 5;
const SWEEP_INTERVAL_MS = 60 * 60 * 1000; // hourly

let expiryTimer: NodeJS.Timeout | null = null;

/**
 * Sweep unpaid commitments older than EXPIRY_DAYS and transition them
 * to "expired". Frees the token allocation so the investor can start
 * over and the round availability recovers.
 *
 * Targets commitments still in pre-funded states:
 *   - pending_saft  (never signed)
 *   - pending_payment (signed, never paid)
 *   - awaiting_wire (wire never received)
 *
 * Funded, refunded, failed, and expired commitments are left alone.
 */
export async function sweepExpiredCommitments(): Promise<number> {
  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const targets = ["pending_saft", "pending_payment", "awaiting_wire"];
  const updated = await db
    .update(commitmentsTable)
    .set({
      state: "expired",
      status: "expired",
      updatedAt: new Date(),
    })
    .where(
      and(
        inArray(commitmentsTable.state, targets),
        lt(commitmentsTable.createdAt, cutoff),
        // Belt-and-suspenders: never touch a commitment that has already
        // been funded. State filter above already excludes funded, but
        // this guards against any future state name changes.
        isNull(commitmentsTable.fundedAt),
      ),
    )
    .returning({ id: commitmentsTable.id });
  if (updated.length > 0) {
    logger.info(
      { count: updated.length, ids: updated.map((u) => u.id) },
      "Expired stale commitments",
    );
  }
  return updated.length;
}

export function startCommitmentExpirySweep(intervalMs = SWEEP_INTERVAL_MS): void {
  if (expiryTimer) return;
  // Run once at startup.
  sweepExpiredCommitments().catch((err) =>
    logger.error({ err }, "initial commitment expiry sweep failed"),
  );
  expiryTimer = setInterval(() => {
    sweepExpiredCommitments().catch((err) =>
      logger.error({ err }, "commitment expiry sweep failed"),
    );
  }, intervalMs);
  expiryTimer.unref?.();
}
