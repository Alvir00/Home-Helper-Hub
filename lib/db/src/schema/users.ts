import { pgTable, serial, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["household", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  replitId: text("replit_id").unique(),
  phone: text("phone"),
  address: text("address"),
  neighborhood: text("neighborhood"),
  role: userRoleEnum("role").notNull().default("household"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  // Login looks accounts up case-insensitively; without this the query is a
  // sequential scan once the user table grows.
  index("IDX_users_email_lower").on(sql`lower(${table.email})`),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
