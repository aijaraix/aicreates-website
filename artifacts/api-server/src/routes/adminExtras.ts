import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  db,
  appUsersTable,
  commitmentsTable,
  allocationApplicationsTable,
  adminNotesTable,
  adminAuditLogTable,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { logAdminAction } from "../lib/audit";

const router: IRouter = Router();

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/applications", async (_req, res) => {
  const rows = await db
    .select({
      id: allocationApplicationsTable.id,
      userId: allocationApplicationsTable.userId,
      email: appUsersTable.email,
      fullName: appUsersTable.fullName,
      status: allocationApplicationsTable.status,
      accreditation: allocationApplicationsTable.accreditation,
      country: allocationApplicationsTable.country,
      intendedAmountCents: allocationApplicationsTable.intendedAmountCents,
      persona: allocationApplicationsTable.persona,
      thesisFit: allocationApplicationsTable.thesisFit,
      referralSource: allocationApplicationsTable.referralSource,
      createdAt: allocationApplicationsTable.createdAt,
      reviewedAt: allocationApplicationsTable.reviewedAt,
      reviewedBy: allocationApplicationsTable.reviewedBy,
    })
    .from(allocationApplicationsTable)
    .leftJoin(
      appUsersTable,
      eq(appUsersTable.id, allocationApplicationsTable.userId),
    )
    .orderBy(desc(allocationApplicationsTable.createdAt))
    .limit(500);
  res.json({ applications: rows });
});

router.post("/admin/applications/:id/review", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const { status } = (req.body ?? {}) as { status?: string };
  if (!status || !["submitted", "approved", "needs_review", "rejected"].includes(status)) {
    res.status(400).json({ error: "invalid status" });
    return;
  }
  const updated = await db
    .update(allocationApplicationsTable)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedBy: req.appUser!.email,
      updatedAt: new Date(),
    })
    .where(eq(allocationApplicationsTable.id, id))
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "review_application",
    targetType: "allocation_application",
    targetId: id,
    details: { status },
  });
  res.json({ application: updated[0] });
});

router.get("/admin/audit-log", async (_req, res) => {
  const rows = await db
    .select()
    .from(adminAuditLogTable)
    .orderBy(desc(adminAuditLogTable.createdAt))
    .limit(500);
  res.json({ entries: rows });
});

router.get("/admin/notes/:userId", async (req, res) => {
  const userId = req.params["userId"];
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const rows = await db
    .select()
    .from(adminNotesTable)
    .where(eq(adminNotesTable.targetUserId, userId))
    .orderBy(desc(adminNotesTable.createdAt))
    .limit(200);
  res.json({ notes: rows });
});

router.post("/admin/notes", async (req, res) => {
  const { targetUserId, body } = (req.body ?? {}) as {
    targetUserId?: string;
    body?: string;
  };
  if (!targetUserId || typeof body !== "string" || !body.trim()) {
    res.status(400).json({ error: "targetUserId and body required" });
    return;
  }
  if (body.length > 4000) {
    res.status(400).json({ error: "body too long" });
    return;
  }
  const inserted = await db
    .insert(adminNotesTable)
    .values({
      targetUserId,
      authorEmail: req.appUser!.email,
      body: body.trim(),
    })
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "create_note",
    targetType: "app_user",
    targetId: targetUserId,
    details: { noteId: inserted[0]?.id },
  });
  res.status(201).json({ note: inserted[0] });
});

router.patch("/admin/commitments/:id/kyc", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const { kycStatus, accreditationStatus, walletAddress } =
    (req.body ?? {}) as {
      kycStatus?: string;
      accreditationStatus?: string;
      walletAddress?: string;
    };
  const validKyc = ["none", "declared", "pending", "verified", "rejected"];
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (kycStatus !== undefined) {
    if (!validKyc.includes(kycStatus)) {
      res.status(400).json({ error: "invalid kycStatus" });
      return;
    }
    set["kycStatus"] = kycStatus;
  }
  if (accreditationStatus !== undefined) {
    set["accreditationStatus"] =
      accreditationStatus.trim().slice(0, 120) || null;
  }
  if (walletAddress !== undefined) {
    set["walletAddress"] = walletAddress.trim().slice(0, 200) || null;
  }
  if (Object.keys(set).length === 1) {
    res.status(400).json({ error: "no fields to update" });
    return;
  }
  const updated = await db
    .update(commitmentsTable)
    .set(set)
    .where(eq(commitmentsTable.id, id))
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "update_commitment_kyc",
    targetType: "commitment",
    targetId: id,
    details: { kycStatus, accreditationStatus, walletAddress },
  });
  res.json({ commitment: updated[0] });
});

export default router;
