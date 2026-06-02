import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function serviceToResponse(s: typeof servicesTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    pricePerHour: s.pricePerHour,
    durationHours: s.durationHours,
    category: s.category,
    iconUrl: s.iconUrl ?? null,
  };
}

router.get("/services", async (_req, res) => {
  const services = await db.select().from(servicesTable);
  return res.json(services.map(serviceToResponse));
});

router.get("/services/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "bad_request", message: "Invalid id" });

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1);
  if (!service) return res.status(404).json({ error: "not_found", message: "Service not found" });

  return res.json(serviceToResponse(service));
});

export default router;
