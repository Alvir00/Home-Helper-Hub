import { Router } from "express";
import { db } from "@workspace/db";
import {
  bookingsTable,
  reviewsTable,
  workersTable,
  servicesTable,
  workerServicesTable,
  usersTable,
} from "@workspace/db";
import { eq, and, inArray, sql, gte, lte, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateBookingBody, UpdateBookingStatusBody, ReviewBookingBody } from "@workspace/api-zod";
import { rateLimit } from "../lib/rateLimit";
import { parsePagination } from "../lib/pagination";
import {
  buildBookingCancelledEmail,
  buildBookingConfirmationEmail,
  buildBookingReceivedEmail,
  buildOperatorBookingEmail,
  sendMail,
} from "../lib/mailer";
import {
  ACTIVE_BOOKING_STATUSES,
  OVERLAP_SCAN_WINDOW_MS,
  SCHEDULED_DATE_SKEW_MS,
  allowedTransitions,
  bookingEndMs,
  canTransition,
  householdMaySet,
  intervalsOverlap,
  type BookingStatusValue,
} from "../lib/bookingPolicy";

const router = Router();

const MAX_ADDRESS_LENGTH = 500;
const MAX_NOTES_LENGTH = 1000;
const MAX_REVIEW_LENGTH = 2000;

/** A household can create at most 20 bookings per hour. */
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyPrefix: "booking",
  keyGenerator: (req) => String(req.userId ?? req.ip ?? "anonymous"),
  message: "Too many booking attempts. Please try again later.",
});

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

router.get("/bookings", requireAuth, async (req, res) => {
  const { status } = req.query;
  const { limit, offset } = parsePagination(req.query as Record<string, unknown>);

  const conditions = [eq(bookingsTable.userId, req.userId!)];
  if (status && typeof status === "string") {
    conditions.push(eq(bookingsTable.status, status as any));
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(bookingsTable.createdAt));

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(and(...conditions));

  const built = await Promise.all(bookings.map(buildBookingResponse));
  return res.json({ bookings: built, total: Number(total[0]?.count ?? 0) });
});

router.post("/bookings", requireAuth, bookingLimiter, async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { workerId, serviceId, scheduledDate, address, notes } = parsed.data;

  const trimmedAddress = address.trim();
  if (trimmedAddress.length < 5 || trimmedAddress.length > MAX_ADDRESS_LENGTH) {
    return res.status(400).json({ error: "validation_error", message: `Address must be between 5 and ${MAX_ADDRESS_LENGTH} characters` });
  }
  const trimmedNotes = notes?.trim() ?? "";
  if (trimmedNotes.length > MAX_NOTES_LENGTH) {
    return res.status(400).json({ error: "validation_error", message: `Notes must be at most ${MAX_NOTES_LENGTH} characters` });
  }
  if (scheduledDate.getTime() < Date.now() - SCHEDULED_DATE_SKEW_MS) {
    return res.status(400).json({ error: "invalid_scheduled_date", message: "Scheduled date must be in the future" });
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId)).limit(1);
  if (!service) return res.status(404).json({ error: "not_found", message: "Service not found" });

  const [worker] = await db.select().from(workersTable).where(eq(workersTable.id, workerId)).limit(1);
  if (!worker || worker.status !== "approved") {
    return res.status(400).json({ error: "worker_unavailable", message: "Worker not available" });
  }

  // A worker can only be booked for work they actually offer.
  const [offering] = await db
    .select({ workerId: workerServicesTable.workerId })
    .from(workerServicesTable)
    .where(and(eq(workerServicesTable.workerId, workerId), eq(workerServicesTable.serviceId, serviceId)))
    .limit(1);
  if (!offering) {
    return res.status(400).json({ error: "worker_service_mismatch", message: "This worker does not offer the selected service" });
  }

  // Reject overlapping slots so a worker cannot be double-booked.
  const requestedStart = scheduledDate.getTime();
  const requestedEnd = bookingEndMs(scheduledDate, service.durationHours);
  const nearby = await db
    .select({ id: bookingsTable.id, serviceId: bookingsTable.serviceId, scheduledDate: bookingsTable.scheduledDate })
    .from(bookingsTable)
    .where(and(
      eq(bookingsTable.workerId, workerId),
      inArray(bookingsTable.status, ACTIVE_BOOKING_STATUSES),
      gte(bookingsTable.scheduledDate, new Date(requestedStart - OVERLAP_SCAN_WINDOW_MS)),
      lte(bookingsTable.scheduledDate, new Date(requestedEnd + OVERLAP_SCAN_WINDOW_MS)),
    ));

  if (nearby.length > 0) {
    const nearbyServiceIds = [...new Set(nearby.map((b) => b.serviceId))];
    const nearbyServices = await db
      .select({ id: servicesTable.id, durationHours: servicesTable.durationHours })
      .from(servicesTable)
      .where(inArray(servicesTable.id, nearbyServiceIds));
    const durationById = new Map<number, number>(
      nearbyServices.map((s): [number, number] => [s.id, s.durationHours]),
    );

    const conflict = nearby.find((b) =>
      intervalsOverlap(
        requestedStart,
        requestedEnd,
        b.scheduledDate.getTime(),
        bookingEndMs(b.scheduledDate, durationById.get(b.serviceId) ?? 0),
      ),
    );
    if (conflict) {
      return res.status(409).json({ error: "slot_unavailable", message: "This worker is already booked for that time. Please choose another slot." });
    }
  }

  const totalPrice = service.pricePerHour * service.durationHours;

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      userId: req.userId!,
      workerId,
      serviceId,
      scheduledDate: new Date(scheduledDate),
      address: trimmedAddress,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
      status: "pending",
      totalPrice,
    })
    .returning();

  // Confirmation emails are best-effort: a mail outage must never fail a
  // booking that has already been written to the database.
  const appUrl = (process.env["APP_URL"] ?? "").replace(/\/+$/, "");
  const emailDetails = {
    customerName: req.user?.name ?? "there",
    workerName: worker.name,
    serviceName: service.name,
    scheduledDate: new Date(scheduledDate),
    address: trimmedAddress,
    totalPrice,
    bookingId: booking.id,
    appUrl,
  };

  if (req.user?.email) {
    void sendMail({
      to: req.user.email,
      ...buildBookingReceivedEmail(emailDetails),
    });
  }

  const operatorEmail = process.env["BOOKING_NOTIFY_EMAIL"];
  if (operatorEmail) {
    void sendMail({
      to: operatorEmail,
      ...buildOperatorBookingEmail({
        ...emailDetails,
        customerPhone: req.user?.phone ?? null,
      }),
    });
  }

  return res.status(201).json(await buildBookingResponse(booking));
});

