import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, ArrowRight, Sparkles, Shirt, Home as HomeIcon } from "lucide-react";
import { serviceImageMap, Price } from "@/components/booking";

export default function Services() {
  const { data: services, isLoading } = useListServices({
    query: { queryKey: getListServicesQueryKey() },
  });

  return (
    <div className="flex flex-col w-full">
      <section className="bg-brand text-brand-foreground">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Services & hourly prices</h1>
          <p className="mt-2 text-white/85 text-sm md:text-base max-w-2xl">
            Professional cleaning and laundry, booked by the hour. All supplies included — the price you see is the price you pay.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))
            : services?.map((s) => (
                <div key={s.id} className="hover-lift flex flex-col rounded-lg border border-border bg-card overflow-hidden">
                  <div className="relative h-44 bg-muted overflow-hidden">
                    {serviceImageMap[s.name] ? (
                      <img
                        src={serviceImageMap[s.name]}
                        alt={s.name}
                        width={400}
                        height={176}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5">
                        {s.category === "laundry" ? <Shirt className="h-14 w-14 text-primary/40" />
                          : s.category === "cleaning" ? <Sparkles className="h-14 w-14 text-primary/40" />
                          : <HomeIcon className="h-14 w-14 text-primary/40" />}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-sm bg-brand px-2 py-1 text-xs font-semibold text-white capitalize">
                      {s.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold tracking-tight">{s.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">{s.description}</p>
                    <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Hourly rate</span>
                        <Price amount={s.pricePerHour} />
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" /> {s.durationHours} hrs typical
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" /> All supplies included
                      </div>
                    </div>
                    <Link href={`/book?service=${s.id}`} className="mt-4">
                      <Button className="w-full font-bold">Book this service <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-muted/60 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 className="text-xl font-bold">Need regular home care?</h2>
            <p className="text-sm text-muted-foreground mt-1">Subscription plans give you regular bookings at a discounted rate.</p>
          </div>
          <Link href="/plans">
            <Button size="lg" className="font-bold">View plans & deals <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
