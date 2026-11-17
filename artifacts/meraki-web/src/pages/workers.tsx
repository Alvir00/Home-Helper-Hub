import { useState } from "react";
import { Link } from "wouter";
import { useListWorkers, getListWorkersQueryKey, useListServices, getListServicesQueryKey, WorkerStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Workers() {
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const { data: services } = useListServices({
    query: { queryKey: getListServicesQueryKey() }
  });

  const { data: workersData, isLoading } = useListWorkers(
    { serviceId: serviceFilter !== "all" ? Number(serviceFilter) : undefined },
    { query: { queryKey: getListWorkersQueryKey({ serviceId: serviceFilter !== "all" ? Number(serviceFilter) : undefined }) } }
  );

  const approvedWorkers = workersData?.workers.filter(w => w.status === WorkerStatus.approved) ?? [];

  return (
    <div className="flex flex-col w-full">

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-br from-[#FAF7F4] to-[#f0e8e0] border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our Team</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Meet our Professionals
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every Meraki professional is background-checked, trained, and rated by real customers across Addis Ababa.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-72">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Workers Grid ── */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Skeleton className="h-56 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))
          ) : approvedWorkers.map((worker) => (
            <div key={worker.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">

              {/* Photo area */}
              <div className="relative h-56 bg-muted overflow-hidden">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage
                    src={worker.photoUrl || undefined}
                    alt={worker.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <AvatarFallback className="w-full h-full rounded-none text-5xl bg-primary/10 text-primary">
                    {worker.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Rating chip */}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-semibold shadow-sm border border-border/50">
                  <Star className="h-3 w-3 text-star fill-current" />
                  {worker.rating?.toFixed(1) || 'New'}
                </div>

                {/* Jobs chip */}
                <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-medium shadow-sm border border-border/50">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {worker.completedBookings} jobs
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-bold tracking-tight mb-0.5 group-hover:text-primary transition-colors">
                  {worker.name}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {worker.totalReviews} review{worker.totalReviews !== 1 ? 's' : ''}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {worker.services.slice(0, 2).map(s => (
                    <Badge key={s.id} variant="secondary" className="bg-primary/8 text-primary border-primary/15 text-[11px] font-medium">
                      {s.name}
                    </Badge>
                  ))}
                  {worker.services.length > 2 && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[11px]">
                      +{worker.services.length - 2}
                    </Badge>
                  )}
                </div>

                {worker.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">
                    {worker.bio}
                  </p>
                )}

                <Link href={`/workers/${worker.id}`} className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && approvedWorkers.length === 0 && (
          <div className="text-center py-24 bg-accent/20 rounded-2xl border border-dashed border-border">
            <p className="text-lg text-muted-foreground mb-4">No professionals found for this service.</p>
            <Button variant="outline" onClick={() => setServiceFilter("all")}>Clear filter</Button>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 text-center border border-primary/15">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to book a professional?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            All our professionals are background-checked and rated by real customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg" className="shadow-sm shadow-primary/20">Book a Service</Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline" className="bg-background">View Subscription Plans</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
