import { Router } from "express";
import { db } from "@workspace/db";
import {
  servicesTable,
  workerApplicationsTable,
  workerServicesTable,
  workersTable,
} from "@workspace/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { rateLimit } from "../lib/rateLimit";
import { parsePagination } from "../lib/pagination";

const router = Router();

const MAX_NAME = 120;
const MAX_BIO = 1000;
const MAX_NEIGHBORHOOD = 120;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s()-]*$/;

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: "worker-application",
  message: "Too many applications from this address. Please try again later.",
});

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : null;
}

function cleanServiceIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((n): n is number => Number.isInteger(n) && n > 0))].slice(0, 20);
}

/**
 * Public application form. Deliberately does not create a worker: an admin
 * reviews the application first, which keeps unvetted people out of search
 * results and off customer bookings.
 */
router.post("/worker-applications", applicationLimiter, async (req, res) => {
  const name = cleanText(req.body?.name, MAX_NAME);
  if (!name || name.length < 2) {
    return res.status(400).json({ error: "validation_error", message: "Name must be between 2 and 120 characters" });
  }

  const phone = cleanText(req.body?.phone, 32);
  if (!phone || !PHONE_RE.test(phone)) {
    return res.status(400).json({ error: "validation_error", message: "A valid phone number is required" });
  }

  const email = cleanText(req.body?.email, 320)?.toLowerCase() ?? null;
  if (email !== null && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "validation_error", message: "Email address is not valid" });
  }

  const neighborhood = cleanText(req.body?.neighborhood, MAX_NEIGHBORHOOD);
  const bio = cleanText(req.body?.bio, MAX_BIO);
  const serviceIds = cleanServiceIds(req.body?.serviceIds);

  if (serviceIds.length === 0) {
    return res.status(400).json({ error: "validation_error", message: "Choose at least one service" });
  }

  const found = await db
    .select({ id: servicesTable.id })
    .from(servicesTable)
    .where(inArray(servicesTable.id, serviceIds));
  if (found.length !== serviceIds.length) {
    return res.status(400).json({ error: "validation_error", message: "One or more services do not exist" });
  }

  const [application] = await db
    .insert(workerApplicationsTable)
    .values({ name, phone, email, neighborhood, bio, serviceIds, status: "pending" })
    .returning({ id: workerApplicationsTable.id, createdAt: workerApplicationsTable.createdAt });

  return res.status(201).json({
    id: application.id,
    status: "pending",
    createdAt: application.createdAt.toISOString(),
    message: "Application received. We will contact you within two working days.",
  });
});

router.get(
  "/dashboard/admin/worker-applications",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { status } = req.query;
    const { limit, offset } = parsePagination(req.query as Record<string, unknown>, 20, 100);

    const conditions = [];
    if (status === "pending" || status === "approved" || status === "rejected") {
      conditions.push(eq(workerApplicationsTable.status, status));
    }

    const applications = await db
      .select()
      .from(workerApplicationsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workerApplicationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(workerApplicationsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return res.json({
      applications: applications.map((a) => ({
        id: a.id,
        name: a.name,
        phone: a.phone,
        email: a.email ?? null,
        neighborhood: a.neighborhood ?? null,
        bio: a.bio ?? null,
        serviceIds: a.serviceIds,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
      })),
      total: Number(totalResult[0]?.count ?? 0),
    });
  },
);

router.patch(
  "/dashboard/admin/worker-applications/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

    const status = req.body?.status;
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "validation_error", message: "Status must be approved or rejected" });
    }

    const [application] = await db
      .select()
      .from(workerApplicationsTable)
      .where(eq(workerApplicationsTable.id, id))
      .limit(1);

    if (!application) {
      return res.status(404).json({ error: "not_found", message: "Application not found" });
    }
    if (application.status !== "pending") {
      return res.status(409).json({ error: "already_reviewed", message: "This application has already been reviewed" });
    }

    let workerId: number | null = null;

    await db.transaction(async (tx) => {
      if (status === "approved") {
        const [worker] = await tx
          .insert(workersTable)
          .values({
            name: application.name,
            bio: application.bio,
            phone: application.phone,
            status: "approved",
          })
          .returning({ id: workersTable.id });

        workerId = worker.id;

        if (application.serviceIds.length > 0) {
          await tx
            .insert(workerServicesTable)
            .values(application.serviceIds.map((serviceId) => ({ workerId: worker.id, serviceId })))
            .onConflictDoNothing();
        }
      }

      await tx
        .update(workerApplicationsTable)
        .set({ status, reviewedAt: new Date() })
        .where(eq(workerApplicationsTable.id, id));
    });

    return res.json({ id, status, workerId });
  },
);

export default router;
