import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { WebhookHandlers } from "./lib/webhookHandlers";

const app: Express = express();

// 0. Permanent redirect from the legacy portal subdomain to the new
// invest subdomain. Both subdomains are expected to point at the same
// Replit deployment, so the redirect runs before anything else.
app.use((req, res, next) => {
  const host = (req.headers.host ?? "").toLowerCase().split(":")[0];
  if (host === "portal.aicreates.ai") {
    res.redirect(301, `https://invest.aicreates.ai${req.originalUrl}`);
    return;
  }
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

export const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https?:\/\/(www\.)?aicreates\.ai$/i,
  /^https?:\/\/invest\.aicreates\.ai$/i,
  /^https?:\/\/aijaraix\.github\.io$/i,
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
  /^https?:\/\/[a-z0-9.-]+\.replit\.dev$/i,
  /^https?:\/\/[a-z0-9.-]+\.replit\.app$/i,
  /^https?:\/\/[a-z0-9.-]+\.repl\.co$/i,
];

// 1. Clerk proxy must run before body parsers (it streams raw bytes).
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// 2. Stripe webhook must run before express.json() so req.body is a Buffer.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature" });
      return;
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        req.log?.error(
          "STRIPE WEBHOOK ERROR: req.body is not a Buffer (express.json() ran first).",
        );
        res.status(500).json({ error: "Webhook processing error" });
        return;
      }
      await WebhookHandlers.processWebhook(req.body, sig!);
      res.status(200).json({ received: true });
    } catch (err) {
      req.log?.error({ err }, "stripe webhook error");
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

// 3. CORS + body parsing for the rest of the app.
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin)))
        return cb(null, true);
      return cb(null, false);
    },
    // Portal is same-origin with the api-server in production, so Clerk uses
    // first-party cookies and CORS credentials are unnecessary. The marketing
    // site does not call authenticated endpoints. Keep credentials off so the
    // broad replit.* dev-domain allow-list does not widen exposure.
    credentials: false,
  }),
);
app.set("trust proxy", true);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }));

// 4. Clerk session middleware (host-aware publishable key).
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;
