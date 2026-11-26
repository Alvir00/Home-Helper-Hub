import { db } from "./index";
import {
  usersTable,
  servicesTable,
  workersTable,
  workerServicesTable,
  subscriptionPlansTable,
  bookingsTable,
  reviewsTable,
} from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

// Realistic demo reviews so helper profiles show genuine social proof.
const REVIEW_COMMENTS: Record<string, Array<{ rating: number; text: string }>> = {
  "Tigist Haile": [
    { rating: 5, text: "Tigist arrived on time and left our apartment spotless. We've booked her every two weeks since." },
    { rating: 5, text: "Incredible attention to detail — the kitchen has never looked better. Highly recommend." },
    { rating: 4, text: "Very thorough and professional. Took a little longer than expected but the result was worth it." },
  ],
  "Mekdes Tadesse": [
    { rating: 5, text: "Fast, thorough and always on time. My laundry comes back perfectly folded every visit." },
    { rating: 4, text: "Great deep clean before our guests arrived. Would book again." },
    { rating: 5, text: "Mekdes is reliable and friendly. The combined package is excellent value." },
  ],
  "Selamawit Girma": [
    { rating: 5, text: "Selamawit worked quietly and efficiently. The bedroom deep clean was exactly what we needed." },
    { rating: 5, text: "Our go-to helper for the combined home + laundry package. Never disappointed." },
    { rating: 4, text: "Very good service and easy to schedule. Recommended for busy households." },
  ],
  "Hiwot Bekele": [
    { rating: 5, text: "Hiwot transformed our kitchen — stovetop and cabinets look brand new." },
    { rating: 4, text: "Friendly and professional. Great at organizing bedrooms too." },
    { rating: 5, text: "Punctual, careful with our things, and a lovely person. Five stars." },
  ],
  "Birtukan Alemu": [
    { rating: 5, text: "The ironing is immaculate. Birtukan treats every garment with care." },
    { rating: 4, text: "Reliable laundry service, fair price, and always on schedule." },
    { rating: 4, text: "Hardworking and detail-oriented. Our clothes have never looked better." },
  ],
};

