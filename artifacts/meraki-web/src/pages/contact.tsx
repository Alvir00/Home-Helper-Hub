import { Link } from "wouter";
import { Mail, Phone, MapPin, Clock, MessageCircleQuestion } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    question: "How do I reschedule a booking?",
    answer:
      "Open My bookings, choose the booking and cancel it, then book the new time. Cancellations more than 24 hours before the visit are free.",
  },
  {
    question: "When and how do I pay?",
    answer:
      "Pay the helper directly after the job finishes, in cash or by Telebirr. The price shown at checkout is the full amount — no hidden fees.",
  },
  {
    question: "What if I am not happy with the clean?",
    answer:
      "Tell us within 24 hours and include photos where possible. We will arrange a re-clean or a partial refund after speaking with the helper.",
  },
  {
    question: "How do I become a helper?",
    answer:
      "Apply through the become-a-helper page. We review applications by hand and call you within two working days to confirm your experience.",
  },
];

export default function Contact() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Contact us</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Real people, based in Addis Ababa. We answer every message within one working day.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Email</h2>
              <a href="mailto:help@meraki.et" className="text-sm text-primary underline">
                help@meraki.et
              </a>
              <p className="mt-1 text-xs text-muted-foreground">Best for booking changes and refunds</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Phone & WhatsApp</h2>
              <a href="tel:+251911000001" className="text-sm text-primary underline">
                +251 91 100 0001
              </a>
              <p className="mt-1 text-xs text-muted-foreground">Same-day bookings and urgent issues</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Support hours</h2>
              <p className="text-sm">Monday – Saturday, 8:00 – 19:00</p>
              <p className="mt-1 text-xs text-muted-foreground">Sunday: urgent bookings only</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Office</h2>
              <p className="text-sm">Bole, Addis Ababa, Ethiopia</p>
              <p className="mt-1 text-xs text-muted-foreground">Visits by appointment only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <MessageCircleQuestion className="h-5 w-5 text-primary" /> Common questions
      </h2>
      <div className="mb-10 divide-y divide-border rounded-lg border border-border">
        {FAQS.map((faq) => (
          <div key={faq.question} className="p-5">
            <h3 className="font-semibold">{faq.question}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-brand p-6 text-white sm:p-8">
        <h2 className="text-xl font-bold">Ready to book?</h2>
        <p className="mt-1 text-sm text-white/80">
          Choose a service, pick a helper and confirm a time — it takes about two minutes.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/book">
            <Button className="bg-deal text-deal-foreground hover:bg-deal/90">Book a service</Button>
          </Link>
          <Link href="/become-a-helper">
            <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
              Become a helper
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