router.get("/bookings/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  const [requester] = await db.select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  if (booking.userId !== req.userId && requester?.role !== "admin") {
    return res.status(403).json({ error: "forbidden", message: "Access denied" });
  }

  return res.json(await buildBookingResponse(booking));
});

router.patch("/bookings/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!existing) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  const [requester] = await db.select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  const isAdmin = requester?.role === "admin";
  if (existing.userId !== req.userId && !isAdmin) {
    return res.status(403).json({ error: "forbidden", message: "Access denied" });
  }

  const nextStatus = parsed.data.status as BookingStatusValue;

  // Households may only cancel; confirming, starting, and completing a job are
  // operational decisions that must come from an administrator.
  if (!isAdmin && !householdMaySet(nextStatus)) {
    return res.status(403).json({ error: "admin_required", message: "Only an administrator can set this booking status" });
  }

  if (nextStatus === existing.status) {
    return res.json(await buildBookingResponse(existing));
  }

  if (!canTransition(existing.status, nextStatus, isAdmin)) {
    return res.status(409).json({
      error: "invalid_transition",
      message: `A ${existing.status} booking cannot be moved to ${nextStatus}`,
      allowedStatuses: allowedTransitions(existing.status, isAdmin),
    });
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ status: nextStatus as any })
    .where(eq(bookingsTable.id, id))
    .returning();

  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  if (nextStatus === "completed") {
    await db
      .update(workersTable)
      .set({ completedBookings: sql`${workersTable.completedBookings} + 1` })
      .where(eq(workersTable.id, booking.workerId));
  }

  const response = await buildBookingResponse(booking);

  // Confirmation and cancellation are the two moments the customer needs mail.
  if (nextStatus === "confirmed" || nextStatus === "cancelled") {
    const [customer] = await db
      .select({ email: usersTable.email, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, booking.userId))
      .limit(1);

    if (customer?.email && response.service) {
      const appUrl = (process.env["APP_URL"] ?? "").replace(/\/+$/, "");
      const details = {
        customerName: customer.name,
        workerName: response.worker?.name ?? "your helper",
        serviceName: response.service.name,
        scheduledDate: new Date(response.scheduledDate),
        address: response.address,
        totalPrice: response.totalPrice,
        bookingId: response.id,
        appUrl,
      };

      void sendMail({
        to: customer.email,
        ...(nextStatus === "confirmed"
          ? buildBookingConfirmationEmail(details)
          : buildBookingCancelledEmail(details)),
      });
    }
  }

  return res.json(response);
});

router.post("/bookings/:id/review", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
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

  const comment = parsed.data.comment?.trim() ?? null;
  if (comment !== null && comment.length > MAX_REVIEW_LENGTH) {
    return res.status(400).json({
      error: "validation_error",
      message: `Review must be at most ${MAX_REVIEW_LENGTH} characters`,
    });
  }

  // `reviews.booking_id` is unique; check first so a second review is a clear
  // 409 instead of a raw constraint violation surfacing as a 500.
  const [existingReview] = await db
    .select({ id: reviewsTable.id })
    .from(reviewsTable)
    .where(eq(reviewsTable.bookingId, id))
    .limit(1);
  if (existingReview) {
    return res.status(409).json({ error: "review_exists", message: "This booking already has a review" });
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ bookingId: id, rating: parsed.data.rating, comment })
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
