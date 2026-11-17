import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { passwordResetTokensTable, usersTable } from "@workspace/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { rateLimit, emailKey } from "../lib/rateLimit";
import { clearSession, createSession, getSessionId, setSessionCookie } from "../lib/auth";
import { buildPasswordResetEmail, sendMail } from "../lib/mailer";
import { logger } from "../lib/logger";
const router = Router();

const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Compared against when no usable hash exists, so that a login for an unknown
 * email costs the same as one for a known email. Without it, response timing
 * reveals which addresses are registered.
 */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  randomBytes(16).toString("hex"),
  BCRYPT_ROUNDS,
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "login",
  keyGenerator: emailKey,
  message: "Too many login attempts. Please try again in a few minutes.",
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: "register",
  message: "Too many accounts created from this address. Please try again later.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: "forgot-password",
  message: "Too many reset requests. Please try again later.",
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: "reset-password",
  message: "Too many reset attempts. Please try again later.",
});

/** Emails are stored as typed, but must match case-insensitively. */
function findByEmail(email: string) {
  return db
    .select()
    .from(usersTable)
    .where(sql`lower(${usersTable.email}) = ${email.trim().toLowerCase()}`)
    .limit(1);
}

/** Reset tokens are stored as digests, never in the clear. */
function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Public base URL used in reset links; APP_URL wins, otherwise derive it. */
function resolveAppUrl(req: Request): string {
  const configured = process.env["APP_URL"];
  if (configured) return configured.replace(/\/+$/, "");

  const proto = String(req.headers["x-forwarded-proto"] ?? req.protocol ?? "http");
  const host = String(req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "localhost");
  return `${proto}://${host}`;
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

/**
 * The payload the SPA reads from `/api/auth/user`. Password accounts have no
 * OIDC identity, so the DB row fills every field; `id` is stringified because
 * the contract models it as the OIDC subject.
 */
function toSessionUser(user: typeof usersTable.$inferSelect) {
  return {
    id: String(user.id),
    email: user.email,
    firstName: null,
    lastName: null,
    profileImageUrl: null,
    role: user.role,
    dbId: user.id,
    name: user.name,
    phone: user.phone ?? null,
    address: user.address ?? null,
    neighborhood: user.neighborhood ?? null,
  };
}

/**
 * Persists the session in Postgres and sets the cookie the browser (and the
 * SPA) will use. Returns the sid, which doubles as the bearer token for the
 * Expo app — `getSessionId` accepts either transport.
 */
async function startSession(
  req: Request,
  res: Response,
  user: typeof usersTable.$inferSelect,
): Promise<string> {
  const sid = await createSession({
    user: toSessionUser(user),
    dbUserId: user.id,
    dbUserRole: user.role,
  });
  setSessionCookie(req, res, sid);
  return sid;
}

router.post("/auth/register", registerLimiter, async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { name, email, password, phone, address } = parsed.data;
  const normalisedEmail = email.trim().toLowerCase();

  const existing = await findByEmail(normalisedEmail);
  if (existing.length > 0) {
    return res.status(400).json({ error: "email_taken", message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [user] = await db.insert(usersTable).values({
    name: name.trim(),
    email: normalisedEmail,
    passwordHash,
    phone: phone ?? null,
    address: address ?? null,
    role: "household",
  }).returning();

  // Session lives in Postgres, so it survives restarts and works across
  // instances; the SPA authenticates with the cookie, the app with the sid.
  const token = await startSession(req, res, user);

  return res.status(201).json({ token, user: userToResponse(user) });
});

router.post("/auth/login", loginLimiter, async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { email, password } = parsed.data;
  const [user] = await findByEmail(email);

  // Always run a bcrypt comparison, even for unknown emails or accounts that
  // only ever signed in through OIDC (null passwordHash), so timing and the
  // response body are identical in every failure case.
  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatch = await bcrypt.compare(password, passwordHash);

  if (!user || !user.passwordHash || !passwordMatch) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  const token = await startSession(req, res, user);

  return res.json({ token, user: userToResponse(user) });
});

router.post("/auth/logout", async (req, res) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  return res.json({ message: "Signed out" });
});

router.post("/auth/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body ?? {};
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "validation_error", message: "A valid email address is required" });
  }
  const [user] = await findByEmail(email);

  if (!user) {
    return res.json({ message: "If an account with that email exists, a reset link has been sent." });
  }

  // Only the hash is stored, and only the newest link is valid: requesting a
  // second reset invalidates the first.
  const resetToken = randomBytes(32).toString("hex");
  await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, user.id));
  await db.insert(passwordResetTokensTable).values({
    userId: user.id,
    tokenHash: hashResetToken(resetToken),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const resetUrl = `${resolveAppUrl(req)}/reset-password/${resetToken}`;
  const { delivered } = await sendMail({
    to: user.email,
    ...buildPasswordResetEmail(resetUrl, user.name),
  });

  const isProduction = process.env.NODE_ENV === "production";

  // Without a mail transport there is no way to hand the link over, so log it —
  // but never in production, where logs are not a private channel.
  if (!delivered && !isProduction) {
    logger.warn({ resetUrl }, "Password reset link (no mail transport configured)");
  }

  return res.json({
    message: "If an account with that email exists, a reset link has been sent.",
    ...(isProduction ? {} : { resetToken }),
  });
});

router.post("/auth/reset-password", resetPasswordLimiter, async (req, res) => {
  const { token, password } = req.body ?? {};
  if (typeof token !== "string" || !token.trim()) {
    return res.status(400).json({ error: "validation_error", message: "Reset token is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
  }

  const tokenHash = hashResetToken(token.trim());
  const [record] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(and(eq(passwordResetTokensTable.tokenHash, tokenHash), isNull(passwordResetTokensTable.usedAt)))
    .limit(1);

  if (!record) {
    return res.status(400).json({ error: "invalid_token", message: "This reset link is invalid or has already been used." });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.id, record.id));
    return res.status(400).json({ error: "token_expired", message: "This reset link has expired. Please request a new one." });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, record.userId));

  // Single use: drop every outstanding link for the account.
  await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, record.userId));

  return res.json({ message: "Password updated successfully. You can now log in with your new password." });
});

export default router;
