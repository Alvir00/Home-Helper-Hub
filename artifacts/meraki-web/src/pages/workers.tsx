import { useState } from "react";
import { Link } from "wouter";
import { useListWorkers, getListWorkersQueryKey, useListServices, getListServicesQueryKey, WorkerStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
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

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Our Professionals</h1>
          <p className="text-xl text-muted-foreground">
            Meet the vetted, top-rated cleaners and helpers ready to serve you.
          </p>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-6" />
              <Skeleton className="h-10 w-full mt-auto" />
            </div>
          ))
        ) : (
          workersData?.workers.filter(w => w.status === WorkerStatus.approved).map((worker) => (
            <div key={worker.id} className="group rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center hover-elevate transition-all duration-300">
              <Avatar className="h-24 w-24 mb-4 border-4 border-accent">
                <AvatarImage src={worker.photoUrl || undefined} alt={worker.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{worker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">{worker.name}</h2>
              
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-amber-500 mb-3">
                <Star className="h-4 w-4 fill-current" />
                <span>{worker.rating?.toFixed(1) || 'New'}</span>
                <span className="text-muted-foreground ml-1">({worker.totalReviews} reviews)</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {worker.services.slice(0, 2).map(s => (
                  <Badge key={s.id} variant="secondary" className="bg-accent text-accent-foreground font-normal">
                    {s.name}
                  </Badge>
                ))}
                {worker.services.length > 2 && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground font-normal">
                    +{worker.services.length - 2} more
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 w-full">
                {worker.bio}
              </p>
              
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-border">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-primary" />
                  {worker.completedBookings} jobs
                </div>
                <Link href={`/workers/${worker.id}`}>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      
      {!isLoading && workersData?.workers.filter(w => w.status === WorkerStatus.approved).length === 0 && (
        <div className="text-center py-24 bg-accent/20 rounded-2xl border border-border border-dashed">
          <p className="text-lg text-muted-foreground">No professionals found matching your criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => setServiceFilter("all")}>Clear filters</Button>
        </div>
      )}

      <div className="mt-16 bg-accent/30 rounded-3xl p-8 md:p-12 text-center border border-border">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to book a professional?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          All our professionals are background-checked, trained, and rated by real customers across Addis Ababa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/book">
            <Button size="lg" className="shadow-sm">Book a Service</Button>
          </Link>
          <Link href="/plans">
            <Button size="lg" variant="outline" className="bg-background">View Subscription Plans</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
