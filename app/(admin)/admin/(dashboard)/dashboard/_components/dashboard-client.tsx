"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Activity, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   AreaChart,
   Area,
} from "recharts";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useDashboardChartData, useRecentSecurityEvents } from "@/features/admin/hooks/use-admin";
import Link from "next/link";

export default function AdminDashboardPage({
   statsData,
   securityEvents: initialEvents = []
}: {
   statsData: { title: string; value: number; icon: string; description: string; trend?: string; trendValue?: string }[];
   securityEvents?: { id: string; user: string; action: string; time: string; type: string }[];
}) {
   const containerRef = React.useRef<HTMLDivElement>(null);
   const { data: chartData, isLoading: chartLoading } = useDashboardChartData();
   const { data: liveEvents, isLoading: eventsLoading } = useRecentSecurityEvents(4);

   const displayEvents = liveEvents.length > 0 ? liveEvents : initialEvents;

   useGSAP(() => {
      gsap.from(".stat-card", {
         y: 30,
         opacity: 0,
         stagger: 0.1,
         duration: 0.8,
         ease: "power3.out"
      });
      gsap.from(".chart-section", {
         scale: 0.98,
         opacity: 0,
         duration: 1,
         delay: 0.4,
         ease: "power2.out"
      });
      gsap.from(".stat-value", {
         textContent: 0,
         duration: 2,
         ease: "power2.out",
         snap: { textContent: 1 },
         stagger: 0.1
      });
   }, { scope: containerRef });

   const displayChart = chartData.length > 0 ? chartData : [
      { name: "Mon", users: 0, posts: 0, engagement: 0 },
      { name: "Tue", users: 0, posts: 0, engagement: 0 },
      { name: "Wed", users: 0, posts: 0, engagement: 0 },
      { name: "Thu", users: 0, posts: 0, engagement: 0 },
      { name: "Fri", users: 0, posts: 0, engagement: 0 },
      { name: "Sat", users: 0, posts: 0, engagement: 0 },
      { name: "Sun", users: 0, posts: 0, engagement: 0 },
   ];

   return (
      <div ref={containerRef} className="space-y-10 pb-10">
         <div className="flex flex-col gap-2">
            <motion.h1
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm"
            >
               Dashboard Overview
            </motion.h1>
            <motion.p
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="text-muted-foreground text-lg"
            >
               Dynamic platform insights and administrative controls.
            </motion.p>
         </div>

         {/* Stats Grid */}
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, i) => {
               const IconComponent = {
                  shield: ShieldCheck,
                  users: Users,
                  calendar: Calendar,
                  activity: Activity
               }[stat.icon] || Activity;

               return (
                  <Card key={stat.title} className="stat-card glass-card premium-border border-0 overflow-hidden">
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                           <IconComponent className="h-5 w-5" />
                        </div>
                     </CardHeader>
                     <CardContent>
                        <div className="flex items-baseline space-x-2">
                           <div className="stat-value text-3xl font-bold text-foreground">{stat.value}</div>
                           {stat.trendValue && (
                              <div className={cn(
                                 "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md",
                                 stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                              )}>
                                 {stat.trend === 'up' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                                 {stat.trendValue}
                              </div>
                           )}
                        </div>
                        <p className="mt-2 text-xs font-medium text-muted-foreground/70">{stat.description}</p>
                     </CardContent>
                  </Card>
               );
            })}
         </div>

         {/* Charts Section */}
         <div className="grid gap-6 md:grid-cols-2">
            <Card className="chart-section glass-card premium-border border-0 p-6">
               <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-foreground">System Activity</CardTitle>
                  <CardDescription className="text-muted-foreground">Total posts generated vs engagement rate</CardDescription>
               </CardHeader>
               <div className="h-[350px] w-full pt-6">
                  {chartLoading ? (
                     <div className="h-full w-full animate-pulse rounded-xl bg-muted/30" />
                  ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={displayChart}>
                              <defs>
                                 <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip
                                 contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--foreground)',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                 }}
                              />
                              <Area type="monotone" dataKey="posts" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPosts)" strokeWidth={3} />
                           </AreaChart>
                        </ResponsiveContainer>
                  )}
               </div>
            </Card>

            <Card className="chart-section glass-card premium-border border-0 p-6">
               <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-foreground">User Growth</CardTitle>
                  <CardDescription className="text-muted-foreground">Platform registrations across the week</CardDescription>
               </CardHeader>
               <div className="h-[350px] w-full pt-6">
                  {chartLoading ? (
                     <div className="h-full w-full animate-pulse rounded-xl bg-muted/30" />
                  ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={displayChart}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip
                                 cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                 contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--foreground)',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                 }}
                              />
                              <Bar dataKey="users" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                  )}
               </div>
            </Card>
         </div>

         {/* Recent Activity Feed */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                     Live Security Monitor
                  </h2>
                  <p className="text-sm text-muted-foreground">Real-time platform status and administrator actions</p>
               </div>
               <Button variant="outline" size="sm" className="glass-card hover:bg-muted font-semibold px-6">
                  <Link href="/admin/system/jobs">View All</Link>
               </Button>
            </div>
            <div className="grid gap-4">
               {eventsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card/30 p-5 animate-pulse">
                        <div className="flex items-center gap-5">
                           <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                           <div className="space-y-2">
                              <div className="h-4 w-56 bg-muted-foreground/20 rounded" />
                              <div className="h-3 w-32 bg-muted-foreground/10 rounded" />
                           </div>
                        </div>
                        <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
                     </div>
                  ))
               ) : displayEvents.length > 0 ? displayEvents.map((item: { id: string; user: string; action: string; time: string; type: string }, idx: number) => (
                  <motion.div
                     key={item.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.6 + idx * 0.1 }}
                     className="flex items-center justify-between rounded-2xl border border-border bg-card/30 p-5 transition-all hover:translate-x-1 hover:shadow-lg hover:bg-card/50 group"
                  >
                     <div className="flex items-center gap-5">
                        <div className={cn(
                           "h-3 w-3 rounded-full transition-transform group-hover:scale-125",
                           item.type === 'warning' || item.type === 'critical' ? 'bg-rose-500 animate-pulse' :
                              item.type === 'success' ? 'bg-emerald-500' : 'bg-primary'
                        )} />
                        <div>
                           <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{item.action}</p>
                           <p className="text-sm text-muted-foreground font-medium">By {item.user}</p>
                        </div>
                     </div>
                     <p className="text-xs font-mono font-bold text-muted-foreground/60 bg-muted px-2 py-1 rounded-md">{typeof item.time === 'string' ? new Date(item.time).toLocaleString() : item.time}</p>
                  </motion.div>
               )) : (
                  <div className="py-24 text-center glass-card rounded-2xl border-0">
                     <p className="text-muted-foreground font-medium italic">Synchronizing live security feed...</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
