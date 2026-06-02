import { pgTable, serial, text, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { servicesTable } from "./services";

export const workerStatusEnum = pgEnum("worker_status", ["pending", "approved", "suspended"]);

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
});

export const workerServicesTable = pgTable("worker_services", {
  workerId: integer("worker_id").notNull().references(() => workersTable.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id, { onDelete: "cascade" }),
});

export const insertWorkerSchema = createInsertSchema(workersTable).omit({ id: true, createdAt: true });
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workersTable.$inferSelect;
