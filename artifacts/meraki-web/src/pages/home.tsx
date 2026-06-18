import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import {
  ArrowRight, CheckCircle2, Star, Shield, Clock,
  Sparkles, Shirt, Home as HomeIcon, Users, MapPin, Award
} from "lucide-react";

const serviceImageMap: Record<string, string> = {
  'Home Cleaning': '/service-cleaning.png',
  'Kitchen Cleaning': '/service-kitchen.png',
  'Laundry & Ironing': '/service-laundry.png',
  'Combined Home & Laundry': '/service-combined.png',
  'Bedroom Deep Clean': '/service-bedroom.png',
};

export default function Home() {
  const { data: services, isLoading } = useListServices({
    query: { queryKey: getListServicesQueryKey() }
  });

  return (
    <div className="flex flex-col w-full">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAF7F4] via-[#FAF7F4] to-[#f0e8e0] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(193,98,47,0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full w-fit border border-primary/20">
                <Sparkles className="h-4 w-4" />
                Addis Ababa's #1 Home Help
              </div>

              <div className="space-y-5">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Your home,{" "}
                  <span className="text-primary">spotless</span>{" "}
                  and <span className="text-primary">serene</span>.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Book vetted cleaners and laundry helpers in minutes. Trusted by hundreds of families across Addis Ababa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book">
                  <Button size="lg" className="w-full sm:w-auto text-base h-13 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                    Book Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-13 px-8 bg-background/70 backdrop-blur hover:bg-background">
                    View Services
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-medium">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Background-checked staff
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  4.8★ avg rating
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  15+ neighborhoods
                </div>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-background/80 relative z-10">
                  <img
                    src="/hero-interior.png"
                    alt="Beautiful bright Ethiopian home interior"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Floating card — rating */}
                <div className="absolute -bottom-5 -left-5 z-20 bg-background rounded-2xl shadow-xl p-4 border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-500 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Top Rated</div>
                    <div className="text-xs text-muted-foreground">500+ happy homes</div>
                  </div>
                </div>

                {/* Floating card — next available */}
                <div className="absolute -top-4 -right-4 z-20 bg-background rounded-2xl shadow-xl px-4 py-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-0.5">Next available</div>
                  <div className="font-bold text-sm text-primary">Today, 2:00 PM</div>
                </div>
              </div>

              <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-primary/8 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-10 -left-10 w-60 h-60 bg-amber-400/6 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Homes Served" },
              { value: "4.8★", label: "Average Rating" },
              { value: "15+", label: "Neighborhoods" },
              { value: "100%", label: "Vetted Staff" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-primary-foreground/75 text-sm mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Preview ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our Services</p>
              <h2 className="text-4xl font-bold tracking-tight">Designed for your lifestyle</h2>
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
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
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
                <div className="group flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                  <div className="h-52 bg-muted relative overflow-hidden">
                    {serviceImageMap[service.name] ? (
                      <>
                        <img
                          src={serviceImageMap[service.name]}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                            ETB {service.pricePerHour}/hr
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        {service.category === 'cleaning' ? (
                          <Sparkles className="h-16 w-16 text-primary/40" />
                        ) : service.category === 'laundry' ? (
                          <Shirt className="h-16 w-16 text-primary/40" />
                        ) : (
                          <HomeIcon className="h-16 w-16 text-primary/40" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-border/60">
                      <span className="text-muted-foreground">{service.durationHours} hrs typical</span>
                      <span className="text-primary flex items-center gap-1">
                        Book now <ArrowRight className="h-3.5 w-3.5" />
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
      <section className="py-24 bg-accent/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</p>
            <h2 className="text-4xl font-bold tracking-tight">How Meraki Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {[
              {
                step: 1,
                icon: Sparkles,
                title: "Choose a Service",
                desc: "Select what you need — cleaning, laundry, or a combined package.",
              },
              {
                step: 2,
                icon: Clock,
                title: "Pick Your Time",
                desc: "Schedule for today or next week. Flexible slots from 8am to 6pm.",
              },
              {
                step: 3,
                icon: Award,
                title: "Enjoy Your Space",
                desc: "Your vetted professional arrives on time and delivers perfection.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center mb-5 gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Meraki ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-bold tracking-tight mb-6">Built on trust, delivered with care</h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Every Meraki professional is personally vetted, trained, and rated by real customers. We don't just clean homes — we earn trust, one visit at a time.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Trusted Professionals",
                    desc: "Every worker passes a rigorous background check and in-person interview before joining Meraki.",
                  },
                  {
                    icon: Clock,
                    title: "Flexible Scheduling",
                    desc: "Book for tomorrow or next month. Reschedule easily if your plans change — no penalty.",
                  },
                  {
                    icon: Star,
                    title: "Satisfaction Guaranteed",
                    desc: "Not happy with your service? We'll send someone back — free of charge, no questions asked.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <img src="/service-cleaning.png" alt="Professional cleaner" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mt-8">
                <img src="/service-laundry.png" alt="Laundry service" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial / Social Proof ── */}
      <section className="py-16 bg-accent/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Yohannes T.", neighborhood: "Bole", rating: 5, text: "Selamawit arrived on time, worked quietly, and left our apartment spotless. We've booked her every two weeks since." },
              { name: "Rahel A.", neighborhood: "Kazanchis", rating: 5, text: "I was skeptical at first, but Meraki has completely changed how I manage household chores. Absolutely worth it!" },
              { name: "Dawit M.", neighborhood: "CMC", rating: 5, text: "Professional, reliable, and affordable. The laundry service is a game-changer — fresh clothes folded perfectly." },
            ].map((t) => (
              <div key={t.name} className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "text-amber-500 fill-current" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
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

      {/* ── CTA ── */}
      <section className="py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
            <Users className="h-4 w-4" />
            500+ happy households
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 max-w-2xl mx-auto">
            Ready for a spotlessly clean home?
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Join hundreds of Addis Ababa families who trust Meraki every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg" className="bg-background text-primary hover:bg-background/90 text-base h-14 px-10 shadow-2xl font-semibold">
                Book Your First Service <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10 text-base h-14 px-10">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
