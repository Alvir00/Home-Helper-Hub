import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import {
  ArrowRight, Star, Shield, Clock, Sparkles, Droplets, Home as HomeIcon, MapPin
} from "lucide-react";

const serviceImageMap: Record<string, string> = {
  'Home Cleaning': '/service-cleaning.png',
  'Kitchen Cleaning': '/service-kitchen.png',
  'Laundry & Ironing': '/service-laundry.png',
  'Combined Home & Laundry': '/service-combined.png',
  'Bedroom Deep Clean': '/service-bedroom.png',
};

// Amharic service names, shown alongside English — we serve Addis Ababa, so the
// site should speak both. Falls back gracefully (nothing renders) for unknown names.
const amharicNameMap: Record<string, string> = {
  'Home Cleaning': 'የቤት ጽዳት',
  'Kitchen Cleaning': 'የኩሽና ጽዳት',
  'Laundry & Ironing': 'ልብስ ማጠብና ማጠፍ',
  'Combined Home & Laundry': 'ቤትና ልብስ ጽዳት',
  'Bedroom Deep Clean': 'የእንቅልፍ ክፍል ጥልቅ ጽዳት',
};

export default function Home() {
  const { data: services, isLoading } = useListServices({
    query: { queryKey: getListServicesQueryKey() }
  });

  // Real hourly floor from the database, for the hero price tag — no invented numbers.
  const minPrice = services?.length
    ? Math.min(...services.map((s) => s.pricePerHour))
    : null;

  return (
    <div className="flex flex-col w-full">

      {/* ── Hero ── */}
      <section className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div className="flex flex-col justify-center space-y-8">
              <p className="text-primary text-sm font-semibold tracking-[0.18em] uppercase">
                የቤት አገልግሎት · Addis Ababa
              </p>

              <div className="space-y-5">
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.05]">
                  Housework,{" "}
                  <span className="text-primary italic">handled</span>.
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Book a vetted cleaner or laundry helper by the hour — clear prices in
                  ETB, from a one-off deep clean to a weekly visit.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book">
                  <Button size="lg" className="w-full sm:w-auto text-base h-13 px-8">
                    Book now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-13 px-8">
                    View services
                  </Button>
                </Link>
              </div>

              {/* One real customer, one real neighborhood — specificity over a wall of badges */}
              <div className="pt-2 max-w-md">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-star fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Selamawit arrived on time and left our apartment spotless — we've
                  booked her every two weeks since."
                  <span className="text-foreground font-medium"> — Yohannes T., Bole</span>
                </p>
              </div>
            </div>

            {/* Right — hero photo with a real price from the database */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="aspect-[5/4] rounded-lg overflow-hidden border border-border relative z-10">
                  <img
                    src="/hero-interior.png"
                    alt="A bright, tidy home in Addis Ababa"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Offset teal block behind the photo — flat, printed, not misty */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 bg-primary/15 rounded-lg" aria-hidden="true" />

                {minPrice !== null && (
                  <div className="absolute bottom-5 left-5 z-20 bg-background border border-border rounded-md px-4 py-2.5 shadow-sm">
                    <span className="text-xs text-muted-foreground block leading-none mb-1">From</span>
                    <span className="font-display text-xl font-semibold text-foreground leading-none">
                      ETB {minPrice}<span className="text-sm text-muted-foreground font-sans font-normal">/hr</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Promises strip (policies, not vanity numbers) ── */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {[
              { title: "Vetted staff", sub: "Interviewed in person, background-checked" },
              { title: "Fixed hourly rates", sub: "The price you see is the price you pay" },
              { title: "Free re-clean", sub: "If something's missed, we return at no cost" },
              { title: "Pay on completion", sub: "Cash, Telebirr or card — after the work" },
            ].map((item) => (
              <div key={item.title}>
                <div className="font-display text-lg font-semibold tracking-tight">{item.title}</div>
                <div className="text-primary-foreground/70 text-xs mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Preview ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-primary font-medium text-sm tracking-[0.18em] uppercase mb-2">Services</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight">Choose what your home needs</h2>
            </div>
            <Link href="/services">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 font-medium">
                See all services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <Skeleton className="h-52 w-full rounded-none" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              ))
            ) : services?.slice(0, 3).map((service) => (
              <Link key={service.id} href={`/book?service=${service.id}`}>
                <div className="group flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden hover:border-primary/40 transition-colors">
                  <div className="h-52 bg-muted relative overflow-hidden">
                    {serviceImageMap[service.name] ? (
                      <>
                        <img
                          src={serviceImageMap[service.name]}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-block bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-md border border-border">
                            ETB {service.pricePerHour}/hr
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        {service.category === 'cleaning' ? (
                          <Sparkles className="h-16 w-16 text-primary/40" />
                        ) : service.category === 'laundry' ? (
                          <Droplets className="h-16 w-16 text-primary/40" />
                        ) : (
                          <HomeIcon className="h-16 w-16 text-primary/40" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{service.name}</h3>
                      {amharicNameMap[service.name] && (
                        <span className="text-sm text-muted-foreground shrink-0">{amharicNameMap[service.name]}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-border">
                      <span className="text-muted-foreground">{service.durationHours} hrs typical</span>
                      <span className="text-primary flex items-center gap-1">
                        Book <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 lg:py-24 bg-accent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12">
            <p className="text-primary font-medium text-sm tracking-[0.18em] uppercase mb-2">How it works</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight">Three steps, one clean home</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose a service",
                desc: "Cleaning, laundry, or a combined package — hourly rates shown upfront.",
              },
              {
                step: "2",
                title: "Pick your time",
                desc: "Today or next week. Flexible slots from 8am to 6pm, reschedule free.",
              },
              {
                step: "3",
                title: "Enjoy your space",
                desc: "Your helper arrives on time. Pay when the work is done.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="border-t-2 border-foreground/15 pt-6">
                <div className="font-display text-5xl font-semibold text-primary mb-4 leading-none">{step}</div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Meraki ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-medium text-sm tracking-[0.18em] uppercase mb-2">Why Meraki</p>
              <h2 className="font-display text-4xl font-semibold tracking-tight mb-6">Trust is earned visit by visit</h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Every Meraki professional is interviewed in person, background-checked,
                and rated by customers after every single visit.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Trusted professionals",
                    desc: "In-person interview and background check before anyone joins Meraki.",
                  },
                  {
                    icon: Clock,
                    title: "Flexible scheduling",
                    desc: "Book for tomorrow or next month. Reschedule free if plans change.",
                  },
                  {
                    icon: Star,
                    title: "Satisfaction guaranteed",
                    desc: "Not happy with a visit? We send someone back — free of charge.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border">
                <img src="/service-cleaning.png" alt="A Meraki cleaner at work" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border mt-8">
                <img src="/service-laundry.png" alt="Freshly pressed laundry" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Yohannes T.", neighborhood: "Bole", rating: 5, text: "Selamawit arrived on time, worked quietly, and left our apartment spotless. We've booked her every two weeks since." },
              { name: "Rahel A.", neighborhood: "Kazanchis", rating: 5, text: "I was skeptical at first, but Meraki has completely changed how I manage household chores. Absolutely worth it!" },
              { name: "Dawit M.", neighborhood: "CMC", rating: 5, text: "Professional, reliable, and affordable. The laundry service is a game-changer — fresh clothes folded perfectly." },
            ].map((t) => (
              <div key={t.name} className="bg-background rounded-lg p-6 border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "text-star fill-current" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {t.neighborhood}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — the one dark navy band ── */}
      <section className="py-24 lg:py-28 bg-navy text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-5 max-w-2xl mx-auto">
            Ready for a clean home?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Book online in two minutes, across Addis Ababa. Pay when the work is done.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg" className="bg-white text-navy hover:bg-white/90 text-base h-14 px-10 font-semibold">
                Book your first service <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="border-aqua/40 text-white hover:bg-white/10 text-base h-14 px-10">
                View plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
