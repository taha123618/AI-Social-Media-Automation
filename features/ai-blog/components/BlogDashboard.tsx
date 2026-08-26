"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, BookOpen, Search, Filter, Loader2 } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              AI Blog Writer CMS
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Autonomous multi-agent research, Gutenberg HTML serialization, and real-time SEO scoring.
          </p>
        </div>

        <Link href="/blog/new" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto text-xs font-semibold gap-1.5 rounded-lg">
            <Plus className="h-4 w-4" />
            <span>Create Article</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-card p-3 rounded-xl border border-border/80">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {["ALL", "DRAFT", "GENERATING", "REVIEW", "PUBLISHED"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? "default" : "ghost"}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg text-xs font-medium px-3 h-8 ${
                filterStatus === status 
                  ? "bg-primary text-primary-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-2 border border-border/80 rounded-xl bg-card">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Retrieving article repository...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card p-8 text-center max-w-lg mx-auto">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No Articles Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {search || filterStatus !== "ALL"
              ? "Adjust query filter parameters."
              : "Generate an SEO-optimized long-form article using our multi-agent wizard."}
          </p>
          {!search && filterStatus === "ALL" && (
            <Link href="/blog/new" className="inline-block mt-4">
              <Button size="sm" className="text-xs rounded-lg font-semibold">
                Start Writing
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <BlogArticleCard
              key={article.id}
              article={article}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
