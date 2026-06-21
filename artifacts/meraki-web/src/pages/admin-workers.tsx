import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useListAllWorkers, getListAllWorkersQueryKey,
  useUpdateWorkerStatus, WorkerStatus,
  useCreateWorker, useUpdateWorkerInfo,
  useListServices, getListServicesQueryKey,
  Worker,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, X, ShieldAlert, UserPlus, Pencil, Star } from "lucide-react";

const workerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  photoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  serviceIds: z.array(z.number()).min(1, "Select at least one service"),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

function WorkerForm({
  form,
  servicesData,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
}: {
  form: ReturnType<typeof useForm<WorkerFormValues>>;
  servicesData: { id: number; name: string; category: string; pricePerHour: number }[];
  onSubmit: (v: WorkerFormValues) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl><Input placeholder="Tigist Haile" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="+251 911 234 567" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo URL</FormLabel>
                <FormControl><Input placeholder="https://…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief description of experience and specialties…" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services *</FormLabel>
              <div className="grid grid-cols-1 gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
                {servicesData.map((service) => (
                  <label key={service.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/40 cursor-pointer transition-colors">
                    <Checkbox
                      checked={field.value.includes(service.id)}
                      onCheckedChange={(checked) => {
                        field.onChange(
                          checked
                            ? [...field.value, service.id]
                            : field.value.filter((id) => id !== service.id)
                        );
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{service.category} · ETB {service.pricePerHour}/hr</p>
                    </div>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminWorkers() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialStatus = urlParams.get("status") || "all";
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [addOpen, setAddOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusFilterMap: Record<string, WorkerStatus | undefined> = {
    pending: WorkerStatus.pending,
    approved: WorkerStatus.approved,
    suspended: WorkerStatus.suspended,
    all: undefined,
  };

  const { data: workersData, isLoading } = useListAllWorkers(
    { status: statusFilterMap[activeTab] },
    { query: { queryKey: getListAllWorkersQueryKey({ status: statusFilterMap[activeTab] }) } }
  );

  const { data: servicesData } = useListServices(
    {},
    { query: { queryKey: getListServicesQueryKey({}) } }
  );

  const updateStatusMutation = useUpdateWorkerStatus();
  const createWorkerMutation = useCreateWorker();
  const updateInfoMutation = useUpdateWorkerInfo();

  const addForm = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: { name: "", bio: "", phone: "", photoUrl: "", serviceIds: [] },
  });

  const editForm = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: { name: "", bio: "", phone: "", photoUrl: "", serviceIds: [] },
  });

  useEffect(() => {
    if (editingWorker) {
      editForm.reset({
        name: editingWorker.name,
        bio: editingWorker.bio ?? "",
        phone: editingWorker.phone ?? "",
        photoUrl: editingWorker.photoUrl ?? "",
        serviceIds: editingWorker.services.map((s) => s.id),
      });
    }
  }, [editingWorker]);

  const handleUpdateStatus = (id: number, status: WorkerStatus) => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Worker ${status === WorkerStatus.approved ? "approved" : status === WorkerStatus.suspended ? "suspended" : "updated"}` });
          queryClient.invalidateQueries({ queryKey: getListAllWorkersQueryKey({ status: statusFilterMap[activeTab] }) });
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Failed to update status", description: error.message });
        },
      }
    );
  };

  const handleAddWorker = (values: WorkerFormValues) => {
    createWorkerMutation.mutate(
      {
        data: {
          name: values.name,
          bio: values.bio || undefined,
          phone: values.phone || undefined,
          photoUrl: values.photoUrl || undefined,
          serviceIds: values.serviceIds,
        },
      },
      {
        onSuccess: (worker) => {
          toast({ title: "Worker added!", description: `${worker.name} is now active on the platform.` });
          queryClient.invalidateQueries({ queryKey: getListAllWorkersQueryKey({}) });
          setAddOpen(false);
          addForm.reset();
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Failed to add worker", description: error.message });
        },
      }
    );
  };

  const handleEditWorker = (values: WorkerFormValues) => {
    if (!editingWorker) return;
    updateInfoMutation.mutate(
      {
        id: editingWorker.id,
        data: {
          name: values.name,
          bio: values.bio || undefined,
          phone: values.phone || undefined,
          photoUrl: values.photoUrl || undefined,
          serviceIds: values.serviceIds,
        },
      },
      {
        onSuccess: (worker) => {
          toast({ title: "Worker updated!", description: `${worker.name}'s profile has been saved.` });
          queryClient.invalidateQueries({ queryKey: getListAllWorkersQueryKey({}) });
          setEditingWorker(null);
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Failed to update worker", description: error.message });
        },
      }
    );
  };

  const services = servicesData?.services ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Workers</h1>
          <p className="text-muted-foreground">Approve, suspend, edit, or add worker profiles.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <UserPlus className="h-4 w-4 mr-2" /> Add Worker
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Professional</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Jobs</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : workersData?.workers && workersData.workers.length > 0 ? (
                workersData.workers.map((worker) => (
                  <TableRow key={worker.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={worker.photoUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {worker.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.name}</div>
                          <div className="text-xs text-muted-foreground">{worker.services.length} service{worker.services.length !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{worker.phone || <span className="text-muted-foreground italic">No phone</span>}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {worker.rating != null ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {worker.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{worker.completedBookings}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{format(new Date(worker.createdAt), "MMM d, yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        worker.status === WorkerStatus.approved ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                        worker.status === WorkerStatus.pending  ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                        "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                      }>
                        {worker.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm" variant="outline"
                          className="h-8 gap-1"
                          onClick={() => setEditingWorker(worker)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        {worker.status === WorkerStatus.pending && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleUpdateStatus(worker.id, WorkerStatus.approved)} disabled={updateStatusMutation.isPending}>
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => handleUpdateStatus(worker.id, WorkerStatus.suspended)} disabled={updateStatusMutation.isPending}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {worker.status === WorkerStatus.approved && (
                          <Button size="sm" variant="outline" className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => handleUpdateStatus(worker.id, WorkerStatus.suspended)} disabled={updateStatusMutation.isPending}>
                            <ShieldAlert className="h-4 w-4 mr-1" /> Suspend
                          </Button>
                        )}
                        {worker.status === WorkerStatus.suspended && (
                          <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleUpdateStatus(worker.id, WorkerStatus.approved)} disabled={updateStatusMutation.isPending}>
                            <Check className="h-4 w-4 mr-1" /> Reactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No workers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      {/* ── Add Worker Dialog ── */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) addForm.reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a New Worker</DialogTitle>
            <DialogDescription>
              This worker will be immediately approved and visible on the platform.
            </DialogDescription>
          </DialogHeader>
          <WorkerForm
            form={addForm}
            servicesData={services}
            onSubmit={handleAddWorker}
            isPending={createWorkerMutation.isPending}
            submitLabel="Add Worker"
            onCancel={() => { setAddOpen(false); addForm.reset(); }}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit Worker Dialog ── */}
      <Dialog open={!!editingWorker} onOpenChange={(open) => { if (!open) setEditingWorker(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>
              Update {editingWorker?.name}'s profile, contact info, and services.
            </DialogDescription>
          </DialogHeader>
          <WorkerForm
            form={editForm}
            servicesData={services}
            onSubmit={handleEditWorker}
            isPending={updateInfoMutation.isPending}
            submitLabel="Save Changes"
            onCancel={() => setEditingWorker(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
