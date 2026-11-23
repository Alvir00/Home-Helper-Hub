import { useListSubscriptionPlans, getListSubscriptionPlansQueryKey, useCreateSubscription, useGetCurrentSubscription, getGetCurrentSubscriptionQueryKey, UserSubscriptionStatus } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { DealBadge, Price } from "@/components/booking";

export default function Plans() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useListSubscriptionPlans({
    query: { queryKey: getListSubscriptionPlansQueryKey() },
  });
  const { data: currentSubscription } = useGetCurrentSubscription({
    query: { enabled: isAuthenticated, queryKey: getGetCurrentSubscriptionQueryKey() },
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
          toast({ title: "Subscription activated!", description: "You've successfully subscribed to the plan." });
          queryClient.invalidateQueries({ queryKey: getGetCurrentSubscriptionQueryKey() });
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Subscription failed", description: error.message || "Something went wrong." });
        },
      }
    );
  };

  const activePlanId =
    currentSubscription && currentSubscription.status === UserSubscriptionStatus.active
      ? currentSubscription.plan.id
      : null;

  return (
    <div className="flex flex-col w-full">
      <section className="bg-brand text-brand-foreground">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Plans & deals</h1>
          <p className="mt-2 text-white/85 text-sm md:text-base max-w-2xl">
            Regular bookings at a discounted rate. Priority scheduling, consistent helpers, no commitment.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {plansLoading
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)
            : plans?.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-lg border bg-card p-6",
                    plan.popular ? "border-primary shadow-md" : "border-border",
                    activePlanId === plan.id ? "ring-2 ring-primary" : ""
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-6 rounded-sm bg-deal px-2 py-0.5 text-xs font-bold text-deal-foreground">
                      Most popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <DealBadge>Save {plan.discountPercent}%</DealBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4"><Price amount={plan.priceMonthly} unit="/month" /></div>
                  <div className="mt-2 inline-flex w-fit rounded-sm bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {plan.bookingsPerMonth} bookings / month
                  </div>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{plan.discountPercent}% off extra bookings</span>
                    </li>
                  </ul>
                  <Button
                    className="mt-6 w-full font-bold h-11"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={createSubscriptionMutation.isPending || activePlanId === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {activePlanId === plan.id ? "Current plan" : createSubscriptionMutation.isPending ? "Processing…" : "Subscribe"}
                  </Button>
                </div>
              ))}
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h3 className="text-xl font-bold mb-5">Frequently asked questions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes — no long-term commitments. Cancel from your dashboard at any time." },
              { q: "What if I need more cleanings?", a: "Extra bookings beyond your plan are charged at your plan's discounted rate." },
              { q: "Do unused bookings roll over?", a: "Unused bookings don't roll over, so helpers can keep a predictable schedule." },
              { q: "Can I tip my professional?", a: "Absolutely — 100% of tips go to your helper, in cash or via the app." },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-lg border border-border bg-muted/50 p-5">
                <h4 className="font-semibold text-sm mb-1.5">{q}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-lg bg-brand p-8 md:p-10 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-extrabold">Not ready for a plan?</h3>
          <p className="mt-2 text-white/80 text-sm md:text-base">Book a one-off service today — pay after the job.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book">
              <Button size="lg" className="bg-deal text-deal-foreground hover:bg-deal/90 font-bold">Book a service <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold">Create free account</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
