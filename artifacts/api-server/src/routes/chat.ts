import { Router, type IRouter } from "express";
import {
  db,
  appUsersTable,
  chatThreadsTable,
  chatMessagesTable,
} from "@workspace/db";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, isEmailAdmin } from "../lib/auth";
import {
  broadcastToAdmins,
  broadcastToUser,
  isOnline,
  issueTicket,
  onlineInvestorIds,
  shouldEmailInvestor,
} from "../lib/chat";
import { emailNewChatMessage } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const MAX_BODY = 4000;

function dashboardUrl(): string {
  const base =
    process.env.PUBLIC_PORTAL_ORIGIN?.replace(/\/$/, "") ??
    "https://invest.aicreates.ai";
  return `${base}/invest/dashboard`;
}

async function ensureThreadFor(investorUserId: string) {
  const existing = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.investorUserId, investorUserId))
    .limit(1);
  if (existing[0]) return existing[0];
  const inserted = await db
    .insert(chatThreadsTable)
    .values({ investorUserId })
    .onConflictDoNothing()
    .returning();
  if (inserted[0]) return inserted[0];
  // Concurrent insert — re-read.
  const again = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.investorUserId, investorUserId))
    .limit(1);
  return again[0]!;
}

/* ---- WS ticket ---------------------------------------------------------- */

router.post("/chat/ws-ticket", requireAuth, (req, res) => {
  const u = req.appUser!;
  const role = isEmailAdmin(u.email) ? "admin" : "investor";
  const ticket = issueTicket(u.id, role);
  res.json({ ticket });
});

/* ---- Investor: their own thread ---------------------------------------- */

router.get("/chat/thread", requireAuth, async (req, res) => {
  const u = req.appUser!;
  const role = isEmailAdmin(u.email) ? "admin" : "investor";

  // Admin can read any thread by ?investorUserId=. Non-admins are
  // strictly scoped to their own thread; passing a different
  // investorUserId is rejected explicitly so the failure mode is loud.
  let investorUserId = u.id;
  const q = req.query["investorUserId"];
  if (typeof q === "string" && q) {
    if (role === "admin") {
      investorUserId = q;
    } else if (q !== u.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }

  const thread = await ensureThreadFor(investorUserId);
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.threadId, thread.id))
    .orderBy(chatMessagesTable.createdAt);

  // Mark counterparty messages as read on open.
  if (role === "admin") {
    await db
      .update(chatMessagesTable)
      .set({ readByAdminAt: new Date() })
      .where(
        and(
          eq(chatMessagesTable.threadId, thread.id),
          eq(chatMessagesTable.senderRole, "investor"),
          isNull(chatMessagesTable.readByAdminAt),
        ),
      );
  } else {
    await db
      .update(chatMessagesTable)
      .set({ readByInvestorAt: new Date() })
      .where(
        and(
          eq(chatMessagesTable.threadId, thread.id),
          eq(chatMessagesTable.senderRole, "admin"),
          isNull(chatMessagesTable.readByInvestorAt),
        ),
      );
  }

  res.json({ thread, messages });
});

/* ---- Send a message ---------------------------------------------------- */

router.post("/chat/messages", requireAuth, async (req, res) => {
  const u = req.appUser!;
  const role = isEmailAdmin(u.email) ? "admin" : "investor";
  const body = String(req.body?.body ?? "").trim();
  if (!body) {
    res.status(400).json({ error: "Empty body" });
    return;
  }
  if (body.length > MAX_BODY) {
    res.status(400).json({ error: "Body too long" });
    return;
  }

  let investorUserId: string;
  if (role === "admin") {
    const target = String(req.body?.investorUserId ?? "");
    if (!target) {
      res.status(400).json({ error: "investorUserId required" });
      return;
    }
    investorUserId = target;
  } else {
    investorUserId = u.id;
  }

  const thread = await ensureThreadFor(investorUserId);
  const inserted = await db
    .insert(chatMessagesTable)
    .values({
      threadId: thread.id,
      senderUserId: u.id,
      senderRole: role,
      body,
      // The sender has implicitly "read" their own outbound message.
      readByInvestorAt: role === "investor" ? new Date() : null,
      readByAdminAt: role === "admin" ? new Date() : null,
    })
    .returning();
  const msg = inserted[0]!;

  await db
    .update(chatThreadsTable)
    .set({ lastMessageAt: msg.createdAt, updatedAt: new Date() })
    .where(eq(chatThreadsTable.id, thread.id));

  // Broadcast to investor's tabs and to all admin tabs (admin inbox is shared).
  broadcastToUser(investorUserId, {
    type: "message",
    threadId: thread.id,
    investorUserId,
    message: msg,
  });
  broadcastToAdmins({
    type: "message",
    threadId: thread.id,
    investorUserId,
    message: msg,
  });

  // Offline-investor email when admin replies and investor is not online.
  if (role === "admin" && !isOnline(investorUserId)) {
    if (shouldEmailInvestor(investorUserId)) {
      try {
        const investor = await db
          .select()
          .from(appUsersTable)
          .where(eq(appUsersTable.id, investorUserId))
          .limit(1);
        const inv = investor[0];
        if (inv?.email) {
          await emailNewChatMessage({
            to: inv.email,
            investorName: inv.fullName ?? inv.email.split("@")[0] ?? "there",
            preview: body.slice(0, 160),
            dashboardUrl: dashboardUrl(),
          });
        }
      } catch (err) {
        logger.warn({ err }, "offline chat email failed");
      }
    }
  }

  res.json({ message: msg });
});

