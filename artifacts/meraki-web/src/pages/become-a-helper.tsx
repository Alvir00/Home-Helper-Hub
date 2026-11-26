import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListServices, getListServicesQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, Loader2, Sparkles, ShieldCheck, Wallet, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number we can reach you on")
    .max(32)
    .regex(/^\+?[0-9][0-9\s()-]*$/, "Use digits, spaces, + or - only"),
  email: z
    .string()
    .trim()
    .max(320)
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  neighborhood: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, "Keep it under 1000 characters")
    .optional()
    .or(z.literal("")),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

const BENEFITS = [
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "Keep more of what you earn",
    text: "No sign-up fee and no commission on your first month. Get paid in cash or Telebirr after every job.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Choose your own schedule",
    text: "Accept only the jobs that fit your week. Morning, afternoon or weekend — you decide.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Verified customers",
    text: "Every booking comes from a registered household with a confirmed address and phone number.",
  },
];

export default function BecomeAHelper() {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [serviceError, setServiceError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: services } = useListServices({
    query: { queryKey: getListServicesQueryKey() },
  });

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: "", phone: "", email: "", neighborhood: "", bio: "" },
  });

  function toggleService(id: number) {
    setServiceError("");
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function onSubmit(values: ApplicationValues) {
    if (selectedServices.length === 0) {
      setServiceError("Choose at least one service you can offer");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/worker-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          email: values.email || null,
          neighborhood: values.neighborhood || null,
          bio: values.bio || null,
          serviceIds: selectedServices,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "We could not send your application. Please try again.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Application not sent",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mb-3 text-3xl font-bold">Application received</h1>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          Thank you for applying to work with Meraki. Our team reviews every application by hand and
          will call you within two working days.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
          <Link href="/workers">
            <Button>Meet our helpers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Work with Meraki
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Turn your cleaning skills into steady income
        </h1>
        <p className="text-muted-foreground">
          We connect careful, reliable helpers with households across Addis Ababa. Apply in two
          minutes — no CV, no office visit.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  {benefit.icon}
                </div>
                <div>
                  <h2 className="font-semibold">{benefit.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{benefit.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-1 text-xl font-bold">Apply to become a helper</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              We will call you to confirm your experience before activating your profile.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="e.g. Tigist Haile" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" placeholder="+251 91 123 4567" {...form.register("phone")} />
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  placeholder="e.g. Bole, CMC, Ayat"
                  {...form.register("neighborhood")}
                />
              </div>

              <div>
                <Label className="mb-2 block">Services you can offer</Label>
                <div className="space-y-2 rounded-lg border border-border p-3">
                  {(services ?? []).map((service) => (
                    <label
                      key={service.id}
                      className="flex cursor-pointer items-center gap-3 text-sm"
                    >
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <span>{service.name}</span>
                    </label>
                  ))}
                  {!services && <p className="text-sm text-muted-foreground">Loading services…</p>}
                </div>
                {serviceError && <p className="mt-1 text-xs text-destructive">{serviceError}</p>}
              </div>

              <div>
                <Label htmlFor="bio">About you (optional)</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell us about your experience, the areas you know well, and the hours you prefer."
                  {...form.register("bio")}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send application
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By applying you agree to our{" "}
                <Link href="/terms" className="underline">terms</Link> and{" "}
                <Link href="/privacy" className="underline">privacy policy</Link>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
