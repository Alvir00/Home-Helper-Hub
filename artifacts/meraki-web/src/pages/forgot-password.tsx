import { useState } from "react";
import { Link } from "wouter";
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
import { Sparkles, ArrowLeft, CheckCircle } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof forgotSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      const data = await res.json().catch(() => ({}));
      if (data?.resetToken) {
        setDevResetToken(data.resetToken);
      }
      setSubmitted(true);
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
          <CardTitle className="text-2xl font-bold tracking-tight">Reset your password</CardTitle>
          <CardDescription className="text-muted-foreground">
            {submitted
              ? "Check your inbox for next steps."
              : "Enter your email and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                If an account exists for that email address, you'll receive a password reset link
                shortly. The link expires in 1 hour.
              </p>
              {devResetToken && (
                <div className="w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-left">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Dev mode — click to reset
                  </p>
                  <Link
                    href={`/reset-password/${devResetToken}`}
                    className="break-all text-sm font-medium text-primary underline underline-offset-2"
                  >
                    /reset-password/{devResetToken}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col border-t bg-muted/20 px-6 py-4">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
