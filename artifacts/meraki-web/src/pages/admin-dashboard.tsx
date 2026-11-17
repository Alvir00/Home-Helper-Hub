import { useGetAdminSummary, getGetAdminSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users, Briefcase, CalendarClock, Banknote, Activity,
  TrendingUp, Star, CheckCircle2, Clock, XCircle, RotateCcw, UserCheck
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, { label: string; color: string; bar: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "bg-coral text-coral-foreground", bar: "bg-coral", icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",     bar: "bg-blue-500",   icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", bar: "bg-green-500",  icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",         bar: "bg-red-400",    icon: <XCircle className="h-3.5 w-3.5" /> },
  in_progress:{ label: "In Progress", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", bar: "bg-purple-500", icon: <RotateCcw className="h-3.5 w-3.5" /> },
};

function StatCard({
  title, value, sub, icon, accent, isLoading,
}: {
  title: string; value: React.ReactNode; sub?: React.ReactNode;
  icon: React.ReactNode; accent: string; isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? <Skeleton className="h-8 w-24" /> : value}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function avatarInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetAdminSummary({
    query: { queryKey: getGetAdminSummaryQueryKey() }
  });

  const totalBookingsForBar = Object.values(summary?.bookingsByStatus ?? {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Overview</h1>
          <p className="text-muted-foreground">Real-time platform statistics and management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/users">
            <Button variant="outline" className="gap-2"><Users className="h-4 w-4" />Users</Button>
          </Link>
          <Link href="/admin/workers">
            <Button variant="outline" className="gap-2"><Briefcase className="h-4 w-4" />Workers</Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="outline" className="gap-2"><CalendarClock className="h-4 w-4" />Bookings</Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Revenue This Month"
          value={`ETB ${(summary?.revenueThisMonth ?? 0).toLocaleString()}`}
          sub="From completed bookings"
          icon={<Banknote className="h-4 w-4 text-emerald-600" />}
          accent="bg-emerald-100 dark:bg-emerald-900/30"
          isLoading={isLoading}
        />
        <StatCard
          title="Bookings Today"
          value={summary?.bookingsToday}
          sub="Scheduled for today"
          icon={<CalendarClock className="h-4 w-4 text-blue-600" />}
          accent="bg-blue-100 dark:bg-blue-900/30"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Bookings"
          value={summary?.totalBookings}
          sub="All time"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          accent="bg-primary/10"
          isLoading={isLoading}
        />
        <StatCard
          title="Workers"
          value={summary?.totalWorkers}
          sub={summary?.pendingWorkers
            ? <span className="text-star font-medium">{summary.pendingWorkers} pending approval</span>
            : "All approved"}
          icon={<UserCheck className="h-4 w-4 text-violet-600" />}
          accent="bg-violet-100 dark:bg-violet-900/30"
          isLoading={isLoading}
        />
        <StatCard
          title="Registered Users"
          value={summary?.totalUsers}
          sub={<span>{summary?.activeSubscriptions ?? 0} on subscriptions</span>}
          icon={<Users className="h-4 w-4 text-rose-600" />}
          accent="bg-rose-100 dark:bg-rose-900/30"
          isLoading={isLoading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* Recent Bookings — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest 8 bookings across the platform</CardDescription>
            </div>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="text-primary">View all →</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y">
                {(summary?.recentBookings ?? []).map((b) => {
                  const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-6 py-3 hover:bg-accent/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{b.userName ?? "—"}</span>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="text-sm text-muted-foreground truncate">{b.serviceName ?? "—"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex gap-3">
                          <span>Worker: {b.workerName ?? "Unassigned"}</span>
                          <span>{formatDate(b.scheduledDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold">ETB {b.totalPrice}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!isLoading && (summary?.recentBookings ?? []).length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No bookings yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Workers */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Top Workers</CardTitle>
            <CardDescription>By completed bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : (summary?.topWorkers ?? []).map((w, i) => (
                  <div key={w.id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-400 text-amber-900" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-300 text-orange-900" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    {w.photoUrl ? (
                      <img src={w.photoUrl} alt={w.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {avatarInitials(w.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{w.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-star fill-star" />{w.rating?.toFixed(1) ?? "—"}</span>
                        <span>·</span>
                        <span>{w.completedBookings} done</span>
                      </div>
                    </div>
                  </div>
                ))}
            {!isLoading && (summary?.topWorkers ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">No approved workers yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Booking Status Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking Status Breakdown</CardTitle>
            <CardDescription>All-time distribution across statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              Object.entries(summary?.bookingsByStatus ?? {}).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status] ?? { label: status, bar: "bg-muted", color: "", icon: null };
                const pct = Math.round((count / totalBookingsForBar) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        {cfg.icon}<span className="capitalize">{cfg.label}</span>
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{count}</span>
                        <span className="text-muted-foreground text-xs">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Signups + Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>Newest registered users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                : (summary?.recentUsers ?? []).map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                        {avatarInitials(u.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDate(u.createdAt)}</span>
                    </div>
                  ))}
              {!isLoading && (summary?.recentUsers ?? []).length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-2">No users yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/workers?status=pending">
                <div className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">Review Pending Workers</span>
                  </div>
                  {(summary?.pendingWorkers ?? 0) > 0 && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 font-bold dark:bg-amber-900/30 dark:text-amber-300">
                      {summary!.pendingWorkers}
                    </Badge>
                  )}
                </div>
              </Link>
              <Link href="/admin/users">
                <div className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">Manage Users</span>
                  </div>
                </div>
              </Link>
              <Link href="/admin/workers">
                <div className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-violet-100 text-violet-600 rounded-lg dark:bg-violet-900/30">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">Manage Workers</span>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
