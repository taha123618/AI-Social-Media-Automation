"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Sparkles, BookOpen, Search, Filter, Loader2,
  FileText, Clock, TrendingUp, BarChart, Star, Zap,
  ArrowRight, ChartLine,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BlogArticleCard } from "./BlogArticleCard";
import { toast as sonnerToast } from "sonner";
import { getBlogDashboardAnalytics } from "../actions/blog-generation.actions";

export default function BlogDashboardEnhanced() {
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", { description });
    } else {
      sonnerToast.success(title || "Success", { description });
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog/articles");
      const json = await res.json();
      if (json.success) {
        setArticles(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    getBlogDashboardAnalytics(30).then(setAnalyticsData).catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/articles/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        sonnerToast.success("Article deleted");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = (article.title || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    draft: articles.filter((a) => a.status === "DRAFT").length,
    avgSeo: articles.length > 0
      ? Math.round(articles.reduce((sum: number, a: any) => sum + (a.seoScore || 0), 0) / articles.length)
      : 0,
    totalWords: articles.reduce((sum: number, a: any) => sum + (a.wordCount || 0), 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            AI Blog Writer
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage high-ranking, SEO-optimized articles.
          </p>
        </div>
        <Link href="/blog/new">
          <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group">
            <Plus className="h-4 w-4" />
            New Article
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </motion.div>

      {/* Stats row */}
      {articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: FileText, label: "Total Articles", value: stats.total, color: "text-blue-400", bg: "bg-blue-500/10", trend: analyticsData?.trends?.dailyAverage },
            { icon: Star, label: "Published", value: stats.published, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: TrendingUp, label: "Avg SEO Score", value: `${analyticsData?.seoMetrics?.averageScore ?? stats.avgSeo}%`, color: "text-violet-400", bg: "bg-violet-500/10", trend: analyticsData?.seoMetrics?.improvementRate },
            { icon: ChartLine, label: "Daily Avg", value: analyticsData?.trends?.dailyAverage ?? 0, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat: any) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 rounded-2xl border border-border bg-card/50">
                <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                {stat.trend !== undefined && stat.trend !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${stat.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Filter and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border"
      >
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {["ALL", "DRAFT", "GENERATING", "REVIEW", "PUBLISHED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading articles...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center max-w-xl mx-auto mt-8"
        >
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {search || filterStatus !== "ALL" ? "No articles found" : "Ready to write your first article?"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search || filterStatus !== "ALL"
              ? "Try adjusting your search or filters."
              : "Generate SEO-optimized, long-form content that ranks."}
          </p>
          {!search && filterStatus === "ALL" && (
            <Link href="/blog/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 group">
                <Zap className="h-4 w-4" />
                Generate Your First Article
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <BlogArticleCard article={article} onDelete={handleDelete} isDeleting={deletingId === article.id} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
