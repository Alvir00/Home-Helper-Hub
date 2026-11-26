import { pgTable, serial, text, real, integer, timestamp, pgEnum, primaryKey, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { servicesTable } from "./services";

export const workerStatusEnum = pgEnum("worker_status", ["pending", "approved", "suspended"]);

export const workerApplicationStatusEnum = pgEnum("worker_application_status", [
  "pending",
  "approved",
  "rejected",
]);

export const workersTable = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  rating: real("rating"),
  totalReviews: integer("total_reviews").notNull().default(0),
  completedBookings: integer("completed_bookings").notNull().default(0),
  status: workerStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_workers_status").on(table.status),
  index("IDX_workers_rating").on(table.rating),
]);

export const workerServicesTable = pgTable("worker_services", {
  workerId: integer("worker_id").notNull().references(() => workersTable.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id, { onDelete: "cascade" }),
}, (table) => [
  // Prevents duplicate links, which would otherwise inflate a worker's service
  // list and make "offers this service" checks ambiguous.
  primaryKey({ columns: [table.workerId, table.serviceId] }),
  index("IDX_worker_services_service").on(table.serviceId),
]);

/**
 * Public applications from prospective helpers. Approving one creates a row in
 * `workers` and links the chosen services; the application is kept for audit.
 */
export const workerApplicationsTable = pgTable("worker_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  neighborhood: text("neighborhood"),
  bio: text("bio"),
  serviceIds: jsonb("service_ids").$type<number[]>().notNull().default([]),
  status: workerApplicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => [
  index("IDX_worker_applications_status").on(table.status, table.createdAt),
]);

export const insertWorkerSchema = createInsertSchema(workersTable).omit({ id: true, createdAt: true });
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workersTable.$inferSelect;
