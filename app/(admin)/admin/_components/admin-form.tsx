"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createAdmin, updateAdmin, getAdminById } from "../actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Save, X, Shield, Mail, Lock, UserCog } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  role: z.enum(["super_admin", "admin"]),
});

interface AdminFormProps {
  id?: string;
}

export function AdminForm({ id }: AdminFormProps) {
  const router = useRouter();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  useEffect(() => {
    if (isEdit) {
      getAdminById(id).then((admin) => {
        if (admin) {
          form.reset({
            name: admin.name,
            email: admin.email,
            role: admin.role as any,
            password: "",
          });
        }
        setIsFetching(false);
      });
    }
  }, [id, isEdit, form]);

  useGSAP(() => {
    if (!isFetching) {
      gsap.from(cardRef.current, {
        y: 40,
        opacity: 0,
        scale: 0.98,
        duration: 0.8,
        ease: "power3.out"
      });
      gsap.from(".form-field", {
        x: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.4
      });
    }
  }, [isFetching]);

  async function onSubmit(data: z.infer<typeof adminSchema>) {
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateAdmin(id, data as any);
        toast.success("Administrator privileges updated successfully");
      } else {
        if (!data.password) {
          toast.error("Security credential (password) is required for new nodes");
          setIsLoading(false);
          return;
        }
        await createAdmin(data as any);
        toast.success("New administrator node initialized successfully");
      }
      router.push("/admin/admins");
    } catch (error) {
      toast.error("Operation failed. System integrity check recommended.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-500">Decrypting identity data...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto pb-10">
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            {isEdit ? <UserCog className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isEdit ? "Refine Administrator" : "Create Security Node"}
          </h1>
        </div>
        <p className="text-muted-foreground ml-13 font-medium">Authorized access control configuration.</p>
      </div>

      <div ref={cardRef}>
        <Card className="glass-card premium-border border-0 bg-card/20 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-border/50 pb-6 bg-muted/5">
            <CardTitle className="text-xl font-bold text-foreground tracking-tight">Identity Configuration</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              {isEdit ? "Updating an existing administrator's credentials and permissions." : "Initializing a new administrator with specific system-level access."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="form-field space-y-2">
                      <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Legal Identity</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="absolute left-3 top-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary"><UserCog className="h-4 w-4" /></span>
                          <Input
                            placeholder="Enter full name"
                            className="h-12 pl-10 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive text-xs font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="form-field space-y-2">
                      <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Protocol Email</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="absolute left-3 top-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary"><Mail className="h-4 w-4" /></span>
                          <Input
                            placeholder="identity@system.com"
                            className="h-12 pl-10 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive text-xs font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="form-field space-y-2">
                      <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                        Access Key {isEdit && "(Optional)"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="absolute left-3 top-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary"><Lock className="h-4 w-4" /></span>
                          <Input
                            type="password"
                            placeholder={isEdit ? "Leave empty to retain" : "Minimum 8 characters"}
                            className="h-12 pl-10 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary rounded-xl font-medium transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive text-xs font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="form-field space-y-2">
                      <FormLabel className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Security Clearance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative group">
                            <span className="absolute left-3 top-3.5 text-muted-foreground/60 z-10 transition-colors group-focus-within:text-primary"><Shield className="h-4 w-4" /></span>
                            <SelectTrigger className="h-12 pl-10 border-border bg-muted/30 text-foreground focus:border-primary rounded-xl font-medium transition-all">
                              <SelectValue placeholder="Select Clearance Level" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className="glass-card border-border shadow-2xl rounded-xl">
                          <SelectItem value="admin" className="focus:bg-primary/10 rounded-lg font-medium">Standard Administrator</SelectItem>
                          <SelectItem value="super_admin" className="focus:bg-primary/10 rounded-lg font-bold text-primary">Super Administrator (Full Ops)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive text-xs font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="form-field flex justify-end gap-3 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="h-12 px-8 border-border hover:bg-muted font-bold rounded-xl transition-all"
                >
                  <X className="mr-2 h-4 w-4" />
                  Abort Ops
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-black rounded-xl transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isEdit ? <Save className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isEdit ? "Update Node" : "Initialize Node"}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
