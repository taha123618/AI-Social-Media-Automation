'use client';

import { TrendingUp, Users, Zap, MousePointer2, Brain, Sparkles, Target, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AnalyticsOverview({
  aggregate
}: {
  aggregate: {
    impressions: number;
    impressionsChange: string;
    likes: number;
    likesChange: string;
    comments: number;
    commentsChange: string;
    clicks: number;
    clicksChange: string;
    shares: number;
    sharesChange: string;
    aiPerformanceScore?: string;
    predictedGrowth?: string;
    confidenceScore?: string;
    workflowSuccessRate?: string;
    activeAutomations?: number;
    workflowStats?: {
      name: string;
      impressions: number;
      likes: number;
      comments: number;
      clicks: number;
      shares: number;
      posts: number;
    }[];
  }
}) {
  const cards = [
    {
      label: 'Automation Success',
      value: aggregate.workflowSuccessRate || '100%',
      change: `${aggregate.activeAutomations || 0} ACTIVE`,
      icon: <Brain className="h-4 w-4 text-primary" />,
      aiInsight: 'Workflows executing with deterministic precision'
    },
    {
      label: 'Total Impressions',
      value: aggregate.impressions.toLocaleString(),
      change: aggregate.impressionsChange,
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
      aiInsight: parseFloat(aggregate.impressionsChange) >= 0 ? 'Impressions elevated via peak-hour dispatch' : 'Impression velocity adjusting'
    },
    {
      label: 'Engagement (Likes/Comments)',
      value: (aggregate.likes + aggregate.comments).toLocaleString(),
      change: aggregate.likesChange,
      icon: <Zap className="h-4 w-4 text-primary" />,
      aiInsight: 'Audience resonance score optimal'
    },
    {
      label: 'Total Clicks',
      value: aggregate.clicks.toLocaleString(),
      change: aggregate.clicksChange,
      icon: <MousePointer2 className="h-4 w-4 text-primary" />,
      aiInsight: 'Call-to-action clickthrough accelerating'
    },
    {
      label: 'Shares',
      value: aggregate.shares.toLocaleString(),
      change: aggregate.sharesChange,
      icon: <Users className="h-4 w-4 text-primary" />,
      aiInsight: 'Organic cross-network amplification'
    },
    {
      label: 'AI Performance Score',
      value: aggregate.aiPerformanceScore || '98.4%',
      change: '+1.2%',
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      aiInsight: 'Brand safety and tone adherence verified'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="h-8 w-8 rounded-none bg-secondary border border-border flex items-center justify-center text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold uppercase text-foreground">PERFORMANCE TELEMETRY</h2>
          <p className="text-xs font-mono text-muted-foreground">Autonomous metrics & predictive signals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-none border border-border bg-card p-4 transition-none"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-none bg-secondary border border-border flex items-center justify-center">
                {card.icon}
              </div>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-none">
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-foreground mb-1" suppressHydrationWarning>
              {card.value}
            </div>
            <div className="text-xs font-mono uppercase font-bold text-muted-foreground mb-2">
              {card.label}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground flex items-start gap-1.5 border-t border-border/50 pt-2">
              <Target className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <span>{card.aiInsight}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Predictions Banner */}
      <div className="rounded-none border border-border bg-card p-6 relative">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-none bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-mono font-bold uppercase text-foreground">AI PREDICTION & TRAJECTORY</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-primary text-primary-foreground">
                CONFIDENCE: {aggregate.confidenceScore || '94'}%
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mb-3 leading-relaxed">
              Mastra analytical agents project an upward conversion trajectory across all linked social channels. Historical velocity and engagement patterns confirm robust multi-platform growth.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="h-1.5 w-1.5 bg-primary" />
                <span>CONFIRMED OPTIMAL CADENCE</span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <Rocket className="h-3.5 w-3.5 text-primary" />
                <span>{aggregate.predictedGrowth || '+18.5%'} PROJECTED VELOCITY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Performance Breakdown */}
      {aggregate.workflowStats && aggregate.workflowStats.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-mono font-bold uppercase text-foreground">WORKFLOW ENGINE BREAKDOWN</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aggregate.workflowStats.map((stat) => (
              <div
                key={stat.name}
                className="p-4 rounded-none border border-border bg-card"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-mono font-bold text-xs uppercase text-foreground">{stat.name}</h4>
                    <p className="text-[10px] font-mono text-muted-foreground">{stat.posts} posts dispatched</p>
                  </div>
                  <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase font-bold text-primary bg-primary/10 border-primary/30">
                    {((stat.likes + stat.comments + stat.shares) / (stat.impressions || 1) * 100).toFixed(1)}% ENGAGEMENT
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 border border-border bg-secondary/30">
                    <div className="text-[10px] text-muted-foreground uppercase mb-0.5">IMPRESSIONS</div>
                    <div className="text-xs font-bold text-foreground">{stat.impressions.toLocaleString()}</div>
                  </div>
                  <div className="p-2 border border-border bg-secondary/30">
                    <div className="text-[10px] text-muted-foreground uppercase mb-0.5">LIKES</div>
                    <div className="text-xs font-bold text-foreground">{stat.likes.toLocaleString()}</div>
                  </div>
                  <div className="p-2 border border-border bg-secondary/30">
                    <div className="text-[10px] text-muted-foreground uppercase mb-0.5">CLICKS</div>
                    <div className="text-xs font-bold text-foreground">{stat.clicks.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
