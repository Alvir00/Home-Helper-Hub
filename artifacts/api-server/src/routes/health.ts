import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

/** Liveness: the process is up and can answer HTTP. */
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/**
 * Readiness: the process can serve real traffic, which requires the database.
 * Platforms (Render, Fly, Kubernetes) should probe this before routing traffic;
 * the Docker HEALTHCHECK keeps using /healthz so a database outage does not
 * trigger an endless container restart loop.
 */
router.get("/readyz", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

export default router;
