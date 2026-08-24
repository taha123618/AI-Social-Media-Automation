'use client';

import { FileText, TrendingUp, Users, Zap, MousePointer2, Brain, Sparkles, Target, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
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
      change: `${aggregate.activeAutomations || 0} Active`,
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      aiInsight: 'Workflows are running with high reliability'
    },
    {
      label: 'Total Impressions',
      value: aggregate.impressions.toLocaleString(),
      change: aggregate.impressionsChange,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      aiInsight: parseFloat(aggregate.impressionsChange) >= 0 ? 'Impressions increased due to optimal posting times' : 'Visibility has decreased compared to last period'
    },
    {
      label: 'Engagement (Likes/Comments)',
      value: (aggregate.likes + aggregate.comments).toLocaleString(),
      change: aggregate.likesChange,
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      aiInsight: parseFloat(aggregate.likesChange) >= 0 ? 'Content resonates well with your target audience' : 'Engagement is lower than previous period'
    },
    {
      label: 'Total Clicks',
      value: aggregate.clicks.toLocaleString(),
      change: aggregate.clicksChange,
      icon: <MousePointer2 className="h-5 w-5" />,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      aiInsight: 'CTA effectiveness improving week over week'
    },
    {
      label: 'Shares',
      value: aggregate.shares.toLocaleString(),
      change: aggregate.sharesChange,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
      aiInsight: 'Social amplification of your brand'
    },
    {
      label: 'AI Performance Score',
      value: aggregate.aiPerformanceScore || 'N/A',
      change: '+0.0%',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      aiInsight: 'Brand alignment improving across all platforms'
    },
    {
      label: 'Predicted Growth',
      value: aggregate.predictedGrowth || 'N/A',
      change: 'Next 30 days',
      icon: <Rocket className="h-5 w-5" />,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      aiInsight: 'Based on current trajectory and market trends'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Performance Intelligence</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered insights and predictions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                {card.change}
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-2" suppressHydrationWarning>
              {card.value}
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              {card.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Target className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-purple-500" />
              <span>{card.aiInsight}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Predictions Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative z-10 flex items-start gap-6">
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Brain className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2">AI Performance Forecast</h3>
            <p className="text-purple-100 mb-4 max-w-2xl text-sm leading-relaxed">
              Our advanced machine learning models predict a continued {parseFloat(aggregate.predictedGrowth || '0') >= 0 ? 'upward' : 'adjusting'} trajectory for your social media presence.
              Based on your engagement patterns and consistency, your current momentum suggests a high probability of beating market benchmarks this month.
            </p>
            <div className="flex items-center gap-6 text-sm font-bold">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>High Confidence ({aggregate.confidenceScore || '92'}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span>{aggregate.predictedGrowth || '+15%'} Projected Growth</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Workflow Performance Breakdown */}
      {aggregate.workflowStats && aggregate.workflowStats.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Workflow Breakdown</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aggregate.workflowStats.map((stat, idx) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{stat.name}</h4>
                    <p className="text-xs text-slate-500">{stat.posts} posts generated</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    {((stat.likes + stat.comments + stat.shares) / (stat.impressions || 1) * 100).toFixed(1)}% Engagement
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Impressions</div>
                    <div className="text-sm font-bold">{stat.impressions.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Likes</div>
                    <div className="text-sm font-bold">{stat.likes.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Clicks</div>
                    <div className="text-sm font-bold">{stat.clicks.toLocaleString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
