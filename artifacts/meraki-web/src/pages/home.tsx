import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, Shield, Clock, Sparkles, Shirt, Home as HomeIcon } from "lucide-react";
import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: services, isLoading } = useListServices({
    query: { queryKey: getListServicesQueryKey() }
  });

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-accent/30 pt-16 pb-16 lg:pt-24 lg:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="flex flex-col justify-center space-y-8 relative z-10">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-xl">
                  Precise, trustworthy home help in <span className="text-primary">Addis Ababa</span>.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                  Book vetted cleaners and laundry helpers in minutes. Precise service, every time.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-lg">
                    Book Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 bg-background/50 backdrop-blur">
                    View Services
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Vetted Staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Top Rated</span>
                </div>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative z-10 border-4 border-background">
                <img 
                  src="/hero-interior.png" 
                  alt="Beautiful bright Ethiopian home interior" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-secondary rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Our Services</h2>
              <p className="text-muted-foreground text-lg">Designed for your lifestyle.</p>
            </div>
            <Link href="/services">
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                See all services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))
            ) : services?.slice(0, 3).map((service) => (
              <Link key={service.id} href={`/book?service=${service.id}`}>
                <div className="group flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden hover-elevate transition-all duration-300">
                  <div className="h-48 bg-muted flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    {service.category === 'cleaning' ? (
                      <Sparkles className="h-16 w-16 text-primary/50 group-hover:text-primary/70 transition-colors" />
                    ) : service.category === 'laundry' ? (
                      <Shirt className="h-16 w-16 text-primary/50 group-hover:text-primary/70 transition-colors" />
                    ) : (
                      <HomeIcon className="h-16 w-16 text-primary/50 group-hover:text-primary/70 transition-colors" />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                    <p className="text-muted-foreground mb-6 flex-1 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between font-medium pt-4 border-t border-border">
                      <span>{service.durationHours} Hours</span>
                      <span className="text-primary">ETB {service.pricePerHour}/hr</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-accent/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-16">How Meraki Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-0.5 bg-border -z-10" />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-accent flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold">Choose a Service</h3>
              <p className="text-muted-foreground max-w-xs">Select what you need help with — cleaning, laundry, or a bit of both.</p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-accent flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold">Pick a Time</h3>
              <p className="text-muted-foreground max-w-xs">Schedule an appointment that fits your busy calendar perfectly.</p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold">Enjoy your space</h3>
              <p className="text-muted-foreground max-w-xs">Our vetted professionals handle the rest with care and precision.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Trusted Professionals</h3>
                <p className="text-muted-foreground">Every Meraki worker passes a rigorous background check and in-person interview.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Flexible Scheduling</h3>
                <p className="text-muted-foreground">Book for tomorrow or next month. Reschedule easily if your plans change.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 flex-shrink-0">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Satisfaction Guaranteed</h3>
                <p className="text-muted-foreground">If you're not completely satisfied with our service, we'll make it right.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready for a cleaner home?</h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join thousands of households in Addis Ababa who trust Meraki for their home care.
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 text-lg h-14 px-10 shadow-xl">
              Book Your First Service
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