/* ---- Mark a single message read ---------------------------------------- */

router.post("/chat/messages/:id/read", requireAuth, async (req, res) => {
  const u = req.appUser!;
  const role = isEmailAdmin(u.email) ? "admin" : "investor";
  const id = String(req.params.id);
  const field = role === "admin" ? "readByAdminAt" : "readByInvestorAt";
  // For investor we additionally restrict to their own thread.
  if (role === "investor") {
    const row = await db
      .select({
        threadId: chatMessagesTable.threadId,
        investorUserId: chatThreadsTable.investorUserId,
      })
      .from(chatMessagesTable)
      .innerJoin(
        chatThreadsTable,
        eq(chatMessagesTable.threadId, chatThreadsTable.id),
      )
      .where(eq(chatMessagesTable.id, id))
      .limit(1);
    if (!row[0] || row[0].investorUserId !== u.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }
  await db
    .update(chatMessagesTable)
    .set({ [field]: new Date() })
    .where(eq(chatMessagesTable.id, id));
  res.json({ ok: true });
});

/* ---- Investor: unread count ------------------------------------------- */

router.get("/chat/unread", requireAuth, async (req, res) => {
  const u = req.appUser!;
  // Always returns the current user's own unread count (admin messages
  // they haven't read yet). Admin uses a different endpoint.
  const thread = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.investorUserId, u.id))
    .limit(1);
  if (!thread[0]) {
    res.json({ unread: 0 });
    return;
  }
  const rows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(chatMessagesTable)
    .where(
      and(
        eq(chatMessagesTable.threadId, thread[0].id),
        eq(chatMessagesTable.senderRole, "admin"),
        isNull(chatMessagesTable.readByInvestorAt),
      ),
    );
  res.json({ unread: rows[0]?.c ?? 0 });
});

/* ---- Admin: list threads with presence + unread + last message --------- */

router.get(
  "/admin/chat/threads",
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    // Source of truth is app_users (every non-admin investor) so the
    // admin inbox can show online investors who have never messaged
    // and let admins send the first reach-out. Threads are LEFT JOINed.
    const rows = await db
      .select({
        user: appUsersTable,
        thread: chatThreadsTable,
      })
      .from(appUsersTable)
      .leftJoin(
        chatThreadsTable,
        eq(chatThreadsTable.investorUserId, appUsersTable.id),
      )
      .where(eq(appUsersTable.role, "investor"));

    const threadIds = rows
      .map((r) => r.thread?.id)
      .filter((id): id is string => Boolean(id));
    const unreadByThread = new Map<string, number>();
    const lastMsgByThread = new Map<
      string,
      { body: string; createdAt: Date; senderRole: string }
    >();
    if (threadIds.length) {
      const unreadRows = await db
        .select({
          threadId: chatMessagesTable.threadId,
          c: sql<number>`count(*)::int`,
        })
        .from(chatMessagesTable)
        .where(
          and(
            inArray(chatMessagesTable.threadId, threadIds),
            eq(chatMessagesTable.senderRole, "investor"),
            isNull(chatMessagesTable.readByAdminAt),
          ),
        )
        .groupBy(chatMessagesTable.threadId);
      for (const r of unreadRows) unreadByThread.set(r.threadId, r.c);

      // Last message per thread via DISTINCT ON.
      const lastRowsResult = await db.execute<{
        thread_id: string;
        body: string;
        created_at: Date;
        sender_role: string;
      }>(sql`
        SELECT DISTINCT ON (thread_id) thread_id, body, created_at, sender_role
        FROM chat_messages
        WHERE thread_id IN (${sql.join(
          threadIds.map((id) => sql`${id}::uuid`),
          sql`, `,
        )})
        ORDER BY thread_id, created_at DESC
      `);
      const rows = (lastRowsResult as unknown as {
        rows?: Array<{
          thread_id: string;
          body: string;
          created_at: Date;
          sender_role: string;
        }>;
      }).rows ?? (lastRowsResult as unknown as Array<{
        thread_id: string;
        body: string;
        created_at: Date;
        sender_role: string;
      }>);
      for (const r of rows) {
        lastMsgByThread.set(r.thread_id, {
          body: r.body,
          createdAt: r.created_at,
          senderRole: r.sender_role,
        });
      }
    }

    const onlineSet = new Set(onlineInvestorIds());
    const items = rows.map((r) => ({
      threadId: r.thread?.id ?? null,
      investorUserId: r.user.id,
      investorEmail: r.user.email,
      investorName: r.user.fullName,
      online: onlineSet.has(r.user.id),
      unread: r.thread ? (unreadByThread.get(r.thread.id) ?? 0) : 0,
      lastMessageAt: r.thread?.lastMessageAt ?? null,
      lastMessage: r.thread
        ? (lastMsgByThread.get(r.thread.id) ?? null)
        : null,
    }));

    // Sort: online first, then by lastMessageAt desc.
    items.sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1;
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });

    res.json({ threads: items, onlineCount: onlineSet.size });
  },
);

/* ---- Admin: presence summary ------------------------------------------ */

router.get(
  "/admin/chat/presence",
  requireAuth,
  requireAdmin,
  (_req, res) => {
    const ids = onlineInvestorIds();
    res.json({ onlineInvestorIds: ids, count: ids.length });
  },
);

export default router;
