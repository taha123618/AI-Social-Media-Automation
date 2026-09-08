"use client";

import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useErrorLogs, useResolveError, useDeleteError } from "@/features/system/hooks/use-system";
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
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   AlertTriangle,
   RefreshCw,
   ArrowLeft,
   Info,
   Search,
   CheckCircle2,
   XCircle,
   Trash2,
   ShieldAlert,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type ErrorLog = {
   id: string;
   message: string;
   source: string;
   path: string | null;
   stack: string | null;
   context: Record<string, any> | null;
   resolved: boolean;
   createdAt: string;
};

const SOURCES = [
   "all", "API /api/contents", "API /api/video/generate",
   "API /api/autopilot/generate", "API /api/posting-schedule",
   "BetterAuth.UserCreate", "MetricsCron",
];

function ErrorDetailsDialog({ log }: { log: ErrorLog }) {
   return (
      <Dialog>
         <DialogTrigger asChild>
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
              <Info className="h-4 w-4" />
           </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl glass-card border border-border/50">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black text-destructive">
                 <ShieldAlert className="h-5 w-5" />
                 Error Details
              </DialogTitle>
           </DialogHeader>
           <div className="space-y-4 text-sm">
              <div>
                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Message</p>
                 <p className="font-semibold">{log.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Source</p>
                    <p>{log.source}</p>
                 </div>
                 <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Path</p>
                    <p className="font-mono text-xs">{log.path || "—"}</p>
                 </div>
              </div>
              {log.context && Object.keys(log.context).length > 0 && (
                 <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Context</p>
                    <pre className="rounded-xl bg-muted/50 p-3 text-xs overflow-auto max-h-40">
                       {JSON.stringify(log.context, null, 2)}
                    </pre>
                 </div>
              )}
              {log.stack && (
                 <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Stack Trace</p>
                    <pre className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500/80 overflow-auto max-h-48 whitespace-pre-wrap">
                       {log.stack}
                    </pre>
                 </div>
              )}
           </div>
        </DialogContent>
     </Dialog>
  );
}

function ActionButtons({ log }: { log: ErrorLog }) {
   const { mutate: resolveError, isPending: isResolving } = useResolveError();
   const { mutate: deleteError, isPending: isDeleting } = useDeleteError();

   return (
      <div className="flex items-center gap-1">
        <ErrorDetailsDialog log={log} />
        <Button
           variant="ghost" size="icon"
           className={`h-8 w-8 rounded-xl transition-all ${log.resolved ? "hover:bg-muted" : "hover:bg-emerald-500/10 hover:text-emerald-500"}`}
           disabled={isResolving || isDeleting}
           onClick={() => resolveError({ id: log.id, resolved: !log.resolved })}
           title={log.resolved ? "Mark as Open" : "Mark as Resolved"}
        >
           {log.resolved ? <XCircle className="h-4 w-4 text-muted-foreground" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        </Button>
        <Button
           variant="ghost" size="icon"
           className="h-8 w-8 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
           disabled={isResolving || isDeleting}
           onClick={() => { if (confirm("Permanently delete this error log?")) deleteError(log.id); }}
           title="Delete"
        >
           <Trash2 className="h-4 w-4" />
        </Button>
     </div>
  );
}

export default function ErrorLogsPage() {
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState("");
   const [sourceFilter, setSourceFilter] = useState("all");
   const [statusFilter, setStatusFilter] = useState("unresolved");
   const qc = useQueryClient();
   const containerRef = useRef<HTMLDivElement>(null);

   const { data, isLoading, isFetching } = useErrorLogs({
     page,
     limit: 25,
     search: search || undefined,
     source: sourceFilter === "all" ? undefined : sourceFilter,
     resolved: statusFilter === "all" ? undefined : statusFilter === "resolved",
  });

   const logs: ErrorLog[] = Array.from(
      new Map((data?.logs ?? []).map((l: ErrorLog) => [l.id, l])).values()
   ) as ErrorLog[];
   const total = data?.total ?? 0;
   const openCount = logs.filter(l => !l.resolved).length;
   const pageCount = total ? Math.ceil(total / 25) : 0;

   const handleRefresh = () => qc.invalidateQueries({ queryKey: ["system", "errors"] });

   return (
     <div ref={containerRef} className="space-y-10 pb-10">
        {/* Header */}
         <div className="errors-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div className="space-y-2">
              <Link href="/admin/system" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to System Control
              </Link>
              <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
                 <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-inner">
                    <AlertTriangle className="h-8 w-8 text-rose-500" />
                 </div>
                 Error Logs
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                 Track and resolve application errors.
                 {total > 0 && (
                    <span className="ml-3 font-bold">
                       <span className="text-rose-500">{openCount} open</span>
                       <span className="text-foreground/40"> / {total.toLocaleString()} total</span>
                    </span>
                 )}
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

         <Card className="log-table glass-card premium-border border-0 overflow-hidden rounded-3xl shadow-2xl bg-card/5 backdrop-blur-2xl">
           <CardHeader className="border-b border-border/50 p-8 flex flex-col md:flex-row md:items-center md:justify-between bg-muted/30 gap-4">
              <div className="space-y-1">
                 <CardTitle className="text-3xl font-black text-foreground tracking-tight">Error Log Buffer</CardTitle>
                 <CardDescription className="text-muted-foreground font-medium text-base">
                    Application exceptions with full stack traces
                 </CardDescription>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                 <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-52 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       {SOURCES.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Sources" : s}</SelectItem>)}
                    </SelectContent>
            </Select>
                 <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-44 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="all">All Errors</SelectItem>
                       <SelectItem value="unresolved">Open Only</SelectItem>
                       <SelectItem value="resolved">Resolved Only</SelectItem>
                    </SelectContent>
            </Select>
                 <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
                    <Input
                       placeholder="Search error messages..."
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
                    Array.from({ length: 6 }).map((_, i) => (
                       <div key={i} className="p-6 flex items-center justify-between gap-6 animate-pulse">
                          <div className="flex items-center gap-6">
                             <div className="h-14 w-14 rounded-2xl bg-muted/40" />
                             <div className="space-y-2">
                                <div className="h-4 w-64 bg-muted/40 rounded" />
                                <div className="h-3 w-40 bg-muted/30 rounded" />
                             </div>
                          </div>
                          <div className="h-8 w-28 bg-muted/40 rounded-xl" />
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
                             className={`p-6 hover:bg-muted/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-default
                      ${log.resolved ? "opacity-60" : ""}`}
                          >
                             <div className="flex items-center gap-6">
                                <div className={`rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm flex-shrink-0
                        ${log.resolved ? "bg-muted/30 text-muted-foreground border border-border/30" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                                   <ShieldAlert className="h-7 w-7" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                   <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight truncate max-w-lg">
                                      {log.message}
                                   </h4>
                                   <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                                      Source: <span className="text-foreground/60 normal-case font-semibold">{log.source}</span>
                                      {log.path && (
                                         <><span className="mx-2 text-border">·</span><span className="font-mono normal-case">{log.path}</span></>
                                      )}
                                   </p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 flex-shrink-0">
                                <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-4 py-2 rounded-xl border-2 transition-all
                        ${log.resolved
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                                      : "border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10"}`}>
                                   {log.resolved ? "resolved" : "open"}
                                </span>
                                <span className="text-sm font-mono font-black text-muted-foreground/40 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/10 whitespace-nowrap">
                                   {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                                </span>
                                <ActionButtons log={log} />
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 ) : (
                    <div className="py-32 text-center italic text-muted-foreground font-bold text-xl opacity-50">
                       No error logs found. 🎉
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
                    className="text-primary hover:bg-primary/10 font-black px-8 h-12 rounded-2xl transition-all hover:scale-105">← Previous</Button>
                 <Button variant="ghost" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}
                    className="text-primary hover:bg-primary/10 font-black px-8 h-12 rounded-2xl transition-all hover:scale-105">Next →</Button>
              </div>
           </div>
        </Card>
     </div>
  );
}
