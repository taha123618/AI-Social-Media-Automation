'use client';

import { TrendingUp, Users, FileText, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthMetricsProps {
  data: {
    postsPublished: number;
    totalEngagement: number;
    leadsCaptured: number;
    consistencyScore: number;
    estimatedRevenueImpact: string;
    summary: string;
  } | null;
}

export function GrowthMetricsCard({ data }: GrowthMetricsProps) {
  if (!data) return null;

  const metrics = [
    {
      label: 'Published',
      value: data.postsPublished,
      icon: <FileText className="h-3.5 w-3.5 text-primary" />,
    },
    {
      label: 'Engagement',
      value: data.totalEngagement.toLocaleString(),
      icon: <Activity className="h-3.5 w-3.5 text-accent" />,
    },
    {
      label: 'Leads',
      value: data.leadsCaptured,
      icon: <Users className="h-3.5 w-3.5 text-emerald-500" />,
    },
    {
      label: 'Consistency',
      value: `${data.consistencyScore}%`,
      icon: <TrendingUp className="h-3.5 w-3.5 text-purple-400" />,
    },
    {
      label: 'Rev. ROI',
      value: data.estimatedRevenueImpact,
      icon: <DollarSign className="h-3.5 w-3.5 text-primary" />,
    },
  ];

  return (
    <Card className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
      <CardHeader className="p-0 pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">
            Growth Telemetry
          </p>
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Autonomous Velocity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-secondary/50 border border-border/40 text-left"
            >
              <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                {metric.icon}
                <span className="text-[10px] font-medium uppercase">{metric.label}</span>
              </div>
              <div className="text-base font-bold font-mono text-foreground" suppressHydrationWarning>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {data.summary && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
            {data.summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
