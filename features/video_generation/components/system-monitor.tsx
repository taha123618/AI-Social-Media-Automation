'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Users,
  Video,
  BarChart3,
  Settings
} from "lucide-react";
import { useSystemHealth, useSystemActions, useSystemAlerts } from "@/features/video_generation/hooks/use-system-health";

interface SystemMonitorProps {
  businessId: string;
}

export function SystemMonitor({ businessId }: SystemMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: healthData, isLoading } = useSystemHealth();
  const { cleanup, resetFailed, isCleaningUp, isResetting } = useSystemActions();
  const { alerts, hasAlerts, criticalAlerts } = useSystemAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to load system health data
          </div>
        </CardContent>
      </Card>
    );
  }

  const { health, stats, providers, recentActivity } = healthData;

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getSystemStatus = () => {
    if (criticalAlerts.length > 0) return 'critical';
    if (alerts.length > 0) return 'warning';
    return 'healthy';
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6" />
          <div>
            <h3 className="text-lg font-semibold">System Monitor</h3>
            <p className="text-sm text-muted-foreground">Real-time system health and performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getHealthIcon(systemStatus)}
          <Badge variant={systemStatus === 'healthy' ? 'default' : systemStatus === 'warning' ? 'secondary' : 'destructive'}>
            {systemStatus.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {hasAlerts && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'default' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.message}</strong> - {alert.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className={`text-2xl font-bold ${getHealthColor(health.successRate, { good: 90, warning: 80 })}`}>
                  {health.successRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={health.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{health.activeJobs}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Queue: {health.queueLength} jobs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{health.averageProcessingTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Minutes per job
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className={`text-2xl font-bold ${getHealthColor(100 - health.errorRate, { good: 95, warning: 85 })}`}>
                  {health.errorRate}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={health.errorRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Provider Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Provider Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <div key={provider.provider} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{provider.provider}</p>
                      <p className="text-sm text-muted-foreground">{provider._count.id} jobs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {Math.round((provider._count.id / stats.total) * 100)}%
                      </p>
                      <Progress value={(provider._count.id / stats.total) * 100} className="w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Last 50 system events</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {activity.status === 'COMPLETED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                        {activity.status === 'PROCESSING' && <Clock className="h-4 w-4 text-blue-500" />}
                        <div>
                          <p className="text-sm font-medium">{activity.provider}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{activity.status}</Badge>
                        {activity.processingTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(activity.processingTime)}s
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Actions
              </CardTitle>
              <CardDescription>Maintenance and cleanup operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Cleanup Operations</h4>
                  <p className="text-sm text-muted-foreground">
                    Remove old completed/failed jobs (older than 30 days)
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => cleanup()}
                    disabled={isCleaningUp}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isCleaningUp ? 'Cleaning...' : 'Cleanup Old Jobs'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Reset Failed Jobs</h4>
                  <p className="text-sm text-muted-foreground">
                    Reset all failed jobs to pending status for retry
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => resetFailed()}
                    disabled={isResetting}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isResetting ? 'Resetting...' : 'Reset Failed Jobs'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
