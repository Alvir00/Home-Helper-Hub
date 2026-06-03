import { db } from "./index";
import {
  usersTable,
  servicesTable,
  workersTable,
  workerServicesTable,
  subscriptionPlansTable,
} from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

async function seed() {
  console.log("Seeding database...");

  const services = [
    { name: "Home Cleaning", description: "Full home deep cleaning service — floors, bathrooms, kitchen, and living areas", pricePerHour: 150, durationHours: 3, category: "cleaning" },
    { name: "Kitchen Cleaning", description: "Thorough kitchen cleaning including stovetop, sink, cabinets, and appliances", pricePerHour: 100, durationHours: 2, category: "cleaning" },
    { name: "Laundry & Ironing", description: "Wash, dry, fold, and iron your clothes with care", pricePerHour: 80, durationHours: 2, category: "laundry" },
    { name: "Combined Home & Laundry", description: "Complete home cleaning plus laundry — our most popular package", pricePerHour: 200, durationHours: 4, category: "combined" },
    { name: "Bedroom Deep Clean", description: "Deep cleaning of bedrooms including dusting, vacuuming, and linen change", pricePerHour: 120, durationHours: 2.5, category: "cleaning" },
  ] as const;

  const insertedServices: Array<{ id: number; name: string }> = [];
  for (const svc of services) {
    const existing = await db.select({ id: servicesTable.id, name: servicesTable.name })
      .from(servicesTable).where(eq(servicesTable.name, svc.name)).limit(1);
    if (existing.length > 0) {
      insertedServices.push(existing[0]);
    } else {
      const [s] = await db.insert(servicesTable).values(svc).returning({ id: servicesTable.id, name: servicesTable.name });
      insertedServices.push(s);
    }
  }
  console.log(`  Services: ${insertedServices.length} ready`);

  const workerDefs = [
    { name: "Tigist Haile", bio: "Experienced home cleaner with 5 years of service in Addis Ababa. Known for attention to detail and reliability.", phone: "+251911234567", photoUrl: "/worker-1.png", rating: 4.9, totalReviews: 47, completedBookings: 52, status: "approved" as const, services: ["Home Cleaning", "Kitchen Cleaning", "Combined Home & Laundry"] },
    { name: "Mekdes Tadesse", bio: "Professional cleaner specializing in deep cleaning and laundry. Fast, thorough, and always on time.", phone: "+251922345678", photoUrl: "/worker-2.png", rating: 4.7, totalReviews: 38, completedBookings: 41, status: "approved" as const, services: ["Home Cleaning", "Laundry & Ironing", "Combined Home & Laundry"] },
    { name: "Selamawit Girma", bio: "Dedicated home helper with expertise in combined cleaning and laundry packages.", phone: "+251933456789", photoUrl: "/worker-3.png", rating: 4.8, totalReviews: 29, completedBookings: 33, status: "approved" as const, services: ["Combined Home & Laundry", "Bedroom Deep Clean"] },
    { name: "Hiwot Bekele", bio: "Friendly and professional cleaner. Specializes in kitchen deep cleaning and bedroom organization.", phone: "+251944567890", photoUrl: "/worker-4.png", rating: 4.6, totalReviews: 22, completedBookings: 25, status: "approved" as const, services: ["Home Cleaning", "Kitchen Cleaning", "Bedroom Deep Clean"] },
    { name: "Birtukan Alemu", bio: "Hardworking and detail-oriented. Excellent at laundry and ironing services.", phone: "+251955678901", photoUrl: "/worker-5.png", rating: 4.5, totalReviews: 15, completedBookings: 18, status: "approved" as const, services: ["Laundry & Ironing"] },
  ];

  for (const w of workerDefs) {
    const existing = await db.select({ id: workersTable.id })
      .from(workersTable).where(eq(workersTable.name, w.name)).limit(1);

    let workerId: number;
    if (existing.length > 0) {
      workerId = existing[0].id;
      await db.update(workersTable).set({
        photoUrl: w.photoUrl,
        bio: w.bio,
        rating: w.rating,
        totalReviews: w.totalReviews,
        completedBookings: w.completedBookings,
        status: w.status,
      }).where(eq(workersTable.id, workerId));
    } else {
      const [inserted] = await db.insert(workersTable).values({
        name: w.name,
        bio: w.bio,
        phone: w.phone,
        photoUrl: w.photoUrl,
        rating: w.rating,
        totalReviews: w.totalReviews,
        completedBookings: w.completedBookings,
        status: w.status,
      }).returning({ id: workersTable.id });
      workerId = inserted.id;
    }

    for (const svcName of w.services) {
      const svc = insertedServices.find((s) => s.name === svcName);
      if (!svc) continue;
      const existingLink = await db.select()
        .from(workerServicesTable)
        .where(eq(workerServicesTable.workerId, workerId))
        .limit(1);
      if (existingLink.length === 0) {
        await db.insert(workerServicesTable).values({ workerId, serviceId: svc.id }).onConflictDoNothing();
      } else {
        await db.insert(workerServicesTable).values({ workerId, serviceId: svc.id }).onConflictDoNothing();
      }
    }
  }
  console.log(`  Workers: ${workerDefs.length} ready`);

  const plans = [
    { name: "Basic", description: "Perfect for occasional cleaning needs", priceMonthly: 499, bookingsPerMonth: 2, discountPercent: 10, features: ["2 bookings per month", "10% discount on all bookings", "Priority support", "Free cancellation"], popular: false },
    { name: "Standard", description: "Our most popular plan for busy households", priceMonthly: 899, bookingsPerMonth: 4, discountPercent: 20, features: ["4 bookings per month", "20% discount on all bookings", "Priority support", "Free cancellation", "Same-day booking"], popular: true },
    { name: "Premium", description: "Complete home care — unlimited peace of mind", priceMonthly: 1499, bookingsPerMonth: 8, discountPercent: 30, features: ["8 bookings per month", "30% discount on all bookings", "Priority support", "Free cancellation", "Same-day booking", "Dedicated worker assignment", "24/7 support"], popular: false },
  ];

  for (const plan of plans) {
    const existing = await db.select({ id: subscriptionPlansTable.id })
      .from(subscriptionPlansTable).where(eq(subscriptionPlansTable.name, plan.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(subscriptionPlansTable).values(plan);
    }
  }
  console.log(`  Subscription plans: ${plans.length} ready`);

  const adminEmail = "admin@meraki.et";
  const existingAdmin = await db.select({ id: usersTable.id })
    .from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", BCRYPT_ROUNDS);
    await db.insert(usersTable).values({
      name: "Meraki Admin",
      email: adminEmail,
      passwordHash,
      phone: "+251911000001",
      address: "Bole, Addis Ababa",
      role: "admin",
    });
    console.log("  Admin user created: admin@meraki.et / admin123");
  } else {
    console.log("  Admin user already exists");
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
