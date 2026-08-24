"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, Calendar, Edit3, Trash2, Globe, FileClock, ChevronRight, BarChart, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogArticleCardProps {
  article: {
    id: string;
    title: string | null;
    slug: string | null;
    status: string;
    wordCount: number;
    readingTime: number;
    seoScore: number | null;
    tone: string;
    updatedAt: string | Date;
  };
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function BlogArticleCard({ article, onDelete, isDeleting }: BlogArticleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "GENERATING":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse";
      case "REVIEW":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const getSeoScoreColor = (score: number | null) => {
    if (!score) return "text-slate-500";
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-sm dark:shadow-none hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] font-bold ${getStatusColor(article.status)}`}>
              {article.status}
</Badge>
            <span className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
            {article.title || "Untitled Blog Post"}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link href={`/blog/${article.id}`}>
            <Button size="icon" variant="ghost" disabled={isDeleting} className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none">
              <Edit3 className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            disabled={isDeleting}
            className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => onDelete(article.id)}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
        {article.slug ? `slug: ${article.slug}` : "No slug generated yet."}
      </p>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            {article.wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <FileClock className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            {article.readingTime} min
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-bold">
          <BarChart className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          <span className={getSeoScoreColor(article.seoScore)}>
            {article.seoScore ? `${article.seoScore}% SEO` : "Unscored"}
          </span>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-400" />
      </div>
    </div>
  );
}
