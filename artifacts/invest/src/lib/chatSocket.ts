import { api } from "./api";

export type ChatServerMessage =
  | { type: "hello"; role: "investor" | "admin" }
  | {
      type: "message";
      threadId: string;
      investorUserId: string;
      message: ChatMessage;
    }
  | { type: "presence"; userId: string; online: boolean }
  | { type: "pong" };

export interface ChatMessage {
  id: string;
  threadId: string;
  senderUserId: string;
  senderRole: "investor" | "admin";
  body: string;
  createdAt: string;
  readByInvestorAt: string | null;
  readByAdminAt: string | null;
}

/**
 * Reconnecting WebSocket wrapper. Issues a fresh ws-ticket from the
 * api-server before each connect, exponential-backoff on disconnect.
 */
export class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<(msg: ChatServerMessage) => void>();
  private retry = 0;
  private closed = false;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    void this.connect();
  }

  on(cb: (msg: ChatServerMessage) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  close(): void {
    this.closed = true;
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.ws) this.ws.close();
  }

  private async connect(): Promise<void> {
    if (this.closed) return;
    let ticket: string;
    try {
      const resp = await api<{ ticket: string }>("/chat/ws-ticket", {
        method: "POST",
        body: {},
      });
      ticket = resp.ticket;
    } catch {
      this.scheduleReconnect();
      return;
    }
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/api/ws/chat?ticket=${encodeURIComponent(ticket)}`;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.retry = 0;
      if (this.pingTimer) clearInterval(this.pingTimer);
      this.pingTimer = setInterval(() => {
        try {
          ws.send(JSON.stringify({ type: "ping" }));
        } catch {
          /* ignore */
        }
      }, 25_000);
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as ChatServerMessage;
        for (const l of this.listeners) l(msg);
      } catch {
        /* ignore malformed */
      }
    };
    ws.onclose = () => {
      if (this.pingTimer) clearInterval(this.pingTimer);
      this.scheduleReconnect();
    };
    ws.onerror = () => {
      ws.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.closed) return;
    this.retry = Math.min(this.retry + 1, 6);
    const delay = Math.min(30_000, 500 * 2 ** this.retry);
    setTimeout(() => void this.connect(), delay);
  }
}
