"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { useAuditLogs } from "@/features/system/hooks/use-system";
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
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Info,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type AuditLog = {
  id: string;
  action: string;
  resource: string;
  status: "SUCCESS" | "FAILURE";
  ipAddress: string | null;
  userAgent: string | null;
  details: Record<string, any> | null;
  createdAt: string;
  user?: { name: string; email: string } | null;
};

const AUDIT_ACTIONS = [
  "all", "USER_SIGNUP", "USER_LOGIN", "CONTENT_APPROVED",
  "CONTENT_REJECTED", "RESOLVE_ERROR_LOG", "DELETE_ERROR_LOG",
];

function AuditDetailsDialog({ log }: { log: AuditLog }) {
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
            <ShieldCheck className="h-5 w-5 text-primary" />
            Audit Event Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Action</p>
              <Badge variant="secondary" className="font-mono text-xs">{log.action}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Status</p>
              <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-xl border-2 inline-block
                ${log.status === "SUCCESS" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" : "border-rose-500/40 bg-rose-500/10 text-rose-500"}`}>
                {log.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Resource</p>
              <p className="font-semibold">{log.resource}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">User</p>
              <p>{log.user?.name || log.user?.email || "System"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">IP Address</p>
              <p className="font-mono text-xs">{log.ipAddress || "—"}</p>
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
          {log.userAgent && (
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">User Agent</p>
              <p className="text-xs text-muted-foreground break-all">{log.userAgent}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useAuditLogs({
    page,
    limit: 25,
    search: search || undefined,
    action: actionFilter === "all" ? undefined : actionFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const logs: AuditLog[] = Array.from(
    new Map((data?.logs ?? []).map((l: AuditLog) => [l.id, l])).values()
  ) as AuditLog[];
  const total = data?.total ?? 0;
  const failCount = logs.filter(l => l.status === "FAILURE").length;
  const pageCount = total ? Math.ceil(total / 25) : 0;

  const handleRefresh = () => qc.invalidateQueries({ queryKey: ["system", "audit"] });

  useGSAP(() => {
    gsap.from(".audit-header", {
      y: -24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });
    gsap.from(".log-table", {
      opacity: 0,
      y: 24,
      duration: 0.9,
      delay: 0.25,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      {/* Header */}
      <div className="audit-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Link href="/admin/system" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to System Control
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            Audit Logs
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Security and compliance event trail.
            {total > 0 && (
              <span className="ml-3 font-bold">
                <span className="text-rose-500">{failCount} failures</span>
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
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Security Audit Trail</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-base">
              Logins, approvals, and critical system changes
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-52 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_ACTIONS.map((a) => <SelectItem key={a} value={a}>{a === "all" ? "All Actions" : a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44 h-12 rounded-xl border-border/50 bg-muted/20 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success Only</SelectItem>
                <SelectItem value="FAILURE">Failures Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
              <Input
                placeholder="Search by resource..."
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
                      <div className="h-4 w-48 bg-muted/40 rounded" />
                      <div className="h-3 w-32 bg-muted/30 rounded" />
                    </div>
                  </div>
                  <div className="h-8 w-24 bg-muted/40 rounded-xl" />
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
                      <div className={`rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm flex-shrink-0
                        ${log.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                        {log.status === "SUCCESS"
                          ? <CheckCircle2 className="h-7 w-7" />
                          : <AlertCircle className="h-7 w-7" />}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                          {log.action}
                        </h4>
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                          Resource: <span className="text-foreground/60 normal-case font-semibold">{log.resource}</span>
                          {log.user && (
                            <>
                              <span className="mx-2 text-border">·</span>
                              <span className="text-foreground/60 normal-case font-medium inline-flex items-center gap-1">
                                <User className="h-3 w-3" />{log.user.name || log.user.email}
                              </span>
                            </>
                          )}
                          {log.ipAddress && (
                            <>
                              <span className="mx-2 text-border">·</span>
                              <span className="font-mono normal-case text-foreground/40">{log.ipAddress}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-4 py-2 rounded-xl border-2 transition-all
                        ${log.status === "SUCCESS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10"}`}>
                        {log.status}
                      </span>
                      <span className="text-sm font-mono font-black text-muted-foreground/40 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/10 whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                      </span>
                      <AuditDetailsDialog log={log} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-32 text-center italic text-muted-foreground font-bold text-xl opacity-50">
                No audit events found.
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
