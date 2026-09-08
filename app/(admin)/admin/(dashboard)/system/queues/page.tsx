"use client";

import { useRef } from "react";
import { useQueueStats } from "@/features/system/hooks/use-system";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Layers, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity,
  AlertCircle,
  Zap,
  TrendingUp,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

export default function QueuesHealthPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isFetching } = useQueueStats();
  const qc = useQueryClient();

  const queues = data?.queues || {};
  const queueEntries = Object.entries(queues);
  
  const totalWaiting = queueEntries.reduce((acc, [_, stats]: any) => acc + stats.waiting, 0);
  const totalActive = queueEntries.reduce((acc, [_, stats]: any) => acc + stats.active, 0);
  const totalFailed = queueEntries.reduce((acc, [_, stats]: any) => acc + stats.failed, 0);

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ["system", "queues"] });

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      {/* Header */}
      <div className="queues-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/system"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Control
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            Queue Health
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Real-time infrastructure monitoring for all background workers and task queues.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Syncing..." : "Refresh Status"}
          </Button>
        </div>
      </div>

      {/* Global Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: "Active Jobs",
            value: totalActive,
            icon: Activity,
            color: "text-primary",
            bg: "bg-primary/10",
            sub: "Currently processing"
          },
          {
            label: "Waiting Jobs",
            value: totalWaiting,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            sub: "Queued in Redis"
          },
          {
            label: "Total Failures",
            value: totalFailed,
            icon: AlertCircle,
            color: totalFailed > 0 ? "text-rose-500" : "text-emerald-500",
            bg: totalFailed > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
            sub: "Across all system queues"
          }
        ].map((stat, i) => (
          <div key={stat.label} className="summary-card">
            <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <div className={`text-4xl font-black tracking-tighter ${stat.color}`}>
                      {isLoading ? "..." : stat.value}
                    </div>
                  </div>
                </div>
                <p className="text-xs font-bold text-muted-foreground mt-4 flex items-center gap-2">
                   <TrendingUp className="h-3 w-3 opacity-50" />
                   {stat.sub}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Queue Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
             <Database className="h-6 w-6 text-muted-foreground" />
             Managed Queues
           </h2>
           <Badge variant="outline" className="rounded-lg font-black text-[10px] uppercase tracking-widest px-3">
             {queueEntries.length} Active Services
           </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
            ))
          ) : (
            <AnimatePresence>
              {queueEntries.map(([name, stats]: any, i) => (
                <motion.div
                  key={name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="queue-card"
                >
                  <Card className="glass-card premium-border border-0 bg-card/5 backdrop-blur-xl shadow-2xl rounded-3xl h-full group hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                        <div className={`h-2 w-2 rounded-full ${stats.active > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors truncate">
                        {name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active</p>
                          <p className="text-2xl font-black tracking-tighter text-foreground">{stats.active}</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Waiting</p>
                          <p className="text-2xl font-black tracking-tighter text-foreground">{stats.waiting}</p>
                        </div>
                        <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Success</p>
                          <p className="text-2xl font-black tracking-tighter text-emerald-500">{stats.completed}</p>
                        </div>
                        <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Failed</p>
                          <p className="text-2xl font-black tracking-tighter text-rose-500">{stats.failed}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground">Delayed: {stats.delayed}</span>
                         </div>
                         <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold hover:bg-primary/10 hover:text-primary" asChild>
                            <Link href="/admin/system/jobs">View History</Link>
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
