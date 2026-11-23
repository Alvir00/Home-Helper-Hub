import { useState } from "react";
import { Link } from "wouter";
import {
  useListWorkers, getListWorkersQueryKey,
  useListServices, getListServicesQueryKey,
  WorkerStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MapPin, SlidersHorizontal, ArrowRight } from "lucide-react";
import { RatingRow, Price, VerifiedBadge, TopRatedBadge } from "@/components/booking";

export default function Workers() {
  const urlParams = new URLSearchParams(window.location.search);
  const [serviceFilter, setServiceFilter] = useState<string>(urlParams.get("service") || "all");
  const area = urlParams.get("area");

  const { data: services } = useListServices({ query: { queryKey: getListServicesQueryKey() } });
  const { data: workersData, isLoading } = useListWorkers(
    { serviceId: serviceFilter !== "all" ? Number(serviceFilter) : undefined },
    { query: { queryKey: getListWorkersQueryKey({ serviceId: serviceFilter !== "all" ? Number(serviceFilter) : undefined }) } }
  );

  const approved = (workersData?.workers ?? [])
    .filter((w) => w.status === WorkerStatus.approved)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div className="flex flex-col w-full">
      {/* Blue results header */}
      <section className="bg-brand text-brand-foreground">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Home help professionals{area ? ` in ${area}` : " in Addis Ababa"}
          </h1>
          <p className="mt-2 text-white/85 text-sm md:text-base">
            {isLoading ? "Loading helpers…" : `${approved.length} verified helper${approved.length === 1 ? "" : "s"} available`}
            {area ? " · showing city-wide results" : ""}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium hidden sm:inline">Filter:</span>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-64 h-10 bg-background">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services?.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/book" className="ml-auto hidden sm:inline-flex">
            <Button size="sm" className="font-bold">Book a service <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col gap-4">
          {isLoading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-lg" />)
            : approved.map((w) => {
                const from = w.services.length ? Math.min(...w.services.map((s) => s.pricePerHour)) : null;
                return (
                  <div key={w.id} className="hover-lift grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 rounded-lg border border-border bg-card p-4">
                    <Link href={`/workers/${w.id}`} className="block">
                      <img src={w.photoUrl || "/worker-1.png"} alt={w.name} className="h-36 w-36 sm:h-40 sm:w-40 rounded-lg object-cover" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/workers/${w.id}`} className="text-lg font-bold text-primary hover:underline">{w.name}</Link>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <VerifiedBadge />
                        {(w.rating ?? 0) >= 4.8 && <TopRatedBadge />}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {w.services.slice(0, 3).map((s) => (
                          <span key={s.id} className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s.name}</span>
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
                        <div className="flex gap-2">
                          <Link href={`/workers/${w.id}`}>
                            <Button variant="outline" size="sm">Profile</Button>
                          </Link>
                          <Link href={`/book?worker=${w.id}`}>
                            <Button size="sm" className="font-bold">Book</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {!isLoading && approved.length === 0 && (
          <div className="text-center py-20 rounded-lg border border-dashed border-border bg-muted/40">
            <p className="text-lg text-muted-foreground mb-4">No helpers found for this service.</p>
            <Button variant="outline" onClick={() => setServiceFilter("all")}>Clear filter</Button>
          </div>
        )}
      </div>
    </div>
  );
}
