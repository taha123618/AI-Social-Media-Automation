'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Users, 
  MousePointer2, Share2, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stat {
  label: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
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
      color: 'blue'
    },
    { 
      label: 'Engagement Rate', 
      value: `${stats.engagementRate}%`, 
      change: 2.1, 
      icon: MousePointer2,
      color: 'purple'
    },
    { 
      label: 'Scheduled', 
      value: stats.scheduledCount, 
      change: 0, 
      icon: Calendar,
      color: 'orange'
    },
    { 
      label: 'Overall Growth', 
      value: `+${stats.growth}%`, 
      change: stats.growth, 
      icon: Share2,
      color: 'green'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-none shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
            </CardContent>
            <div className={`h-1 w-full bg-gradient-to-r from-${stat.color}-500 to-transparent opacity-10 group-hover:opacity-100 transition-opacity`} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
