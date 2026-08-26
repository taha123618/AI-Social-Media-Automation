"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  planId: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
  billingStatus: z.enum(["ACTIVE", "PAUSED", "CANCELED", "PAST_DUE", "TRIALING"]).optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: any;
  onSubmit: (data: UserFormData) => Promise<any>;
}

export function UserForm({ initialData, onSubmit }: UserFormProps) {
  const router = useRouter();
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      planId: initialData?.planId || "free",
      billingStatus: initialData?.billingStatus || "ACTIVE",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: UserFormData) => {
    try {
      await onSubmit(values);
      toast.success(initialData ? "User updated successfully" : "User created successfully");
      router.refresh();
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  return (
    <Form {...(form as any)} onSubmit={form.handleSubmit(handleSubmit) as any} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField
          control={form.control as any}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Full Identity Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter user's name" {...field} className="h-12 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all" />
              </FormControl>
              <FormMessage className="text-destructive text-xs font-bold" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Protocol Email Address</FormLabel>
              <FormControl>
                <Input placeholder="user@protocol.com" {...field} className="h-12 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all" />
              </FormControl>
              <FormMessage className="text-destructive text-xs font-bold" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                {initialData ? "Security Override (Optional)" : "Primary Access Key"}
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} className="h-12 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all" />
              </FormControl>
              <FormMessage className="text-destructive text-xs font-bold" />
            </FormItem>
          )}
        />
        {!initialData && (
          <FormField
            control={form.control as any}
            name="planId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                  Initial Subscription Tier
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-muted/30 text-foreground font-medium text-sm focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="free">Free Tier (Default)</option>
                    <option value="starter">Starter Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </FormControl>
                <FormMessage className="text-destructive text-xs font-bold" />
              </FormItem>
            )}
          />
        )}
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="h-12 px-8 border-border hover:bg-muted font-bold rounded-xl transition-all"
        >
          Abort
        </Button>
        <Button type="submit" disabled={isLoading} className="h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-black rounded-xl transition-all">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? "Commit Changes" : "Provision Identity"}
        </Button>
      </div>
    </Form>
  );
}
