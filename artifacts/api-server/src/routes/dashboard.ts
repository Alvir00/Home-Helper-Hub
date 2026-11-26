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
  usersTable,
} from "@workspace/db";
import { eq, and, gte, inArray, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/auth";
import { parsePagination } from "../lib/pagination";

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
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod ?? null,
    paidAt: booking.paidAt ? booking.paidAt.toISOString() : null,
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

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : null;
}

function cleanPhone(value: unknown): string | null {
  const phone = cleanText(value, 32);
  if (phone === null) return null;
  return /^\+?[0-9][0-9\s()-]*$/.test(phone) ? phone : null;
}

function cleanPhotoUrl(value: unknown): string | null {
  const url = cleanText(value, 500);
  if (url === null) return null;
  return /^https?:\/\//i.test(url) || url.startsWith("/") ? url : null;
}

function cleanServiceIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((n): n is number => Number.isInteger(n) && n > 0))].slice(0, 20);
}

async function servicesExist(serviceIds: number[]): Promise<boolean> {
  if (serviceIds.length === 0) return true;
  const found = await db
    .select({ id: servicesTable.id })
    .from(servicesTable)
    .where(inArray(servicesTable.id, serviceIds));
  return found.length === serviceIds.length;
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
    .orderBy(desc(bookingsTable.createdAt));

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
  const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);

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

  const recentBookingsRaw = await db
    .select({
      id: bookingsTable.id,
      userName: usersTable.name,
      serviceName: servicesTable.name,
      workerName: workersTable.name,
      scheduledDate: bookingsTable.scheduledDate,
      status: bookingsTable.status,
      totalPrice: bookingsTable.totalPrice,
      createdAt: bookingsTable.createdAt,
    })
    .from(bookingsTable)
    .leftJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
    .leftJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .leftJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .orderBy(desc(bookingsTable.createdAt))
    .limit(8);

  const recentUsersRaw = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(5);

  const topWorkersRaw = await db
    .select({
      id: workersTable.id,
      name: workersTable.name,
      photoUrl: workersTable.photoUrl,
      rating: workersTable.rating,
      completedBookings: workersTable.completedBookings,
      totalReviews: workersTable.totalReviews,
    })
    .from(workersTable)
    .where(eq(workersTable.status, "approved"))
    .orderBy(desc(workersTable.completedBookings))
    .limit(5);

  return res.json({
    totalWorkers: Number(totalWorkers?.count ?? 0),
    pendingWorkers: Number(pendingWorkers?.count ?? 0),
    totalBookings: Number(totalBookings?.count ?? 0),
    bookingsToday: Number(bookingsToday?.count ?? 0),
    activeSubscriptions: Number(activeSubs?.count ?? 0),
    revenueThisMonth: Number(monthRevenue[0]?.total ?? 0),
    bookingsByStatus,
    totalUsers: Number(totalUsersResult?.count ?? 0),
    recentBookings: recentBookingsRaw.map((b) => ({
      id: b.id,
      userName: b.userName ?? null,
      serviceName: b.serviceName ?? null,
      workerName: b.workerName ?? null,
      scheduledDate: b.scheduledDate.toISOString(),
      status: b.status,
      totalPrice: b.totalPrice,
      createdAt: b.createdAt.toISOString(),
    })),
    recentUsers: recentUsersRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
    })),
    topWorkers: topWorkersRaw.map((w) => ({
      id: w.id,
      name: w.name,
      photoUrl: w.photoUrl ?? null,
      rating: w.rating ?? null,
      completedBookings: w.completedBookings,
      totalReviews: w.totalReviews,
    })),
  });
});

// Admin: all bookings
router.get("/dashboard/admin/bookings", requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const { limit, offset } = parsePagination(req.query as Record<string, unknown>);

  const conditions = [];
  if (status && typeof status === "string") {
    conditions.push(eq(bookingsTable.status, status as any));
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(bookingsTable.createdAt));

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const built = await Promise.all(bookings.map(buildBookingResponse));
  return res.json({ bookings: built, total: Number(total[0]?.count ?? 0) });
});

