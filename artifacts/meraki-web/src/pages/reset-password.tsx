import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";

const resetSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirm: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function ResetPassword() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const [, setLocation] = useLocation();
  const [done, setDone] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    if (!token) {
      setInvalidToken(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.error === "invalid_token" || data?.error === "token_expired") {
          setInvalidToken(true);
          return;
        }
        throw new Error(data?.message || "Something went wrong. Please try again.");
      }

      setDone(true);
      setTimeout(() => setLocation("/login"), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <Card className="w-full max-w-md border-border/60 shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Set a new password</CardTitle>
          <CardDescription className="text-muted-foreground">
            {done
              ? "Your password has been updated."
              : invalidToken
              ? "This reset link is invalid or has expired."
              : "Choose a strong password for your account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Password updated! Redirecting you to login…
              </p>
            </div>
          ) : invalidToken ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground">
                This link may have already been used or it has expired. Please request a new one.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/forgot-password">Request a new link</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? "Updating…" : "Update password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col border-t bg-muted/20 px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Remember it after all?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
