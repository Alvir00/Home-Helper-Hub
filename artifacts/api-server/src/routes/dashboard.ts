import { Router } from "express";
import { db } from "@workspace/db";
import {
  bookingsTable,
  workersTable,
  servicesTable,
  reviewsTable,
  userSubscriptionsTable,
  subscriptionPlansTable,
  workerServicesTable,
} from "@workspace/db";
import { eq, and, gte, inArray, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/auth";

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

// User dashboard summary
router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const upcoming = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.userId, req.userId!),
        inArray(bookingsTable.status, ["pending", "confirmed"])
      )
    )
    .limit(5)
    .orderBy(bookingsTable.scheduledDate);

  const recent = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.userId, req.userId!))
    .limit(5)
    .orderBy(bookingsTable.createdAt);

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.userId, req.userId!));

  const monthlyCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.userId, req.userId!), gte(bookingsTable.createdAt, startOfMonth)));

  const [activeSub] = await db
    .select()
    .from(userSubscriptionsTable)
    .where(and(eq(userSubscriptionsTable.userId, req.userId!), eq(userSubscriptionsTable.status, "active")))
    .limit(1);

  let activeSubscription = null;
  if (activeSub) {
    const [plan] = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.id, activeSub.planId))
      .limit(1);
    if (plan) {
      activeSubscription = {
        id: activeSub.id,
        userId: activeSub.userId,
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          bookingsPerMonth: plan.bookingsPerMonth,
          discountPercent: plan.discountPercent,
          features: plan.features ?? [],
          popular: plan.popular,
        },
        status: activeSub.status,
        startDate: activeSub.startDate.toISOString(),
        endDate: activeSub.endDate.toISOString(),
        bookingsUsed: activeSub.bookingsUsed,
      };
    }
  }

  const upcomingBuilt = await Promise.all(upcoming.map(buildBookingResponse));
  const recentBuilt = await Promise.all(recent.map(buildBookingResponse));

  return res.json({
    upcomingBookings: upcomingBuilt,
    totalBookings: Number(totalCount[0]?.count ?? 0),
    activeSubscription,
    bookingsThisMonth: Number(monthlyCount[0]?.count ?? 0),
    recentBookings: recentBuilt,
  });
});

// Admin summary
router.get("/dashboard/admin/summary", requireAuth, requireAdmin, async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalWorkers] = await db.select({ count: sql<number>`count(*)` }).from(workersTable);
  const [pendingWorkers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(workersTable)
    .where(eq(workersTable.status, "pending"));
  const [totalBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable);
  const [bookingsToday] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(gte(bookingsTable.createdAt, startOfToday));
  const [activeSubs] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userSubscriptionsTable)
    .where(eq(userSubscriptionsTable.status, "active"));

  const monthRevenue = await db
    .select({ total: sql<number>`sum(total_price)` })
    .from(bookingsTable)
    .where(and(gte(bookingsTable.createdAt, startOfMonth), eq(bookingsTable.status, "completed")));

  const byStatus = await db
    .select({ status: bookingsTable.status, count: sql<number>`count(*)` })
    .from(bookingsTable)
    .groupBy(bookingsTable.status);

  const bookingsByStatus: Record<string, number> = {};
  for (const row of byStatus) {
    bookingsByStatus[row.status] = Number(row.count);
  }

  return res.json({
    totalWorkers: Number(totalWorkers?.count ?? 0),
    pendingWorkers: Number(pendingWorkers?.count ?? 0),
    totalBookings: Number(totalBookings?.count ?? 0),
    bookingsToday: Number(bookingsToday?.count ?? 0),
    activeSubscriptions: Number(activeSubs?.count ?? 0),
    revenueThisMonth: Number(monthRevenue[0]?.total ?? 0),
    bookingsByStatus,
  });
});

// Admin: all bookings
router.get("/dashboard/admin/bookings", requireAuth, requireAdmin, async (req, res) => {
  const { status, limit = "20", offset = "0" } = req.query;

  const conditions = [];
  if (status && typeof status === "string") {
    conditions.push(eq(bookingsTable.status, status as any));
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string))
    .orderBy(bookingsTable.createdAt);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const built = await Promise.all(bookings.map(buildBookingResponse));
  return res.json({ bookings: built, total: Number(total[0]?.count ?? 0) });
});

// Admin: all workers
router.get("/dashboard/admin/workers", requireAuth, requireAdmin, async (req, res) => {
  const { status, limit = "20", offset = "0" } = req.query;

  const conditions = [];
  if (status && typeof status === "string") {
    conditions.push(eq(workersTable.status, status as any));
  }

  const workers = await db
    .select()
    .from(workersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(workersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const built = await Promise.all(
    workers.map(async (w) => {
      const workerServiceLinks = await db
        .select({ serviceId: workerServicesTable.serviceId })
        .from(workerServicesTable)
        .where(eq(workerServicesTable.workerId, w.id));
      const serviceIds = workerServiceLinks.map((ws) => ws.serviceId);
      const services =
        serviceIds.length > 0
          ? await db.select().from(servicesTable).where(inArray(servicesTable.id, serviceIds))
          : [];
      return {
        id: w.id,
        name: w.name,
        bio: w.bio ?? null,
        phone: w.phone ?? null,
        photoUrl: w.photoUrl ?? null,
        rating: w.rating ?? null,
        totalReviews: w.totalReviews,
        completedBookings: w.completedBookings,
        status: w.status,
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          pricePerHour: s.pricePerHour,
          durationHours: s.durationHours,
          category: s.category,
          iconUrl: s.iconUrl ?? null,
        })),
        createdAt: w.createdAt.toISOString(),
      };
    })
  );

  return res.json({ workers: built, total: Number(total[0]?.count ?? 0) });
});

// Admin: update worker status
router.patch("/dashboard/admin/workers/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const { status } = req.body;
  if (!["pending", "approved", "suspended"].includes(status)) {
    return res.status(400).json({ error: "bad_request", message: "Invalid status" });
  }

  const [worker] = await db
    .update(workersTable)
    .set({ status })
    .where(eq(workersTable.id, id))
    .returning();

  if (!worker) return res.status(404).json({ error: "not_found", message: "Worker not found" });

  const workerServiceLinks = await db
    .select({ serviceId: workerServicesTable.serviceId })
    .from(workerServicesTable)
    .where(eq(workerServicesTable.workerId, worker.id));
  const serviceIds = workerServiceLinks.map((ws) => ws.serviceId);
  const services =
    serviceIds.length > 0
      ? await db.select().from(servicesTable).where(inArray(servicesTable.id, serviceIds))
      : [];

  return res.json({
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
  });
});

export default router;
