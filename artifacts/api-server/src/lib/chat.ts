/**
 * In-memory chat presence + WS ticket store. Single-process only — fine
 * for the current single-instance autoscale deployment. If we ever scale
 * to multiple replicas, swap this for Redis pub/sub.
 */
import { randomBytes } from "node:crypto";
import type { WebSocket } from "ws";

export type Role = "investor" | "admin";

export interface WsTicket {
  userId: string;
  role: Role;
  expiresAt: number;
}

const TICKET_TTL_MS = 60_000;
const tickets = new Map<string, WsTicket>();

export function issueTicket(userId: string, role: Role): string {
  const ticket = randomBytes(24).toString("hex");
  tickets.set(ticket, { userId, role, expiresAt: Date.now() + TICKET_TTL_MS });
  return ticket;
}

export function consumeTicket(ticket: string): WsTicket | null {
  const entry = tickets.get(ticket);
  if (!entry) return null;
  tickets.delete(ticket);
  if (entry.expiresAt < Date.now()) return null;
  return entry;
}

// Sweep expired tickets occasionally to bound memory.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of tickets) if (v.expiresAt < now) tickets.delete(k);
}, 60_000).unref?.();

// ---- presence -----------------------------------------------------------

interface ConnState {
  ws: WebSocket;
  userId: string;
  role: Role;
  alive: boolean;
}

const connectionsByUser = new Map<string, Set<ConnState>>();
const allConnections = new Set<ConnState>();
const adminConnections = new Set<ConnState>();

export function addConnection(state: ConnState): void {
  allConnections.add(state);
  let set = connectionsByUser.get(state.userId);
  if (!set) {
    set = new Set();
    connectionsByUser.set(state.userId, set);
  }
  set.add(state);
  if (state.role === "admin") adminConnections.add(state);

  // Notify admins that an investor came online (if first connection
  // for this user). Don't notify when an admin connects — investors
  // never see admin presence.
  if (state.role === "investor" && set.size === 1) {
    broadcastToAdmins({ type: "presence", userId: state.userId, online: true });
  }
}

export function removeConnection(state: ConnState): void {
  allConnections.delete(state);
  const set = connectionsByUser.get(state.userId);
  if (set) {
    set.delete(state);
    if (set.size === 0) {
      connectionsByUser.delete(state.userId);
      if (state.role === "investor") {
        broadcastToAdmins({
          type: "presence",
          userId: state.userId,
          online: false,
        });
      }
    }
  }
  if (state.role === "admin") adminConnections.delete(state);
}

export function isOnline(userId: string): boolean {
  return (connectionsByUser.get(userId)?.size ?? 0) > 0;
}

export function onlineInvestorIds(): string[] {
  const out: string[] = [];
  for (const [userId, set] of connectionsByUser) {
    for (const c of set) {
      if (c.role === "investor") {
        out.push(userId);
        break;
      }
    }
  }
  return out;
}

export function broadcastToUser(
  userId: string,
  payload: Record<string, unknown>,
): void {
  const set = connectionsByUser.get(userId);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const c of set) {
    try {
      c.ws.send(msg);
    } catch {
      /* ignore */
    }
  }
}

export function broadcastToAdmins(payload: Record<string, unknown>): void {
  const msg = JSON.stringify(payload);
  for (const c of adminConnections) {
    try {
      c.ws.send(msg);
    } catch {
      /* ignore */
    }
  }
}

// Heartbeat: every 30s, terminate connections that didn't pong.
export function startHeartbeat(): void {
  setInterval(() => {
    for (const c of allConnections) {
      if (!c.alive) {
        try {
          c.ws.terminate();
        } catch {
          /* ignore */
        }
        continue;
      }
      c.alive = false;
      try {
        c.ws.ping();
      } catch {
        /* ignore */
      }
    }
  }, 30_000).unref?.();
}

export type { ConnState };

// ---- email throttle -----------------------------------------------------

const lastEmailAt = new Map<string, number>();
const EMAIL_THROTTLE_MS = 15 * 60 * 1000;

/**
 * Returns true if we should send an offline-message email to this
 * investor right now (and records the send). Returns false if we
 * already emailed them within the throttle window.
 */
export function shouldEmailInvestor(investorUserId: string): boolean {
  const last = lastEmailAt.get(investorUserId) ?? 0;
  if (Date.now() - last < EMAIL_THROTTLE_MS) return false;
  lastEmailAt.set(investorUserId, Date.now());
  return true;
}
