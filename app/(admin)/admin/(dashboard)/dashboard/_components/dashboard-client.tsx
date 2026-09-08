"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Activity, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { useDashboardChartData, useRecentSecurityEvents } from "@/features/admin/hooks/use-admin";
import Link from "next/link";

export default function AdminDashboardPage({
   statsData,
   securityEvents: initialEvents = []
}: {
   statsData: { title: string; value: number; icon: string; description: string; trend?: string; trendValue?: string }[];
   securityEvents?: { id: string; user: string; action: string; time: string; type: string }[];
}) {
   const { data: chartData, isLoading: chartLoading } = useDashboardChartData();
   const { data: liveEvents, isLoading: eventsLoading } = useRecentSecurityEvents(4);

   const displayEvents = liveEvents.length > 0 ? liveEvents : initialEvents;

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
      <div className="space-y-8 pb-10">
         <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
               Dashboard Overview
            </h1>
            <p className="text-muted-foreground text-sm">
               Platform telemetry, multi-tenant analytics, and administrative controls.
            </p>
         </div>

         {/* Stats Grid */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat) => {
               const IconComponent = {
                  shield: ShieldCheck,
                  users: Users,
                  calendar: Calendar,
                  activity: Activity
               }[stat.icon] || Activity;

               return (
                  <Card key={stat.title} className="rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all">
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                           <IconComponent className="h-4 w-4" />
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-1">
                        <div className="flex items-baseline space-x-2">
                           <div className="text-3xl font-bold text-foreground font-mono">{stat.value}</div>
                           {stat.trendValue && (
                              <div className={cn(
                                 "flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                                 stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                              )}>
                                 {stat.trend === 'up' ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                                 {stat.trendValue}
                              </div>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                     </CardContent>
                  </Card>
               );
            })}
         </div>

         {/* Charts Section */}
         <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-xl border border-border bg-card shadow-xs p-6">
               <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base font-bold text-foreground">System Activity</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Total posts generated vs engagement rate</CardDescription>
               </CardHeader>
               <div className="h-[320px] w-full pt-4">
                  {chartLoading ? (
                     <div className="h-full w-full animate-pulse rounded-xl bg-secondary/50" />
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
                                 borderRadius: '8px',
                                 color: 'var(--foreground)',
                                 fontSize: '12px',
                                 boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                           />
                           <Area type="monotone" dataKey="posts" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPosts)" strokeWidth={2} />
                        </AreaChart>
                     </ResponsiveContainer>
                  )}
               </div>
            </Card>

            <Card className="rounded-xl border border-border bg-card shadow-xs p-6">
               <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-base font-bold text-foreground">User Growth</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Platform registrations across the week</CardDescription>
               </CardHeader>
               <div className="h-[320px] w-full pt-4">
                  {chartLoading ? (
                     <div className="h-full w-full animate-pulse rounded-xl bg-secondary/50" />
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
                                 borderRadius: '8px',
                                 color: 'var(--foreground)',
                                 fontSize: '12px',
                                 boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                           />
                           <Bar dataKey="users" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  )}
               </div>
            </Card>
         </div>

         {/* Recent Activity Feed */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                  <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                     Live Security Monitor
                  </h2>
                  <p className="text-xs text-muted-foreground">Real-time platform status and administrator actions</p>
               </div>
               <Link href="/admin/system/jobs">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-lg">
                     View All
                  </Button>
               </Link>
            </div>
            <div className="grid gap-3">
               {eventsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                           <div className="h-3 w-3 rounded-full bg-secondary" />
                           <div className="space-y-1.5">
                              <div className="h-4 w-48 bg-secondary rounded" />
                              <div className="h-3 w-28 bg-secondary/70 rounded" />
                           </div>
                        </div>
                        <div className="h-4 w-20 bg-secondary rounded" />
                     </div>
                  ))
               ) : displayEvents.length > 0 ? displayEvents.map((item: { id: string; user: string; action: string; time: string; type: string }) => (
                  <div
                     key={item.id}
                     className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 group shadow-xs"
                  >
                     <div className="flex items-center gap-3.5">
                        <div className={cn(
                           "h-2.5 w-2.5 rounded-full shrink-0",
                           item.type === 'warning' || item.type === 'critical' ? 'bg-rose-500 animate-pulse' :
                              item.type === 'success' ? 'bg-emerald-500' : 'bg-primary'
                        )} />
                        <div>
                           <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{item.action}</p>
                           <p className="text-[11px] text-muted-foreground">By {item.user}</p>
                        </div>
                     </div>
                     <p className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                        {typeof item.time === 'string' ? new Date(item.time).toLocaleDateString() : item.time}
                     </p>
                  </div>
               )) : (
                  <div className="py-12 text-center border border-border rounded-xl bg-card">
                     <p className="text-xs text-muted-foreground italic">Synchronizing live security feed...</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
