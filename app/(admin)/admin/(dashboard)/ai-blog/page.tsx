"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Users, TrendingUp, Settings, Activity, AlertTriangle,
  Loader2, ArrowRight, BookOpen, Sparkles, BarChart3,
} from "lucide-react";

interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalGenerations: number;
  avgSeoScore: number;
  articlesByStatus: Record<string, number>;
  recentActivity: Array<{ id: string; action: string; createdAt: string }>;
  topTemplates: Array<{ id: string; name: string; _count: { articles: number } }>;
}

export default function AIBlogAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Articles", value: stats?.totalArticles ?? 0, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Generations", value: stats?.totalGenerations ?? 0, icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Avg SEO Score", value: `${stats?.avgSeoScore ?? 0}%`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">AI Blog Writer</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your AI blog generation platform.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/ai-blog/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-sm font-bold hover:bg-accent transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/admin/ai-blog/analytics"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-6 rounded-2xl border border-border bg-card/50">
              <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status distribution */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card/50">
          <h3 className="text-lg font-bold text-foreground mb-4">Article Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats?.articlesByStatus ?? {}).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-24">{status}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(count / Math.max(1, stats?.totalArticles ?? 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-border bg-card/50">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/admin/ai-blog/settings", label: "System Settings", icon: Settings },
                { href: "/admin/ai-blog/templates", label: "Manage Templates", icon: FileText },
                { href: "/admin/ai-blog/users", label: "User Management", icon: Users },
                { href: "/admin/ai-blog/analytics", label: "View Analytics", icon: Activity },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors group"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          <div className="p-6 rounded-2xl border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-lg font-bold text-foreground">System Alerts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No active alerts. All systems operational.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
