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

const businessSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  website: z.string().url().optional().or(z.literal("")),
});

interface BusinessFormProps {
  initialData?: any;
  onSubmit: (data: z.infer<typeof businessSchema>) => Promise<any>;
}

export function BusinessForm({ initialData, onSubmit }: BusinessFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      website: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof businessSchema>) => {
    try {
      await onSubmit(values);
      toast.success(initialData ? "Workspace updated successfully" : "Workspace created successfully");
      router.refresh();
      router.push("/admin/workspaces");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Form {...form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Workspace Identity</FormLabel>
              <FormControl>
                <Input placeholder="My Global Enterprise" {...field} className="h-12 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all" />
              </FormControl>
              <FormMessage className="text-destructive text-xs font-bold" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Protocol Routing Slug</FormLabel>
              <FormControl>
                <Input placeholder="global-enterprise" {...field} className="h-12 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all" />
              </FormControl>
              <FormMessage className="text-destructive text-xs font-bold" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="md:col-span-2 space-y-2">
              <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Public Endpoint URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://protocol-x.io" {...field} className="h-12 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all" />
              </FormControl>
              <FormMessage className="text-destructive text-xs font-bold" />
            </FormItem>
          )}
        />
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
        <Button type="submit" disabled={isLoading} className="h-12 px-10 bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black rounded-xl transition-all">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? "Commit Config" : "Initialize Node"}
        </Button>
      </div>
    </Form>
  );
}
