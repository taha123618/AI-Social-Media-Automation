"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, Calendar, Edit3, Trash2, FileClock, BarChart, Loader2 } from "lucide-react";
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
        return "bg-primary/10 text-primary border-primary/30";
      case "GENERATING":
        return "bg-secondary text-primary border-border animate-pulse";
      case "REVIEW":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  const getSeoScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-primary font-bold";
    if (score >= 50) return "text-amber-400";
    return "text-destructive";
  };

  return (
    <div className="group relative rounded-none border border-border bg-card p-4 hover:border-primary/60 transition-none">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase rounded-none px-1.5 py-0.5 ${getStatusColor(article.status)}`}>
              {article.status}
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="text-sm font-mono font-bold uppercase text-foreground line-clamp-1 group-hover:text-primary transition-none">
            {article.title || "UNTITLED ARTICLE VECTOR"}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link href={`/blog/${article.id}`}>
            <Button size="icon" variant="ghost" disabled={isDeleting} className="h-7 w-7 rounded-none text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            disabled={isDeleting}
            className="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(article.id)}
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-xs font-mono text-muted-foreground line-clamp-1">
        {article.slug ? `/${article.slug}` : "No slug generated."}
      </p>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-foreground">
            <FileText className="h-3 w-3 text-primary" />
            {article.wordCount} WORDS
          </span>
          <span className="flex items-center gap-1">
            <FileClock className="h-3 w-3" />
            {article.readingTime} MIN
          </span>
        </div>

        <div className="flex items-center gap-1 font-bold">
          <BarChart className="h-3 w-3 text-primary" />
          <span className={getSeoScoreColor(article.seoScore)}>
            {article.seoScore ? `${article.seoScore}% SEO` : "UNSCORED"}
          </span>
        </div>
      </div>
    </div>
  );
}
