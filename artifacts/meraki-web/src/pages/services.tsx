import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Banknote, CheckCircle2, Sparkles, Shirt, Home as HomeIcon, ArrowRight } from "lucide-react";

const serviceImageMap: Record<string, string> = {
  'Home Cleaning': '/service-cleaning.png',
  'Kitchen Cleaning': '/service-kitchen.png',
  'Laundry & Ironing': '/service-laundry.png',
  'Combined Home & Laundry': '/service-combined.png',
  'Bedroom Deep Clean': '/service-bedroom.png',
};

export default function Services() {
  const { data: services, isLoading } = useListServices({
    query: { queryKey: getListServicesQueryKey() }
  });

  return (
    <div className="flex flex-col w-full">

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-br from-[#FAF7F4] to-[#f0e8e0] border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Professional cleaning and laundry services tailored to your needs. Book by the hour with trusted professionals.
          </p>
        </div>
      </div>

      {/* ── Service Cards ── */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Skeleton className="h-52 w-full rounded-none" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-11 w-full mt-4" />
                </div>
              </div>
            ))
          ) : (
            services?.map((service) => (
              <div key={service.id} className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">

                {/* Image */}
                <div className="h-52 bg-accent/50 overflow-hidden relative">
                  {serviceImageMap[service.name] ? (
                    <>
                      <img
                        src={serviceImageMap[service.name]}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      {service.category === 'cleaning' ? (
                        <Sparkles className="h-16 w-16 text-primary/50" />
                      ) : service.category === 'laundry' ? (
                        <Shirt className="h-16 w-16 text-primary/50" />
                      ) : (
                        <HomeIcon className="h-16 w-16 text-primary/50" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-background/90 backdrop-blur text-foreground text-xs font-bold px-3 py-1.5 rounded-full capitalize">
                      {service.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-sm text-muted-foreground flex-1 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2.5 mb-6 pt-5 border-t border-border/60">
                    <div className="flex items-center text-sm">
                      <Banknote className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                      <span className="font-semibold text-foreground">ETB {service.pricePerHour}</span>
                      <span className="text-muted-foreground ml-1">per hour</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                      {service.durationHours} hours typical duration
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 mr-2.5 text-primary flex-shrink-0" />
                      All supplies included
                    </div>
                  </div>

                  <Link href={`/book?service=${service.id}`} className="mt-auto">
                    <Button className="w-full h-11 font-semibold group/btn">
                      Book this service
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-20 max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 text-center border border-primary/15">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Need regular home care?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Our subscription plans give you regular bookings at a discounted rate — perfect for busy households.
          </p>
          <Link href="/plans">
            <Button size="lg" className="bg-primary shadow-sm shadow-primary/20">
              View Subscription Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
