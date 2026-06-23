import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TESTIMONIAL = {
  text: "Meraki has completely changed how I manage my home. I book a cleaner in under 2 minutes and the results are always spotless.",
  author: "Yenehun Assefa",
  location: "Bole, Addis Ababa",
  initials: "YA",
};

const STATS = [
  { value: "500+", label: "Homes Served" },
  { value: "4.8★", label: "Avg Rating" },
  { value: "100%", label: "Vetted Staff" },
];

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-primary flex-col justify-between px-12 py-14 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-center bg-cover"
          style={{ backgroundImage: "url('/service-cleaning.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/80 to-primary" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-white" />
            <span className="font-bold text-xl text-white tracking-widest">meraki</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-white text-4xl font-bold leading-snug mb-3">
              Your home,<br />perfectly kept.
            </p>
            <p className="text-white/75 text-base">
              Book vetted cleaners and laundry helpers in minutes. Trusted across Addis Ababa.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-5">
            <div className="flex gap-1 mb-3">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              "{TESTIMONIAL.text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold">
                {TESTIMONIAL.initials}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{TESTIMONIAL.author}</p>
                <p className="text-white/60 text-xs">{TESTIMONIAL.location}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-white text-2xl font-bold">{value}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl text-primary tracking-widest">meraki</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to book your home services and manage your account.
          </p>

          <Button
            onClick={login}
            className="w-full h-12 text-base flex items-center justify-center gap-2"
          >
            Continue to log in
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            New to Meraki? An account is created automatically when you first log in.
          </p>
        </div>
      </div>
    </div>
  );
}
