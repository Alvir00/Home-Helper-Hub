import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMeBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 32;
const MAX_ADDRESS_LENGTH = 500;
const MAX_NEIGHBORHOOD_LENGTH = 120;

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

/** Trim incoming text; empty strings become null so fields can be cleared. */
function normaliseText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

router.get("/users/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
  return res.json(userToResponse(user));
});

router.patch("/users/me", requireAuth, async (req, res) => {
  const parsed = UpdateMeBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { name, phone, address, neighborhood } = parsed.data;
  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (name !== undefined) {
    const normalisedName = name.trim();
    if (normalisedName.length < 2 || normalisedName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: "validation_error", message: `Name must be between 2 and ${MAX_NAME_LENGTH} characters` });
    }
    updates.name = normalisedName;
  }

  if (phone !== undefined) {
    const normalisedPhone = normaliseText(phone);
    if (normalisedPhone !== null) {
      if (normalisedPhone.length > MAX_PHONE_LENGTH || !/^\+?[0-9][0-9\s()-]*$/.test(normalisedPhone)) {
        return res.status(400).json({ error: "validation_error", message: "Phone number is not valid" });
      }
    }
    updates.phone = normalisedPhone;
  }

  if (address !== undefined) {
    const normalisedAddress = normaliseText(address);
    if (normalisedAddress !== null && normalisedAddress.length > MAX_ADDRESS_LENGTH) {
      return res.status(400).json({ error: "validation_error", message: `Address must be at most ${MAX_ADDRESS_LENGTH} characters` });
    }
    updates.address = normalisedAddress;
  }

  if (neighborhood !== undefined) {
    const normalisedNeighborhood = normaliseText(neighborhood);
    if (normalisedNeighborhood !== null && normalisedNeighborhood.length > MAX_NEIGHBORHOOD_LENGTH) {
      return res.status(400).json({ error: "validation_error", message: `Neighborhood must be at most ${MAX_NEIGHBORHOOD_LENGTH} characters` });
    }
    updates.neighborhood = normalisedNeighborhood;
  }

  // Drizzle throws on an empty `set({})`, and a no-op update is meaningless.
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "validation_error", message: "No profile fields to update" });
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
  if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
  return res.json(userToResponse(user));
});

export default router;
