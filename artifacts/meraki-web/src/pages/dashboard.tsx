import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, BookingStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Star, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case BookingStatus.completed: return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case BookingStatus.pending: return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case BookingStatus.in_progress: return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case BookingStatus.cancelled: return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Household Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime services</p>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.bookingsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Bookings in current month</p>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Subscription Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : summary?.activeSubscription ? (
              <>
                <div className="text-lg font-bold text-foreground">{summary.activeSubscription.plan.name}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className="text-primary font-medium mr-1">{summary.activeSubscription.bookingsUsed} / {summary.activeSubscription.plan.bookingsPerMonth}</span>
                  bookings used
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-muted-foreground">No active plan</div>
                <Link href="/plans">
                  <span className="text-xs text-primary font-medium hover:underline mt-1 inline-block">View plans</span>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
              </div>
              <Link href="/book">
                <Button size="sm">Book Service</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : summary?.upcomingBookings && summary.upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {summary.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-xl bg-accent/30 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-background flex flex-col items-center justify-center border shadow-sm">
                          <span className="text-xs font-medium text-muted-foreground uppercase">{format(new Date(booking.scheduledDate), 'MMM')}</span>
                          <span className="text-lg font-bold leading-none">{format(new Date(booking.scheduledDate), 'dd')}</span>
                        </div>
                        <div>
                          <h4 className="font-bold">{booking.service.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(booking.scheduledDate), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={booking.worker.photoUrl || undefined} />
                            <AvatarFallback>{booking.worker.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium hidden sm:inline-block">{booking.worker.name}</span>
                        </div>
                        <Link href={`/bookings/${booking.id}`} className="ml-auto">
                          <Button variant="outline" size="sm">Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
                  <p className="text-muted-foreground mb-4">No upcoming bookings scheduled.</p>
                  <Link href="/book">
                    <Button variant="outline">Schedule one now</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent History</CardTitle>
                <CardDescription>Your past appointments</CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="ghost" size="sm">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : summary?.recentBookings && summary.recentBookings.length > 0 ? (
                <div className="space-y-0">
                  {summary.recentBookings.slice(0, 4).map((booking, i) => (
                    <Link key={booking.id} href={`/bookings/${booking.id}`}>
                      <div className={`flex items-center justify-between py-4 ${i !== 0 ? 'border-t border-border/50' : ''} hover:bg-accent/20 transition-colors px-2 -mx-2 rounded-md`}>
                        <div>
                          <div className="font-medium">{booking.service.name}</div>
                          <div className="text-sm text-muted-foreground">{format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`border-none ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No history available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/book">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  Book New Service
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="outline" className="w-full justify-start h-12">
                  <ShieldCheck className="mr-3 h-5 w-5 text-emerald-500" />
                  Manage Subscription
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start h-12">
                  <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
                  Payment Methods
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Need help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Our support team is available from 8 AM to 6 PM daily to assist you with any questions.
              </p>
              <Button variant="secondary" className="w-full bg-background text-primary hover:bg-background/90">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
