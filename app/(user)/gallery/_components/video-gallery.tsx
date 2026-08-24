"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Play } from "lucide-react";
import VideoCard from "./video-card";

interface VideoJob {
  id: string;
  prompt: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  createdAt: string;
  completedAt?: string;
  provider: "RUNWAY" | "LUMA";
  error?: string;
}

export default function VideoGallery() {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ["gallery-videos"],
    queryFn: async () => {
      const response = await fetch("/api/gallery/videos");
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      return response.json() as Promise<VideoJob[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load videos</p>
        <p className="text-muted-foreground text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  // Filter only completed videos for gallery
  const completedVideos = videos?.filter((video: VideoJob) => video.status === "COMPLETED") || [];

  if (completedVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
        <p className="text-muted-foreground">
          Generate your first AI video to see it appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Gallery</h2>
          <p className="text-muted-foreground">
            {completedVideos.length} video{completedVideos.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {completedVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
