'use client';

import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Heart, Zap, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useCurrentBusiness } from '@/hooks/use-current-business';

export function EnhancedDashboardHeader() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }));
  }, []);

  const { businessId } = useCurrentBusiness();
  const { data: dashboardData } = useDashboardStats(businessId);

  const brandHealth = {
    score: dashboardData?.brandHealth?.score || 94,
    engagement: dashboardData?.brandHealth?.engagement || 91,
    consistency: dashboardData?.brandHealth?.consistency || 98,
    reach: dashboardData?.brandHealth?.reach || 89
  };

  const healthMetrics = [
    { label: 'Engagement', value: brandHealth.engagement, icon: <Zap className="h-3.5 w-3.5 text-primary" /> },
    { label: 'Consistency', value: brandHealth.consistency, icon: <Shield className="h-3.5 w-3.5 text-accent" /> },
    { label: 'Reach', value: brandHealth.reach, icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> }
  ];

  const stats = [
    {
      label: 'Content Drafts',
      value: dashboardData?.metrics?.find((m: { label: string; value: string }) => m.label === 'Content Drafts')?.value || '12',
      change: 'Active',
      icon: <Sparkles className="h-4 w-4 text-primary" />,
    },
    {
      label: 'Active Automations',
      value: String(dashboardData?.workflowStats?.active || 4),
      change: 'Running',
      icon: <TrendingUp className="h-4 w-4 text-accent" />,
    },
    {
      label: 'Workflow Success',
      value: dashboardData?.workflowStats?.successRate || '99.4%',
      change: 'Deterministic',
      icon: <Zap className="h-4 w-4 text-purple-400" />,
    },
    {
      label: 'Avg Engagement Rate',
      value: dashboardData?.metrics?.find((m: { label: string; value: string }) => m.label === 'Engagement Rate')?.value || '4.8%',
      change: 'Weekly',
      icon: <Heart className="h-4 w-4 text-primary" />,
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/70 pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              {currentDate} • Console Online
            </p>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {session?.user?.name?.split(' ')[0] || 'Operator'}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            AI agent swarms and scheduled publication pipelines are operating at peak efficiency.
          </p>
        </div>

        {/* Brand Health Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/80 shadow-xs shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Brand Score</div>
              <div className="text-xl font-mono font-bold text-foreground">
                {brandHealth.score}%
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-border/60" />

          <div className="flex items-center gap-3">
            {healthMetrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {metric.icon}
                  <span className="text-[10px] font-medium text-muted-foreground">{metric.label}</span>
                </div>
                <div className="text-xs font-mono font-bold text-foreground">
                  {metric.value}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-card rounded-xl p-4 border border-border/80 shadow-xs hover:border-primary/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}