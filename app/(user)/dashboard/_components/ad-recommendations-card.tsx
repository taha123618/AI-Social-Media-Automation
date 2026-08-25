'use client';

import { Zap, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdRecommendation {
  postId: string;
  title: string;
  engagementRate: string;
  status: string;
  suggestedBudget: string;
  reason: string;
}

interface AdRecommendationsProps {
  recommendations: AdRecommendation[];
}

export function AdRecommendationsCard({ recommendations }: AdRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
      <CardHeader className="p-0 pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">
            Promotion Engine
          </p>
        </div>
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
          <span>Ad Copy Boosters</span>
          <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.postId}
            className="p-3.5 rounded-lg bg-secondary/50 border border-border/40 hover:border-primary/40 transition-all text-left"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 pr-2">
                <h4 className="font-bold text-xs text-foreground truncate">{rec.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {rec.engagementRate} CTR
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {rec.suggestedBudget}
                  </span>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md text-primary hover:bg-primary/10 shrink-0">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {rec.reason}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
