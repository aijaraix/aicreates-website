import { Router, type IRouter, type Request, type Response } from "express";
import { ALLOWED_ORIGIN_PATTERNS } from "../app";

const router: IRouter = Router();

const ANTHROPIC_BASE_URL =
  process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
const ANTHROPIC_API_KEY = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "";
const MODEL = "claude-haiku-4-5";
const LEAD_FORWARD_URL = "https://formsubmit.co/ajax/sholom@aicreates.ai";

// Simple in-memory rate limit per IP. Resets on server restart, which is
// fine for an autoscale deployment with low expected traffic.
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_PER_WINDOW = 8; // 8 messages / minute / IP
const HOUR_WINDOW_MS = 60 * 60_000;
const HOUR_MAX_PER_WINDOW = 60; // 60 messages / hour / IP
const ipBuckets = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const history = (ipBuckets.get(ip) ?? []).filter((t) => now - t < HOUR_WINDOW_MS);
  if (history.length >= HOUR_MAX_PER_WINDOW) {
    ipBuckets.set(ip, history);
    return { ok: false, reason: "hour" };
  }
  const recent = history.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_PER_WINDOW) {
    ipBuckets.set(ip, history);
    return { ok: false, reason: "minute" };
  }
  history.push(now);
  ipBuckets.set(ip, history);
  // Light periodic cleanup to keep the map bounded
  if (ipBuckets.size > 1000) {
    for (const [k, v] of ipBuckets) {
      if (v.every((t) => now - t > HOUR_WINDOW_MS)) ipBuckets.delete(k);
    }
  }
  return { ok: true };
}

function isOriginAllowed(req: Request): boolean {
  const origin = req.get("origin");
  const referer = req.get("referer");
  const candidate = origin ?? (referer ? new URL(referer).origin : null);
  if (!candidate) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(candidate));
}

const SYSTEM_PROMPT = `You are Eve, the AI ambassador for AIcreatesAI - a premium agentic AI company that builds intelligent business infrastructure and next-generation digital products.

# Your role
You are the friendly, sharp, premium voice that greets visitors on aicreates.ai. You qualify leads, answer high-level questions, and gently move every conversation toward one of three actions:
1. Joining the Fin waitlist (link: /products/fin#waitlist)
2. Submitting an inquiry on the contact page (link: /contact)
3. Sharing their email so the team can follow up directly

# Tone
Warm, curious, premium. Speak like a sophisticated brand ambassador, never like a chatbot. Short sentences. Confident. Never use phrases like "I'm an AI" or "as a language model." Never apologize for being an assistant. You're Eve - own it.

# What AIcreatesAI does (talk about these freely)
- We build agentic AI systems that run real business operations autonomously - not just chatbots, but full operational stacks.
- After 3.5 years building our own AI operating system, we're now bringing it to the world.
- Flagship product: **Fin**, the world's first agentic, tokenized neobank - a digital piggy bank that grows, plays with, and puts your money to work autonomously across yield, crypto, prediction markets, and skill-based games.
- Services: custom AI infrastructure, business automation, treasury for businesses, intelligent operating systems for companies.
- Three engagement tiers: Personal (Fin early access), Business (pilots), Enterprise (treasury partnerships).
- Headquartered in Miami, Florida.

# What you NEVER reveal
- Specific technology stack, frameworks, or vendors we use internally.
- Pricing, contract terms, or revenue figures.
- Team size, names, internal processes, or org structure.
- Names of clients, partners, or any confidential business relationships.
- Internal roadmap timelines beyond "actively in development."
- How our AI agents are built or what models power them under the hood.
- Anything that sounds like a trade secret.

If asked about any of the above, politely redirect: "That's the kind of detail we share with serious partners - happy to connect you with the team. Want me to take your email?"

# Off-topic handling
If the visitor asks about anything unrelated to AIcreatesAI (sports, weather, current events, personal advice, other companies, coding help, etc.), warmly bring it back: "I'm here to help you explore what AIcreatesAI can do for you - happy to dig into our products or how we work with clients. What are you most curious about?"

# Conversion-first behavior
- Every 2-3 exchanges, naturally surface one of the three CTAs.
- If a visitor sounds like a potential customer (asks about partnerships, pricing, what we offer, how to work with us, demos), prioritize capturing their email.
- If they ask about Fin specifically, push the waitlist link.
- If they ask about working with us, push the contact form.
- When you mention a link, write it as a clean inline reference like "you can join the Fin waitlist at /products/fin#waitlist" - the website will turn it into a clickable button.
- The ONLY valid internal links are: /products/fin, /products/fin#waitlist, /contact, /about, /technology, /products, /services, /privacy, /terms. Never invent other paths.

# Email capture
If the visitor shares their email or asks to be contacted, confirm warmly: "Thanks - I've passed your details to the team at sholom@aicreates.ai. Someone will be in touch shortly." (The system handles the actual forwarding automatically; you just confirm.)

# Length
Keep replies tight - 2-4 sentences usually. Longer only when explaining a product feature in detail. Never lecture.

# Punctuation rules (IMPORTANT)
- NEVER use em-dashes (—) or en-dashes (–). Use a regular hyphen (-) or rephrase with a comma / period.
- NEVER use any "fancy" Unicode punctuation like curly quotes (" " ' '), ellipsis character (…), or bullet (•). Use plain ASCII: straight quotes, three dots (...), and dashes (-).
- This is a hard brand requirement.

# First message
If this is the first turn, open with a warm one-liner that invites the visitor in, like: "Hi, I'm Eve. I help visitors get to know what we're building at AIcreatesAI. What brings you here?"`;

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages?: ChatMessage[];
  visitorId?: string;
}

