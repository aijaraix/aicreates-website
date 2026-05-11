import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare module "express-serve-static-core" {
  interface Request {
    appUser?: {
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      stripeCustomerId: string | null;
    };
  }
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const userId =
    (auth?.sessionClaims as { userId?: string } | undefined)?.userId ??
    auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(appUsersTable)
      .where(eq(appUsersTable.id, userId))
      .limit(1);

    let row = existing[0];

    if (!row) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        "";
      const fullName =
        [clerkUser.firstName, clerkUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || null;
      const isAdmin = adminEmails().includes(email.toLowerCase());

      const inserted = await db
        .insert(appUsersTable)
        .values({
          id: userId,
          email,
          fullName,
          role: isAdmin ? "admin" : "investor",
        })
        .onConflictDoNothing()
        .returning();
      row =
        inserted[0] ??
        (
          await db
            .select()
            .from(appUsersTable)
            .where(eq(appUsersTable.id, userId))
            .limit(1)
        )[0];
    } else {
      // Promote to admin if email is on allow-list and currently not admin.
      const isAdmin = adminEmails().includes(row.email.toLowerCase());
      if (isAdmin && row.role !== "admin") {
        const updated = await db
          .update(appUsersTable)
          .set({ role: "admin", updatedAt: new Date() })
          .where(eq(appUsersTable.id, userId))
          .returning();
        row = updated[0] ?? row;
      }
    }

    if (!row) {
      res.status(500).json({ error: "User provisioning failed" });
      return;
    }

    req.appUser = {
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      stripeCustomerId: row.stripeCustomerId,
    };
    next();
  } catch (err) {
    req.log?.error({ err }, "requireAuth failed");
    res.status(500).json({ error: "Auth provisioning failed" });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.appUser?.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
