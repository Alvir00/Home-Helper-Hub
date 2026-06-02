import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHmac, randomBytes } from "crypto";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

function hashPassword(password: string): string {
  const salt = "meraki_salt_2024";
  return createHmac("sha256", salt).update(password).digest("hex");
}

function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${randomBytes(16).toString("hex")}`;
  return Buffer.from(payload).toString("base64");
}

function userToResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    address: user.address ?? null,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

// Simple in-memory token store (production would use Redis/DB)
export const tokenStore = new Map<string, number>();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { name, email, password, phone, address } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "email_taken", message: "Email already registered" });
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    phone: phone ?? null,
    address: address ?? null,
    role: "household",
  }).returning();

  const token = generateToken(user.id);
  tokenStore.set(token, user.id);

  return res.status(201).json({ token, user: userToResponse(user) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  const token = generateToken(user.id);
  tokenStore.set(token, user.id);

  return res.json({ token, user: userToResponse(user) });
});

export default router;
