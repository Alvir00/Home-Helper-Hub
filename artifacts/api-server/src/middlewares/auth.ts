import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { tokenStore } from "../routes/auth";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid token" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = tokenStore.get(token);

  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
    return;
  }

  const [user] = await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "User not found" });
    return;
  }

  req.userId = user.id;
  req.userRole = user.role;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Admin access required" });
    return;
  }
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = tokenStore.get(token);
    if (userId) {
      req.userId = userId;
    }
  }
  next();
}
