import { pgTable, serial, text, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceCategoryEnum = pgEnum("service_category", ["cleaning", "laundry", "combined"]);

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pricePerHour: real("price_per_hour").notNull(),
  durationHours: real("duration_hours").notNull(),
  category: serviceCategoryEnum("category").notNull(),
  iconUrl: text("icon_url"),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
