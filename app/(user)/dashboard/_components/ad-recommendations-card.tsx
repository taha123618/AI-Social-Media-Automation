'use client';

import { Zap, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <Card className="overflow-hidden border border-border shadow-none bg-card rounded-none">
      <CardHeader className="pb-2 border-b border-border">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-none bg-primary" />
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">CAMPAIGN DISPATCH</p>
        </div>
        <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          Ad Recommendations
          <Zap className="h-3.5 w-3.5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        {recommendations.map((rec) => (
          <div
            key={rec.postId}
            className="group relative p-3 rounded-none bg-secondary/40 border border-border hover:border-primary/50 transition-none"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground mb-1 line-clamp-1 uppercase">{rec.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="lime">
                    {rec.engagementRate} ENGAGEMENT
                  </Badge>
                  <Badge variant="amber">
                    {rec.suggestedBudget}
                  </Badge>
                </div>
              </div>
              <Button size="icon-xs" variant="ghost" className="text-muted-foreground hover:text-primary">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <p className="text-xs font-mono text-muted-foreground leading-relaxed mb-3">
              {rec.reason}
            </p>

            <Button size="sm" className="w-full">
              BOOST CAMPAIGN NOW
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
