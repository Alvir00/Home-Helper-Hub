import { useListSubscriptionPlans, getListSubscriptionPlansQueryKey, useCreateSubscription, useGetCurrentSubscription, getGetCurrentSubscriptionQueryKey, UserSubscriptionStatus } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export default function Plans() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useListSubscriptionPlans({
    query: { queryKey: getListSubscriptionPlansQueryKey() }
  });

  const { data: currentSubscription, isLoading: subLoading } = useGetCurrentSubscription({
    query: { 
      enabled: isAuthenticated,
      queryKey: getGetCurrentSubscriptionQueryKey()
    }
  });

  const createSubscriptionMutation = useCreateSubscription();

  const handleSubscribe = (planId: number) => {
    if (!isAuthenticated) {
      setLocation("/login?redirect=/plans");
      return;
    }

    createSubscriptionMutation.mutate(
      { data: { planId } },
      {
        onSuccess: () => {
          toast({
            title: "Subscription activated!",
            description: "You've successfully subscribed to the plan.",
          });
          queryClient.invalidateQueries({ queryKey: getGetCurrentSubscriptionQueryKey() });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Subscription failed",
            description: error.message || "Something went wrong.",
          });
        }
      }
    );
  };

  const activePlanId = currentSubscription && currentSubscription.status === UserSubscriptionStatus.active 
    ? currentSubscription.plan.id 
    : null;

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your household's needs. Enjoy priority booking, consistent service, and discounted rates.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {plansLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-border">
              <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-32 mb-6" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-12 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                plan.popular ? "border-primary shadow-lg scale-105 z-10" : "border-border shadow-sm hover-elevate",
                activePlanId === plan.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-xs font-bold text-center py-1.5 uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              {activePlanId === plan.id && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground p-1 rounded-bl-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              <CardHeader className={cn("pb-4", plan.popular ? "pt-8" : "pt-6")}>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-baseline">
                  <span className="text-sm font-semibold text-muted-foreground mr-1">ETB</span>
                  <span className="text-4xl font-bold tracking-tight">{plan.priceMonthly}</span>
                  <span className="text-muted-foreground ml-1 font-medium">/month</span>
                </div>
                <div className="mb-6 text-sm font-medium text-primary bg-primary/10 inline-block px-3 py-1 rounded-full">
                  Includes {plan.bookingsPerMonth} bookings
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                      <span className="text-sm text-foreground leading-tight">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <span className="text-sm text-foreground leading-tight">{plan.discountPercent}% discount on extra bookings</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-4 pb-6">
                <Button 
                  className="w-full text-base h-12" 
                  variant={plan.popular ? "default" : "outline"}
                  disabled={createSubscriptionMutation.isPending || activePlanId === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {activePlanId === plan.id ? (
                    "Current Plan"
                  ) : createSubscriptionMutation.isPending ? (
                    "Processing..."
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div className="mt-24 text-center">
        <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mt-8">
          <div>
            <h4 className="font-bold text-lg mb-2">Can I cancel anytime?</h4>
            <p className="text-muted-foreground">Yes, there are no long-term commitments. You can cancel your subscription at any time from your dashboard.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">What if I need more cleanings?</h4>
            <p className="text-muted-foreground">Any additional bookings beyond your plan's included amount will be charged at your plan's discounted rate.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Do unused bookings roll over?</h4>
            <p className="text-muted-foreground">Unused bookings do not roll over to the next month to ensure our professionals have a predictable schedule.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Can I tip my professional?</h4>
            <p className="text-muted-foreground">Absolutely! 100% of tips go directly to your service professional. You can tip in cash or through the app after service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
