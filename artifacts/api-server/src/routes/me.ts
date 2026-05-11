import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { db, appUsersTable, commitmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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
