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
    wordCount?: number | null;
    readingTime?: number | null;
    seoScore?: number | null;
    tone?: string | null;
    updatedAt: string | Date;
    [key: string]: any;
  };
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function BlogArticleCard({ article, onDelete, isDeleting }: BlogArticleCardProps) {
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "accent" | "outline" => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "GENERATING":
        return "accent";
      case "REVIEW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSeoScoreColor = (score: number | null | undefined) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-primary font-bold";
    if (score >= 50) return "text-amber-500";
    return "text-destructive";
  };

  return (
    <div className="group relative rounded-xl border border-border/80 bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(article.status)} className="text-[10px] font-semibold px-2 py-0.5">
                {article.status}
              </Badge>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors mt-2">
              {article.title || "Untitled Article"}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Link href={`/blog/${article.id}`}>
              <Button size="icon" variant="ghost" disabled={isDeleting} className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground">
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              disabled={isDeleting}
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(article.id)}
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground line-clamp-1 font-mono">
          {article.slug ? `/${article.slug}` : "No slug generated."}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-foreground">
            <FileText className="h-3 w-3 text-primary" />
            {article.wordCount ?? 0} words
          </span>
          <span className="flex items-center gap-1">
            <FileClock className="h-3 w-3" />
            {article.readingTime ?? 1} min
          </span>
        </div>

        <div className="flex items-center gap-1 font-semibold">
          <BarChart className="h-3 w-3 text-primary" />
          <span className={getSeoScoreColor(article.seoScore)}>
            {article.seoScore ? `${article.seoScore}% SEO` : "Unscored"}
          </span>
        </div>
      </div>
    </div>
  );
}
