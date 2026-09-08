'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ConsistencyScoreUI } from './_components/consistency-score-ui';
import { LeadStatsUI } from './_components/lead-stats-ui';
import { AnalyticsOverview } from './_components/analytics-overview';
import { GrowthEngineUI } from './_components/growth-engine-ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Activity, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { useAnalyticsOverview, useConsistencyScore, useLeadAnalytics, useAnalyticsInsights, useGrowthAnalytics } from '@/hooks/api-hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureGate } from '@/components/billing/FeatureGate';

interface ConsistencyData {
  overall: number;
  frequency: number;
  streak: number;
  optimalTiming: number;
  recommendation: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface LeadData {
  totalLeads: number;
  estimatedValue: number;
  byType: Record<string, number>;
  conversionRate: {
    conversionRate: string;
    postsWithLeads: number;
    totalPosts: number;
  };
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { businessId, isLoading: businessLoading } = useCurrentBusiness();

  // Fetch analytics data using React Query
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useAnalyticsOverview(
    businessId || '',
    30
  );

  const { data: consistencyData, isLoading: consistencyLoading, error: consistencyError } = useConsistencyScore(
    businessId || '',
    90
  );

  const { data: leadData, isLoading: leadLoading, error: leadError } = useLeadAnalytics(
    businessId || '',
    30
  );

  const { data: insightsData, isLoading: insightsLoading, error: insightsError } = useAnalyticsInsights(
    businessId || '',
    30
  );

  const { data: growthData, isLoading: growthLoading, error: growthError } = useGrowthAnalytics(
    businessId || ''
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-5 p-1 bg-secondary/80 rounded-xl border border-border/70">
            <TabsTrigger value="overview" className="text-xs font-semibold px-3 py-1.5 whitespace-nowrap">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="growth" className="text-xs font-semibold px-3 py-1.5 whitespace-nowrap">
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Growth Engine
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs font-semibold px-3 py-1.5 whitespace-nowrap">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="consistency" className="text-xs font-semibold px-3 py-1.5 whitespace-nowrap">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Consistency Score
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-xs font-semibold px-3 py-1.5 whitespace-nowrap">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Lead Tracking
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="insights" className="mt-6">
          {insightsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : insightsError ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-slate-500">Failed to load insights data</p>
              </CardContent>
            </Card>
          ) : insightsData?.data ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Insights</CardTitle>
                      <CardDescription>Intelligent analysis of your performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insightsData.data.insights.map((insight: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${insight.priority === 'high' ? 'bg-red-500' :
                                insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                              <h4 className="font-semibold">{insight.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Actionable suggestions to improve performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insightsData.data.recommendations.map((rec: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">{rec.title}</h4>
                            <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {rec.action === 'content' ? 'Content Strategy' :
                                rec.action === 'scheduling' ? 'Posting Schedule' :
                                  rec.action === 'analysis' ? 'Performance Analysis' : 'General'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
          ) : null}
        </TabsContent>

        <TabsContent value="consistency" className="mt-6">
          {consistencyLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : consistencyError ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-slate-500">Failed to load consistency data</p>
              </CardContent>
            </Card>
          ) : consistencyData?.data ? (
            <ConsistencyScoreUI
              overall={consistencyData.data.overall}
              frequency={consistencyData.data.frequency}
              streak={consistencyData.data.streak}
              optimalTiming={consistencyData.data.optimalTiming}
              recommendation={consistencyData.data.recommendation}
              trend={consistencyData.data.trend}
              totalPosts={overviewData?.data?.totalPosts || 0}
              averagePerWeek={((overviewData?.data?.totalPosts || 0) / 30) * 7}
              bestDay={consistencyData.data.bestDay || 'Wednesday'}
              bestTime={consistencyData.data.bestTime || 18}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          {leadLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : leadError ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-slate-500">Failed to load lead data</p>
              </CardContent>
            </Card>
          ) : leadData?.data ? (
            <LeadStatsUI
              totalLeads={leadData.data.totalLeads}
              estimatedValue={leadData.data.estimatedValue}
              byType={leadData.data.byType}
              conversionRate={parseFloat(leadData.data.conversionRate?.conversionRate || '0')}
              totalPosts={leadData.data.conversionRate?.totalPosts || 0}
              postsWithLeads={leadData.data.conversionRate?.postsWithLeads || 0}
              topPerformingPosts={leadData.data.topPerformingPosts}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          {overviewLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          ) : overviewError ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-slate-500">Failed to load overview data</p>
              </CardContent>
            </Card>
          ) : overviewData?.data ? (
                <AnalyticsOverview aggregate={overviewData.data} />
          ) : null}
        </TabsContent>

        <TabsContent value="growth" className="mt-6">
          <FeatureGate feature="advanced_analytics">
            <GrowthEngineUI data={growthData} isLoading={growthLoading} />
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
