import app from "./app";
import { logger } from "./lib/logger";
import { reportError } from "./lib/alerts";
import { db, pool, sessionsTable } from "@workspace/db";
import { lt } from "drizzle-orm";

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

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

/**
 * Expired sessions are invisible to users but accumulate forever. Sweep them
 * hourly so the table (and its index) stays small.
 */
async function sweepExpiredSessions(): Promise<void> {
  try {
    const removed = await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expire, new Date()))
      .returning({ sid: sessionsTable.sid });

    if (removed.length > 0) {
      logger.info({ count: removed.length }, "Removed expired sessions");
    }
  } catch (err) {
    logger.warn({ err }, "Session cleanup failed");
  }
}

void sweepExpiredSessions();
const sessionSweeper = setInterval(() => void sweepExpiredSessions(), 60 * 60 * 1000);
sessionSweeper.unref();

/**
 * Graceful shutdown: stop accepting connections, let in-flight requests finish,
 * then close the pool. Docker sends SIGTERM on `stop`/redeploy; without this a
 * deploy would cut off checkout requests mid-flight.
 */
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Shutting down");

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error closing HTTP server");
      reportError("shutdown", err);
    }

    try {
      await pool.end();
    } catch (poolErr) {
      logger.warn({ err: poolErr }, "Error closing database pool");
    }

    process.exit(err ? 1 : 0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
  reportError("unhandledRejection", reason);
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  reportError("uncaughtException", err);
  void shutdown("uncaughtException");
});
