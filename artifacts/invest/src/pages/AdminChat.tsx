import { useEffect, useMemo, useRef, useState } from "react";
import { Redirect } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, X } from "lucide-react";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import { useInvestSeo } from "@/lib/useInvestSeo";
import {
  ChatSocket,
  type ChatMessage,
  type ChatServerMessage,
} from "@/lib/chatSocket";

interface MeResp {
  user: { role: string; email: string };
}

interface ThreadListItem {
  threadId: string;
  investorUserId: string;
  investorEmail: string;
  investorName: string | null;
  online: boolean;
  unread: number;
  lastMessageAt: string | null;
  lastMessage: { body: string; senderRole: string; createdAt: string } | null;
}

interface ThreadListResp {
  threads: ThreadListItem[];
  onlineCount: number;
}

interface ThreadResp {
  thread: { id: string; investorUserId: string };
  messages: ChatMessage[];
}

export default function AdminChat() {
  useInvestSeo({
    title: "Chat",
    description: "Investor chat console for AICreatesAI admins.",
    path: "/admin/chat",
  });
  const me = useQuery({ queryKey: ["me"], queryFn: () => api<MeResp>("/me") });
  const isAdmin = me.data?.user.role === "admin";

  if (me.isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        Loading…
      </div>
    );
  }
  if (me.data && me.data.user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />
      <PageHeader
        eyebrow="Operator console"
        title={<>Investor chat.</>}
        subtitle="Live chat with active investors. Online investors are shown first."
      />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <ChatConsole />
      </main>
    </div>
  );
}

