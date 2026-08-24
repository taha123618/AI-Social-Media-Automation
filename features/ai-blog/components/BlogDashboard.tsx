"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, BookOpen, Search, Filter, Loader2, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogArticleCard } from "./BlogArticleCard";
import { toast as sonnerToast } from "sonner";

export default function BlogDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

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
      } else {
        toast({
          title: "Failed to load articles",
          description: json.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection error",
        description: "Could not retrieve articles from server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/blog/articles/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        toast({
          title: "Article deleted",
          description: "The article was removed successfully.",
        });
      } else {
        toast({
          title: "Delete failed",
          description: json.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error deleting article",
        description: "Connection issue.",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = (article.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (article.slug || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />
            AI Blog Writer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Create and manage high-ranking, SEO-optimized articles with our structured writing wizard.
          </p>
        </div>

        <Link href="/blog/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-slate-100 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-200 dark:border-slate-900">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-500 dark:focus:border-slate-700 focus:ring-blue-500 dark:focus:ring-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          {["ALL", "DRAFT", "GENERATING", "REVIEW", "PUBLISHED"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? "secondary" : "ghost"}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg text-[10px] sm:text-xs font-semibold uppercase whitespace-nowrap ${
                filterStatus === status 
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Retrieving blog articles...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10 p-8 sm:p-12 text-center max-w-xl mx-auto mt-8">
          <Sparkles className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-300">No articles found</h3>
          <p className="text-slate-600 dark:text-slate-500 mt-2 text-sm">
            {search || filterStatus !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "Generate your first SEO-optimized long-form article using our outline wizard."}
          </p>
          {!search && filterStatus === "ALL" && (
            <Link href="/blog/new" className="inline-block mt-6">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredArticles.map((article) => (
            <BlogArticleCard key={article.id} article={article} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
