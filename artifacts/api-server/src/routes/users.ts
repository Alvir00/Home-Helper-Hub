import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function userToResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    address: user.address ?? null,
    neighborhood: user.neighborhood ?? null,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
  return res.json(userToResponse(user));
});

router.patch("/users/me", requireAuth, async (req, res) => {
  const { name, phone, address, neighborhood } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (neighborhood !== undefined) updates.neighborhood = neighborhood;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
  return res.json(userToResponse(user));
});

export default router;
