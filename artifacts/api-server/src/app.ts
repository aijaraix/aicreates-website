import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
export const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https?:\/\/(www\.)?aicreates\.ai$/i,
  /^https?:\/\/aijaraix\.github\.io$/i,
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
  /^https?:\/\/[a-z0-9.-]+\.replit\.dev$/i,
  /^https?:\/\/[a-z0-9.-]+\.replit\.app$/i,
  /^https?:\/\/[a-z0-9.-]+\.repl\.co$/i,
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server, curl, mobile apps
      if (ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin))) return cb(null, true);
      return cb(null, false);
    },
    credentials: false,
  }),
);
// Trust the proxy in front of us so req.ip reflects the real client IP
app.set("trust proxy", true);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
