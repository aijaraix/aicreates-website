import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { logger } from "./lib/logger";
import { getStripeSync, isStripeConfigured } from "./lib/stripeClient";
import { startRoundSweep, evaluateRoundTransitions } from "./lib/roundStatus";
import { startCommitmentExpirySweep } from "./lib/commitmentExpiry";
import {
  addConnection,
  consumeTicket,
  removeConnection,
  startHeartbeat,
  type ConnState,
} from "./lib/chat";

async function initStripe(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set; skipping Stripe initialization.");
    return;
  }

  const configured = await isStripeConfigured();
  if (!configured) {
    logger.warn(
      "Stripe integration not connected. Skipping Stripe init. " +
        "Connect via the Replit Integrations tab to enable payments.",
    );
    return;
  }

  try {
    logger.info("Initializing Stripe schema...");
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();
    const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (replitDomain) {
      const webhookUrl = `https://${replitDomain}/api/stripe/webhook`;
      logger.info({ webhookUrl }, "Setting up managed Stripe webhook");
      await stripeSync.findOrCreateManagedWebhook(webhookUrl);
    }

    logger.info("Backfilling Stripe data...");
    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe data synced"))
      .catch((err) => logger.error({ err }, "Stripe syncBackfill failed"));
  } catch (err) {
    logger.error({ err }, "initStripe failed; continuing without Stripe");
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initStripe();

const server = createServer(app);

// ---- Chat WebSocket (auth via short-lived ticket from POST /api/chat/ws-ticket).
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname !== "/api/ws/chat") {
    socket.destroy();
    return;
  }
  const ticket = url.searchParams.get("ticket") ?? "";
  const entry = consumeTicket(ticket);
  if (!entry) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    const state: ConnState = {
      ws,
      userId: entry.userId,
      role: entry.role,
      alive: true,
    };
    addConnection(state);
    ws.on("pong", () => {
      state.alive = true;
    });
    ws.on("message", (raw) => {
      // Clients only need heartbeats; messages flow through REST.
      try {
        const text = raw.toString();
        if (text.length > 4) {
          const parsed = JSON.parse(text) as { type?: string };
          if (parsed.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        /* ignore malformed */
      }
    });
    ws.on("close", () => removeConnection(state));
    ws.on("error", () => removeConnection(state));
    // Send initial hello so the client can confirm authentication.
    try {
      ws.send(JSON.stringify({ type: "hello", role: entry.role }));
    } catch {
      /* ignore */
    }
  });
});

startHeartbeat();

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening (HTTP + WS)");
  evaluateRoundTransitions({ reason: "sweep" }).catch((sweepErr) =>
    logger.error({ err: sweepErr }, "initial round transition failed"),
  );
  startRoundSweep();
  startCommitmentExpirySweep();
});
