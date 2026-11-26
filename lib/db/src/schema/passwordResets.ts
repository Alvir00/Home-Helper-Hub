import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Password reset links.
 *
 * Replaces the previous in-memory `Map`, which lost every pending reset when the
 * process restarted and disagreed between instances. Only a SHA-256 hash of the
 * token is stored: a leaked database snapshot cannot be used to reset accounts.
 */
export const passwordResetTokensTable = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("IDX_password_reset_expire").on(table.expiresAt),
    index("IDX_password_reset_user").on(table.userId),
  ],
);
