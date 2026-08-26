"use client";

import { useRef } from "react";
import { useSystemMetrics } from "@/features/system/hooks/use-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, ShieldCheck, Server, Layers, Cpu, MemoryStick, Users, HeartPulse, Zap, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LOG_CARDS = [
  {
    title: "Activity Logs",
    description: "Monitor user actions, system events, and application usage patterns in real time.",
    href: "/admin/system/activity",
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    label: "View Activity",
  },
  {
    title: "Error Logs",
    description: "Track exceptions, failed requests, stack traces, and system anomalies.",
    href: "/admin/system/errors",
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    label: "View Errors",
  },
  {
    title: "Audit Logs",
    description: "Review security events, access changes, and compliance records.",
    href: "/admin/system/audit",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "View Audit",
  },
  {
    title: "Queue Health",
    description: "Real-time infrastructure monitoring — active workers, waiting jobs, and failure rates.",
    href: "/admin/system/queues",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "View Health",
  },
  {
    title: "Job Logs",
    description: "Historical record of background job execution — success and failure audit trails.",
    href: "/admin/system/jobs",
    icon: Layers,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    label: "View Logs",
  },
  {
    title: "Maintenance Mode",
    description: "Toggle site availability, schedule downtimes, and customize maintenance screens.",
    href: "/admin/system/maintenance",
    icon: Wrench,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    label: "Configure",
  },
];

export default function SystemDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useSystemMetrics("24h");

  const metrics = data?.metrics || [];
  const cpuUsage = metrics.filter((m: any) => m.name === "CPU_USAGE").pop()?.value ?? 0;
  const memoryUsage = metrics.filter((m: any) => m.name === "MEMORY_USAGE").pop()?.value ?? 0;
  const activeUsers = metrics.filter((m: any) => m.name === "ACTIVE_USERS").pop()?.value ?? 0;

  const cpuColor = cpuUsage > 80 ? "text-rose-500" : cpuUsage > 60 ? "text-amber-500" : "text-emerald-500";
  const memColor = memoryUsage > 80 ? "text-rose-500" : memoryUsage > 60 ? "text-amber-500" : "text-emerald-500";

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      {/* Header */}
      <div className="system-header space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Server className="h-8 w-8 text-primary" />
          </div>
          System Control
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Unified monitoring hub — health, metrics, logs, and background workers.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "CPU Usage",
            value: isLoading ? "—" : `${cpuUsage.toFixed(1)}%`,
            sub: "Current average load",
            icon: Cpu,
            color: isLoading ? "text-muted-foreground" : cpuColor,
            delay: 0,
          },
          {
            label: "Memory Usage",
            value: isLoading ? "—" : `${memoryUsage.toFixed(1)}%`,
            sub: "System memory utilization",
            icon: MemoryStick,
            color: isLoading ? "text-muted-foreground" : memColor,
            delay: 0.05,
          },
          {
            label: "Active Users",
            value: isLoading ? "—" : String(activeUsers),
            sub: "In the last 24 hours",
            icon: Users,
            color: "text-primary",
            delay: 0.1,
          },
          {
            label: "System Status",
            value: "Healthy",
            sub: "All services operational",
            icon: HeartPulse,
            color: "text-emerald-500",
            delay: 0.15,
          },
        ].map((metric) => (
          <div key={metric.label} className="metric-card">
            <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl group hover:shadow-2xl transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {metric.label}
                </CardTitle>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-muted/30 group-hover:scale-110 transition-transform">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-black tracking-tighter ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-xs font-bold text-muted-foreground mt-1">{metric.sub}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Log Section Header */}
      <div className="log-section-header space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Log Modules</h2>
        <p className="text-muted-foreground font-medium">
          Access detailed event streams for each monitoring domain.
        </p>
      </div>

      {/* Log Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {LOG_CARDS.map((card, i) => (
          <div key={card.href} className="log-card">
            <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl flex flex-col h-full group hover:shadow-2xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className={`h-12 w-12 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <CardTitle className="text-xl font-black tracking-tight">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {card.description}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-auto rounded-xl font-black hover:bg-muted transition-all hover:scale-[1.02] active:scale-95 border-border/50"
                >
                  <Link href={card.href}>{card.label}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
