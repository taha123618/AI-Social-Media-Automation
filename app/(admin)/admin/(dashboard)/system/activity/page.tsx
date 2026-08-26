"use client";

import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useActivityLogs } from "@/features/system/hooks/use-system";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, RefreshCw, ArrowLeft, Info, Search, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, any> | null;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

const KNOWN_ENTITIES = [
  "User", "ContentDraft", "Post", "VideoJob", "PostingSchedule",
  "KnowledgeDocument", "AutopilotPlan", "Session",
];

function ActivityDetailsDialog({ log }: { log: ActivityLog }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass-card border border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Activity className="h-5 w-5 text-primary" />
            Activity Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Action</p>
              <Badge variant="secondary" className="font-mono text-xs">{log.action}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Entity</p>
              <p className="font-semibold">{log.entity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">User</p>
              <p>{log.user?.name || log.user?.email || "System"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Time</p>
              <p className="text-xs">{format(new Date(log.createdAt), "PPpp")}</p>
            </div>
          </div>
          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Details</p>
              <pre className="rounded-xl bg-muted/50 p-3 text-xs overflow-auto max-h-48">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const qc = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useActivityLogs({
    page,
    limit: 25,
    search: search || undefined,
    entity: entityFilter === "all" ? undefined : entityFilter,
  });

  const logs: ActivityLog[] = Array.from(
    new Map((data?.logs ?? []).map((l: ActivityLog) => [l.id, l])).values()
  ) as ActivityLog[];
  const total = data?.total ?? 0;
  const pageCount = total ? Math.ceil(total / 25) : 0;

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ["system", "activity"] });

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      {/* Header */}
      <div className="activity-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link href="/admin/system" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to System Control
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            Activity Logs
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Real-time stream of all user and system actions.
            {total > 0 && <span className="ml-3 font-bold text-foreground/50">{total.toLocaleString()} records</span>}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isFetching}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95 gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Log Card */}
      <Card className="log-table glass-card premium-border border-0 overflow-hidden rounded-3xl shadow-2xl bg-card/5 backdrop-blur-2xl">
        <CardHeader className="border-b border-border/50 p-8 flex flex-col md:flex-row md:items-center md:justify-between bg-muted/30 gap-4">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Event Stream</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-base">
              Every user and system action, in order
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {KNOWN_ENTITIES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
              <Input
                placeholder="Search actions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-12 h-12 border-border/50 bg-muted/20 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl font-bold placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center justify-between gap-6 animate-pulse">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-muted/40" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-muted/40 rounded" />
                      <div className="h-3 w-32 bg-muted/30 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-muted/40 rounded-xl" />
                </div>
              ))
            ) : logs.length > 0 ? (
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    className="p-6 hover:bg-muted/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-default"
                  >
                    <div className="flex items-center gap-6">
                      <div className="rounded-2xl p-4 bg-primary/10 text-primary border border-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm flex-shrink-0">
                        <Activity className="h-7 w-7" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                          {log.action}
                        </h4>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                          Entity: <span className="text-foreground/60 normal-case font-semibold">{log.entity}</span>
                          {log.user && (
                            <>
                              <span className="mx-2 text-border">·</span>
                              <span className="text-foreground/60 normal-case font-medium inline-flex items-center gap-1">
                                <User className="h-3 w-3" />{log.user.name || log.user.email}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <span className="text-sm font-mono font-black text-muted-foreground/40 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/10 whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                      </span>
                      <ActivityDetailsDialog log={log} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-32 text-center italic text-muted-foreground font-bold text-xl opacity-50">
                No activity logs found.
              </div>
            )}
          </div>
        </CardContent>

        <div className="p-8 border-t border-border/50 bg-muted/40 flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">
            Page {page} of {pageCount || 1}
            <span className="ml-3 text-foreground/40">({total.toLocaleString()} records)</span>
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="text-primary hover:bg-primary/10 font-black px-8 h-12 rounded-2xl transition-all hover:scale-105">
              ← Previous
            </Button>
            <Button variant="ghost" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}
              className="text-primary hover:bg-primary/10 font-black px-8 h-12 rounded-2xl transition-all hover:scale-105">
              Next →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
