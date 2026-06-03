import { useState } from "react";
import { Link } from "wouter";
import { useListBookings, getListBookingsQueryKey, BookingStatus } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight, Calendar } from "lucide-react";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<string>("upcoming");

  const statusFilterMap: Record<string, BookingStatus | undefined> = {
    upcoming: BookingStatus.confirmed, // Assuming confirmed are upcoming for simplicity, ideally we'd have a date filter or a backend 'upcoming' flag
    past: BookingStatus.completed,
    cancelled: BookingStatus.cancelled,
    all: undefined
  };

  const { data: bookingsData, isLoading } = useListBookings(
    { status: statusFilterMap[activeTab] },
    { query: { queryKey: getListBookingsQueryKey({ status: statusFilterMap[activeTab] }) } }
  );

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your past and upcoming service appointments.</p>
        </div>
        <Link href="/book">
          <Button>Book New Service</Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3 mb-8">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <Skeleton className="h-24 w-24 rounded-full md:rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-32 md:self-center" />
                  </div>
                </Card>
              ))}
            </div>
          ) : bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
            <div className="space-y-4">
              {bookingsData.bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden hover-elevate transition-all border-border/60">
                  <div className="flex flex-col md:flex-row">
                    {/* Date/Status Column */}
                    <div className="bg-accent/30 p-6 md:w-64 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-border/50">
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {format(new Date(booking.scheduledDate), 'MMM')}
                      </div>
                      <div className="text-4xl font-bold text-foreground mb-1">
                        {format(new Date(booking.scheduledDate), 'dd')}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {format(new Date(booking.scheduledDate), 'EEEE, h:mm a')}
                      </div>
                      <Badge variant="outline" className={`border-none ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {/* Details Column */}
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{booking.service.name}</h3>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Clock className="w-4 h-4 mr-1.5" /> {booking.service.durationHours} hours
                            <span className="mx-2">•</span>
                            <span className="font-medium text-foreground">ETB {booking.totalPrice}</span>
                          </div>
                        </div>
                        <Link href={`/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm" className="hidden md:flex">
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-4 mt-auto p-4 bg-muted/30 rounded-xl">
                        <Avatar className="h-10 w-10 border border-background">
                          <AvatarImage src={booking.worker.photoUrl || undefined} />
                          <AvatarFallback>{booking.worker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{booking.worker.name}</div>
                          <div className="text-xs text-muted-foreground">Professional</div>
                        </div>
                      </div>

                      <Link href={`/bookings/${booking.id}`} className="md:hidden mt-4">
                        <Button variant="outline" className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-accent/10 rounded-2xl border border-dashed border-border">
              <div className="flex justify-center mb-4 opacity-40">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don't have any {activeTab} bookings at the moment. 
              </p>
              <Link href="/book">
                <Button>Book a Service</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
