"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Loader2,
} from "lucide-react";
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

export default function TalkToSalesOverview() {
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

  const cards = [
    { label: "Total Requests", value: analytics?.total ?? 0, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "New Leads", value: analytics?.new ?? 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Contacted", value: analytics?.contacted ?? 0, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "Completed", value: analytics?.completed ?? 0, icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Converted", value: analytics?.converted ?? 0, icon: ArrowRight, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Talk to Sales</h1>
          <p className="text-muted-foreground mt-1">Manage demo requests, leads, and sales settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/talk-to-sales/settings">Settings</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/talk-to-sales/leads">
              View Leads
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "rounded-xl border p-5 transition-all hover:shadow-md",
              card.bg, card.border,
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bg, card.border)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/talk-to-sales/leads">
                <Users className="mr-3 h-4 w-4" />
                Browse All Leads
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/talk-to-sales/settings">
                <CalendarCheck className="mr-3 h-4 w-4" />
                Configure Demo Settings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/talk-to-sales/analytics">
                <TrendingUp className="mr-3 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Activity</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics?.todayCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">demo requests today</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
