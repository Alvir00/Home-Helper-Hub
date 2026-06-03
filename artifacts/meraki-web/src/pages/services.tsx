import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Banknote, CheckCircle2, Sparkles, Shirt, Home as HomeIcon } from "lucide-react";

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
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground">
          Professional cleaning and laundry services tailored to your needs. Book by the hour with trusted professionals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="pt-4 flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            </div>
          ))
        ) : (
          services?.map((service) => (
            <div key={service.id} className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover-elevate transition-all duration-300">
              <div className="h-48 bg-accent/50 overflow-hidden border-b border-border relative">
                {serviceImageMap[service.name] ? (
                  <img
                    src={serviceImageMap[service.name]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {service.category === 'cleaning' ? (
                      <Sparkles className="h-16 w-16 text-primary/60" />
                    ) : service.category === 'laundry' ? (
                      <Shirt className="h-16 w-16 text-primary/60" />
                    ) : (
                      <HomeIcon className="h-16 w-16 text-primary/60" />
                    )}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">{service.name}</h2>
                </div>
                
                <p className="text-muted-foreground flex-1 mb-6">
                  {service.description}
                </p>
                
                <div className="space-y-3 mb-8 pt-6 border-t border-border">
                  <div className="flex items-center text-sm font-medium">
                    <Banknote className="w-4 h-4 mr-2 text-primary" />
                    ETB {service.pricePerHour} per hour
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    {service.durationHours} hours typical duration
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                    All supplies included
                  </div>
                </div>
                
                <Link href={`/book?service=${service.id}`} className="mt-auto">
                  <Button className="w-full text-base h-12 shadow-sm" variant="default">
                    Book this service
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-24 max-w-4xl mx-auto bg-accent/30 rounded-3xl p-8 md:p-12 text-center border border-border">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Need something more regular?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          We offer subscription plans that give you regular bookings at a discounted rate, perfect for keeping your home consistently clean.
        </p>
        <Link href="/plans">
          <Button size="lg" variant="outline" className="bg-background">
            View Subscription Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}
