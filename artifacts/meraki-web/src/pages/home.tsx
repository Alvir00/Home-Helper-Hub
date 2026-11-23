import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useListServices, getListServicesQueryKey,
  useListWorkers, getListWorkersQueryKey,
  useListSubscriptionPlans, getListSubscriptionPlansQueryKey,
  WorkerStatus,
} from "@workspace/api-client-react";
import {
  Search, ShieldCheck, CalendarCheck2, Wallet, Tag, ArrowRight, MapPin,
} from "lucide-react";
import {
  serviceImageMap, RatingRow, Price, DealBadge, VerifiedBadge, TopRatedBadge, PhotoTile,
} from "@/components/booking";

const NEIGHBORHOODS = [
  "Bole", "Kazanchis", "CMC", "Old Airport", "Sarbet", "Ayat", "Piassa", "Megenagna",
];

const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function SearchWidget() {
  const [, setLocation] = useLocation();
  const { data: services } = useListServices({ query: { queryKey: getListServicesQueryKey() } });
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (area) params.set("area", area);
    setLocation(`/workers?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="rounded-lg bg-background p-3 shadow-lg border border-border">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] gap-2">
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="h-12 bg-background" aria-label="Service">
            <SelectValue placeholder="What do you need?" />
          </SelectTrigger>
          <SelectContent>
            {services?.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="h-12 bg-background" aria-label="Neighborhood">
            <SelectValue placeholder="Neighborhood" />
          </SelectTrigger>
          <SelectContent>
            {NEIGHBORHOODS.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 bg-background"
          aria-label="Date"
        />

        <Select value={time} onValueChange={setTime}>
          <SelectTrigger className="h-12 bg-background" aria-label="Time">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" size="lg" className="h-12 px-6 text-base font-bold">
          <Search className="h-5 w-5" /> Search
        </Button>
      </div>
    </form>
  );
}

const TRUST = [
  { icon: CalendarCheck2, title: "Free cancellation", sub: "Up to 24h before your booking" },
  { icon: ShieldCheck, title: "Verified professionals", sub: "ID-checked & interviewed" },
  { icon: Wallet, title: "Pay after the job", sub: "Cash, Telebirr or card" },
  { icon: Tag, title: "No hidden fees", sub: "The hourly price is the price" },
];

export default function Home() {
  const { data: services, isLoading: servicesLoading } = useListServices({
    query: { queryKey: getListServicesQueryKey() },
  });
  const { data: workersData, isLoading: workersLoading } = useListWorkers(undefined, {
    query: { queryKey: getListWorkersQueryKey() },
  });
  const { data: plans } = useListSubscriptionPlans({
    query: { queryKey: getListSubscriptionPlansQueryKey() },
  });

  const topWorkers = (workersData?.workers ?? [])
    .filter((w) => w.status === WorkerStatus.approved)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  const minPrice = services?.length ? Math.min(...services.map((s) => s.pricePerHour)) : null;

  return (
    <div className="flex flex-col w-full">
      {/* ── Blue booking hero ── */}
      <section className="bg-brand text-brand-foreground">
        <div className="container mx-auto px-4 md:px-6 pt-12 pb-16 md:pt-16 md:pb-20">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
            Home help in Addis Ababa, booked in minutes.
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/85 max-w-2xl">
            Verified cleaners and laundry pros at transparent hourly rates
            {minPrice !== null ? <> — from <span className="font-bold text-deal">ETB {minPrice}/hr</span></> : null}.
            Pay after the job is done.
          </p>
          <div className="mt-8 max-w-5xl">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Browse by service ── */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Browse by service</h2>
          <p className="text-sm text-muted-foreground mb-5">Pick a service and see live hourly prices.</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {servicesLoading
              ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 min-w-[150px] flex-1 rounded-lg" />)
              : services?.map((s) => (
                  <PhotoTile
                    key={s.id}
                    image={serviceImageMap[s.name] || "/service-cleaning.png"}
                    title={s.name}
                    subtitle={`from ETB ${s.pricePerHour}/hr`}
                    href={`/book?service=${s.id}`}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ── Top-rated helpers (booking-style list cards) ── */}
      <section className="py-10 md:py-12 bg-muted/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Top-rated helpers near you</h2>
              <p className="text-sm text-muted-foreground">Rated by real customers across Addis Ababa.</p>
            </div>
            <Link href="/workers" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              See all helpers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {workersLoading
              ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-lg" />)
              : topWorkers.map((w) => {
                  const from = w.services.length ? Math.min(...w.services.map((s) => s.pricePerHour)) : null;
                  return (
                    <div key={w.id} className="hover-lift grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 rounded-lg border border-border bg-card p-4">
                      <Link href={`/workers/${w.id}`} className="block">
                        <img
                          src={w.photoUrl || "/worker-1.png"}
                          alt={w.name}
                          className="h-36 w-36 sm:h-40 sm:w-40 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link href={`/workers/${w.id}`} className="text-lg font-bold text-primary hover:underline">
                          {w.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <VerifiedBadge />
                          {(w.rating ?? 0) >= 4.8 && <TopRatedBadge />}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {w.services.slice(0, 3).map((s) => (
                            <span key={s.id} className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {s.name}
                            </span>
                          ))}
                        </div>
                        {w.bio && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{w.bio}</p>}
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> Addis Ababa · {w.completedBookings} jobs completed
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 sm:text-right">
                        <RatingRow score={w.rating} reviews={w.totalReviews} />
                        <div className="flex flex-col items-end gap-2">
                          {from !== null && <Price amount={from} />}
                          <Link href={`/book?worker=${w.id}`}>
                            <Button size="sm" className="font-bold">Book</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* ── Popular neighborhoods ── */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Popular areas in Addis Ababa</h2>
          <p className="text-sm text-muted-foreground mb-5">Helpers available across the city.</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <PhotoTile image="/hero-interior.png" title="Bole" subtitle="Cleaning · Laundry" href="/workers" />
            <PhotoTile image="/service-cleaning.png" title="Kazanchis" subtitle="Cleaning · Laundry" href="/workers" />
            <PhotoTile image="/service-bedroom.png" title="CMC" subtitle="Cleaning · Laundry" href="/workers" />
            <PhotoTile image="/service-kitchen.png" title="Old Airport" subtitle="Cleaning · Laundry" href="/workers" />
            <PhotoTile image="/service-laundry.png" title="Sarbet" subtitle="Cleaning · Laundry" href="/workers" />
            <PhotoTile image="/service-combined.png" title="Ayat" subtitle="Cleaning · Laundry" href="/workers" />
          </div>
        </div>
      </section>

      {/* ── Save with a plan ── */}
      <section className="py-10 md:py-12 bg-muted/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Save with a monthly plan</h2>
              <p className="text-sm text-muted-foreground">Regular bookings at a discounted rate.</p>
            </div>
            <Link href="/plans" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Compare plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {plans?.slice(0, 3).map((p) => (
              <div key={p.id} className={`rounded-lg border bg-card p-5 ${p.popular ? "border-primary shadow-md" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">{p.name}</span>
                  <DealBadge>Save {p.discountPercent}%</DealBadge>
                </div>
                <div className="mt-3"><Price amount={p.priceMonthly} unit="/month" /></div>
                <p className="mt-1 text-sm text-muted-foreground">{p.bookingsPerMonth} bookings / month</p>
                <Link href="/plans" className="mt-4 block">
                  <Button variant={p.popular ? "default" : "outline"} className="w-full font-semibold">
                    View plan
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why book with Meraki ── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">Why book with Meraki?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Every helper is vetted", desc: "In-person interview and background check before anyone joins. Ratings after every visit." },
              { icon: CalendarCheck2, title: "Flexible & free to change", desc: "Book for today or next month. Reschedule or cancel free up to 24 hours before." },
              { icon: Wallet, title: "Pay when it's done", desc: "No prepayment. Pay cash, Telebirr or card after the work — and only if you're happy." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-3">
                  <Icon className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
