import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-primary">Meraki</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/services" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/services" ? "text-primary" : "text-muted-foreground"}`}>Services</Link>
            <Link href="/workers" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith("/workers") ? "text-primary" : "text-muted-foreground"}`}>Workers</Link>
            <Link href="/plans" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/plans" ? "text-primary" : "text-muted-foreground"}`}>Plans</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4">
                {isAdmin ? (
                  <>
                    <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/admin" ? "text-primary" : "text-muted-foreground"}`}>Admin</Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>Dashboard</Link>
                    <Link href="/bookings" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith("/bookings") ? "text-primary" : "text-muted-foreground"}`}>Bookings</Link>
                  </>
                )}
                
                <div className="flex items-center gap-2 pl-4 border-l">
                  <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <UserIcon className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <button onClick={login} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Log in</button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={login}>Sign up</Button>
              </div>
            )}
            
            <Link href="/book">
              <Button size="sm" className="ml-2 shadow-sm">Book Now</Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link href="/services" className="text-sm font-medium py-2" onClick={closeMenu}>Services</Link>
            <Link href="/workers" className="text-sm font-medium py-2" onClick={closeMenu}>Workers</Link>
            <Link href="/plans" className="text-sm font-medium py-2" onClick={closeMenu}>Plans</Link>
            
            {isAuthenticated ? (
              <>
                <div className="h-px bg-border my-2" />
                {isAdmin ? (
                  <Link href="/admin" className="text-sm font-medium py-2" onClick={closeMenu}>Admin Dashboard</Link>
                ) : (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium py-2" onClick={closeMenu}>Dashboard</Link>
                    <Link href="/bookings" className="text-sm font-medium py-2" onClick={closeMenu}>My Bookings</Link>
                  </>
                )}
                <Link href="/profile" className="text-sm font-medium py-2" onClick={closeMenu}>Profile Settings</Link>
                <Button variant="outline" className="mt-2 w-full justify-center" onClick={() => { logout(); closeMenu(); }}>Log out</Button>
              </>
            ) : (
              <>
                <div className="h-px bg-border my-2" />
                <Button variant="outline" className="w-full justify-center" onClick={() => { login(); closeMenu(); }}>Log in</Button>
                <Button className="w-full justify-center" onClick={() => { login(); closeMenu(); }}>Sign up</Button>
              </>
            )}
            <Link href="/book" onClick={closeMenu}>
              <Button className="w-full justify-center shadow-md">Book Now</Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t border-border bg-background py-12 mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl tracking-tight text-primary">Meraki</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                Precise, trustworthy, and human home help service for urban households in Addis Ababa.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">House Cleaning</Link></li>
                <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Laundry Services</Link></li>
                <li><Link href="/plans" className="text-sm text-muted-foreground hover:text-primary transition-colors">Subscription Plans</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/workers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Workers</Link></li>
                <li><Link href="/plans" className="text-sm text-muted-foreground hover:text-primary transition-colors">Subscription Plans</Link></li>
                <li><Link href="/book" className="text-sm text-muted-foreground hover:text-primary transition-colors">Book a Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2">
                <li><button onClick={login} className="text-sm text-muted-foreground hover:text-primary transition-colors">Log In</button></li>
                <li><Link href="/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Bookings</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Meraki. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Doing things with soul in Addis Ababa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
