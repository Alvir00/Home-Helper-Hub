import { pgTable, serial, integer, text, timestamp, real, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { workersTable } from "./workers";
import { servicesTable } from "./services";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

/**
 * Payment state for a booking. Even when money changes hands in cash or via
 * Telebirr outside the app, the admin console needs to record whether the job
 * was paid so revenue can be reconciled.
 */
export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "refunded",
]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  workerId: integer("worker_id").notNull().references(() => workersTable.id),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  totalPrice: real("total_price").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_bookings_user_created").on(table.userId, table.createdAt),
  index("IDX_bookings_worker_date").on(table.workerId, table.scheduledDate),
  index("IDX_bookings_status").on(table.status),
  index("IDX_bookings_created").on(table.createdAt),
]);

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookingsTable.id, { onDelete: "cascade" }).unique(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
export type Review = typeof reviewsTable.$inferSelect;
