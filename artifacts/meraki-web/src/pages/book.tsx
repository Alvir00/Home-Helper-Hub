import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListServices, 
  getListServicesQueryKey,
  useListWorkers,
  getListWorkersQueryKey,
  useCreateBooking,
  WorkerStatus
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  workerId: z.string().min(1, "Please select a professional"),
  scheduledDate: z.date({
    required_error: "Please select a date",
  }),
  scheduledTime: z.string().min(1, "Please select a time"),
  address: z.string().min(5, "Please enter your full address"),
  notes: z.string().optional(),
});

export default function Book() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  // Extract query params for deep linking
  const urlParams = new URLSearchParams(window.location.search);
  const initialService = urlParams.get('service') || "";
  const initialWorker = urlParams.get('worker') || "";

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: initialService,
      workerId: initialWorker,
      address: user?.address || "",
      notes: "",
      scheduledTime: "10:00",
    },
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedWorkerId = form.watch("workerId");
  const selectedDate = form.watch("scheduledDate");

  const { data: services } = useListServices({
    query: { queryKey: getListServicesQueryKey() }
  });

  const { data: workersData } = useListWorkers(
    { serviceId: selectedServiceId ? Number(selectedServiceId) : undefined },
    { 
      query: { 
        queryKey: getListWorkersQueryKey({ serviceId: selectedServiceId ? Number(selectedServiceId) : undefined }),
        enabled: !!selectedServiceId
      } 
    }
  );

  const createBookingMutation = useCreateBooking();

  const selectedServiceObj = services?.find(s => s.id.toString() === selectedServiceId);
  const selectedWorkerObj = workersData?.workers.find(w => w.id.toString() === selectedWorkerId);

  function onSubmit(values: z.infer<typeof bookingSchema>) {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your booking.",
      });
      setLocation(`/login?redirect=/book`);
      return;
    }

    // Combine date and time
    const [hours, minutes] = values.scheduledTime.split(':');
    const scheduledDateTime = new Date(values.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    createBookingMutation.mutate(
      { 
        data: {
          serviceId: Number(values.serviceId),
          workerId: Number(values.workerId),
          scheduledDate: scheduledDateTime.toISOString(),
          address: values.address,
          notes: values.notes
        } 
      },
      {
        onSuccess: (booking) => {
          toast({
            title: "Booking Confirmed! 🎉",
            description: "Your service has been successfully scheduled.",
          });
          setLocation(`/bookings/${booking.id}`);
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Booking failed",
            description: error.message || "An error occurred while booking.",
          });
        },
      }
    );
  }

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Book a Service</h1>
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          <span className={cn("px-2 py-1 rounded-full", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>1. Service</span>
          <div className={cn("h-px w-8 mx-2", step >= 2 ? "bg-primary" : "bg-border")} />
          <span className={cn("px-2 py-1 rounded-full", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>2. Professional</span>
          <div className={cn("h-px w-8 mx-2", step >= 3 ? "bg-primary" : "bg-border")} />
          <span className={cn("px-2 py-1 rounded-full", step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted")}>3. Details</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <Card className="border-border shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Form {...form}>
                <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)}>
                  
                  {/* STEP 1: SERVICE */}
                  {step === 1 && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold mb-6">Select a Service</h2>
                      <div className="grid gap-4">
                        {services?.map((service) => (
                          <div 
                            key={service.id}
                            className={cn(
                              "border-2 rounded-xl p-4 cursor-pointer transition-all",
                              selectedServiceId === service.id.toString() 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/30 hover:bg-accent/30"
                            )}
                            onClick={() => {
                              form.setValue("serviceId", service.id.toString());
                              form.setValue("workerId", ""); // Reset worker when service changes
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                <div className="text-3xl">
                                  {service.category === 'cleaning' ? '✨' : service.category === 'laundry' ? '👕' : '🏠'}
                                </div>
                                <div>
                                  <h3 className="font-bold">{service.name}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">ETB {service.pricePerHour}/hr</div>
                                <div className="text-xs text-muted-foreground mt-1">~{service.durationHours} hrs</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex justify-end">
                        <Button 
                          type="button" 
                          onClick={() => setStep(2)} 
                          disabled={!selectedServiceId}
                          className="px-8"
                        >
                          Continue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: WORKER */}
                  {step === 2 && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center mb-6">
                        <Button variant="ghost" size="icon" className="-ml-2 mr-2" onClick={() => setStep(1)} type="button">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-bold">Select a Professional</h2>
                      </div>
                      
                      {(!workersData || workersData.workers.length === 0) ? (
                        <div className="text-center py-12 bg-accent/20 rounded-xl border border-dashed">
                          <p className="text-muted-foreground">No professionals currently available for this service.</p>
                          <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>Go back</Button>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {workersData.workers.filter(w => w.status === WorkerStatus.approved).map((worker) => (
                            <div 
                              key={worker.id}
                              className={cn(
                                "border-2 rounded-xl p-4 cursor-pointer transition-all text-center flex flex-col items-center",
                                selectedWorkerId === worker.id.toString() 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:border-primary/30 hover:bg-accent/30"
                              )}
                              onClick={() => form.setValue("workerId", worker.id.toString())}
                            >
                              <Avatar className="h-16 w-16 mb-3">
                                <AvatarImage src={worker.photoUrl || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">{worker.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <h3 className="font-bold">{worker.name}</h3>
                              <div className="flex items-center text-xs font-medium text-amber-500 mt-1 mb-2">
                                ★ {worker.rating?.toFixed(1) || 'New'} <span className="text-muted-foreground ml-1">({worker.totalReviews})</span>
                              </div>
                              <div className="mt-auto text-xs text-muted-foreground flex items-center">
                                <CheckCircle2 className="h-3 w-3 mr-1 text-primary" /> {worker.completedBookings} jobs
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-8 flex justify-between">
                        <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
                        <Button 
                          type="button" 
                          onClick={() => setStep(3)} 
                          disabled={!selectedWorkerId}
                          className="px-8"
                        >
                          Continue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: DETAILS */}
                  {step === 3 && (
                    <div className="p-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center mb-6">
                        <Button variant="ghost" size="icon" className="-ml-2 mr-2" onClick={() => setStep(2)} type="button">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-bold">Date & Location</h2>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="scheduledDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal h-11",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="scheduledTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select a time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {generateTimeSlots().map((time) => (
                                      <SelectItem key={time} value={time}>{time}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Apartment/House number, Street, Neighborhood" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Instructions (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="E.g., Please focus on the kitchen. I have a friendly dog." 
                                  className="resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-8 flex justify-between pt-6 border-t">
                        <Button variant="outline" type="button" onClick={() => setStep(2)}>Back</Button>
                        <Button 
                          type="submit" 
                          disabled={createBookingMutation.isPending}
                          className="px-8"
                        >
                          {createBookingMutation.isPending ? "Confirming..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </div>
                  )}

                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* SUMMARY SIDEBAR */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 border-border bg-accent/10 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Service</span>
                {selectedServiceObj ? (
                  <span className="font-semibold text-foreground">{selectedServiceObj.name}</span>
                ) : (
                  <span className="text-muted-foreground italic text-sm">Not selected</span>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Professional</span>
                {selectedWorkerObj ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedWorkerObj.photoUrl || undefined} />
                      <AvatarFallback className="text-[10px]">{selectedWorkerObj.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{selectedWorkerObj.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-sm">Not selected</span>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Date & Time</span>
                {selectedDate ? (
                  <span className="font-semibold text-foreground">
                    {format(selectedDate, "MMM d, yyyy")} at {form.watch("scheduledTime")}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic text-sm">Not selected</span>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  {selectedServiceObj ? (
                    <span className="font-bold text-xl text-primary">
                      ETB {selectedServiceObj.pricePerHour * selectedServiceObj.durationHours}
                    </span>
                  ) : (
                    <span className="font-bold text-xl text-muted-foreground">--</span>
                  )}
                </div>
                {selectedServiceObj && (
                  <p className="text-xs text-muted-foreground text-right">
                    Based on {selectedServiceObj.durationHours} hours
                  </p>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
