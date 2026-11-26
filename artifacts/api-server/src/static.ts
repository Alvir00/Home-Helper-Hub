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
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const PUBLIC_PATHS = [
  "/",
  "/services",
  "/workers",
  "/plans",
  "/become-a-helper",
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/contact",
];

function originFor(req: Request): string {
  const configured = (process.env["APP_URL"] ?? "").replace(/\/+$/, "");
  if (configured) return configured;
  return `${req.protocol}://${req.get("host") ?? "localhost"}`;
}

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

  const indexHtmlPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexHtmlPath)) {
    logger.warn(
      { distDir },
      "WEB_DIST is set but index.html was not found; skipping static hosting",
    );
    return;
  }

  // APP_URL is baked into canonical/Open Graph tags at startup. Without it the
  // tags stay relative, which browsers ignore for previews but is harmless.
  const appUrl = (process.env["APP_URL"] ?? "").replace(/\/+$/, "");
  const indexHtml = fs
    .readFileSync(indexHtmlPath, "utf8")
    .replaceAll("__PUBLIC_URL__", appUrl);

  const setHtmlHeaders = (res: ServerResponse) => {
    res.setHeader("Content-Security-Policy", WEB_CSP);
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Content-Type-Options", "nosniff");
  };

  // Dynamic so the sitemap always points at the real public host, even when
  // the deployment URL changes.
  app.get("/robots.txt", (req, res) => {
    const origin = originFor(req);
    res
      .type("text/plain")
      .send(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get("/sitemap.xml", (req, res) => {
    const origin = originFor(req);
    const urls = PUBLIC_PATHS.map((publicPath) => {
      const priority = publicPath === "/" ? "1.0" : publicPath === "/workers" ? "0.9" : "0.7";
      return `  <url><loc>${origin}${publicPath}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
    }).join("\n");

    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
  });

  app.use(
    express.static(distDir, {
      index: false,
      etag: true,
      setHeaders(res, filePath) {
        res.setHeader("X-Content-Type-Options", "nosniff");

        if (filePath.endsWith("index.html")) {
          setHtmlHeaders(res);
          return;
        }

        // Vite fingerprints everything under /assets, so those files can be
        // cached forever. Public images keep their names and get a week.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=604800");
        }
      },
    }),
  );

  // SPA fallback: any non-API GET renders the app shell so client routing works
  // on deep links and refreshes. /api is excluded — it has its own 404 handler.
  app.get(/^\/(?!api(?:\/|$)).*/, (req: Request, res: Response) => {
    // A missing file must 404, not return the HTML shell with a 200. Otherwise
    // a stale /worker-1.png or a deleted JS chunk looks like a valid response
    // and fails later with a confusing MIME-type error.
    if (path.extname(req.path)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    setHtmlHeaders(res);
    res.type("html").send(indexHtml);
  });

  logger.info({ distDir }, "Serving built web app from the API process");
}
