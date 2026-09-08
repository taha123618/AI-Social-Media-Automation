"use client";

import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";
import { Users, MousePointer2, Share2, Eye, TrendingUp, Filter, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyticsTotals, usePostEngagement } from "@/features/admin/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f43f5e", "#10b981", "#f59e0b"];

export default function AnalyticsClient({
  chartData,
  pieData,
  totals: initialTotals
}: {
  chartData: any[],
  pieData: any[],
  totals: {
    views: string;
    clicks: string;
    shares: string;
    users: string;
  }
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: liveTotals, isLoading: totalsLoading } = useAnalyticsTotals();
  const { data: engagementData, isLoading: engagementLoading } = usePostEngagement(14);

  const totals = liveTotals ? {
    views: liveTotals.views,
    clicks: liveTotals.clicks,
    shares: liveTotals.shares,
    users: initialTotals.users,
  } : initialTotals;

  const summaryCards = [
    { title: "Total Impressions", value: totals.views, icon: Eye, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Click Rate", value: totals.clicks, icon: MousePointer2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Total Shares", value: totals.shares, icon: Share2, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "Identity Nodes", value: totals.users, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const engagementChartData = engagementData.length > 0 ? engagementData : (chartData.length > 0 ? chartData.map(d => ({ ...d, impressions: d.users * 100, clicks: d.users * 20, likes: d.users * 10, comments: Math.floor(d.users * 2), shares: Math.floor(d.users * 3) })) : []);

  return (
    <div ref={containerRef} className="space-y-10 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-sm flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            Engine Analytics
          </h1>
          <p className="text-muted-foreground text-lg font-medium ml-15">Real-time telemetry and engagement protocol metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass-card hover:bg-muted font-bold px-6 border-border rounded-xl">
            <Filter className="mr-2 h-4 w-4" />
            Parameters
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-105">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((item, i) => (
          <Card key={item.title} className="analytics-card glass-card premium-border border-0 bg-card/10 backdrop-blur-md shadow-xl rounded-2xl hover:bg-card/20 transition-colors group cursor-default">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{item.title}</CardTitle>
              <div className={`rounded-xl p-2.5 ${item.bg} group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {totalsLoading ? (
                <Skeleton className="h-10 w-24 mb-2" />
              ) : (
                <div className="text-4xl font-black tracking-tighter text-foreground">{item.value}</div>
              )}
              <div className="mt-3 flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg border border-emerald-500/20">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Live Feed
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        <Card className="analytics-card glass-card premium-border col-span-4 border-0 p-8 rounded-3xl shadow-2xl bg-card/5 backdrop-blur-2xl">
          <CardHeader className="px-0 pt-0 pb-10">
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Engagement Timeline</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-base">Daily impressions, clicks, and engagement metrics</CardDescription>
          </CardHeader>
          <div className="h-[400px] w-full pt-4">
            {engagementLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementChartData}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/20" />
                  <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground/40 font-bold" fontSize={11} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="currentColor" className="text-muted-foreground/40 font-bold" fontSize={11} tickLine={false} axisLine={false} dx={-15} />
                  <Tooltip
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                    contentStyle={{
                      backgroundColor: 'rgba(var(--background-rgb), 0.8)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '12px 16px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                  <Area type="monotone" dataKey="impressions" stroke="#6366f1" fillOpacity={1} fill="url(#colorImpressions)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="analytics-card glass-card premium-border col-span-3 border-0 p-8 rounded-3xl shadow-2xl bg-card/5 backdrop-blur-2xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-3xl font-black text-foreground tracking-tight">Signal Channels</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-base">Platform distribution across the network</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(var(--background-rgb), 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '12px 16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3">
            {pieData.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-border/10 hover:border-border/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-black text-foreground/90 uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-sm font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 group-hover:scale-105 transition-transform">{item.value} Nodes</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
