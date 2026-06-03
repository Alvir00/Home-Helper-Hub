import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
const router = Router();

const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

interface ResetEntry {
  userId: number;
  expiresAt: number;
}

export const resetTokenStore = new Map<string, ResetEntry>();

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

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
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

  if (!user) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  const token = generateToken(user.id);
  tokenStore.set(token, user.id);

  return res.json({ token, user: userToResponse(user) });
});

router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "validation_error", message: "A valid email address is required" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user) {
    return res.json({ message: "If an account with that email exists, a reset link has been sent." });
  }

  const resetToken = randomBytes(32).toString("hex");
  resetTokenStore.set(resetToken, {
    userId: user.id,
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
  });

  return res.json({
    message: "If an account with that email exists, a reset link has been sent.",
    ...(process.env.NODE_ENV !== "production" ? { resetToken } : {}),
  });
});

router.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body ?? {};
  if (typeof token !== "string" || !token) {
    return res.status(400).json({ error: "validation_error", message: "Reset token is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
  }
  const entry = resetTokenStore.get(token);

  if (!entry) {
    return res.status(400).json({ error: "invalid_token", message: "This reset link is invalid or has already been used." });
  }

  if (Date.now() > entry.expiresAt) {
    resetTokenStore.delete(token);
    return res.status(400).json({ error: "token_expired", message: "This reset link has expired. Please request a new one." });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, entry.userId));

  resetTokenStore.delete(token);

  return res.json({ message: "Password updated successfully. You can now log in with your new password." });
});

export default router;
