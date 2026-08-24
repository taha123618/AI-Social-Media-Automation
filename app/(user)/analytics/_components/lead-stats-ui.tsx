'use client';

import { motion } from 'framer-motion';
import { Phone, MessageCircle, Globe, Calendar, MapPin, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeadStatsUIProps {
  totalLeads: number;
  estimatedValue: number;
  byType: Record<string, number>;
  conversionRate: number;
  totalPosts: number;
  postsWithLeads: number;
  topPerformingPosts?: Array<{
    postId: string;
    leads: number;
    value: number;
    title: string;
    platform: string;
    postedAt: string | Date;
  }>;
}

export function LeadStatsUI({
  totalLeads,
  estimatedValue,
  byType,
  conversionRate,
  totalPosts,
  postsWithLeads,
  topPerformingPosts = []
}: LeadStatsUIProps) {
  const leadTypes = [
    {
      key: 'phoneCalls',
      label: 'Phone Calls',
      icon: Phone,
      value: byType.phoneCalls || 0,
      avgValue: 50,
      color: 'bg-blue-600'
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      value: byType.messages || 0,
      avgValue: 30,
      color: 'bg-green-600'
    },
    {
      key: 'websiteVisits',
      label: 'Website Visits',
      icon: Globe,
      value: byType.websiteVisits || 0,
      avgValue: 10,
      color: 'bg-purple-600'
    },
    {
      key: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      value: byType.bookings || 0,
      avgValue: 100,
      color: 'bg-yellow-600'
    },
    {
      key: 'directions',
      label: 'Directions',
      icon: MapPin,
      value: byType.directions || 0,
      avgValue: 40,
      color: 'bg-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-3">
              <CardDescription>Total Leads</CardDescription>
              <CardTitle className="text-3xl">{totalLeads}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardDescription>Estimated Revenue</CardDescription>
              <CardTitle className="text-3xl">${estimatedValue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Attributed to social media</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-3">
              <CardDescription>Conversion Rate</CardDescription>
              <CardTitle className="text-3xl">{conversionRate.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Of posts generate leads</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-yellow-600">
            <CardHeader className="pb-3">
              <CardDescription>Avg Value per Lead</CardDescription>
              <CardTitle className="text-3xl">${(estimatedValue / totalLeads || 0).toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Average lead value</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lead Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lead Breakdown by Type</CardTitle>
                <CardDescription>Detailed view of lead sources and values</CardDescription>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadTypes.map((type, index) => {
                const Icon = type.icon;
                const value = type.value;
                const revenue = value * type.avgValue;
                const percentage = totalLeads > 0 ? (value / totalLeads) * 100 : 0;

                return (
                  <div key={type.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${type.color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-slate-500">${type.avgValue} avg value</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{value}</p>
                        <p className="text-sm text-green-600 font-semibold">
                          ${revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <motion.div
                        className={`h-2 rounded-full ${type.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{percentage.toFixed(1)}% of total leads</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>From posts to leads generated</CardDescription>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Posts</span>
                    <span className="text-sm font-bold">{totalPosts}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <motion.div
                      className="h-3 rounded-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Posts with Leads</span>
                    <span className="text-sm font-bold">{postsWithLeads}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <motion.div
                      className="h-3 rounded-full bg-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${(postsWithLeads / totalPosts) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Leads Generated</span>
                    <span className="text-sm font-bold">{totalLeads}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <motion.div
                      className="h-3 rounded-full bg-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (totalLeads / (postsWithLeads * 3)) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="font-semibold">Total Revenue Attributed</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${estimatedValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Posts Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Highest revenue-generating content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformingPosts.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm italic">No lead data available yet for your posts.</p>
              ) : (
                topPerformingPosts.map((post, i) => (
                  <div key={post.postId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}`}>#{i + 1}</Badge>
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] uppercase h-4 px-1">{post.platform}</Badge>
                          <p className="text-[10px] text-slate-500">
                            {new Date(post.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">${post.value.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{post.leads} leads</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
