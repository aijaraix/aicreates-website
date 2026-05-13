import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { ChatSocket, type ChatMessage, type ChatServerMessage } from "@/lib/chatSocket";

interface ThreadResp {
  thread: { id: string; investorUserId: string };
  messages: ChatMessage[];
}

/**
 * Floating chat button + panel rendered globally for signed-in
 * investors. Hidden for admins (admins use /admin/chat instead).
 *
 * Investors deliberately never see admin presence — there is no
 * "admin online" or "typing" indicator on this surface.
 */
export default function ChatWidget({ hidden }: { hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<ChatSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only fetch the thread once the panel is opened. Pass markRead so
  // the server clears unread state for messages the investor is now
  // viewing -- a background prefetch must never silently zero unread.
  const thread = useQuery({
    queryKey: ["chat", "thread", open],
    queryFn: () => api<ThreadResp>("/chat/thread?markRead=true"),
    enabled: !hidden && open,
    staleTime: 10_000,
  });

  // Initial unread count when the panel is closed.
  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    api<{ unread: number }>("/chat/unread")
      .then((r) => {
        if (!cancelled) setUnread(r.unread);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hidden]);

  // WS subscription.
  useEffect(() => {
    if (hidden) return;
    const s = new ChatSocket();
    socketRef.current = s;
    const off = s.on((msg: ChatServerMessage) => {
      if (msg.type === "message") {
        setLiveMessages((prev) =>
          prev.some((m) => m.id === msg.message.id) ? prev : [...prev, msg.message],
        );
        if (msg.message.senderRole === "admin") {
          if (open) {
            // Persist read state immediately so reload/reconnect
            // doesn't resurrect the unread badge.
            api(`/chat/messages/${msg.message.id}/read`, {
              method: "POST",
            }).catch(() => {});
            setUnread(0);
          } else {
            setUnread((u) => u + 1);
          }
        }
      }
    });
    return () => {
      off();
      s.close();
    };
  }, [hidden, open]);

  const allMessages = useMemo(() => {
    const seen = new Set<string>();
    const merged: ChatMessage[] = [];
    for (const m of [...(thread.data?.messages ?? []), ...liveMessages]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(m);
      }
    }
    merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return merged;
  }, [thread.data, liveMessages]);

  // Auto-scroll on new messages.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [allMessages.length, open]);

  // Reset unread when opening.
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  if (hidden) return null;

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const r = await api<{ message: ChatMessage }>("/chat/messages", {
        method: "POST",
        body: { body },
      });
      setLiveMessages((prev) =>
        prev.some((m) => m.id === r.message.id) ? prev : [...prev, r.message],
      );
      setDraft("");
    } catch {
      /* surface as inline error in a follow-up; keep silent for now */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50" data-testid="chat-widget">
      {open && (
        <div
          className="mb-3 w-[360px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl border border-white/10 bg-[#0F0F12]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden"
          data-testid="chat-panel"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]/80">
            <div>
              <div className="text-sm font-medium text-white">
                Chat with the AICreatesAI team
              </div>
              <div className="text-[11px] text-white/50">
                We reply as soon as we can.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white"
              aria-label="Close chat"
              data-testid="chat-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5"
            data-testid="chat-messages"
          >
            {thread.isLoading && (
              <div className="text-white/50 text-sm">Loading…</div>
            )}
            {!thread.isLoading && allMessages.length === 0 && (
              <div className="text-white/50 text-sm py-8 text-center">
                Send a message and our team will reply here.
              </div>
            )}
            {allMessages.map((m) => (
              <ChatBubble key={m.id} m={m} />
            ))}
          </div>
          <div className="px-3 py-2.5 border-t border-white/10 flex items-end gap-2 bg-[#0A0A0A]/60">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Type a message…"
              className="flex-1 bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#00F5D4]/50 resize-none max-h-32"
              data-testid="chat-composer"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || !draft.trim()}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[#00F5D4] text-[#0A0A0A] hover:bg-[#00F5D4]/90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              data-testid="chat-send"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#00F5D4] text-[#0A0A0A] shadow-2xl shadow-[#00F5D4]/30 hover:scale-105 transition"
        aria-label={open ? "Close chat" : "Open chat"}
        data-testid="chat-toggle"
      >
        <MessageCircle className="w-5 h-5" />
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center"
            data-testid="chat-unread-badge"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMessage }) {
  const isInvestor = m.senderRole === "investor";
  return (
    <div
      className={`flex ${isInvestor ? "justify-end" : "justify-start"}`}
      data-testid={`chat-message-${m.senderRole}`}
    >
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
          isInvestor
            ? "bg-[#00F5D4] text-[#0A0A0A] rounded-br-sm"
            : "bg-white/[0.06] text-white rounded-bl-sm"
        }`}
      >
        {m.body}
      </div>
    </div>
  );
}
