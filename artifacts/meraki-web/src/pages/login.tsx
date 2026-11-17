import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Sparkles, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLogin();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    loginMutation.mutate(
      { data: { email: email.trim(), password } },
      {
        onSuccess: () => {
          // Full navigation so the auth hook re-reads the new session cookie.
          window.location.assign("/");
        },
        onError: (error) => {
          setFormError(error.message || "Unable to sign in. Please try again.");
        },
      },
    );
  };

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
                <Star key={i} className="h-4 w-4 fill-star text-star" />
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 text-base flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New to Meraki?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
