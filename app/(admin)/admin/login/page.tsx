"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { loginAdmin } from "../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  Terminal,
  Cpu,
  Server,
} from "lucide-react";

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
      toast.error("Authentication failed. Please check credentials and try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* LEFT COLUMN: Graph paper grid, floating navigation, and centered Admin Card */}
      <div className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 pt-16 pb-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12 bg-[#FAFAFC] dark:bg-[#09090D] bg-[linear-gradient(to_right,#E6E6EA_1px,transparent_1px),linear-gradient(to_bottom,#E6E6EA_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#191922_1px,transparent_1px),linear-gradient(to_bottom,#191922_1px,transparent_1px)] bg-[size:24px_24px] overflow-y-auto">
        {/* Top Floating Navigation Links */}
        <div className="w-full absolute top-4 left-0 right-0 px-4 sm:top-6 sm:px-6 flex items-center justify-between pointer-events-none z-30">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground bg-card/90 backdrop-blur-md border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-2xs pointer-events-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground bg-card/90 backdrop-blur-md border border-border rounded-lg hover:bg-muted transition-all duration-200 shadow-2xs pointer-events-auto"
          >
            Workspace Login
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Center Container for Admin Card */}
        <div className="w-full max-w-[420px] sm:max-w-md my-auto flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-card/95 backdrop-blur-xl rounded-2xl shadow-sm border border-border p-6 sm:p-8"
          >
            {/* Header: Brand & Clearance Pill */}
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-primary/25 mb-3.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Control Center
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Privileged access gateway for infrastructure orchestration.
              </p>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Tier-1 Security Clearance Required
              </div>
            </div>

            {/* Admin Credentials Form */}
            <form action={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="admin-email"
                  className="text-xs font-semibold text-foreground tracking-wide uppercase"
                >
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    placeholder="admin@company.com"
                    autoComplete="email"
                    required
                    className="h-11 rounded-lg border-input bg-background/50 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <Label
                  htmlFor="admin-password"
                  className="text-xs font-semibold text-foreground tracking-wide uppercase"
                >
                  Master Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="h-11 rounded-lg border-input bg-background/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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

              {/* Session Security Advisory */}
              <div className="rounded-lg bg-muted/50 border border-border p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Session is bound to current IP with 8-hour cryptographic expiry.</span>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full rounded-lg bg-primary font-semibold text-sm text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating Privileges...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Enter Admin Console
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Switch to Workspace Login */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Looking for client workspace?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium transition-colors duration-200"
              >
                Sign in to workspace
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Security Footnote */}
        <p className="text-[11px] font-medium text-muted-foreground mt-6 text-center select-none">
          Restricted Infrastructure • Cryptographic Audit Trails • TLS 1.3
        </p>
      </div>

      {/* RIGHT COLUMN: Dark Obsidian Infrastructure & Telemetry Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-8 lg:p-10 xl:p-14 2xl:p-16 bg-[#0B0B12] relative overflow-hidden min-h-[100dvh] select-none">
        {/* Ambient Radial Lighting */}
        <div className="absolute -top-24 -right-24 w-[550px] h-[550px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -z-0" />
        <div className="absolute top-1/2 -right-24 w-[400px] h-[400px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none -z-0" />
        <div className="absolute -bottom-20 left-12 w-[350px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-0" />

        {/* Top Header: Brand & Cluster Health */}
        <div className="flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Social<span className="text-primary">AI</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-gray-300 border border-white/10">
                Admin
              </span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 tracking-tight">
              Cluster: All Systems Operational
            </span>
          </div>
        </div>

        {/* Hero Copy (Mission Control for Autonomous Infrastructure) */}
        <div className="space-y-5 lg:space-y-6 max-w-xl my-auto py-8 lg:py-10 relative z-10">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Mission Control for Autonomous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-300">
              AI Infrastructure.
            </span>
          </h2>
          <p className="text-[#9CA3AF] text-sm lg:text-base font-normal leading-relaxed">
            Supervise 13 autonomous marketing agents, orchestrate high-throughput BullMQ background workers, enforce multi-tenant isolation, and inspect global dispatch telemetry in real time.
          </p>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-300 pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Multi-Tenant RBAC</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <Server className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>BullMQ Queue Engine</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
              <span>13 Autonomous Agents</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>pgvector RAG Store</span>
            </div>
          </div>

          {/* Real-time Telemetry Showcase Box */}
          <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-gray-300 font-mono">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span>TELEMETRY FEED</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                24ms latency
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] text-gray-400">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">[00:00:01]</span>
                <span className="text-gray-300">BullMQ Redis Queue Worker</span>
                <span className="text-emerald-400 font-semibold">Active (0 failed)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">[00:00:02]</span>
                <span className="text-gray-300">Multi-Agent Swarm Dispatch</span>
                <span className="text-primary font-semibold">13/13 Synced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">[00:00:03]</span>
                <span className="text-gray-300">Deny-by-Default API Proxy</span>
                <span className="text-indigo-400 font-semibold">Enforced</span>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/social-media-management-tool"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline underline-offset-4 decoration-primary/60 hover:decoration-primary transition-all"
            >
              Explore platform capabilities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-500 flex items-center justify-between pt-4 border-t border-white/5 relative z-10 font-mono">
          <span>SEC-PROTOCOL: v2.4.0</span>
          <span>AIR-GAPPED COMPLIANCE ENFORCED</span>
        </div>
      </div>
    </div>
  );
}
