'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Settings,
  Zap,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  FileVideo,
  Image as ImageIcon,
  Play,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useVideoJobs } from "@/features/video_generation/hooks/use-video";
import { useVideoAdvancedOperations, useVideoFileOperations } from "@/features/video_generation/hooks/use-video-advanced";

interface VideoAdvancedToolsProps {
  businessId: string;
}

export function VideoAdvancedTools({ businessId }: VideoAdvancedToolsProps) {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [batchOptions, setBatchOptions] = useState({
    includeThumbnails: false,
    format: 'original' as const,
    compression: 'none' as const
  });
  const [optimizationOptions, setOptimizationOptions] = useState({
    priority: 'normal' as const,
    quality: 'medium' as const,
    format: 'mp4' as const,
    compression: true
  });

  // Hooks
  const { data: jobs, isLoading } = useVideoJobs(businessId);
  const { optimizeVideo, batchDownload, isOptimizing, isCreatingBatch } = useVideoAdvancedOperations(businessId);
  const { downloadVideo, copyVideoUrl, shareVideo } = useVideoFileOperations();

  // Get completed videos
  const completedVideos = jobs?.filter(job => job.status === "COMPLETED") || [];

  const handleVideoSelection = (videoId: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos([...selectedVideos, videoId]);
    } else {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(completedVideos.map(job => job.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleBatchDownload = () => {
    if (selectedVideos.length === 0) {
      toast.error("Please select at least one video");
      return;
    }

    batchDownload.mutate({
      videoIds: selectedVideos,
      options: batchOptions
    });
  };

  const handleOptimizeVideo = (videoId: string) => {
    optimizeVideo.mutate({
      videoId,
      options: optimizationOptions
    });
  };

  const handleIndividualDownload = async (videoUrl: string, videoId: string) => {
    const success = await downloadVideo(videoUrl, `video-${videoId}.mp4`);
    if (success) {
      toast.success("Video downloaded successfully");
    } else {
      toast.error("Failed to download video");
    }
  };

  const handleCopyUrl = async (videoUrl: string) => {
    const success = await copyVideoUrl(videoUrl);
    if (success) {
      toast.success("Video URL copied to clipboard");
    } else {
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async (videoUrl: string, title: string) => {
    const success = await shareVideo(videoUrl, title);
    if (success) {
      toast.success("Video shared successfully");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h2 className="text-3xl font-bold">Advanced Video Tools</h2>
          <p className="text-muted-foreground">Optimization, batch operations, and advanced features</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {completedVideos.length} Completed Videos
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-3xl font-bold">{selectedVideos.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-3xl font-bold">~{selectedVideos.length * 25}MB</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimization</p>
                <p className="text-3xl font-bold">50%</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={50} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold">{isOptimizing || isCreatingBatch ? 'Active' : 'Idle'}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Operations
          </CardTitle>
          <CardDescription>
            Configure and execute batch operations on multiple videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Include Thumbnails</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-thumbnails"
                  checked={batchOptions.includeThumbnails}
                  onCheckedChange={(checked) =>
                    setBatchOptions(prev => ({ ...prev, includeThumbnails: checked as boolean }))
                  }
                />
                <Label htmlFor="include-thumbnails">Include thumbnail images</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={batchOptions.format}
                onValueChange={(value: any) => setBatchOptions(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compression</Label>
              <Select
                value={batchOptions.compression}
                onValueChange={(value: any) => setBatchOptions(prev => ({ ...prev, compression: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBatchDownload}
              disabled={selectedVideos.length === 0 || isCreatingBatch}
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Batch ({selectedVideos.length})
            </Button>

            <div className="text-sm text-muted-foreground">
              Estimated size: ~{selectedVideos.length * 25}MB
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Video Library</CardTitle>
              <CardDescription>Select videos for batch operations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedVideos.length === completedVideos.length && completedVideos.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Select All</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {completedVideos.map((video) => (
                <div key={video.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={(checked) => handleVideoSelection(video.id, checked as boolean)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{video.provider}</Badge>
                          <Badge variant="secondary">{video.quality}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>

                  <p className="text-sm line-clamp-2">{video.prompt}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}s
                    </span>
                    <span>{video.aspectRatio}</span>
                  </div>

                  {/* Video Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleIndividualDownload(video.videoUrl!, video.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(video.videoUrl!)}
                    >
                      Copy URL
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(video.videoUrl!, video.prompt.substring(0, 50))}
                    >
                      Share
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOptimizeVideo(video.id)}
                      disabled={isOptimizing}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize
                    </Button>

                    {video.videoUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {(isOptimizing || isCreatingBatch) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium">
                  {isOptimizing ? 'Optimizing video...' : 'Creating batch download...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait, this may take a few moments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
