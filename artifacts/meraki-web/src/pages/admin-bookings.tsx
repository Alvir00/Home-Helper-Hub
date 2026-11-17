import { useState } from "react";
import { Link } from "wouter";
import {
  useListAllBookings,
  getListAllBookingsQueryKey,
  useUpdateBookingStatus,
  BookingStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

/**
 * Mirrors the transition rules enforced by the API (`lib/bookingPolicy.ts`).
 * Households can only cancel; advancing a job is an admin action, so this page
 * is the only place the status can move forward.
 */
const ADMIN_NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.pending]: [BookingStatus.confirmed, BookingStatus.cancelled],
  [BookingStatus.confirmed]: [BookingStatus.in_progress, BookingStatus.cancelled],
  [BookingStatus.in_progress]: [BookingStatus.completed, BookingStatus.cancelled],
  [BookingStatus.completed]: [],
  [BookingStatus.cancelled]: [],
};

const statusLabel = (status: BookingStatus) => status.replace("_", " ");

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusFilterMap: Record<string, BookingStatus | undefined> = {
    pending: BookingStatus.pending,
    confirmed: BookingStatus.confirmed,
    in_progress: BookingStatus.in_progress,
    completed: BookingStatus.completed,
    cancelled: BookingStatus.cancelled,
    all: undefined
  };

  const { data: bookingsData, isLoading } = useListAllBookings(
    { status: statusFilterMap[statusFilter] },
    { query: { queryKey: getListAllBookingsQueryKey({ status: statusFilterMap[statusFilter] }) } }
  );

  const updateStatusMutation = useUpdateBookingStatus();

  const handleUpdateStatus = (id: number, status: BookingStatus) => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Booking marked ${statusLabel(status)}` });
          queryClient.invalidateQueries({
            queryKey: getListAllBookingsQueryKey({ status: statusFilterMap[statusFilter] }),
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to update booking",
            description: error.message,
          });
        },
      }
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed: return "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case BookingStatus.completed: return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
      case BookingStatus.pending: return "border-coral bg-coral text-coral-foreground";
      case BookingStatus.in_progress: return "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
      case BookingStatus.cancelled: return "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
          <p className="text-muted-foreground">Monitor and progress platform bookings.</p>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))
            ) : bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
              bookingsData.bookings.map((booking) => {
                const nextStatuses = ADMIN_NEXT_STATUSES[booking.status];
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{format(new Date(booking.scheduledDate), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(booking.scheduledDate), 'h:mm a')}</div>
                    </TableCell>
                    <TableCell>{booking.service.name}</TableCell>
                    <TableCell>{booking.worker.name}</TableCell>
                    <TableCell className="font-medium">ETB {booking.totalPrice}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(booking.status)}`}>
                        {statusLabel(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nextStatuses.length > 0 ? (
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleUpdateStatus(booking.id, value as BookingStatus)}
                        >
                          <SelectTrigger className="h-8 w-[150px] capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={booking.status} disabled>
                              {statusLabel(booking.status)} (current)
                            </SelectItem>
                            {nextStatuses.map((status) => (
                              <SelectItem key={status} value={status} className="capitalize">
                                {statusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
