"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  ArrowLeft,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  ShieldAlert,
  AlertCircle,
  Search,
  Download,
} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type JobLog = {
  id: string;
  jobId: string;
  queueName: string;
  status: string;
  result: Record<string, any> | null;
  error: string | null;
  createdAt: string;
};

type StatItem = { status: string; _count: { status: number } };

const QUEUE_NAMES = ["all", "email", "social-posting", "content-generation", "workflow-execution"];
const JOB_STATUSES = ["all", "completed", "failed", "pending", "processing"];

function getPriorityFromStatus(status: string): "critical" | "success" | "warning" | "info" {
  switch (status) {
    case "failed": return "critical";
    case "completed": return "success";
    case "processing": return "warning";
    default: return "info";
  }
}

function JobDetailsDialog({ job }: { job: JobLog }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass-card border border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Layers className="h-5 w-5 text-primary" />
            Job Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Job ID</p>
              <p className="font-mono text-xs break-all text-foreground/70">{job.jobId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Queue</p>
              <p className="font-semibold">{job.queueName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Status</p>
              <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-xl border-2 inline-block
                ${job.status === "failed" ? "border-rose-500/40 bg-rose-500/10 text-rose-500" :
                  job.status === "completed" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" :
                    job.status === "processing" ? "border-amber-500/40 bg-amber-500/10 text-amber-500" :
                      "border-primary/30 bg-primary/10 text-primary"}`}
              >
                {job.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Time</p>
              <p className="text-xs text-foreground/70">{format(new Date(job.createdAt), "PPpp")}</p>
            </div>
          </div>
          {job.error && (
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Error</p>
              <pre className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 overflow-auto max-h-48 whitespace-pre-wrap">
                {job.error}
              </pre>
            </div>
          )}
          {job.result && Object.keys(job.result).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Result</p>
              <pre className="rounded-xl bg-muted/50 p-3 text-xs overflow-auto max-h-48">
                {JSON.stringify(job.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useJobLogs(options: {
  page: number;
  limit: number;
  search?: string;
  queue?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["system", "jobs", options],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: options.page.toString(),
        limit: options.limit.toString(),
        ...(options.search && { search: options.search }),
        ...(options.queue && { queue: options.queue }),
        ...(options.status && { status: options.status }),
      });
      const res = await fetch(`/api/admin/system/logs/jobs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch job logs");
      return res.json();
    },
    refetchInterval: 15000,
  });
}

