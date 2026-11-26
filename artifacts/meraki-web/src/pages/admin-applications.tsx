import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, X, Phone, Mail, MapPin, UserCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface WorkerApplication {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  neighborhood: string | null;
  bio: string | null;
  serviceIds: number[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
}

interface ApplicationsResponse {
  applications: WorkerApplication[];
  total: number;
}

const STATUS_STYLES: Record<WorkerApplication["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminApplications() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [busyId, setBusyId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ["admin", "worker-applications", status];

  const { data, isLoading } = useQuery<ApplicationsResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/admin/worker-applications?status=${status}&limit=100`);
      if (!res.ok) throw new Error("Could not load applications");
      return res.json();
    },
  });

  async function review(id: number, next: "approved" | "rejected") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/dashboard/admin/worker-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Could not update the application");
      }

      toast({
        title: next === "approved" ? "Helper approved" : "Application rejected",
        description:
          next === "approved"
            ? "The helper is now live and can appear in search results."
            : "The applicant will not be listed. You can still contact them by phone.",
      });

      await queryClient.invalidateQueries({ queryKey: ["admin", "worker-applications"] });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Admin overview
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Helper applications</h1>
          <p className="mt-1 text-muted-foreground">
            Review people who applied to work with Meraki. Approving creates a live helper profile.
          </p>
        </div>
        <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (data?.applications.length ?? 0) === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <UserCheck className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No {status} applications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New applications from the public form will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {data?.applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{application.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[application.status]}`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {application.phone}
                    </span>
                    {application.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {application.email}
                      </span>
                    )}
                    {application.neighborhood && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {application.neighborhood}
                      </span>
                    )}
                  </div>
                  {application.bio && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80">
                      {application.bio}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Applied{" "}
                    {new Date(application.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    {application.serviceIds.length} service
                    {application.serviceIds.length === 1 ? "" : "s"} selected
                  </p>
                </div>

                {application.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={busyId === application.id}
                      onClick={() => void review(application.id, "approved")}
                    >
                      {busyId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={busyId === application.id}
                      onClick={() => void review(application.id, "rejected")}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
