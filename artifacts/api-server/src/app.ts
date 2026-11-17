import express, { type Express } from "express";
import cors, { type CorsOptions, type CorsOptionsDelegate } from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { authMiddleware } from "./middlewares/authMiddleware";
import { securityHeaders } from "./middlewares/securityHeaders";
import { mountWebApp } from "./static";
import { rateLimit } from "./lib/rateLimit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
// Trust the first hop (the platform proxy) so req.ip and req.protocol are the
// client's real values — rate limiting and secure cookies depend on it.
app.set("trust proxy", 1);

const allowedOrigins = (process.env["ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const baseCorsOptions: CorsOptions = {
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86_400,
};

/**
 * Allowing every origin *and* credentials lets any website drive the API with a
 * logged-in user's cookie. Allow same-host (web and API share a host in this
 * deployment) plus an explicit ALLOWED_ORIGINS allowlist. Outside production an
 * empty allowlist stays permissive so local dev servers keep working.
 */
const corsDelegate: CorsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;

  // No Origin header: server-to-server calls, curl, and native mobile fetch.
  // CORS does not apply, and these clients cannot ride a browser cookie.
  if (!origin) {
    callback(null, { ...baseCorsOptions, origin: false });
    return;
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, { ...baseCorsOptions, origin: true });
    return;
  }

  if (!isProduction && allowedOrigins.length === 0) {
    callback(null, { ...baseCorsOptions, origin: true });
    return;
  }

  let sameHost = false;
  try {
    sameHost = new URL(origin).host === req.headers.host;
  } catch {
    sameHost = false;
  }

  if (sameHost) {
    callback(null, { ...baseCorsOptions, origin: true });
    return;
  }

  // Answer without CORS headers: the browser blocks the response and we keep a
  // record of the attempt. Do not throw — that would turn a misconfiguration
  // into a 500 on every request.
  logger.warn(
    { origin, host: req.headers.host },
    "Blocked cross-origin request",
  );
  callback(null, { ...baseCorsOptions, origin: false });
};

// API-only headers: the strict CSP here would break the SPA, which is served
// with its own policy (see static.ts).
app.use("/api", securityHeaders);
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
    // Never let session identifiers or bearer tokens reach the log sink.
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers['set-cookie']",
      ],
      censor: "[redacted]",
    },
  }),
);
app.use(cors(corsDelegate));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Broad abuse ceiling for the whole API surface; the auth routes carry their own
// much tighter limiter (see routes/auth.ts).
app.use("/api", rateLimit({ windowMs: 60_000, max: 600, keyPrefix: "api" }));

app.use(authMiddleware);

app.use("/api", router);

// Keep unmatched responses JSON-shaped instead of leaking Express' HTML page.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found", message: "Endpoint not found" });
});

// Single-container hosting: serve the built SPA after the API so `/api` always
// wins. No-op unless WEB_DIST is set (see static.ts).
mountWebApp(app, process.env["WEB_DIST"]);

export default app;
