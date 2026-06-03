import { useGetMe, getGetMeQueryKey, useUpdateMe } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ADDIS_NEIGHBORHOODS = [
  "Bole",
  "Kazanchis",
  "Piassa",
  "CMC",
  "Lideta",
  "Kirkos",
  "Yeka",
  "Kolfe Keranio",
  "Gulele",
  "Arada",
  "Addis Ketema",
  "Nifas Silk-Lafto",
  "Akaki Kality",
  "Lemi Kura",
  "Bole Bulbulo",
  "Sarbet",
  "Megenagna",
  "Mexico Square",
  "Arat Kilo",
  "Saris",
];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
});

export default function Profile() {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey() }
  });

  const updateMutation = useUpdateMe();
  const initializedForId = useRef<number | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      neighborhood: "",
    },
  });

  useEffect(() => {
    if (user && initializedForId.current !== user.id) {
      initializedForId.current = user.id;
      form.reset({
        name: user.name,
        phone: user.phone || "",
        address: user.address || "",
        neighborhood: (user as any).neighborhood || "",
      });
    }
  }, [user, form]);

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateMutation.mutate(
      { data: values },
      {
        onSuccess: (updatedUser) => {
          toast({ title: "Profile updated successfully" });
          updateUser(updatedUser);
          queryClient.setQueryData(getGetMeQueryKey(), updatedUser);
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Update failed", description: error.message });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account Settings</h1>

      <div className="space-y-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input value={user?.email} disabled className="bg-muted/50" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+251..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Neighborhood</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your neighborhood in Addis Ababa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ADDIS_NEIGHBORHOODS.map((name) => (
                              <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">Pre-filled automatically when you make a booking.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Address Details</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Apt 4B, near Total petrol station" />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">Apartment or landmark — combined with your neighborhood on bookings.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">Change your password</p>
              </div>
              <Button variant="outline">Update Password</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" disabled>Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
