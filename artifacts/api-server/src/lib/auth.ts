import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, appUsersTable, genesisReferrersTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";

const LOGIN_DEBOUNCE_MS = 30 * 60 * 1000; // 30 min

declare module "express-serve-static-core" {
  interface Request {
    appUser?: {
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      stripeCustomerId: string | null;
      solanaWalletAddress: string | null;
    };
  }
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
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
      // If a /genesis/request-access intake row was created for this
      // email, migrate it onto the real Clerk userId on first sign-in
      // so the referrer record is durably attached to the live user.
      const pendingStubId = `pending:genesis:${email.toLowerCase()}`;
      const stubReferrer = email
        ? await db
            .select()
            .from(genesisReferrersTable)
            .where(eq(genesisReferrersTable.userId, pendingStubId))
            .limit(1)
        : [];
      const desiredRole = isEmailAdmin(email)
        ? "admin"
        : stubReferrer[0]?.status === "approved"
          ? "referrer"
          : "investor";

      const inserted = await db
        .insert(appUsersTable)
        .values({ id: userId, email, fullName, role: desiredRole })
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

      if (stubReferrer[0]) {
        await db
          .update(genesisReferrersTable)
          .set({ userId, updatedAt: new Date() })
          .where(eq(genesisReferrersTable.id, stubReferrer[0].id));
        await db
          .delete(appUsersTable)
          .where(eq(appUsersTable.id, pendingStubId));
      }
    } else {
      // Reconcile role with the env allow-list every request: promote when
      // added to the list, DEMOTE when removed. The DB role is cosmetic;
      // requireAdmin re-checks the live allow-list as the source of truth.
      // Preserve the `referrer` role: it is granted by the Genesis admin
      // tooling and must not be demoted back to `investor` here.
      let desiredRole: string;
      if (isEmailAdmin(row.email)) {
        desiredRole = "admin";
      } else if (row.role === "referrer") {
        desiredRole = "referrer";
      } else {
        desiredRole = "investor";
      }
      if (row.role !== desiredRole) {
        const updated = await db
          .update(appUsersTable)
          .set({ role: desiredRole, updatedAt: new Date() })
          .where(eq(appUsersTable.id, userId))
          .returning();
        row = updated[0] ?? row;
      }
    }

    if (!row) {
      res.status(500).json({ error: "User provisioning failed" });
      return;
    }

    // Login telemetry, debounced to ~once per LOGIN_DEBOUNCE_MS so that
    // every authenticated API call doesn't write to the row.
    const lastLogin = row.lastLoginAt
      ? new Date(row.lastLoginAt).getTime()
      : 0;
    if (Date.now() - lastLogin > LOGIN_DEBOUNCE_MS) {
      try {
        await db
          .update(appUsersTable)
          .set({
            lastLoginAt: new Date(),
            loginCount: sql`${appUsersTable.loginCount} + 1`,
          })
          .where(eq(appUsersTable.id, row.id));
      } catch (err) {
        req.log?.warn({ err }, "login telemetry update failed");
      }
    }

    req.appUser = {
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      stripeCustomerId: row.stripeCustomerId,
      solanaWalletAddress: row.solanaWalletAddress ?? null,
    };
    next();
  } catch (err) {
    req.log?.error({ err }, "requireAuth failed");
    res.status(500).json({ error: "Auth provisioning failed" });
  }
}

/**
 * Live allow-list check on every admin request. Does NOT trust the
 * persisted `app_users.role` value alone — instead re-evaluates the
 * `ADMIN_EMAILS` env var per request so removed admins lose access
 * immediately on the next call.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const email = req.appUser?.email;
  if (!email || !isEmailAdmin(email)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