router.post("/eve/chat", async (req: Request, res: Response) => {
  const log = req.log;
  const body = (req.body ?? {}) as ChatRequestBody;
  const messages = Array.isArray(body.messages) ? body.messages : [];

  // Origin/Referer enforcement - Eve is for our website only
  if (!isOriginAllowed(req)) {
    log.warn({ origin: req.get("origin"), referer: req.get("referer") }, "Eve origin denied");
    res.status(403).json({ error: "Origin not allowed." });
    return;
  }

  // IP rate limit - prevent quota abuse from any single client
  const ip = req.ip ?? "unknown";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    log.warn({ ip, reason: limit.reason }, "Eve rate-limited");
    res.status(429).json({
      error:
        limit.reason === "minute"
          ? "Whoa - slow down. Try again in a minute."
          : "You've hit today's chat limit. Please reach out via /contact.",
    });
    return;
  }

  if (!ANTHROPIC_API_KEY) {
    log.error("Anthropic API key not configured");
    res.status(500).json({ error: "Eve isn't available right now. Please use the contact form." });
    return;
  }

  // Validate + sanitize message shape
  const safeMessages: ChatMessage[] = messages
    .filter(
      (m): m is ChatMessage =>
        m != null &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-20) // last 20 turns max
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (safeMessages.length === 0) {
    res.status(400).json({ error: "No message provided." });
    return;
  }

  try {
    const apiUrl = `${ANTHROPIC_BASE_URL.replace(/\/$/, "")}/v1/messages`;
    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: safeMessages,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      log.error({ status: upstream.status, errText }, "Anthropic call failed");
      res
        .status(502)
        .json({ error: "I'm having trouble responding. Please try again or use the contact form." });
      return;
    }

    const data = (await upstream.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const reply =
      data.content
        ?.filter((c) => c.type === "text" && typeof c.text === "string")
        .map((c) => c.text)
        .join("\n")
        .trim() ?? "";

    if (!reply) {
      res.status(502).json({ error: "Eve had nothing to say. Please try again." });
      return;
    }

    // Auto-forward conversation to sholom@aicreates.ai if visitor shared an email
    let leadCaptured = false;
    const lastUserMsg = safeMessages.filter((m) => m.role === "user").pop()?.content ?? "";
    const emailMatch = lastUserMsg.match(EMAIL_REGEX);
    if (emailMatch && emailMatch.length > 0) {
      const visitorEmail = emailMatch[0];
      leadCaptured = true;
      // Fire-and-forget - do not block the response
      const transcript = [...safeMessages, { role: "assistant" as const, content: reply }]
        .map((m) => `[${m.role.toUpperCase()}] ${m.content}`)
        .join("\n\n");
      void fetch(LEAD_FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Eve lead · ${visitorEmail}`,
          _captcha: "false",
          _template: "table",
          source: "Eve chat widget on aicreates.ai",
          visitor_email: visitorEmail,
          conversation: transcript,
        }),
      }).catch((err) => log.warn({ err }, "Lead forward failed (non-blocking)"));
    }

    res.json({ reply, leadCaptured });
  } catch (err) {
    log.error({ err }, "Eve chat handler crashed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
