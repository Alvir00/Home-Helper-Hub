import { useParams, Link, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey, useUpdateBookingStatus, useReviewBooking, BookingStatus } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, MapPin, Calendar, Star, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export default function BookingDetail() {
  const { id } = useParams();
  const bookingId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useGetBooking(bookingId, {
    query: { enabled: !!bookingId, queryKey: getGetBookingQueryKey(bookingId) }
  });

  const updateStatusMutation = useUpdateBookingStatus();
  const reviewMutation = useReviewBooking();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
        <Link href="/bookings">
          <Button>Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      updateStatusMutation.mutate(
        { id: bookingId, data: { status: BookingStatus.cancelled } },
        {
          onSuccess: (updatedBooking) => {
            toast({ title: "Booking cancelled successfully" });
            queryClient.setQueryData(getGetBookingQueryKey(bookingId), updatedBooking);
          },
          onError: () => {
            toast({ variant: "destructive", title: "Failed to cancel booking" });
          }
        }
      );
    }
  };

  const onSubmitReview = (values: z.infer<typeof reviewSchema>) => {
    reviewMutation.mutate(
      { id: bookingId, data: values },
      {
        onSuccess: () => {
          toast({ title: "Review submitted successfully!" });
          queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(bookingId) });
          form.reset();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to submit review" });
        }
      }
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case BookingStatus.completed: return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      case BookingStatus.pending: return "bg-coral text-coral-foreground border-coral";
      case BookingStatus.in_progress: return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case BookingStatus.cancelled: return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link href="/bookings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to bookings
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className={`h-2 w-full ${getStatusColor(booking.status).split(' ')[0]}`} />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className={`mb-3 capitalize ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </Badge>
                  <CardTitle className="text-2xl">{booking.service.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center text-base">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(booking.scheduledDate), "EEEE, MMMM do, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">ETB {booking.totalPrice}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-xl">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-sm text-muted-foreground mb-1">Service Address</div>
                  <div className="text-foreground">{booking.address}</div>
                </div>
              </div>

              {booking.notes && (
                <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground mb-1">Special Instructions</div>
                    <div className="text-foreground">{booking.notes}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Section */}
          {booking.status === BookingStatus.completed && (
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle>Review Your Service</CardTitle>
                <CardDescription>How did {booking.worker.name} do?</CardDescription>
              </CardHeader>
              <CardContent>
                {booking.review ? (
                  <div className="bg-accent/20 p-6 rounded-xl border border-border">
                    <div className="flex items-center gap-1 mb-3 text-star">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < booking.review!.rating ? "fill-current" : "text-muted stroke-[1.5px]"}`} />
                      ))}
                    </div>
                    {booking.review.comment && (
                      <p className="text-foreground italic">"{booking.review.comment}"</p>
                    )}
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => field.onChange(rating)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    className={`h-8 w-8 transition-colors ${rating <= field.value ? "fill-star text-star" : "text-muted hover:text-star/60"}`} 
                                  />
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feedback (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Share your experience..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={reviewMutation.isPending}>
                        {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Your Professional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={booking.worker.photoUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">{booking.worker.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{booking.worker.name}</h3>
                <div className="flex items-center text-sm font-medium text-star mt-1 mb-4">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  {booking.worker.rating?.toFixed(1) || 'New'} 
                  <span className="text-muted-foreground ml-1">({booking.worker.totalReviews} reviews)</span>
                </div>
                <Link href={`/workers/${booking.worker.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {(booking.status === BookingStatus.pending || booking.status === BookingStatus.confirmed) && (
            <Card className="border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-900/10">
              <CardContent className="p-4">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleCancel}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel Booking
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Free cancellation up to 24 hours before the scheduled time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
