import { useState, useEffect } from "react";
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
  useGetMe,
  getGetMeQueryKey,
  useUpdateMe,
  WorkerStatus
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowRight, ArrowLeft, CalendarCheck2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { serviceImageMap, RatingBadge, Price } from "@/components/booking";

const ADDIS_NEIGHBORHOODS = [
  "Bole", "Kazanchis", "Piassa", "CMC", "Lideta", "Kirkos", "Yeka", "Kolfe Keranio",
  "Gulele", "Arada", "Addis Ketema", "Nifas Silk-Lafto", "Akaki Kality", "Lemi Kura",
  "Bole Bulbulo", "Sarbet", "Megenagna", "Mexico Square", "Arat Kilo", "Saris",
];

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  workerId: z.string().min(1, "Please select a professional"),
  scheduledDate: z.date({ required_error: "Please select a date" }),
  scheduledTime: z.string().min(1, "Please select a time"),
  neighborhood: z.string().min(1, "Please select your neighborhood"),
  addressDetail: z.string().min(2, "Please add your apartment or house number"),
  notes: z.string().optional(),
});

const STEPS = [
  { n: 1, label: "Service" },
  { n: 2, label: "Helper" },
  { n: 3, label: "Details" },
];

export default function Book() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const urlParams = new URLSearchParams(window.location.search);
  const initialService = urlParams.get('service') || "";
  const initialWorker = urlParams.get('worker') || "";

  const { data: me } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), enabled: isAuthenticated }
  });
  const updateMeMutation = useUpdateMe();

  const savedNeighborhood = (me as any)?.neighborhood || "";
  const savedAddressDetail = me?.address || "";

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: initialService,
      workerId: initialWorker,
      neighborhood: savedNeighborhood,
      addressDetail: savedAddressDetail,
      notes: "",
      scheduledTime: "10:00",
    },
  });

  useEffect(() => {
    if (savedNeighborhood) form.setValue("neighborhood", savedNeighborhood);
    if (savedAddressDetail) form.setValue("addressDetail", savedAddressDetail);
  }, [savedNeighborhood, savedAddressDetail]); // eslint-disable-line react-hooks/exhaustive-deps

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
      toast({ title: "Authentication required", description: "Please log in to complete your booking." });
      setLocation(`/login?redirect=/book`);
      return;
    }
    const [hours, minutes] = values.scheduledTime.split(':');
    const scheduledDateTime = new Date(values.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    const combinedAddress = `${values.neighborhood} — ${values.addressDetail}`;

    createBookingMutation.mutate(
      {
        data: {
          serviceId: Number(values.serviceId),
          workerId: Number(values.workerId),
          scheduledDate: scheduledDateTime.toISOString(),
          address: combinedAddress,
          notes: values.notes
        }
      },
      {
        onSuccess: (booking) => {
          toast({ title: "Booking Confirmed! 🎉", description: "Your service has been successfully scheduled." });
          if (values.neighborhood !== (me as any)?.neighborhood || values.addressDetail !== me?.address) {
            updateMeMutation.mutate(
              { data: { neighborhood: values.neighborhood, address: values.addressDetail } as any },
              {
                onSuccess: (updated) => {
                  updateUser(updated);
                  queryClient.setQueryData(getGetMeQueryKey(), updated);
                }
              }
            );
          }
          setLocation(`/bookings/${booking.id}`);
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Booking failed", description: error.message || "An error occurred while booking." });
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
    <>
      {/* Blue booking header with step progress */}
      <section className="bg-brand text-brand-foreground">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Book a service</h1>
          <p className="mt-1 text-sm text-white/85">Three quick steps. Pay after the job is done.</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold",
                  step >= s.n ? "bg-white text-brand" : "bg-white/15 text-white/80"
                )}>
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-sm text-xs font-bold",
                    step >= s.n ? "bg-brand text-white" : "bg-white/25 text-white"
                  )}>{s.n}</span>
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <div className="h-px w-6 bg-white/30" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 pb-32 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Form {...form}>
                <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)}>

                  {/* STEP 1: SERVICE */}
                  {step === 1 && (
                    <div className="p-5 md:p-6">
                      <h2 className="text-lg font-bold mb-4">Select a service</h2>
                      <div className="grid gap-3">
                        {services?.map((service) => (
                          <div
                            key={service.id}
                            className={cn(
                              "flex gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                              selectedServiceId === service.id.toString()
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            )}
                            onClick={() => {
                              form.setValue("serviceId", service.id.toString());
                              form.setValue("workerId", "");
                            }}
                          >
                            <img
                              src={serviceImageMap[service.name] || "/service-cleaning.png"}
                              alt={service.name}
                              className="h-16 w-16 rounded-md object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold">{service.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{service.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <Price amount={service.pricePerHour} />
                              <div className="text-xs text-muted-foreground mt-1">~{service.durationHours} hrs</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: WORKER */}
                  {step === 2 && (
                    <div className="p-5 md:p-6">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" size="icon" className="-ml-2 mr-2" onClick={() => setStep(1)} type="button">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-bold">Select a helper</h2>
                      </div>

                      {(!workersData || workersData.workers.length === 0) ? (
                        <div className="text-center py-12 bg-muted/40 rounded-lg border border-dashed border-border">
                          <p className="text-muted-foreground">No helpers currently available for this service.</p>
                          <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>Go back</Button>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {workersData.workers.filter(w => w.status === WorkerStatus.approved).map((worker) => (
                            <div
                              key={worker.id}
                              className={cn(
                                "flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                                selectedWorkerId === worker.id.toString()
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40"
                              )}
                              onClick={() => form.setValue("workerId", worker.id.toString())}
                            >
                              <img
                                src={worker.photoUrl || "/worker-1.png"}
                                alt={worker.name}
                                className="h-14 w-14 rounded-md object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate">{worker.name}</h3>
                                <div className="text-xs text-muted-foreground mt-0.5">{worker.completedBookings} jobs completed</div>
                              </div>
                              <RatingBadge score={worker.rating} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: DETAILS */}
                  {step === 3 && (
                    <div className="p-5 md:p-6">
                      <div className="flex items-center mb-4">
                        <Button variant="ghost" size="icon" className="-ml-2 mr-2" onClick={() => setStep(2)} type="button">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-bold">Date & location</h2>
                      </div>

                      <div className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
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
                                        className={cn("w-full pl-3 text-left font-normal h-11", !field.value && "text-muted-foreground")}
                                      >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                          name="neighborhood"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Neighborhood</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select your neighborhood in Addis Ababa" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ADDIS_NEIGHBORHOODS.map((name) => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="addressDetail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apartment / House Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Apt 4B, near Total petrol station" className="h-11" {...field} />
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
                                <Textarea placeholder="E.g., Please focus on the kitchen. I have a friendly dog." className="resize-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                </form>
              </Form>
            </div>
          </div>

          {/* SUMMARY SIDEBAR — booking-style */}
          <div className="md:col-span-1">
            <div className="sticky top-24 rounded-lg border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-bold">Your booking</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service</span>
                  {selectedServiceObj ? (
                    <div className="font-semibold text-sm mt-0.5">{selectedServiceObj.name}</div>
                  ) : (
                    <div className="text-muted-foreground italic text-sm mt-0.5">Not selected</div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Helper</span>
                  {selectedWorkerObj ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedWorkerObj.photoUrl || undefined} />
                        <AvatarFallback className="text-[10px]">{selectedWorkerObj.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">{selectedWorkerObj.name}</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic text-sm mt-0.5">Not selected</div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date & time</span>
                  {selectedDate ? (
                    <div className="font-semibold text-sm mt-0.5">{format(selectedDate, "MMM d, yyyy")} at {form.watch("scheduledTime")}</div>
                  ) : (
                    <div className="text-muted-foreground italic text-sm mt-0.5">Not selected</div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated total</span>
                    {selectedServiceObj ? (
                      <span className="font-bold text-xl">ETB {selectedServiceObj.pricePerHour * selectedServiceObj.durationHours}</span>
                    ) : (
                      <span className="font-bold text-xl text-muted-foreground">--</span>
                    )}
                  </div>
                  {selectedServiceObj && (
                    <p className="text-xs text-muted-foreground text-right mt-0.5">Based on {selectedServiceObj.durationHours} hours · pay after the job</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-success">
                  <CalendarCheck2 className="h-4 w-4" /> Free cancellation up to 24h before
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky step navigation */}
      <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container mx-auto px-4 max-w-5xl py-4 flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button variant="outline" type="button" onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((step + 1) as 2 | 3)}
              disabled={step === 1 ? !selectedServiceId : !selectedWorkerId}
              className="px-8 gap-2 font-bold"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" form="booking-form" disabled={createBookingMutation.isPending} className="px-8 font-bold">
              {createBookingMutation.isPending ? "Confirming..." : "Confirm booking"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
