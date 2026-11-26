import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Authentication state is resolved once, by `authMiddleware`, from either the
 * `sid` cookie or a `Bearer <sid>` header — both point at a row in the
 * `sessions` table. These guards only inspect the result, so they stay
 * independent of the transport and of how the session was created.
 */

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.userId) {
    next();
    return;
  }

  res.status(401).json({ error: "unauthorized", message: "Sign-in required" });
}

/**
 * Admin check reads the role from the database instead of trusting the copy
 * cached in the session. A demoted administrator therefore loses access
 * immediately rather than keeping it until their 7-day session expires.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: "unauthorized", message: "Sign-in required" });
    return;
  }

  const [user] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId))
    .limit(1);

  if (user?.role !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }

  req.userRole = "admin";
  next();
}

/**
 * Public endpoints that personalise their output. Kept for parity with the
 * other guards: `authMiddleware` has already populated `req.userId` when a
 * valid session is present, so there is nothing else to resolve.
 */
export function optionalAuth(_req: Request, _res: Response, next: NextFunction): void {
  next();
}
