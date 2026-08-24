"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Settings,
  Users,
  Cpu,
  ShieldAlert,
  Activity,
  FileText,
  Zap,
  LayoutDashboard,
  Search,
  Plus,
  RefreshCw,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBlogDashboardStats } from "@/features/admin/hooks/use-admin";

export default function AdminBlogManagement() {
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const { data: stats, isLoading, error } = useBlogDashboardStats();

  const usageData = stats?.usageData ?? [];
  const topTemplates = stats?.topTemplates ?? [];

  return (
    <div className="space-y-8 p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Blog Writer Admin</h1>
          <p className="text-muted-foreground">Manage AI generation settings, monitor usage, and control system-wide configurations.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Global AI Status</span>
            <Switch checked={isAiEnabled} onCheckedChange={setIsAiEnabled} />
          </div>
          <Badge variant={isAiEnabled ? "default" : "destructive"}>
            {isAiEnabled ? "Operational" : "Disabled"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-900">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Articles"
              value={stats?.totalArticles ?? "0"}
              trend={stats?.articlesChange ?? "+0%"}
              icon={<FileText className="h-5 w-5 text-blue-500" />}
            />
            <StatsCard
              title="Tokens Consumed"
              value={stats?.tokensConsumed ?? "0"}
              trend={stats?.tokensChange ?? "+0%"}
              icon={<Zap className="h-5 w-5 text-amber-500" />}
            />
            <StatsCard
              title="Active Users"
              value={stats?.activeUsers ?? "0"}
              trend={stats?.usersChange ?? "+0%"}
              icon={<Users className="h-5 w-5 text-emerald-500" />}
            />
            <StatsCard
              title="Avg. SEO Score"
              value={stats?.avgSeoScore ?? "0/100"}
              trend={stats?.seoChange ?? "+0%"}
              icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="settings" className="py-2">AI Settings</TabsTrigger>
          <TabsTrigger value="users" className="py-2">User Usage</TabsTrigger>
          <TabsTrigger value="moderation" className="py-2">Moderation</TabsTrigger>
          <TabsTrigger value="monitoring" className="py-2">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Daily AI generation activity across all users.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center p-0 pt-4">
                {isLoading ? (
                  <Skeleton className="h-full w-full mx-4 rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-800" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="articles" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorArticles)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Templates</CardTitle>
                <CardDescription>Most used generation presets.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : topTemplates.length > 0 ? (
                  <div className="space-y-4">
                    {topTemplates.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-pink-500"][i % 5]}`} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.count ?? 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No templates created yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Providers</CardTitle>
                <CardDescription>Configure primary and fallback AI models.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Primary: GPT-4o</p>
                    <p className="text-xs text-muted-foreground">High quality, higher cost</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Fallback: Claude 3.5 Sonnet</p>
                    <p className="text-xs text-muted-foreground">Reliable alternative</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Speed Opt: GPT-4o-mini</p>
                    <p className="text-xs text-muted-foreground">Fast, low cost for outlines</p>
                  </div>
                  <Switch checked />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Generation Rules</CardTitle>
                <CardDescription>Set global limits and safety parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Article Length (Words)</label>
                  <input type="number" defaultValue={5000} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Tone</label>
                  <select className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700">
                    <option>Professional</option>
                    <option>Conversational</option>
                    <option>Technical</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Auto-Optimize SEO</span>
                  <Switch checked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Usage</CardTitle>
              <CardDescription>Track individual user AI generation activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic text-sm">User usage metrics loading from database...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review and moderate AI-generated content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic text-sm">Moderation queue syncing...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Monitoring</CardTitle>
              <CardDescription>Real-time AI service health and performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic text-sm">Monitoring dashboard initializing...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, trend, icon }: { title: string; value: string; trend: string; icon: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-slate-900">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {icon}
          </div>
          <Badge variant="outline" className="text-[10px] font-bold text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
      </CardContent>
      <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: "65%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </Card>
  );
}
