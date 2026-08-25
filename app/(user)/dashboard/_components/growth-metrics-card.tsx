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
      label: 'Posts Published',
      value: data.postsPublished,
      icon: <FileText className="h-3.5 w-3.5 text-primary" />,
    },
    {
      label: 'Engagement',
      value: data.totalEngagement,
      icon: <Activity className="h-3.5 w-3.5 text-primary" />,
    },
    {
      label: 'Leads Captured',
      value: data.leadsCaptured,
      icon: <Users className="h-3.5 w-3.5 text-primary" />,
    },
    {
      label: 'Consistency',
      value: `${data.consistencyScore}%`,
      icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />,
    },
    {
      label: 'Rev. Impact',
      value: data.estimatedRevenueImpact,
      icon: <DollarSign className="h-3.5 w-3.5 text-primary" />,
    },
  ];

  return (
    <Card className="overflow-hidden border border-border shadow-none bg-card rounded-none">
      <CardHeader className="pb-2 border-b border-border">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-none bg-primary" />
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">GROWTH TELEMETRY</p>
        </div>
        <CardTitle className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">Performance Insights</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-2.5 rounded-none bg-secondary/40 border border-border"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-none bg-secondary border border-border">
                  {metric.icon}
                </div>
                <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              </div>
              <p className="text-base font-mono font-black text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>
        <div className="p-2.5 rounded-none bg-primary/5 border border-primary/20">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