async function seed() {
  console.log("Seeding database...");

  const isProduction = process.env.NODE_ENV === "production";
  const seedDemo = !isProduction || process.env.SEED_DEMO_DATA === "1";

  const services = [
    { name: "Home Cleaning", description: "Full home deep cleaning service — floors, bathrooms, kitchen, and living areas", pricePerHour: 150, durationHours: 3, category: "cleaning" as const },
    { name: "Kitchen Cleaning", description: "Thorough kitchen cleaning including stovetop, sink, cabinets, and appliances", pricePerHour: 100, durationHours: 2, category: "cleaning" as const },
    { name: "Laundry & Ironing", description: "Wash, dry, fold, and iron your clothes with care", pricePerHour: 80, durationHours: 2, category: "laundry" as const },
    { name: "Combined Home & Laundry", description: "Complete home cleaning plus laundry — our most popular package", pricePerHour: 200, durationHours: 4, category: "combined" as const },
    { name: "Bedroom Deep Clean", description: "Deep clean for bedrooms including dusting, vacuuming, and linen change", pricePerHour: 120, durationHours: 2, category: "cleaning" as const },
  ];

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

  if (seedDemo) {
    // Demo customers so seeded bookings/reviews have a real author.
    const customerDefs = [
      { name: "Yohannes T.", email: "yohannes@meraki.et" },
      { name: "Rahel A.", email: "rahel@meraki.et" },
      { name: "Dawit M.", email: "dawit@meraki.et" },
    ];
    const customers: Array<{ id: number }> = [];
    for (const c of customerDefs) {
      const ex = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, c.email)).limit(1);
      if (ex.length > 0) {
        customers.push(ex[0]);
      } else {
        const [u] = await db.insert(usersTable).values({ name: c.name, email: c.email }).returning({ id: usersTable.id });
        customers.push(u);
      }
    }

    const workerDefs = [
      { name: "Tigist Haile", bio: "Experienced home cleaner with 5 years of service in Addis Ababa. Known for attention to detail and reliability.", phone: "+251911234567", photoUrl: "/worker-1.jpg", rating: 4.9, totalReviews: 47, completedBookings: 52, status: "approved" as const, services: ["Home Cleaning", "Kitchen Cleaning", "Combined Home & Laundry"] },
      { name: "Mekdes Tadesse", bio: "Professional cleaner specializing in deep cleaning and laundry. Fast, thorough, and always on time.", phone: "+251922345678", photoUrl: "/worker-2.jpg", rating: 4.7, totalReviews: 38, completedBookings: 41, status: "approved" as const, services: ["Home Cleaning", "Laundry & Ironing", "Combined Home & Laundry"] },
      { name: "Selamawit Girma", bio: "Dedicated home helper with expertise in combined cleaning and laundry packages.", phone: "+251933456789", photoUrl: "/worker-3.jpg", rating: 4.8, totalReviews: 29, completedBookings: 33, status: "approved" as const, services: ["Combined Home & Laundry", "Bedroom Deep Clean"] },
      { name: "Hiwot Bekele", bio: "Friendly and professional cleaner. Specializes in kitchen deep cleaning and bedroom organization.", phone: "+251944567890", photoUrl: "/worker-4.jpg", rating: 4.6, totalReviews: 22, completedBookings: 25, status: "approved" as const, services: ["Home Cleaning", "Kitchen Cleaning", "Bedroom Deep Clean"] },
      { name: "Birtukan Alemu", bio: "Hardworking and detail-oriented. Excellent at laundry and ironing services.", phone: "+251955678901", photoUrl: "/worker-5.jpg", rating: 4.5, totalReviews: 15, completedBookings: 18, status: "approved" as const, services: ["Laundry & Ironing"] },
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
        await db.insert(workerServicesTable).values({ workerId, serviceId: svc.id }).onConflictDoNothing();
      }

      // Seed a few completed bookings + reviews (idempotent: skip if worker already has bookings).
      const existingBookings = await db.select({ id: bookingsTable.id })
        .from(bookingsTable).where(eq(bookingsTable.workerId, workerId)).limit(1);
      if (existingBookings.length === 0) {
        const svc = insertedServices.find((s) => s.name === w.services[0]) ?? insertedServices[0];
        const svcDef = services.find((s) => s.name === svc.name) ?? services[0];
        const comments = REVIEW_COMMENTS[w.name] ?? REVIEW_COMMENTS["Tigist Haile"];
        for (let i = 0; i < comments.length; i++) {
          const customer = customers[i % customers.length];
          const scheduled = new Date(Date.now() - (7 + i * 9) * 86400000);
          const [booking] = await db.insert(bookingsTable).values({
            userId: customer.id,
            workerId,
            serviceId: svc.id,
            scheduledDate: scheduled,
            address: "Bole — Apt 4B",
            notes: "seeded-demo",
            status: "completed",
            totalPrice: svcDef.pricePerHour * svcDef.durationHours,
            paymentStatus: "paid",
            paymentMethod: "cash",
            paidAt: scheduled,
          }).returning({ id: bookingsTable.id });
          await db.insert(reviewsTable).values({
            bookingId: booking.id,
            rating: comments[i].rating,
            comment: comments[i].text,
          }).onConflictDoNothing();
        }
      }
    }
    console.log(`  Workers: ${workerDefs.length} ready`);
  } else {
    console.log("  Demo workers skipped (production; set SEED_DEMO_DATA=1 to include them)");
  }

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

  // Admin bootstrap. Production must supply both variables — never ship a
  // known default password to a live database.
  const adminEmail = (process.env.ADMIN_EMAIL ?? (isProduction ? "" : "admin@meraki.et")).trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? (isProduction ? "" : "admin123");

  if (!adminEmail || !adminPassword) {
    console.log("  Admin user skipped — set ADMIN_EMAIL and ADMIN_PASSWORD to create one");
  } else if (isProduction && adminPassword.length < 10) {
    console.log("  Admin user skipped — ADMIN_PASSWORD must be at least 10 characters in production");
  } else {
    const existingAdmin = await db.select({ id: usersTable.id })
      .from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
      await db.insert(usersTable).values({
        name: "Meraki Admin",
        email: adminEmail,
        passwordHash,
        phone: "+251911000001",
        address: "Bole, Addis Ababa",
        role: "admin",
      });
      console.log(`  Admin user created: ${adminEmail}`);
    } else {
      console.log("  Admin user already exists");
    }
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
