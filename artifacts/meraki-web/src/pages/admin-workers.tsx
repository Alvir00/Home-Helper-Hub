import { useState } from "react";
import { Link } from "wouter";
import { useListAllWorkers, getListAllWorkersQueryKey, useUpdateWorkerStatus, WorkerStatus } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, X, ShieldAlert } from "lucide-react";

export default function AdminWorkers() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialStatus = urlParams.get('status') || "all";
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const statusFilterMap: Record<string, WorkerStatus | undefined> = {
    pending: WorkerStatus.pending,
    approved: WorkerStatus.approved,
    suspended: WorkerStatus.suspended,
    all: undefined
  };

  const { data: workersData, isLoading } = useListAllWorkers(
    { status: statusFilterMap[activeTab] },
    { query: { queryKey: getListAllWorkersQueryKey({ status: statusFilterMap[activeTab] }) } }
  );

  const updateStatusMutation = useUpdateWorkerStatus();

  const handleUpdateStatus = (id: number, status: WorkerStatus) => {
    updateStatusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Worker status updated to ${status}` });
          queryClient.invalidateQueries({ queryKey: getListAllWorkersQueryKey({ status: statusFilterMap[activeTab] }) });
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Failed to update status", description: error.message });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Workers</h1>
        <p className="text-muted-foreground">Approve, suspend, or review worker profiles.</p>
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : workersData?.workers && workersData.workers.length > 0 ? (
                workersData.workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={worker.photoUrl || undefined} />
                          <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.name}</div>
                          <div className="text-xs text-muted-foreground">{worker.services.length} services</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{worker.phone || 'No phone'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{format(new Date(worker.createdAt), 'MMM d, yyyy')}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        worker.status === WorkerStatus.approved ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                        worker.status === WorkerStatus.pending ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                        "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                      }>
                        {worker.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {worker.status === WorkerStatus.pending && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleUpdateStatus(worker.id, WorkerStatus.approved)} disabled={updateStatusMutation.isPending}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => handleUpdateStatus(worker.id, WorkerStatus.suspended)} disabled={updateStatusMutation.isPending}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No workers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>
    </div>
  );
}
