import { Router } from "express";
import { db } from "@workspace/db";
import { subscriptionPlansTable, userSubscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateSubscriptionBody } from "@workspace/api-zod";

const router = Router();

function planToResponse(plan: typeof subscriptionPlansTable.$inferSelect) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    bookingsPerMonth: plan.bookingsPerMonth,
    discountPercent: plan.discountPercent,
    features: plan.features ?? [],
    popular: plan.popular,
  };
}

function subscriptionToResponse(
  sub: typeof userSubscriptionsTable.$inferSelect,
  plan: typeof subscriptionPlansTable.$inferSelect
) {
  return {
    id: sub.id,
    userId: sub.userId,
    plan: planToResponse(plan),
    status: sub.status,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate.toISOString(),
    bookingsUsed: sub.bookingsUsed,
  };
}

router.get("/subscription-plans", async (_req, res) => {
  const plans = await db.select().from(subscriptionPlansTable);
  return res.json(plans.map(planToResponse));
});

router.get("/subscriptions/current", requireAuth, async (req, res) => {
  const [sub] = await db
    .select()
    .from(userSubscriptionsTable)
    .where(
      and(
        eq(userSubscriptionsTable.userId, req.userId!),
        eq(userSubscriptionsTable.status, "active")
      )
    )
    .limit(1);

  if (!sub) return res.status(404).json({ error: "not_found", message: "No active subscription" });

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, sub.planId))
    .limit(1);

  return res.json(subscriptionToResponse(sub, plan));
});

router.post("/subscriptions", requireAuth, async (req, res) => {
  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.id, parsed.data.planId))
    .limit(1);

  if (!plan) return res.status(404).json({ error: "not_found", message: "Plan not found" });

  // Cancel any existing active subscription
  await db
    .update(userSubscriptionsTable)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(userSubscriptionsTable.userId, req.userId!),
        eq(userSubscriptionsTable.status, "active")
      )
    );

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const [sub] = await db
    .insert(userSubscriptionsTable)
    .values({
      userId: req.userId!,
      planId: plan.id,
      status: "active",
      startDate: new Date(),
      endDate,
      bookingsUsed: 0,
    })
    .returning();

  return res.status(201).json(subscriptionToResponse(sub, plan));
});

export default router;
