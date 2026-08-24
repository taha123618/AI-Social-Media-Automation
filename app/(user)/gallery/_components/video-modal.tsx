"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Share2, FileVideo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

interface VideoModalProps {
  video: {
    id: string;
    prompt: string;
    status: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration: number;
    aspectRatio: string;
    quality: string;
    createdAt: string;
    completedAt?: string;
    provider: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    if (!video.videoUrl) {
      toast.error("No video URL available");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(video.videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Video downloaded successfully");
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!video.videoUrl) {
      toast.error("No video URL available");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Generated Video - ${video.id}`,
          text: video.prompt,
          url: video.videoUrl,
        });
        toast.success("Video shared successfully");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(video.videoUrl);
        toast.success("Video URL copied to clipboard");
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error("Failed to share video");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[800px] max-h-full overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-4 bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Video Preview</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Main Content lg:flex-row*/}
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Video Section */}
          <div className="flex-1 lg:flex-2 bg-black flex items-center justify-center relative order-1">
            {video.videoUrl ? (
              <>
                {/* Video Element */}
                <video
                  src={video.videoUrl}
                  className="w-full h-full max-h-[60vh] lg:max-h-full object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  onLoadedData={() => setVideoLoaded(true)}
                  onError={() => console.error('Video loading error')}
                />

                {/* Loading Overlay */}
                {!videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <FileVideo className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Video Not Available</h3>
                  <p className="text-muted-foreground">
                    {video.status === 'processing'
                      ? 'Video is still being processed. Please check back later.'
                      : 'Video URL is not available.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="w-full lg:w-96 bg-muted/30 border-t lg:border-t-0 lg:border-l p-6 overflow-y-auto order-2">
            {/* Thumbnail */}
            {video.thumbnailUrl && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Thumbnail</h4>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden w-full">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.prompt}
                    preload
                    fill
                    sizes="(max-width: 400px) 100vw, 400px"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Video Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={`${getStatusColor(video.status)} text-white`}>
                      {video.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Provider</span>
                    <span className="text-sm font-medium">{video.provider}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{formatDuration(video.duration)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Aspect Ratio</span>
                    <span className="text-sm font-medium">{video.aspectRatio}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quality</span>
                    <span className="text-sm font-medium">{video.quality.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Prompt</h4>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {video.prompt}
                </p>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{formatDate(video.createdAt)}</span>
                  </div>

                  {video.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-sm font-medium">{formatDate(video.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Actions</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading || !video.videoUrl}
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download Video'}
                </Button>

                <Button
                  onClick={handleShare}
                  disabled={!video.videoUrl}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