// Admin: all workers
router.get("/dashboard/admin/workers", requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const { limit, offset } = parsePagination(req.query as Record<string, unknown>);

  const conditions = [];
  if (status && typeof status === "string") {
    conditions.push(eq(workersTable.status, status as any));
  }

  const workers = await db
    .select()
    .from(workersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(workersTable.createdAt));

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

// Admin: update worker info (name, bio, phone, photo, services)
router.patch("/dashboard/admin/workers/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const name = cleanText(req.body?.name, 120);
  if (!name || name.length < 2) {
    return res.status(400).json({ error: "bad_request", message: "Name must be between 2 and 120 characters" });
  }
  const bio = cleanText(req.body?.bio, 1000);
  const phone = cleanPhone(req.body?.phone);
  if (req.body?.phone && phone === null) {
    return res.status(400).json({ error: "bad_request", message: "Phone number is not valid" });
  }
  const photoUrl = cleanPhotoUrl(req.body?.photoUrl);
  if (req.body?.photoUrl && photoUrl === null) {
    return res.status(400).json({ error: "bad_request", message: "Photo URL must be an http(s) URL or a local path" });
  }
  const serviceIds = cleanServiceIds(req.body?.serviceIds);
  if (!(await servicesExist(serviceIds))) {
    return res.status(400).json({ error: "bad_request", message: "One or more services do not exist" });
  }

  const [worker] = await db
    .update(workersTable)
    .set({ name, bio, phone, photoUrl })
    .where(eq(workersTable.id, id))
    .returning();

  if (!worker) return res.status(404).json({ error: "not_found", message: "Worker not found" });

  await db.delete(workerServicesTable).where(eq(workerServicesTable.workerId, id));
  if (serviceIds.length > 0) {
    await db.insert(workerServicesTable).values(
      serviceIds.map((sid) => ({ workerId: worker.id, serviceId: sid }))
    ).onConflictDoNothing();
  }

  const updatedServiceIds: number[] = serviceIds;
  const services =
    updatedServiceIds.length > 0
      ? await db.select().from(servicesTable).where(inArray(servicesTable.id, updatedServiceIds))
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

// Admin: list all users
router.get("/dashboard/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const { limit, offset } = parsePagination(req.query as Record<string, unknown>, 50, 100);

  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const total = Number(totalResult[0]?.count ?? 0);

  const userIds = users.map((u) => u.id);
  const bookingCounts =
    userIds.length > 0
      ? await db
          .select({ userId: bookingsTable.userId, count: sql<number>`count(*)` })
          .from(bookingsTable)
          .where(inArray(bookingsTable.userId, userIds))
          .groupBy(bookingsTable.userId)
      : [];

  const countMap = new Map(bookingCounts.map((b) => [b.userId, Number(b.count)]));

  return res.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      address: u.address ?? null,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      bookingCount: countMap.get(u.id) ?? 0,
    })),
    total,
  });
});

// Admin: create a worker directly
router.post("/dashboard/admin/workers", requireAuth, requireAdmin, async (req, res) => {
  const name = cleanText(req.body?.name, 120);
  if (!name || name.length < 2) {
    return res.status(400).json({ error: "bad_request", message: "Name must be between 2 and 120 characters" });
  }
  const bio = cleanText(req.body?.bio, 1000);
  const phone = cleanPhone(req.body?.phone);
  if (req.body?.phone && phone === null) {
    return res.status(400).json({ error: "bad_request", message: "Phone number is not valid" });
  }
  const photoUrl = cleanPhotoUrl(req.body?.photoUrl);
  if (req.body?.photoUrl && photoUrl === null) {
    return res.status(400).json({ error: "bad_request", message: "Photo URL must be an http(s) URL or a local path" });
  }
  const serviceIds = cleanServiceIds(req.body?.serviceIds);
  if (!(await servicesExist(serviceIds))) {
    return res.status(400).json({ error: "bad_request", message: "One or more services do not exist" });
  }

  const [worker] = await db
    .insert(workersTable)
    .values({
      name,
      bio,
      phone,
      photoUrl,
      status: "approved",
    })
    .returning();

  if (serviceIds.length > 0) {
    await db.insert(workerServicesTable).values(
      serviceIds.map((sid) => ({ workerId: worker.id, serviceId: sid }))
    ).onConflictDoNothing();
  }

  const services =
    serviceIds.length > 0
      ? await db.select().from(servicesTable).where(inArray(servicesTable.id, serviceIds))
      : [];

  return res.status(201).json({
    id: worker.id,
    name: worker.name,
    bio: worker.bio ?? null,
    phone: worker.phone ?? null,
    photoUrl: worker.photoUrl ?? null,
    rating: null,
    totalReviews: 0,
    completedBookings: 0,
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
