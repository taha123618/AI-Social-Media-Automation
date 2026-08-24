"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CalendarCheck, Users, TrendingUp, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Analytics {
  total: number;
  new: number;
  contacted: number;
  completed: number;
  converted: number;
  todayCount: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/talk-to-sales/analytics");
        const json = await res.json();
        if (json.success) setAnalytics(json.data);
      } catch {} finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { label: "Total Requests", value: analytics?.total ?? 0, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", desc: "All-time demo requests" },
    { label: "New Leads", value: analytics?.new ?? 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "Awaiting contact" },
    { label: "Contacted", value: analytics?.contacted ?? 0, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", desc: "In conversation" },
    { label: "Completed", value: analytics?.completed ?? 0, icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", desc: "Demos delivered" },
    { label: "Converted", value: analytics?.converted ?? 0, icon: ArrowRight, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", desc: "Became customers" },
  ];

  const total = analytics?.total ?? 1;
  const conversionRate = analytics?.total ? ((analytics.converted / total) * 100).toFixed(1) : "0";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/admin/talk-to-sales">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Overview
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
      <p className="text-muted-foreground mb-8">Track demo request performance and conversion metrics</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={cn("rounded-xl border p-5", card.bg, card.border)}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bg, card.border)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>New → Contacted</span>
                <span className="font-medium">{analytics?.total ? ((analytics.contacted / analytics.total) * 100).toFixed(1) : "0"}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${analytics?.total ? (analytics.contacted / analytics.total) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Contacted → Completed</span>
                <span className="font-medium">{analytics?.contacted ? ((analytics.completed / analytics.contacted) * 100).toFixed(1) : "0"}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${analytics?.contacted ? (analytics.completed / analytics.contacted) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completed → Converted</span>
                <span className="font-medium">{analytics?.completed ? ((analytics.converted / analytics.completed) * 100).toFixed(1) : "0"}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${analytics?.completed ? (analytics.converted / analytics.completed) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Overall Performance</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{conversionRate}%</span>
              </div>
              <div>
                <p className="font-semibold">Conversion Rate</p>
                <p className="text-sm text-muted-foreground">Overall lead-to-customer conversion</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-lg font-bold">{analytics?.todayCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Today&apos;s Requests</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-lg font-bold">{analytics?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">All Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
