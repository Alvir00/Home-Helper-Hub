import { useGetAdminSummary, getGetAdminSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, CalendarClock, Banknote, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetAdminSummary({
    query: { queryKey: getGetAdminSummaryQueryKey() }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Overview</h1>
          <p className="text-muted-foreground">Platform statistics and management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/workers">
            <Button variant="outline">Manage Workers</Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="outline">All Bookings</Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Month)</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `ETB ${summary?.revenueThisMonth}`}</div>
            <p className="text-xs text-muted-foreground mt-1">Total platform revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings Today</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.bookingsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.totalWorkers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.pendingWorkers ? (
                <span className="text-amber-500 font-medium">{summary.pendingWorkers} pending approval</span>
              ) : "All approved"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Households on monthly plans</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Bookings Breakdown</CardTitle>
            <CardDescription>Lifetime bookings by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : summary?.bookingsByStatus ? (
              <div className="space-y-4">
                {Object.entries(summary.bookingsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 rounded-lg border bg-accent/20">
                    <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/workers?status=pending">
              <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/40 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold group-hover:text-primary transition-colors">Review Pending Workers</h4>
                    <p className="text-sm text-muted-foreground">Approve or reject new applications</p>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-sm dark:bg-amber-900 dark:text-amber-300">
                  {summary?.pendingWorkers || 0}
                </div>
              </div>
            </Link>

            <Link href="/admin/bookings">
              <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/40 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold group-hover:text-primary transition-colors">View All Bookings</h4>
                    <p className="text-sm text-muted-foreground">Monitor platform activity</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
