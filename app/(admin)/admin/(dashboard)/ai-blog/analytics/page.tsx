"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Users, FileText, Clock, Loader2, Calendar,
  ArrowUp, ArrowDown,
} from "lucide-react";

interface AnalyticsData {
  totalArticles: number;
  totalUsers: number;
  totalGenerations: number;
  avgSeoScore: number;
  avgReadabilityScore: number;
  totalWordsWritten: number;
  avgWordsPerArticle: number;
  generationTrend: number;
  userTrend: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  dailyStats: Array<{ date: string; count: number }>;
}

export default function AIBlogAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetch(`/api/admin/blog/analytics?range=${timeRange}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const metrics = [
    { icon: FileText, label: "Total Articles", value: data?.totalArticles ?? 0, color: "text-blue-400" },
    { icon: Users, label: "Active Users", value: data?.totalUsers ?? 0, color: "text-emerald-400", trend: data?.userTrend },
    { icon: TrendingUp, label: "Avg SEO Score", value: `${data?.avgSeoScore ?? 0}%`, color: "text-violet-400" },
    { icon: Clock, label: "Avg Readability", value: `${data?.avgReadabilityScore ?? 0}/100`, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track AI blog writer performance metrics.</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                timeRange === range ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="p-6 rounded-2xl border border-border bg-card/50">
              <Icon className={`h-5 w-5 ${metric.color} mb-3`} />
              <div className={`text-3xl font-black ${metric.color}`}>{metric.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{metric.label}</div>
              {metric.trend !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${metric.trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {metric.trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(metric.trend)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily generation chart */}
        <div className="p-6 rounded-2xl border border-border bg-card/50">
          <h3 className="text-lg font-bold text-foreground mb-4">Daily Generations</h3>
          <div className="flex items-end gap-1 h-32">
            {data?.dailyStats?.map((day) => {
              const maxCount = Math.max(...(data?.dailyStats?.map((d) => d.count) ?? [1]));
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary/50 to-primary transition-all duration-500 hover:from-primary hover:to-primary/80"
                    style={{ height: `${(day.count / maxCount) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top keywords */}
        <div className="p-6 rounded-2xl border border-border bg-card/50">
          <h3 className="text-lg font-bold text-foreground mb-4">Top Target Keywords</h3>
          <div className="space-y-2">
            {data?.topKeywords?.slice(0, 10).map((kw, i) => (
              <div key={kw.keyword} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm text-foreground">{kw.keyword}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(kw.count / Math.max(...data.topKeywords.map((k) => k.count))) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{kw.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional metrics */}
        <div className="p-6 rounded-2xl border border-border bg-card/50">
          <h3 className="text-lg font-bold text-foreground mb-4">Content Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "Total Words Written", value: (data?.totalWordsWritten ?? 0).toLocaleString() },
              { label: "Avg Words/Article", value: (data?.avgWordsPerArticle ?? 0).toLocaleString() },
              { label: "Total Generations", value: (data?.totalGenerations ?? 0).toLocaleString() },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-lg font-black text-foreground">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="p-6 rounded-2xl border border-border bg-card/50">
          <h3 className="text-lg font-bold text-foreground mb-4">System Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-sm text-foreground">System Status</span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <span className="text-sm text-muted-foreground">Generation Trend</span>
              <span className={`text-sm font-bold ${(data?.generationTrend ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {data?.generationTrend ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
