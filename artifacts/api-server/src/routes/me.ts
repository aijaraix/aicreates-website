import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import {
  db,
  appUsersTable,
  commitmentsTable,
  saftSubmissionsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { computeVestingSchedule } from "../lib/vesting";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const commitments = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.userId, user.id))
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(100);
  res.json({ user, commitments });
});

router.get("/me/allocations", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const commitments = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.userId, user.id))
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(100);
  const saftRows = await db
    .select({
      commitmentId: saftSubmissionsTable.commitmentId,
      status: saftSubmissionsTable.status,
      signedAt: saftSubmissionsTable.signedAt,
      signatureName: saftSubmissionsTable.signatureName,
      payload: saftSubmissionsTable.payload,
    })
    .from(saftSubmissionsTable)
    .where(eq(saftSubmissionsTable.userId, user.id));
  const saftByCommitment = new Map(
    saftRows.map((s) => [s.commitmentId, s] as const),
  );

  const allocations = commitments.map((c) => {
    const isFunded = c.state === "funded" || c.status === "succeeded";
    const vesting = computeVestingSchedule({
      totalTokens: c.tokenAllocation,
      fundedAt: c.fundedAt ?? c.completedAt,
    });
    const saft = saftByCommitment.get(c.id);
    const payload = (saft?.payload ?? {}) as Record<string, unknown>;
    return {
      id: c.id,
      roundSlug: c.roundSlug,
      tierSlug: c.tierSlug,
      displayName: c.displayName,
      amountCents: c.amountCents,
      currency: c.currency,
      tokenAllocation: c.tokenAllocation,
      state: c.state ?? c.status,
      paymentMethod: c.paymentMethod,
      saftSignedAt: c.saftSignedAt ?? saft?.signedAt ?? null,
      saftStatus: saft?.status ?? null,
      saftSignerName: saft?.signatureName ?? null,
      kycStatus: c.kycStatus,
      accreditationStatus: c.accreditationStatus,
      walletAddress: c.walletAddress,
      walletChain:
        typeof payload["walletChain"] === "string"
          ? (payload["walletChain"] as string)
          : null,
      fundedAt: c.fundedAt ?? c.completedAt,
      createdAt: c.createdAt,
      isFunded,
      vesting: isFunded ? vesting : null,
    };
  });

  res.json({ user, allocations });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { fullName } = req.body as { fullName?: string };
  if (typeof fullName !== "string" || fullName.length > 200) {
    res.status(400).json({ error: "Invalid fullName" });
    return;
  }
  const updated = await db
    .update(appUsersTable)
    .set({ fullName: fullName.trim() || null, updatedAt: new Date() })
    .where(eq(appUsersTable.id, req.appUser!.id))
    .returning();
  res.json({ user: updated[0] });
});

export default router;
