'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Video,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Zap,
  Target,
  Award,
  Filter
} from "lucide-react";
import { useVideoAnalytics, useVideoUsageStats, useVideoAnalyticsExport } from "@/features/video_generation/hooks/use-video-analytics";

interface VideoAnalyticsDashboardProps {
  businessId: string;
}

export function VideoAnalyticsDashboard({ businessId }: VideoAnalyticsDashboardProps) {
  const { data: analytics, isLoading, error } = useVideoAnalytics(businessId);
  const { data: usageStats } = useVideoUsageStats(businessId);
  const { exportData, isLoading: isExporting } = useVideoAnalyticsExport(businessId);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Process data for charts
  const chartData = useMemo(() => {
    if (!analytics?.generationTrend) return [];

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return analytics.generationTrend.slice(-days);
  }, [analytics, timeRange]);

  const providerData = useMemo(() => {
    if (!usageStats) return [];

    const providerCounts = usageStats.reduce((acc, stat) => {
      acc[stat.provider] = (acc[stat.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(providerCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / usageStats.length) * 100)
    }));
  }, [usageStats]);

  const styleData = useMemo(() => {
    if (!usageStats) return [];

    const styleCounts = usageStats.reduce((acc, stat) => {
      acc[stat.style] = (acc[stat.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(styleCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / usageStats.length) * 100)
    }));
  }, [usageStats]);

  const qualityData = useMemo(() => {
    if (!usageStats) return [];

    const qualityCounts = usageStats.reduce((acc, stat) => {
      acc[stat.quality] = (acc[stat.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(qualityCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      percentage: Math.round((value / usageStats.length) * 100)
    }));
  }, [usageStats]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Video Analytics</h2>
          <p className="text-muted-foreground">Track your video generation performance and usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            onClick={() => exportData({ format: 'csv' })}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <p className="text-3xl font-bold">{analytics?.totalVideos || 0}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{analytics?.successRate || 0}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={analytics?.successRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-3xl font-bold">{analytics?.averageProcessingTime || 0}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Used</p>
                <p className="text-3xl font-bold">{analytics?.totalCreditsUsed || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => (value ? new Date(String(value)).toLocaleDateString() : '')}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Provider Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={providerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }: any) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Style Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={styleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status Summary</CardTitle>
          <CardDescription>Current status of all video generation jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{analytics?.completedVideos || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Processing</p>
                <p className="text-2xl font-bold">{analytics?.processingVideos || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{analytics?.pendingVideos || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold">{analytics?.failedVideos || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
