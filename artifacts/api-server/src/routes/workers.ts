import { Router } from "express";
import { db } from "@workspace/db";
import {
  workersTable,
  workerServicesTable,
  servicesTable,
  reviewsTable,
  bookingsTable,
} from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";

const router = Router();

async function buildWorkerResponse(worker: typeof workersTable.$inferSelect) {
  const workerServiceLinks = await db
    .select({ serviceId: workerServicesTable.serviceId })
    .from(workerServicesTable)
    .where(eq(workerServicesTable.workerId, worker.id));

  const serviceIds = workerServiceLinks.map((ws) => ws.serviceId);
  const services =
    serviceIds.length > 0
      ? await db.select().from(servicesTable).where(inArray(servicesTable.id, serviceIds))
      : [];

  return {
    id: worker.id,
    name: worker.name,
    bio: worker.bio ?? null,
    phone: worker.phone ?? null,
    photoUrl: worker.photoUrl ?? null,
    rating: worker.rating ?? null,
    totalReviews: worker.totalReviews,
    completedBookings: worker.completedBookings,
    status: worker.status,
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      pricePerHour: s.pricePerHour,
      durationHours: s.durationHours,
      category: s.category,
      iconUrl: s.iconUrl ?? null,
    })),
    createdAt: worker.createdAt.toISOString(),
  };
}

router.get("/workers", async (req, res) => {
  const { serviceId, limit = "20", offset = "0" } = req.query;

  let workerIds: number[] | null = null;

  if (serviceId) {
    const sid = parseInt(serviceId as string);
    if (!isNaN(sid)) {
      const links = await db
        .select({ workerId: workerServicesTable.workerId })
        .from(workerServicesTable)
        .where(eq(workerServicesTable.serviceId, sid));
      workerIds = links.map((l) => l.workerId);
    }
  }

  let query = db.select().from(workersTable).where(eq(workersTable.status, "approved"));

  const workers = await db
    .select()
    .from(workersTable)
    .where(
      workerIds !== null
        ? and(eq(workersTable.status, "approved"), inArray(workersTable.id, workerIds))
        : eq(workersTable.status, "approved")
    )
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(workersTable)
    .where(
      workerIds !== null
        ? and(eq(workersTable.status, "approved"), inArray(workersTable.id, workerIds))
        : eq(workersTable.status, "approved")
    );

  const built = await Promise.all(workers.map(buildWorkerResponse));
  return res.json({ workers: built, total: Number(totalResult[0]?.count ?? 0) });
});

router.get("/workers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const [worker] = await db.select().from(workersTable).where(eq(workersTable.id, id)).limit(1);
  if (!worker) return res.status(404).json({ error: "not_found", message: "Worker not found" });

  return res.json(await buildWorkerResponse(worker));
});

router.get("/workers/:id/reviews", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const bookingIds = await db
    .select({ id: bookingsTable.id })
    .from(bookingsTable)
    .where(eq(bookingsTable.workerId, id));

  if (bookingIds.length === 0) return res.json([]);

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(inArray(reviewsTable.bookingId, bookingIds.map((b) => b.id)));

  return res.json(
    reviews.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
