'use client';

import { motion } from 'framer-motion';
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
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      color: 'bg-blue-500/10',
    },
    {
      label: 'Engagement',
      value: data.totalEngagement,
      icon: <Activity className="h-4 w-4 text-purple-500" />,
      color: 'bg-purple-500/10',
    },
    {
      label: 'Leads Captured',
      value: data.leadsCaptured,
      icon: <Users className="h-4 w-4 text-green-500" />,
      color: 'bg-green-500/10',
    },
    {
      label: 'Consistency',
      value: `${data.consistencyScore}%`,
      icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
      color: 'bg-orange-500/10',
    },
    {
      label: 'Rev. Impact',
      value: data.estimatedRevenueImpact,
      icon: <DollarSign className="h-4 w-4 text-emerald-500" />,
      color: 'bg-emerald-500/10',
    },
  ];

  return (
    <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Growth Assistant</p>
        </div>
        <CardTitle className="text-2xl font-black tracking-tighter">Performance Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${metric.color}`}>
                  {metric.icon}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{metric.value}</p>
            </motion.div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
            {data.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