function ChatConsole() {
  const qc = useQueryClient();
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(
    null,
  );
  const [liveByInvestor, setLiveByInvestor] = useState<
    Record<string, ChatMessage[]>
  >({});
  const socketRef = useRef<ChatSocket | null>(null);

  const threads = useQuery({
    queryKey: ["admin", "chat", "threads"],
    queryFn: () => api<ThreadListResp>("/admin/chat/threads"),
    refetchInterval: 30_000,
  });

  // Default-select first thread once loaded.
  useEffect(() => {
    if (selectedInvestorId) return;
    const first = threads.data?.threads[0];
    if (first) setSelectedInvestorId(first.investorUserId);
  }, [threads.data, selectedInvestorId]);

  // Single shared admin socket: push live message + presence updates
  // into the threads cache so the inbox re-orders without a refetch.
  useEffect(() => {
    const s = new ChatSocket();
    socketRef.current = s;
    const off = s.on((msg: ChatServerMessage) => {
      if (msg.type === "message") {
        setLiveByInvestor((prev) => {
          const arr = prev[msg.investorUserId] ?? [];
          if (arr.some((m) => m.id === msg.message.id)) return prev;
          return {
            ...prev,
            [msg.investorUserId]: [...arr, msg.message],
          };
        });
        let known = false;
        qc.setQueryData<ThreadListResp | undefined>(
          ["admin", "chat", "threads"],
          (prev) => {
            if (!prev) return prev;
            known = prev.threads.some(
              (t) => t.investorUserId === msg.investorUserId,
            );
            if (!known) return prev;
            const next = prev.threads.map((t) =>
              t.investorUserId === msg.investorUserId
                ? {
                    ...t,
                    lastMessageAt: msg.message.createdAt,
                    lastMessage: {
                      body: msg.message.body,
                      senderRole: msg.message.senderRole,
                      createdAt: msg.message.createdAt,
                    },
                    unread:
                      msg.message.senderRole === "investor" &&
                      msg.investorUserId !== selectedInvestorId
                        ? t.unread + 1
                        : t.unread,
                  }
                : t,
            );
            next.sort((a, b) => {
              if (a.online !== b.online) return a.online ? -1 : 1;
              const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
              const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
              return tb - ta;
            });
            return { ...prev, threads: next };
          },
        );
        // Brand new investor thread -- pull the row in from the server
        // so it shows up in the inbox immediately.
        if (!known) {
          void qc.invalidateQueries({ queryKey: ["admin", "chat", "threads"] });
        }
      } else if (msg.type === "presence") {
        qc.setQueryData<ThreadListResp | undefined>(
          ["admin", "chat", "threads"],
          (prev) => {
            if (!prev) return prev;
            const exists = prev.threads.some(
              (t) => t.investorUserId === msg.userId,
            );
            const next = exists
              ? prev.threads.map((t) =>
                  t.investorUserId === msg.userId
                    ? { ...t, online: msg.online }
                    : t,
                )
              : prev.threads;
            const onlineCount = next.filter((t) => t.online).length;
            next.sort((a, b) => {
              if (a.online !== b.online) return a.online ? -1 : 1;
              const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
              const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
              return tb - ta;
            });
            return { ...prev, threads: next, onlineCount };
          },
        );
      }
    });
    return () => {
      off();
      s.close();
    };
  }, [qc, selectedInvestorId]);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-260px)] min-h-[480px]"
      data-testid="admin-chat"
    >
      <aside
        className="brand-card overflow-hidden flex flex-col"
        data-testid="admin-chat-list"
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-medium">Investors</div>
          <span
            className="text-xs text-[#00F5D4]"
            data-testid="admin-chat-online-count"
          >
            {threads.data?.onlineCount ?? 0} online
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.isLoading && (
            <div className="px-4 py-6 text-white/50 text-sm">Loading…</div>
          )}
          {threads.data?.threads.length === 0 && (
            <div className="px-4 py-6 text-white/50 text-sm">
              No investor threads yet.
            </div>
          )}
          <ul className="divide-y divide-white/5">
            {threads.data?.threads.map((t) => (
              <li key={t.threadId}>
                <button
                  type="button"
                  onClick={() => setSelectedInvestorId(t.investorUserId)}
                  className={`w-full text-left px-4 py-3 transition ${
                    selectedInvestorId === t.investorUserId
                      ? "bg-white/[0.06]"
                      : "hover:bg-white/[0.03]"
                  }`}
                  data-testid={`admin-chat-thread-${t.investorUserId}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                        t.online ? "bg-[#00F5D4]" : "bg-white/20"
                      }`}
                      title={t.online ? "Online" : "Offline"}
                    />
                    <span className="text-sm text-white truncate flex-1">
                      {t.investorName || t.investorEmail}
                    </span>
                    {t.unread > 0 && (
                      <span className="text-[10px] font-semibold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                        {t.unread > 9 ? "9+" : t.unread}
                      </span>
                    )}
                  </div>
                  {t.lastMessage && (
                    <div className="mt-1 ml-4 text-[11px] text-white/40 truncate">
                      {t.lastMessage.senderRole === "admin" ? "You: " : ""}
                      {t.lastMessage.body}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="brand-card overflow-hidden flex flex-col">
        {selectedInvestorId ? (
          <ThreadView
            investorUserId={selectedInvestorId}
            liveMessages={liveByInvestor[selectedInvestorId] ?? []}
            onLiveConsumed={(id) =>
              setLiveByInvestor((prev) => ({ ...prev, [id]: [] }))
            }
            onClose={() => setSelectedInvestorId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
            Select an investor to view the conversation.
          </div>
        )}
      </section>
    </div>
  );
}

function ThreadView({
  investorUserId,
  liveMessages,
  onLiveConsumed,
  onClose,
}: {
  investorUserId: string;
  liveMessages: ChatMessage[];
  onLiveConsumed: (investorUserId: string) => void;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [localSent, setLocalSent] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = useQuery({
    queryKey: ["admin", "chat", "thread", investorUserId],
    queryFn: () =>
      api<ThreadResp>(
        `/chat/thread?investorUserId=${encodeURIComponent(investorUserId)}`,
      ),
  });

  // Decrement unread badge when we open a thread.
  useEffect(() => {
    setLocalSent([]);
    qc.setQueryData<ThreadListResp | undefined>(
      ["admin", "chat", "threads"],
      (prev) =>
        prev
          ? {
              ...prev,
              threads: prev.threads.map((t) =>
                t.investorUserId === investorUserId ? { ...t, unread: 0 } : t,
              ),
            }
          : prev,
    );
    onLiveConsumed(investorUserId);
  }, [investorUserId, qc, onLiveConsumed]);

  const allMessages = useMemo(() => {
    const seen = new Set<string>();
    const merged: ChatMessage[] = [];
    for (const m of [
      ...(thread.data?.messages ?? []),
      ...liveMessages,
      ...localSent,
    ]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(m);
      }
    }
    merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return merged;
  }, [thread.data, liveMessages, localSent]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [allMessages.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const r = await api<{ message: ChatMessage }>("/chat/messages", {
        method: "POST",
        body: { body, investorUserId },
      });
      setLocalSent((prev) =>
        prev.some((m) => m.id === r.message.id) ? prev : [...prev, r.message],
      );
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]/60">
        <div className="text-sm">
          <span className="text-white/50">Conversation with </span>
          <span
            className="text-white font-mono text-xs"
            data-testid="admin-chat-current-investor"
          >
            {investorUserId.slice(0, 12)}…
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5"
        data-testid="admin-chat-messages"
      >
        {thread.isLoading && (
          <div className="text-white/50 text-sm">Loading…</div>
        )}
        {!thread.isLoading && allMessages.length === 0 && (
          <div className="text-white/50 text-sm py-8 text-center">
            No messages yet. Send the first one.
          </div>
        )}
        {allMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}
            data-testid={`admin-chat-message-${m.senderRole}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                m.senderRole === "admin"
                  ? "bg-[#00F5D4] text-[#0A0A0A] rounded-br-sm"
                  : "bg-white/[0.06] text-white rounded-bl-sm"
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2.5 border-t border-white/10 flex items-end gap-2 bg-[#0A0A0A]/40">
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
          placeholder="Reply to investor…"
          className="flex-1 bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#00F5D4]/50 resize-none max-h-32"
          data-testid="admin-chat-composer"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !draft.trim()}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[#00F5D4] text-[#0A0A0A] hover:bg-[#00F5D4]/90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send"
          data-testid="admin-chat-send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
