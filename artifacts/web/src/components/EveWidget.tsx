import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import eveAvatar from "@/assets/eve-portrait.png";

/**
 * Eve API URL.
 * - In dev: defaults to http://localhost:8080 (the local api-server workflow)
 * - In prod: reads from VITE_EVE_API_URL build-time env var.
 *   When the api-server is published on Replit, the deploy URL goes here
 *   (set in .github/workflows/deploy.yml or via a build-time env).
 */
const EVE_API_BASE: string =
  (import.meta.env.VITE_EVE_API_URL as string | undefined) ??
  (import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://aicreates-website-aijaraix.replit.app");

interface EveMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "eve.conversation.v1";
const OPEN_KEY = "eve.opened.v1";

const GREETING: EveMessage = {
  role: "assistant",
  content:
    "Hi - I'm Eve. I help visitors get to know what we're building at AIcreatesAI. What brings you here today?",
};

function loadConversation(): EveMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [GREETING];
    const parsed = JSON.parse(raw) as EveMessage[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* ignore */
  }
  return [GREETING];
}

function saveConversation(msgs: EveMessage[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    /* ignore */
  }
}

/**
 * Whitelist of routes Eve is allowed to link to. Anything not on this list
 * is rendered as plain text so a hallucinated path can't 404 a visitor.
 */
const ALLOWED_PATHS = new Set([
  "/",
  "/about",
  "/technology",
  "/products",
  "/products/fin",
  "/services",
  "/contact",
  "/privacy",
  "/terms",
]);

/**
 * Renders an Eve message body. Internal links of the form /products/fin,
 * /contact, etc. become real <Link> wouter buttons (with optional #hash).
 * Paths not on the whitelist render as plain text.
 */
function MessageBody({ text }: { text: string }) {
  // Match any /something path with optional /sub and optional #hash
  const pattern = /(\/(?:about|technology|products|services|contact)(?:\/[\w-]+)?(?:#[\w-]+)?)/g;
  const parts = text.split(pattern);
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (pattern.test(part)) {
          const [pathOnly] = part.split("#");
          if (!ALLOWED_PATHS.has(pathOnly)) {
            // Hallucinated route - render as plain text, don't make it a broken link.
            return <span key={i}>{part}</span>;
          }
          return (
            <Link
              key={i}
              href={part}
              className="font-medium text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200 hover:decoration-violet-300"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2" aria-label="Eve is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300/80"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function EveWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<EveMessage[]>(() => loadConversation());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOpened, setHasOpened] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(OPEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Persist conversation
  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  // Auto-scroll on new messages or while typing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  // Focus input when opened
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      try {
        sessionStorage.setItem(OPEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    const next: EveMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(`${EVE_API_BASE}/api/eve/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Eve couldn't respond. Please try again.");
      }
      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([GREETING]);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            type="button"
            onClick={handleOpen}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={cn(
              "group fixed z-50 flex items-center gap-3 rounded-full",
              "bottom-5 right-5 sm:bottom-6 sm:right-6",
              "bg-gradient-to-br from-violet-500/90 to-blue-500/90",
              "p-1 pr-4 shadow-[0_8px_32px_rgba(139,92,246,0.45)]",
              "border border-white/20 backdrop-blur-xl",
              "text-white",
            )}
            aria-label="Chat with Eve"
            data-testid="eve-launcher"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-black/30 ring-2 ring-white/30">
              <img src={eveAvatar} alt="Eve" className="h-full w-full object-cover" />
              {!hasOpened && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-violet-600/80" />
                </span>
              )}
            </div>
            <div className="hidden flex-col text-left leading-tight sm:flex">
              <span className="text-sm font-semibold">Chat with Eve</span>
              <span className="text-[11px] text-white/80">AI ambassador</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Chat with Eve"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden",
              "bottom-4 right-4 sm:bottom-6 sm:right-6",
              "h-[min(620px,calc(100dvh-2rem))] w-[min(400px,calc(100vw-2rem))]",
              "rounded-2xl border border-white/10",
              "bg-zinc-950/90 backdrop-blur-2xl",
              "shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(139,92,246,0.15)]",
            )}
            data-testid="eve-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-br from-violet-600/30 to-blue-600/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-black/30 ring-2 ring-violet-300/40">
                  <img src={eveAvatar} alt="Eve" className="h-full w-full object-cover" />
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-white">Eve</span>
                  <span className="text-[11px] text-white/60">AI ambassador · online</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="rounded-md px-2 py-1 text-[11px] text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Start a new conversation"
                  data-testid="eve-reset"
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                  data-testid="eve-close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[13.5px] text-white/90"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                      m.role === "user"
                        ? "rounded-br-sm bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md"
                        : "rounded-bl-sm border border-white/10 bg-white/5 text-white/90",
                    )}
                    data-testid={`eve-msg-${m.role}`}
                  >
                    <MessageBody text={m.content} />
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3.5 py-1">
                    <TypingDots />
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-black/30 p-3">
              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-violet-400/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Eve anything…"
                  rows={1}
                  maxLength={2000}
                  className="max-h-32 min-h-[20px] flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  disabled={busy}
                  data-testid="eve-input"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={busy || !input.trim()}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    "bg-gradient-to-br from-violet-500 to-blue-500 text-white",
                    "shadow-md transition disabled:cursor-not-allowed disabled:opacity-40",
                    "hover:shadow-lg",
                  )}
                  aria-label="Send message"
                  data-testid="eve-send"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-2 px-1 text-center text-[10px] text-white/40">
                Eve is an AI · she may sometimes be wrong · for urgent matters use{" "}
                <Link href="/contact" className="underline hover:text-white/70">
                  /contact
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-only chat icon (no label) - shown when launcher hidden because panel open */}
      {/* No additional render here; layout handled inside the launcher above */}
      {/* Reusable icon import marker (keeps unused import warnings away) */}
      <span className="hidden">
        <MessageCircle aria-hidden />
      </span>
    </>
  );
}

export default EveWidget;
