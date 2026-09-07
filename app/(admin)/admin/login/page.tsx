"use client";

import React, { useState } from "react";
import { loginAdmin } from "../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await loginAdmin(formData);
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      }
    } catch (error: unknown) {
      const err = error as { message?: string; digest?: string };
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes("NEXT_REDIRECT")) {
        return;
      }
      toast.error("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0F19] px-4">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-purple-600/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo Section */}
        <div className="mb-6 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Social AI <span className="text-primary">Admin</span>
            </h1>
            <p className="text-xs text-slate-400">Secure Protocol Access</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-white">Login</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Authorized Personnel Only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@gmail.com"
                    required
                    className="h-10 rounded-lg border-slate-800 bg-slate-950/50 pl-10 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-10 rounded-lg border-slate-800 bg-slate-950/50 pl-10 pr-10 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="h-10 w-full rounded-lg bg-primary font-semibold text-xs text-primary-foreground transition-all hover:bg-primary/90 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (

                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...</span>

                  ) : (
                    <span
                      className="flex items-center justify-center"
                    >
                      Access Control
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Social AI Platform Administration
        </div>
      </motion.div>
    </div>
  );
}
