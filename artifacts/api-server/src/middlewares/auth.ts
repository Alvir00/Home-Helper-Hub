import type { Request, Response, NextFunction } from "express";

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

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }
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
