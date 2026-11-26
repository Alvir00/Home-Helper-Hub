import { logger } from "./logger";

let lastAlertAt = 0;
const MIN_ALERT_INTERVAL_MS = 60_000;

/**
 * Optional, dependency-free alert hook.
 *
 * Set `ERROR_WEBHOOK_URL` to a Slack/Discord/Teams incoming webhook and fatal
 * errors will be posted there. Alerts are throttled to one per minute so a
 * crash loop cannot flood the channel. When the variable is unset this is a
 * no-op — no vendor account required.
 */
export function reportError(context: string, error: unknown): void {
  const url = process.env["ERROR_WEBHOOK_URL"];
  if (!url) return;

  const now = Date.now();
  if (now - lastAlertAt < MIN_ALERT_INTERVAL_MS) return;
  lastAlertAt = now;

  const message = error instanceof Error ? error.message : String(error);
  const text = `🚨 Meraki ${context}: ${message}`;

  // Fire-and-forget: alerting must never delay or fail a response.
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, content: text }),
  }).catch((err) => {
    logger.warn({ err }, "Could not deliver error alert");
  });
}
