import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

/**
 * Standalone migration runner, bundled into the runtime image as
 * `api/migrate.mjs`. Keeping it out of the server process means migrations are
 * an explicit deploy step: a bad migration fails the deploy instead of starting
 * a server against a half-updated schema.
 *
 * MIGRATIONS_DIR defaults to `<cwd>/drizzle` for local `pnpm migrate` runs; the
 * Docker image points it at the copied SQL folder.
 */
const migrationsFolder =
  process.env["MIGRATIONS_DIR"] ?? path.resolve(process.cwd(), "drizzle");

async function run(): Promise<void> {
  console.log(`Applying migrations from ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  await pool.end();
  console.log("Migrations applied.");
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
