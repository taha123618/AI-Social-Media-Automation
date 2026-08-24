'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Square,
  Pause,
  Trash2,
  Download,
  Eye,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Zap,
  BarChart3,
  Filter,
  RefreshCw,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { useVideoJobs, useGenerateVideo, useCancelVideoJob, useApplyBrandFilters } from "@/features/video_generation/hooks/use-video";
import { useMultiVideoMonitor } from "@/features/video_generation/hooks/use-video-processing-monitor";
import { VideoGenerationRequestInput } from "@/features/video_generation/types";

interface VideoManagementDashboardProps {
  businessId: string;
}

interface BatchJob {
  id: string;
  prompt: string;
  style: VideoGenerationRequestInput["style"];
  duration: number;
  aspectRatio: string;
  quality: VideoGenerationRequestInput["quality"];
  model: VideoGenerationRequestInput["model"];
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  error?: string;
}

export function VideoManagementDashboard({ businessId }: VideoManagementDashboardProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Hooks
  const { data: jobs, isLoading, refetch } = useVideoJobs(businessId);
  const generateVideoMutation = useGenerateVideo(businessId);
  const cancelJobMutation = useCancelVideoJob(businessId);
  const applyFiltersMutation = useApplyBrandFilters(businessId);

  // Get active job IDs for monitoring
  const activeJobIds = jobs
    ?.filter(job => job.status === 'PROCESSING' || job.status === 'PENDING')
    .map(job => job.id) || [];

  const { monitors, overallProgress, isAnyActive } = useMultiVideoMonitor(activeJobIds, businessId);

  // Batch operations
  const addBatchJob = () => {
    const newJob: BatchJob = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt: "",
      style: "cinematic",
      duration: 15,
      aspectRatio: "16:9",
      quality: "hd",
      model: "gen4.5",
      status: 'pending'
    };
    setBatchJobs([...batchJobs, newJob]);
  };

  const updateBatchJob = (id: string, updates: Partial<BatchJob>) => {
    setBatchJobs(batchJobs.map(job =>
      job.id === id ? { ...job, ...updates } : job
    ));
  };

  const removeBatchJob = (id: string) => {
    setBatchJobs(batchJobs.filter(job => job.id !== id));
  };

  const processBatchJobs = async () => {
    const validJobs = batchJobs.filter(job => job.prompt.trim());

    if (validJobs.length === 0) {
      toast.error("No valid jobs to process");
      return;
    }

    setIsBatchMode(true);

    for (const job of validJobs) {
      try {
        updateBatchJob(job.id, { status: 'queued' });

        const result = await generateVideoMutation.mutateAsync({
          visualPrompt: job.prompt,
          style: job.style,
          duration: job.duration,
          aspectRatio: job.aspectRatio,
          quality: job.quality,
          model: job.model,
          contentType: "text_to_reel"
        });

        updateBatchJob(job.id, {
          status: 'processing',
          jobId: result.jobId
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateBatchJob(job.id, {
          status: 'failed',
          error: errorMessage
        });
      }
    }

    setIsBatchMode(false);
    toast.success(`Processed ${validJobs.length} batch jobs`);
  };

  // Individual job actions
  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJobMutation.mutateAsync(jobId);
      toast.success("Job cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel job");
    }
  };

  const handleApplyFilters = async (videoUrl: string, jobId: string) => {
    try {
      const result = await applyFiltersMutation.mutateAsync({
        videoUrl,
        options: {
          addWatermark: true,
          applyColorGrade: true,
          resizeForPlatform: "instagram"
        }
      });
      toast.success("Brand filters applied");
    } catch (error) {
      toast.error("Failed to apply filters");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PROCESSING":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "COMPLETED": "default",
      "FAILED": "destructive",
      "PROCESSING": "secondary",
      "PENDING": "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Video Management</h2>
          <p className="text-muted-foreground">Manage and monitor your video generation jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsBatchMode(!isBatchMode)}>
            {isBatchMode ? 'View Jobs' : 'Batch Mode'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{jobs?.length || 0}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold">{activeJobIds.length}</p>
              </div>
              <Play className="h-8 w-8 text-orange-500" />
            </div>
            {isAnyActive && (
              <Progress value={overallProgress} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">
                  {jobs?.filter(job => job.status === 'COMPLETED').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold">
                  {jobs?.filter(job => job.status === 'FAILED').length || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Jobs List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Manage your video generation jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {jobs?.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(job.status)}
                              <Badge variant="outline">{job.provider}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {job.createdAt ? new Date(job.createdAt).toLocaleString() : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedJobs.includes(job.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedJobs([...selectedJobs, job.id]);
                              } else {
                                setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                              }
                            }}
                          />
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2">{job.prompt}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.duration}s
                        </span>
                        <span>{job.aspectRatio}</span>
                        <span className="uppercase">{job.quality}</span>
                      </div>

                      {job.videoUrl && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={job.videoUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyFilters(job.videoUrl!, job.id)}
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                          </Button>
                          {(job.status === 'PENDING' || job.status === 'PROCESSING') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelJob(job.id)}
                              disabled={cancelJobMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}

                      {job.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Batch Processing</CardTitle>
                  <CardDescription>Create and process multiple video jobs</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addBatchJob} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job
                  </Button>
                  <Button
                    onClick={processBatchJobs}
                    disabled={batchJobs.length === 0 || isBatchMode}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Process Batch ({batchJobs.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {batchJobs.map((job, index) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Job {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeBatchJob(job.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Prompt</Label>
                          <Textarea
                            value={job.prompt}
                            onChange={(e) => updateBatchJob(job.id, { prompt: e.target.value })}
                            placeholder="Enter video prompt..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>Style</Label>
                            <Select value={job.style} onValueChange={(value) => updateBatchJob(job.id, { style: value as any })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cinematic">Cinematic</SelectItem>
                                <SelectItem value="realistic">Realistic</SelectItem>
                                <SelectItem value="animated">Animated</SelectItem>
                                <SelectItem value="artistic">Artistic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <Select value={job.duration.toString()} onValueChange={(value) => updateBatchJob(job.id, { duration: parseInt(value) })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 seconds</SelectItem>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="15">15 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {job.jobId && (
                        <div className="text-sm text-blue-600">
                          Job ID: {job.jobId}
                        </div>
                      )}

                      {job.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Monitoring</CardTitle>
              <CardDescription>Real-time status of active video generation jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitors.map((monitor, index) => (
                  <div key={monitor.status.jobId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(monitor.status.status)}
                        <div>
                          <p className="font-medium">Job: {monitor.status.jobId}</p>
                          <p className="text-sm text-muted-foreground">{monitor.status.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{monitor.status.progress}%</p>
                        <Progress value={monitor.status.progress} className="w-32" />
                      </div>
                    </div>
                    {monitor.status.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Error: {monitor.status.error}
                      </div>
                    )}
                  </div>
                ))}
                {activeJobIds.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active jobs to monitor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
