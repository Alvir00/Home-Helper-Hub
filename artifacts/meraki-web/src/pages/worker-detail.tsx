import { useParams, Link } from "wouter";
import { useGetWorker, getGetWorkerQueryKey, useGetWorkerReviews, getGetWorkerReviewsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, ShieldCheck, Calendar, CalendarCheck2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { RatingRow, VerifiedBadge, TopRatedBadge, Price, Stars } from "@/components/booking";

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
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-10 w-1/2 mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Helper not found</h2>
        <Link href="/workers"><Button>Back to helpers</Button></Link>
      </div>
    );
  }

  const fromPrice = worker.services.length ? Math.min(...worker.services.map((s) => s.pricePerHour)) : null;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
      <Link href="/workers" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to all helpers
      </Link>

      {/* Title row: name + badges left, rating right */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{worker.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <VerifiedBadge />
            {(worker.rating ?? 0) >= 4.8 && <TopRatedBadge />}
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> Addis Ababa
            </span>
          </div>
        </div>
        <RatingRow score={worker.rating} reviews={worker.totalReviews} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left: photo, about, services, reviews */}
        <div className="lg:col-span-2 space-y-8">
          <img
            src={worker.photoUrl || "/worker-1.jpg"}
            alt={worker.name}
            width={800}
            height={320}
            decoding="async"
            className="w-full h-64 md:h-80 object-cover rounded-lg border border-border"
          />

          <section>
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {worker.bio || "This helper hasn't written a bio yet, but they are fully vetted and ready to provide excellent service."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Services offered</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {worker.services.map((service) => (
                <div key={service.id} className="rounded-lg border border-border bg-card p-4 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold">{service.name}</h3>
                    <Price amount={service.pricePerHour} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{service.description}</p>
                  <Link href={`/book?service=${service.id}&worker=${worker.id}`} className="mt-3">
                    <Button variant="outline" size="sm" className="w-full font-semibold">Book this service</Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Recent reviews ({worker.totalReviews})</h2>
            {isLoadingReviews ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border bg-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Stars score={review.rating} />
                      <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {review.comment ? `"${review.comment}"` : <span className="italic text-muted-foreground">No comment provided</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/40 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">No reviews yet for this helper.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right: sticky booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-bold">Book this helper</h2>
            </div>
            <div className="p-5 space-y-4">
              {fromPrice !== null && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Starting rate</span>
                  <Price amount={fromPrice} />
                </div>
              )}
              <div className="space-y-2.5 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jobs completed</span>
                  <span className="font-semibold inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {worker.completedBookings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background check</span>
                  <span className="font-semibold inline-flex items-center gap-1.5 text-success">
                    <ShieldCheck className="h-4 w-4" /> Passed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-semibold inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> {format(new Date(worker.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </div>
              <Link href={`/book?worker=${worker.id}`} className="block pt-2">
                <Button className="w-full h-12 text-base font-bold">Book {worker.name.split(' ')[0]}</Button>
              </Link>
              <div className="flex items-center gap-2 text-xs font-medium text-success">
                <CalendarCheck2 className="h-4 w-4" /> Free cancellation up to 24h before
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
