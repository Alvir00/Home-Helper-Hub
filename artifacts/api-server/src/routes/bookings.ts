import { Router } from "express";
import { db } from "@workspace/db";
import {
  bookingsTable,
  reviewsTable,
  workersTable,
  servicesTable,
  workerServicesTable,
} from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateBookingBody, UpdateBookingStatusBody, ReviewBookingBody } from "@workspace/api-zod";

const router = Router();

async function buildBookingResponse(booking: typeof bookingsTable.$inferSelect) {
  const [worker] = await db.select().from(workersTable).where(eq(workersTable.id, booking.workerId)).limit(1);
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, booking.serviceId)).limit(1);
  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.bookingId, booking.id)).limit(1);

  const workerServiceLinks = await db
    .select({ serviceId: workerServicesTable.serviceId })
    .from(workerServicesTable)
    .where(eq(workerServicesTable.workerId, booking.workerId));

  const serviceIds = workerServiceLinks.map((ws) => ws.serviceId);
  const workerServices =
    serviceIds.length > 0
      ? await db.select().from(servicesTable).where(inArray(servicesTable.id, serviceIds))
      : [];

  return {
    id: booking.id,
    userId: booking.userId,
    worker: worker
      ? {
          id: worker.id,
          name: worker.name,
          bio: worker.bio ?? null,
          phone: worker.phone ?? null,
          photoUrl: worker.photoUrl ?? null,
          rating: worker.rating ?? null,
          totalReviews: worker.totalReviews,
          completedBookings: worker.completedBookings,
          status: worker.status,
          services: workerServices.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            pricePerHour: s.pricePerHour,
            durationHours: s.durationHours,
            category: s.category,
            iconUrl: s.iconUrl ?? null,
          })),
          createdAt: worker.createdAt.toISOString(),
        }
      : null,
    service: service
      ? {
          id: service.id,
          name: service.name,
          description: service.description,
          pricePerHour: service.pricePerHour,
          durationHours: service.durationHours,
          category: service.category,
          iconUrl: service.iconUrl ?? null,
        }
      : null,
    scheduledDate: booking.scheduledDate.toISOString(),
    address: booking.address,
    notes: booking.notes ?? null,
    status: booking.status,
    totalPrice: booking.totalPrice,
    review: review
      ? {
          id: review.id,
          bookingId: review.bookingId,
          rating: review.rating,
          comment: review.comment ?? null,
          createdAt: review.createdAt.toISOString(),
        }
      : null,
    createdAt: booking.createdAt.toISOString(),
  };
}

router.get("/bookings", requireAuth, async (req, res) => {
  const { status, limit = "20", offset = "0" } = req.query;

  const conditions = [eq(bookingsTable.userId, req.userId!)];
  if (status && typeof status === "string") {
    conditions.push(eq(bookingsTable.status, status as any));
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(and(...conditions))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string))
    .orderBy(bookingsTable.createdAt);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(and(...conditions));

  const built = await Promise.all(bookings.map(buildBookingResponse));
  return res.json({ bookings: built, total: Number(total[0]?.count ?? 0) });
});

router.post("/bookings", requireAuth, async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { workerId, serviceId, scheduledDate, address, notes } = parsed.data;

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId)).limit(1);
  if (!service) return res.status(404).json({ error: "not_found", message: "Service not found" });

  const [worker] = await db.select().from(workersTable).where(eq(workersTable.id, workerId)).limit(1);
  if (!worker || worker.status !== "approved") {
    return res.status(400).json({ error: "worker_unavailable", message: "Worker not available" });
  }

  const totalPrice = service.pricePerHour * service.durationHours;

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      userId: req.userId!,
      workerId,
      serviceId,
      scheduledDate: new Date(scheduledDate),
      address,
      notes: notes ?? null,
      status: "pending",
      totalPrice,
    })
    .returning();

  return res.status(201).json(await buildBookingResponse(booking));
});

router.get("/bookings/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  return res.json(await buildBookingResponse(booking));
});

router.patch("/bookings/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status as any })
    .where(eq(bookingsTable.id, id))
    .returning();

  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  if (parsed.data.status === "completed") {
    await db
      .update(workersTable)
      .set({ completedBookings: sql`${workersTable.completedBookings} + 1` })
      .where(eq(workersTable.id, booking.workerId));
  }

  return res.json(await buildBookingResponse(booking));
});

router.post("/bookings/:id/review", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const parsed = ReviewBookingBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(and(eq(bookingsTable.id, id), eq(bookingsTable.userId, req.userId!)))
    .limit(1);

  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });
  if (booking.status !== "completed") {
    return res.status(400).json({ error: "not_completed", message: "Booking must be completed to review" });
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ bookingId: id, rating: parsed.data.rating, comment: parsed.data.comment ?? null })
    .returning();

  // Update worker rating
  const allReviews = await db
    .select({ rating: reviewsTable.rating })
    .from(reviewsTable)
    .innerJoin(bookingsTable, eq(reviewsTable.bookingId, bookingsTable.id))
    .where(eq(bookingsTable.workerId, booking.workerId));

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db
    .update(workersTable)
    .set({ rating: avgRating, totalReviews: allReviews.length })
    .where(eq(workersTable.id, booking.workerId));

  return res.status(201).json({
    id: review.id,
    bookingId: review.bookingId,
    rating: review.rating,
    comment: review.comment ?? null,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
