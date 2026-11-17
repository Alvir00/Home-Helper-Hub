import type { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum requests allowed per key inside one window. */
  max: number;
  /** Distinguishes buckets that share a key (e.g. "login" vs "reset"). */
  keyPrefix: string;
  /** Defaults to the client IP. Use this to bucket per email or per user id. */
  keyGenerator?: (req: Request) => string;
  message?: string;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowEntry>();

/**
 * Upper bound on tracked keys. If the process is hammered from many distinct
 * IPs we drop all windows rather than grow memory without limit; the cost is a
 * brief relaxation of the limit, not an outage.
 */
const MAX_TRACKED_KEYS = 10_000;

// Reclaim expired windows so a long-lived process does not leak memory.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}, 60_000);
sweeper.unref?.();

/**
 * Fixed-window, in-process rate limiter.
 *
 * Deliberately dependency-free. It is per-instance, so behind multiple
 * instances the effective limit is `max * instanceCount`; move the store to
 * Redis (or swap in `express-rate-limit` with a shared store) before relying on
 * it for anything beyond abuse mitigation.
 */
export function rateLimit(opts: RateLimitOptions) {
  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const now = Date.now();
    const identity =
      opts.keyGenerator?.(req) ?? req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `${opts.keyPrefix}:${identity}`;

    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
      entry = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(key, entry);
    }
    entry.count += 1;

    const resetInSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader("RateLimit-Limit", String(opts.max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, opts.max - entry.count)));
    res.setHeader("RateLimit-Reset", String(resetInSeconds));

    if (entry.count > opts.max) {
      res.setHeader("Retry-After", String(resetInSeconds));
      res.status(429).json({
        error: "rate_limited",
        message:
          opts.message ?? "Too many requests. Please try again in a few minutes.",
      });
      return;
    }

    next();
  };
}

/** Normalises an email so the limiter cannot be bypassed by case changes. */
export function emailKey(req: Request): string {
  const email = (req.body as { email?: unknown } | undefined)?.email;
  const ip = req.ip ?? "unknown";
  if (typeof email === "string" && email.length > 0 && email.length < 320) {
    return `${ip}|${email.trim().toLowerCase()}`;
  }
  return ip;
}
