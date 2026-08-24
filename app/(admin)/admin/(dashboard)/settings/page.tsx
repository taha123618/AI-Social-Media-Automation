"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, Layers, ShieldCheck, ArrowRight, Settings, Server } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const MONITOR_MODULES = [
  {
    title: "Activity Logs",
    description: "Real-time stream of all user and system actions across the platform.",
    href: "/admin/system/activity",
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    shadow: "shadow-primary/10",
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
    shadow: "shadow-rose-500/10",
    label: "View Errors",
  },
  {
    title: "Audit Trail",
    description: "Security events, access changes, login events, and compliance records.",
    href: "/admin/system/audit",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    shadow: "shadow-emerald-500/10",
    label: "View Audit",
  },
  {
    title: "Job Queue",
    description: "Monitor background job execution — email, social posting, and content workers.",
    href: "/admin/system/jobs",
    icon: Layers,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    shadow: "shadow-orange-500/10",
    label: "View Jobs",
  },
];

export default function SettingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".settings-header", {
      y: -24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });
    gsap.from(".settings-notice", {
      opacity: 0,
      y: 16,
      duration: 0.6,
      delay: 0.15,
      ease: "power2.out",
    });
    gsap.from(".monitor-card", {
      y: 32,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      delay: 0.25,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      {/* Header */}
      <div className="settings-header flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground text-lg font-medium ml-[4.5rem]">
          Platform configuration and administrative settings.
        </p>
      </div>

      {/* Redirect notice */}
      <motion.div
        className="settings-notice glass-card premium-border border-0 rounded-2xl p-6 flex items-start gap-4 bg-primary/5 backdrop-blur-md shadow-xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Server className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-black text-foreground text-base">System monitoring has moved</p>
          <p className="text-muted-foreground font-medium text-sm">
            All monitoring and logging tools are now consolidated in{" "}
            <Link
              href="/admin/system"
              className="text-primary font-black underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              System Control
            </Link>
            — your unified observability hub.
          </p>
        </div>
      </motion.div>

      {/* Section header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Monitoring Modules</h2>
        <p className="text-muted-foreground font-medium">
          Quick access to all system observability and log management tools.
        </p>
      </div>

      {/* Monitor Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {MONITOR_MODULES.map((card) => (
          <Card
            key={card.href}
            className={`monitor-card glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl flex flex-col h-full group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
          >
            <CardHeader>
              <div
                className={`h-12 w-12 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <CardDescription className="text-sm text-muted-foreground font-medium leading-relaxed">
                {card.description}
              </CardDescription>
              <Button
                asChild
                variant="outline"
                className="w-full mt-auto rounded-xl font-black hover:bg-muted transition-all hover:scale-[1.02] active:scale-95 border-border/50 gap-2"
              >
                <Link href={card.href}>
                  {card.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
