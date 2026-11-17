import express, { type Express, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";
import { logger } from "./lib/logger";

const WEB_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Radix and Tailwind inject inline styles at runtime.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

/**
 * Serve the built web app from the API process.
 *
 * Off Replit nothing hosts `meraki-web/dist/public`, and splitting the SPA and
 * the API across two hostnames breaks auth: the session cookie is
 * `sameSite=lax`, so the browser would not send it cross-site. One origin
 * (this process) keeps cookies working and makes CORS a non-issue.
 *
 * Enabled only when `WEB_DIST` points at a real build, so Replit — where the
 * platform serves each artifact itself — is unaffected.
 */
export function mountWebApp(app: Express, distDir: string | undefined): void {
  if (!distDir) return;

  const indexHtml = path.join(distDir, "index.html");
  if (!fs.existsSync(indexHtml)) {
    logger.warn(
      { distDir },
      "WEB_DIST is set but index.html was not found; skipping static hosting",
    );
    return;
  }

  const setHtmlHeaders = (res: ServerResponse) => {
    res.setHeader("Content-Security-Policy", WEB_CSP);
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
  };

  app.use(
    express.static(distDir, {
      index: false,
      // Filenames are content-hashed by Vite, so they can be cached hard.
      maxAge: "1h",
      setHeaders(res, filePath) {
        res.setHeader("X-Content-Type-Options", "nosniff");
        if (filePath.endsWith("index.html")) setHtmlHeaders(res);
      },
    }),
  );

  // SPA fallback: any non-API GET renders the app shell so client routing works
  // on deep links and refreshes. /api is excluded — it has its own 404 handler.
  app.get(/^\/(?!api(?:\/|$)).*/, (_req: Request, res: Response) => {
    setHtmlHeaders(res);
    res.sendFile(indexHtml);
  });

  logger.info({ distDir }, "Serving built web app from the API process");
}
