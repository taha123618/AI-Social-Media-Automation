'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock, Target, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConsistencyScoreUIProps {
  overall: number;
  frequency: number;
  streak: number;
  optimalTiming: number;
  recommendation: string;
  trend: 'improving' | 'stable' | 'declining';
  totalPosts?: number;
  averagePerWeek?: number;
  bestDay?: string;
  bestTime?: number;
}

export function ConsistencyScoreUI({
  overall,
  frequency,
  streak,
  optimalTiming,
  recommendation,
  trend,
  totalPosts = 0,
  averagePerWeek = 0,
  bestDay = 'N/A',
  bestTime = 12
}: ConsistencyScoreUIProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number): 'default' | 'secondary' | 'destructive' | null => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Consistency Score</CardTitle>
                <CardDescription>Your social media posting consistency</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <Badge variant={trend === 'improving' ? 'default' : 'secondary'} className="capitalize">
                  {trend}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Circular Score Display */}
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (overall / 100) * 351.86}
                    className={`${getScoreColor(overall)} transition-all duration-1000`}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 351.86 }}
                    animate={{ strokeDashoffset: 351.86 - (overall / 100) * 351.86 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${getScoreColor(overall)}`}>
                      {overall}
                    </span>
                    <span className="block text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Frequency</span>
                    <span className={`text-sm font-bold ${getScoreColor(frequency)}`}>
                      {frequency}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${frequency >= 80 ? 'bg-green-600' : frequency >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${frequency}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Current Streak</span>
                    <Badge variant={streak > 0 ? (streak >= 7 ? 'default' : 'secondary') : 'destructive'}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {streak} days
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                    <motion.div
                      className={`h-2 rounded-full ${streak >= 7 ? 'bg-green-600' : streak > 0 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, streak * 10)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Optimal Timing</span>
                    <span className={`text-sm font-bold ${getScoreColor(optimalTiming)}`}>
                      {optimalTiming}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${optimalTiming >= 80 ? 'bg-green-600' : optimalTiming >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${optimalTiming}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Target}
          label="Total Posts"
          value={totalPosts.toString()}
          description="All time"
        />
        <StatCard
          icon={Calendar}
          label="Avg Per Week"
          value={averagePerWeek.toFixed(1)}
          description="Posting frequency"
        />
        <StatCard
          icon={Clock}
          label="Best Time"
          value={`${bestDay} at ${formatTime(bestTime)}`}
          description="Highest engagement"
        />
      </div>

      {/* Recommendation Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Recommendation</h3>
                <p className="text-slate-700 dark:text-slate-300">{recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
}
