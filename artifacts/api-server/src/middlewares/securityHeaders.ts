import type { Request, Response, NextFunction } from "express";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Security headers for the JSON API.
 *
 * These are the subset of `helmet`'s defaults that matter for an API which
 * never serves HTML of its own. A dependency-free implementation keeps the
 * pnpm lockfile untouched; swap in `helmet` once dependency updates are
 * possible (it also covers COOP/COEP and HSTS preload tuning).
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Stop browsers from MIME-sniffing a JSON body into something executable.
  res.setHeader("X-Content-Type-Options", "nosniff");
  // The API is never meant to be framed.
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
}
