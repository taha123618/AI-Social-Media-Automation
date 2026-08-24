'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Rocket, CheckCircle2, ArrowUpRight, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface GrowthEngineUIProps {
  data: any;
  isLoading: boolean;
}

export function GrowthEngineUI({ data, isLoading }: GrowthEngineUIProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-[2rem] bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <Card className="rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-12 text-center">
        <Rocket className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-black uppercase">No growth data available yet</h3>
        <p className="text-slate-500 font-medium mt-2 max-w-sm">
          Keep posting and engaging to see your growth engine analytics.
        </p>
      </Card>
    );
  }

  const { metrics, summary } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GrowthMetricCard 
          icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
          label="Posts Published"
          value={metrics.postsPublished}
          subValue="Total volume"
          color="blue"
        />
        <GrowthMetricCard 
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          label="Total Engagement"
          value={metrics.totalEngagement}
          subValue="Reactions & comments"
          color="purple"
        />
        <GrowthMetricCard 
          icon={<Users className="h-5 w-5 text-green-600" />}
          label="Leads Captured"
          value={metrics.leadsCaptured}
          subValue="Potential customers"
          color="green"
        />
        <GrowthMetricCard 
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          label="Est. Revenue Impact"
          value={metrics.estimatedRevenueImpact}
          subValue="Projected ROI"
          color="amber"
        />
      </div>

      {/* Main Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">AI Growth Analysis</p>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Strategic Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{summary}"
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
             <CardTitle className="text-xl font-black uppercase tracking-tight">Consistency Engine</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col justify-center text-center">
            <div className="relative h-40 w-40 mx-auto mb-6">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeDasharray={`${metrics.consistencyScore * 2.82} 282`}
                  strokeLinecap="round"
                  className="text-blue-600 -rotate-90 origin-center transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                  {metrics.consistencyScore}
                </span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Score</span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-500">
              Your posting consistency is {metrics.consistencyScore > 70 ? 'excellent' : 'improving'}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GrowthMetricCard({ icon, label, value, subValue, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    green: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
  };

  return (
    <Card className="rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 overflow-hidden group hover:border-blue-500/30 transition-all">
      <CardContent className="p-6">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 border ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
            {label}
          </p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h4>
          <p className="text-xs font-bold text-slate-500">
            {subValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
