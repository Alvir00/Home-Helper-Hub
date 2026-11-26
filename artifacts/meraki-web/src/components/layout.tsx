import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, User as UserIcon, HelpCircle } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/workers", label: "Helpers" },
  { href: "/plans", label: "Plans & deals" },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const close = () => setOpen(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
      {/* ── Booking-blue header ── */}
      <header className="sticky top-0 z-50 w-full bg-brand text-brand-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0" onClick={close}>
              <Sparkles className="h-6 w-6 text-deal" />
              <span className="text-xl font-bold tracking-tight">Meraki</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 ${
                    location.startsWith(item.href) ? "bg-white/15" : "text-white/90"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href={isAdmin ? "/admin" : "/dashboard"}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="max-w-[110px] truncate">{user?.name}</span>
                  </Link>
                  <Button variant="outline" size="sm" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={logout}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={login}>
                    Sign in
                  </Button>
                  <Button size="sm" className="bg-white text-brand hover:bg-white/90" onClick={login}>
                    Register
                  </Button>
                </>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/15 bg-brand px-4 py-4 flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10" onClick={close}>
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/15" />
            {isAuthenticated ? (
              <>
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10" onClick={close}>
                  {isAdmin ? "Admin dashboard" : "My dashboard"}
                </Link>
                <Link href="/bookings" className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10" onClick={close}>
                  My bookings
                </Link>
                <button className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/10" onClick={() => { logout(); close(); }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <button className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/10" onClick={() => { login(); close(); }}>
                  Sign in
                </button>
                <button className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/10" onClick={() => { login(); close(); }}>
                  Register
                </button>
              </>
            )}
            <Link href="/book" className="mt-2" onClick={close}>
              <Button className="w-full bg-deal text-deal-foreground hover:bg-deal/90">Book now</Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 w-full">{children}</main>

      {/* ── Booking-blue footer ── */}
      <footer className="bg-brand text-white/80">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-deal" />
                <span className="text-lg font-bold text-white">Meraki</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Trusted home cleaning & laundry help across Addis Ababa. Book by the hour, pay after the job.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/services" className="hover:text-white hover:underline">House cleaning</Link></li>
                <li><Link href="/services" className="hover:text-white hover:underline">Kitchen deep clean</Link></li>
                <li><Link href="/services" className="hover:text-white hover:underline">Laundry & ironing</Link></li>
                <li><Link href="/plans" className="hover:text-white hover:underline">Subscription plans</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/workers" className="hover:text-white hover:underline">Our helpers</Link></li>
                <li><Link href="/become-a-helper" className="hover:text-white hover:underline">Become a helper</Link></li>
                <li><Link href="/book" className="hover:text-white hover:underline">Book a service</Link></li>
                <li><Link href="/contact" className="hover:text-white hover:underline">Contact us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/bookings" className="hover:text-white hover:underline">My bookings</Link></li>
                <li><Link href="/profile" className="hover:text-white hover:underline">Account</Link></li>
                <li className="inline-flex items-center gap-1.5"><HelpCircle className="h-4 w-4" /> help@meraki.et</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p>© {new Date().getFullYear()} Meraki. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link href="/terms" className="hover:text-white hover:underline">Terms</Link>
              <Link href="/privacy" className="hover:text-white hover:underline">Privacy</Link>
              <Link href="/contact" className="hover:text-white hover:underline">Contact</Link>
              <span>Addis Ababa, Ethiopia · Prices in ETB</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
