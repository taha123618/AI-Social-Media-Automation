"use client";

import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
   ShieldAlert,
   Terminal,
   Search,
   Download,
   Trash2,
   RefreshCw,
   AlertCircle,
   CheckCircle2,
   Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { format } from "date-fns";

export default function SettingsClient({
   initialLogs,
   stats
}: {
   initialLogs: any[],
   stats: {
      uptime: string;
      pendingJobs: number;
      criticalAlerts: number;
   }
}) {
   const containerRef = useRef<HTMLDivElement>(null);
   const [filter, setFilter] = React.useState("");

   useGSAP(() => {
      gsap.from(".log-item", {
         opacity: 0,
         x: -20,
         stagger: 0.05,
         duration: 0.5,
         ease: "power2.out"
      });
   }, { scope: containerRef });

   const filteredLogs = initialLogs.filter(log =>
      log.event.toLowerCase().includes(filter.toLowerCase()) ||
      log.source.toLowerCase().includes(filter.toLowerCase())
   );

   return (
      <div ref={containerRef} className="space-y-10 pb-10">
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
               <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4 drop-shadow-sm">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                     <Terminal className="h-8 w-8 text-primary" />
                  </div>
                  System Control & Logs
               </h1>
               <p className="text-muted-foreground text-lg font-medium ml-18">Monitor critical platform events and system integrity.</p>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" className="glass-card hover:bg-muted font-bold px-6 border-border rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export Telemetry
               </Button>
               <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black px-8 shadow-xl shadow-destructive/20 rounded-xl transition-all hover:scale-105 active:scale-95">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Purge Buffer
               </Button>
            </div>
         </div>

         <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">System Uptime</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-4xl font-black text-emerald-500 tracking-tighter">{stats.uptime}</div>
                  <p className="text-xs font-bold text-muted-foreground mt-1">99.99% Reliability Score</p>
               </CardContent>
            </Card>
            <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Pending Background Jobs</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-4xl font-black text-primary tracking-tighter">{stats.pendingJobs}</div>
                  <p className="text-xs font-bold text-muted-foreground mt-1">Active Queue Processing</p>
               </CardContent>
            </Card>
            <Card className="glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl">
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Critical Alerts</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-4xl font-black text-destructive tracking-tighter">{stats.criticalAlerts}</div>
                  <p className="text-xs font-bold text-muted-foreground mt-1">Status: Operational</p>
               </CardContent>
            </Card>
         </div>

         <Card className="glass-card premium-border border-0 overflow-hidden rounded-3xl shadow-2xl bg-card/5 backdrop-blur-2xl">
            <CardHeader className="border-b border-border/50 p-8 flex flex-col md:flex-row md:items-center md:justify-between bg-muted/30">
               <div className="space-y-1">
                  <CardTitle className="text-3xl font-black text-foreground tracking-tight">Event Log Buffer</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium text-base">Real-time sequence of system operation events</CardDescription>
               </div>
               <div className="relative w-full md:w-96 mt-4 md:mt-0">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground/60" />
                  <Input
                     placeholder="Search events, sources, or tags..."
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     className="pl-12 h-14 border-border/50 bg-muted/20 text-foreground text-lg focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl font-bold transition-all placeholder:text-muted-foreground/30"
                  />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border/20">
                  {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                     <div key={log.id} className="log-item p-6 hover:bg-muted/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-default">
                        <div className="flex items-center gap-6">
                           <div className={`rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${log.priority === 'critical' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                              log.priority === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                 log.priority === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                              }`}>
                              {log.priority === 'critical' ? <ShieldAlert className="h-7 w-7" /> :
                                 log.priority === 'warning' ? <AlertCircle className="h-7 w-7" /> :
                                    log.priority === 'success' ? <CheckCircle2 className="h-7 w-7" /> : <Info className="h-7 w-7" />}
                           </div>
                           <div className="space-y-0.5">
                              <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{log.event}</h4>
                              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Source: <span className="text-foreground/60">{log.source}</span></p>
                           </div>
                        </div>
                        <div className="flex items-center gap-10">
                           <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-4 py-2 rounded-xl border-2 transition-all ${log.priority === 'critical' ? 'border-rose-500/40 bg-rose-500/10 text-rose-500 scale-105 shadow-lg shadow-rose-500/20' :
                              log.priority === 'warning' ? 'border-amber-500/40 bg-amber-500/10 text-amber-500' :
                                 log.priority === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500' : 'border-primary/30 bg-primary/10 text-primary'
                              }`}>
                              {log.priority}
                           </span>
                           <span className="text-sm font-mono font-black text-muted-foreground/40 w-44 text-right bg-muted/20 px-3 py-1.5 rounded-lg border border-border/10">
                              {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                           </span>
                        </div>
                     </div>
                  )) : (
                     <div className="py-32 text-center italic text-muted-foreground font-bold text-xl opacity-50">No logs matching protocol criteria.</div>
                  )}
               </div>
            </CardContent>
            <div className="p-8 border-t border-border/50 bg-muted/40 flex justify-center">
               <Button variant="ghost" className="text-primary hover:bg-primary/10 font-black px-12 h-14 rounded-2xl transition-all hover:scale-105 text-lg">
                  <RefreshCw className="mr-3 h-5 w-5" />
                  Refresh Matrix Sequence
               </Button>
            </div>
         </Card>
      </div>
   );
}
