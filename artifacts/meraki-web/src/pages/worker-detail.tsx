import { useParams, Link } from "wouter";
import { useGetWorker, getGetWorkerQueryKey, useGetWorkerReviews, getGetWorkerReviewsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ArrowLeft, Calendar, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function WorkerDetail() {
  const { id } = useParams();
  const workerId = Number(id);

  const { data: worker, isLoading: isLoadingWorker } = useGetWorker(workerId, {
    query: { enabled: !!workerId, queryKey: getGetWorkerQueryKey(workerId) }
  });

  const { data: reviews, isLoading: isLoadingReviews } = useGetWorkerReviews(workerId, {
    query: { enabled: !!workerId, queryKey: getGetWorkerReviewsQueryKey(workerId) }
  });

  if (isLoadingWorker) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Worker not found</h2>
        <Link href="/workers">
          <Button>Back to Workers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link href="/workers" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to all professionals
      </Link>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-3xl border border-border overflow-hidden sticky top-24">
            <div className="h-32 bg-primary/10"></div>
            <div className="px-8 pb-8 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 -mt-16 mb-4 border-4 border-card shadow-sm">
                <AvatarImage src={worker.photoUrl || undefined} alt={worker.name} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">{worker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold tracking-tight mb-2">{worker.name}</h1>
              
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-amber-500 mb-6 bg-amber-500/10 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 fill-current" />
                <span>{worker.rating?.toFixed(1) || 'New'}</span>
                <span className="text-muted-foreground ml-1">({worker.totalReviews} reviews)</span>
              </div>
              
              <div className="w-full space-y-4 mb-8 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jobs Completed</span>
                  <span className="font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-primary" />
                    {worker.completedBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Background Check</span>
                  <span className="font-medium flex items-center text-emerald-600">
                    <ShieldCheck className="h-4 w-4 mr-1.5" /> Passed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    {format(new Date(worker.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </div>
              
              <Link href={`/book?worker=${worker.id}`} className="w-full">
                <Button className="w-full h-12 text-base shadow-md">Book {worker.name.split(' ')[0]}</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Reviews */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">About Me</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {worker.bio || "This professional hasn't written a bio yet, but they are fully vetted and ready to provide excellent service."}
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-4">Services Offered</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {worker.services.map((service) => (
                <div key={service.id} className="p-4 rounded-xl border border-border bg-accent/20 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{service.name}</h3>
                    <span className="text-primary font-medium">ETB {service.pricePerHour}/hr</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-6">Recent Reviews ({worker.totalReviews})</h2>
            
            {isLoadingReviews ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-2xl border border-border bg-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted stroke-[1.5px]"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {review.comment ? `"${review.comment}"` : <span className="italic text-muted-foreground">No comment provided</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-accent/20 rounded-2xl border border-border border-dashed">
                <p className="text-muted-foreground">No reviews yet for this professional.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
