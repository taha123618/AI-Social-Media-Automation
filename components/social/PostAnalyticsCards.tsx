'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, 
  MousePointer2, Share2, Calendar
} from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface PostAnalyticsCardsProps {
  stats: {
    totalReach: number;
    engagementRate: number;
    scheduledCount: number;
    growth: number;
  };
}

export function PostAnalyticsCards({ stats }: PostAnalyticsCardsProps) {
  const items: Stat[] = [
    { 
      label: 'Estimated Reach', 
      value: stats.totalReach.toLocaleString(), 
      change: stats.growth, 
      icon: Users,
    },
    { 
      label: 'Engagement Rate', 
      value: `${stats.engagementRate}%`, 
      change: 2.1, 
      icon: MousePointer2,
    },
    { 
      label: 'Scheduled Queue', 
      value: stats.scheduledCount, 
      change: 0, 
      icon: Calendar,
    },
    { 
      label: 'Organic Growth', 
      value: `+${stats.growth}%`, 
      change: stats.growth, 
      icon: Share2,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{item.change}%</span>
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground mb-0.5" suppressHydrationWarning>
              {item.value}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {item.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