export default function JobQueuePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useJobLogs({
    page,
    limit: 25,
    search: search || undefined,
    queue: queueFilter === "all" ? undefined : queueFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const logs: JobLog[] = Array.from(
    new Map((data?.logs ?? []).map((l: JobLog) => [l.id, l])).values()
  ) as JobLog[];

  const stats: StatItem[] = data?.stats ?? [];
  const completed = stats.find(s => s.status === "completed")?._count?.status ?? 0;
  const failed = stats.find(s => s.status === "failed")?._count?.status ?? 0;
  const pending = stats.find(s => s.status === "pending")?._count?.status ?? 0;
  const total = data?.total ?? 0;
  const pageCount = total ? Math.ceil(total / 25) : 0;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ["system", "jobs"] });

  useGSAP(() => {
    gsap.from(".jobs-header", {
      y: -24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });
    gsap.from(".stat-card", {
      y: 32,
      opacity: 0,
      stagger: 0.09,
      duration: 0.75,
      delay: 0.15,
      ease: "power3.out",
    });
    gsap.from(".log-table", {
      opacity: 0,
      y: 24,
      duration: 0.9,
      delay: 0.4,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      {/* Header */}
      <div className="jobs-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/system"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Control
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
              <Layers className="h-8 w-8 text-orange-500" />
            </div>
            Job Queue Monitor
          </h1>
          <p className="text-muted-foreground text-lg font-medium ml-18">
            Background job execution across all workers — email, social posting &amp; content generation.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-card hover:bg-muted font-bold px-6 border-border rounded-xl gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="stat-card">
          <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                Completed Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-emerald-500 tracking-tighter">{completed.toLocaleString()}</div>
              <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Successfully processed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="stat-card">
          <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                Failed Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-destructive tracking-tighter">{failed.toLocaleString()}</div>
              <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                {failed > 0 ? "Require attention" : "All clear"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="stat-card">
          <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                Pending Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-primary tracking-tighter">{pending.toLocaleString()}</div>
              <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Queued for processing
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Log Table */}
      <Card className="log-table glass-card premium-border border-0 overflow-hidden rounded-3xl shadow-2xl bg-card/5 backdrop-blur-2xl">
        <CardHeader className="border-b border-border/50 p-8 flex flex-col md:flex-row md:items-center md:justify-between bg-muted/30 gap-4">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Event Log Buffer</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-base">
              Real-time sequence of background job events
              {total > 0 && (
                <span className="ml-2 text-sm font-bold text-foreground/50">{total.toLocaleString()} total records</span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Queue filter */}
            <Select value={queueFilter} onValueChange={(v) => { setQueueFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUEUE_NAMES.map((q) => (
                  <SelectItem key={q} value={q}>{q === "all" ? "All Queues" : q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
              <Input
                placeholder="Search job ID, queue, status..."
                value={search}
                onChange={handleSearch}
                className="pl-12 h-12 border-border/50 bg-muted/20 text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl font-bold transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center justify-between gap-6 animate-pulse">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-muted/40" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-muted/40 rounded" />
                      <div className="h-3 w-32 bg-muted/30 rounded" />
                    </div>
                  </div>
                  <div className="h-8 w-24 bg-muted/40 rounded-xl" />
                </div>
              ))
            ) : logs.length > 0 ? (
              <AnimatePresence>
                {logs.map((log, i) => {
                  const priority = getPriorityFromStatus(log.status);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="p-6 hover:bg-muted/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-default"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm flex-shrink-0
                          ${priority === "critical" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                            priority === "warning" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              priority === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                "bg-primary/10 text-primary border border-primary/20"}`}
                        >
                          {priority === "critical" ? <ShieldAlert className="h-7 w-7" /> :
                            priority === "warning" ? <AlertCircle className="h-7 w-7" /> :
                              priority === "success" ? <CheckCircle2 className="h-7 w-7" /> :
                                <Clock className="h-7 w-7" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight truncate">
                            {log.queueName.toUpperCase()} job: {log.status}
                          </h4>
                          <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                            Job ID: <span className="text-foreground/50 font-mono normal-case">{log.jobId}</span>
                          </p>
                          {log.error && (
                            <p className="text-xs text-rose-500 truncate max-w-sm font-medium mt-0.5">
                              ⚠ {log.error}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-4 py-2 rounded-xl border-2 transition-all
                          ${priority === "critical" ? "border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/20" :
                            priority === "warning" ? "border-amber-500/40 bg-amber-500/10 text-amber-500" :
                              priority === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" :
                                "border-primary/30 bg-primary/10 text-primary"}`}
                        >
                          {log.status}
                        </span>
                        <span className="text-sm font-mono font-black text-muted-foreground/40 w-40 text-right bg-muted/20 px-3 py-1.5 rounded-lg border border-border/10">
                          {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                        </span>
                        <JobDetailsDialog job={log} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="py-32 text-center italic text-muted-foreground font-bold text-xl opacity-50">
                No job logs matching current filters.
              </div>
            )}
          </div>
        </CardContent>

        {/* Pagination footer */}
        <div className="p-8 border-t border-border/50 bg-muted/40 flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">
            Page {page} of {pageCount || 1}
            <span className="ml-3 text-foreground/40">({total.toLocaleString()} records)</span>
          </span>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(p => p - 1)}
              className="text-primary hover:bg-primary/10 font-black px-8 h-12 rounded-2xl transition-all hover:scale-105"
            >
              ← Previous
            </Button>
            <Button
              variant="ghost"
              disabled={page >= pageCount || isFetching}
              onClick={() => setPage(p => p + 1)}
              className="text-primary hover:bg-primary/10 font-black px-8 h-12 rounded-2xl transition-all hover:scale-105"
            >
              Next →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
