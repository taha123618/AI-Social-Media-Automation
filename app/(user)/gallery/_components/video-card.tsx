'use client'

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Play, Download, Trash2, MoreHorizontal, RefreshCw, Maximize2, Loader2, Zap } from "lucide-react"
import { useVideoThumbnail } from "@/hooks/useVideoThumbnail"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useWorkspace } from "@/contexts/workspace-context"
import axios, { AxiosError } from "axios"
import VideoModal from "./video-modal";

interface VideoCardProps {
  video: {
    id: string
    prompt: string
    videoUrl?: string
    thumbnailUrl?: string
    duration: number
    aspectRatio: string
    quality: string
    status: string
    provider: string
    createdAt: string
    completedAt?: string
    error?: string
    businessId?: string
    workflow?: {
      id: string
      name: string
    }
  }
}


export default function VideoCard({ video }: VideoCardProps) {
  const queryClient = useQueryClient();
  const { businessId } = useWorkspace();
  const [isHovering, setIsHovering] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(video.videoUrl);
  const [isDeleting, setIsDeleting] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Update currentVideoUrl when video prop changes (e.g., after refresh)
  useEffect(() => {
    if (video.videoUrl && video.videoUrl !== currentVideoUrl) {

      setCurrentVideoUrl(video.videoUrl);
    }
  }, [video.videoUrl, currentVideoUrl]);



  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const { localThumbUrl, isGenerating } = useVideoThumbnail({
    videoId: video.id,
    videoUrl: currentVideoUrl,
    existingThumbnailUrl: video.thumbnailUrl,
    isVisible
  });

  const handleCardClick = () => {
    // Only open modal for completed videos with valid URLs
    if (video.status.toLowerCase() === "completed" && currentVideoUrl) {
      setIsModalOpen(true);
    }
  };

  const handleHover = () => {
    // Prevent hover during deletion
    if (isDeleting) return;

    // Type guard for videoUrl
    const videoUrl = currentVideoUrl;
    if (!videoUrl || typeof videoUrl !== 'string') {
      console.log('Hover blocked - invalid video URL');
      return;
    }

    if (video.status.toLowerCase() !== "completed") {
      console.log('Hover blocked - status not completed');
      return;
    }

    setIsHovering(true)

    // Start playing preview after 500ms delay
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        console.log('Attempting to play video preview');
        videoRef.current.currentTime = 0
        videoRef.current.play().then(() => {
          console.log('Video preview playing successfully');
        }).catch((error) => {
          console.log('Video preview play failed:', error);
          // Handle autoplay restrictions
        })
      }
    }, 500)

    // Auto-stop after 3 seconds
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }, 3500) // 500ms delay + 3 seconds
  }

  const handleLeave = () => {
    setIsHovering(false)

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDownload = async () => {
    if (!currentVideoUrl) {
      toast.error("No video URL available");
      return;
    }

    // Type guard to ensure videoUrl is a string
    const videoUrl = currentVideoUrl;
    if (!videoUrl || typeof videoUrl !== 'string') {
      toast.error("Invalid video URL");
      return;
    }

    try {
      // Validate URL
      let url;
      try {
        url = new URL(videoUrl);
      } catch (urlError) {
        throw new Error('Invalid video URL format');
      }

      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol');
      }



      let response;
      try {
        response = await fetch(videoUrl, {
          mode: 'cors',
          method: 'GET'
        });

      } catch (fetchError) {
        console.error('Fetch failed:', fetchError);
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new Error('CORS error or network issue. Video URL may not be accessible from browser.');
        }
        throw fetchError;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      // Determine file extension from URL or default to mp4
      const extension = videoUrl.split('.').pop()?.split('?')[0] || 'mp4';
      a.download = `video-${video.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Video downloaded successfully");
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to download video";

      // Fallback: try opening in new tab if direct download fails
      if (errorMessage.includes('CORS') || errorMessage.includes('network')) {
        // Create a download URL with proper filename
        const extension = videoUrl.split('.').pop()?.split('?')[0] || 'mp4';
        const downloadFilename = `video-${video.id}.${extension}`;

        // Open the video URL directly with download parameter
        const downloadUrl = `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}download=${downloadFilename}`;
        window.open(downloadUrl, '_blank');
        toast.info('Video download opened in new tab due to CORS restrictions');
      } else {
        toast.error(errorMessage);
      }
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/gallery/videos/${video.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Video deleted successfully")
        // Invalidate React Query cache instead of custom event
        queryClient.invalidateQueries({ queryKey: ["gallery-videos"] })
      } else {
        throw new Error('Failed to delete video')
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsDeleting(false);
    }
  }

  // Refresh video URL when it expires
  const refreshVideoMutation = useMutation({
    mutationFn: async () => {
      // Use workspace businessId first, fallback to video businessId if available
      const effectiveBusinessId = businessId || video.businessId;


      if (!effectiveBusinessId) {
        throw new Error('No business ID available');
      }

      const response = await axios.post(`/api/video/${video.id}/refresh`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': effectiveBusinessId
        }
      });

      return response.data.videoUrl;
    },
    onSuccess: (freshUrl) => {
      // useEffect will handle updating currentVideoUrl
      toast.success('Video URL refreshed');
    },
    onError: (error: AxiosError | Error) => {
      console.error('Failed to refresh video URL:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          toast.error('Business ID required or invalid');
        } else if (error.response?.status === 401) {
          toast.error('Unauthorized to refresh video');
        } else {
          toast.error('Failed to refresh video URL');
        }
      } else {
        toast.error('Failed to refresh video URL');
      }
    }
  });

  const refreshVideoUrl = () => {
    const effectiveBusinessId = businessId || video.businessId;



    if (!effectiveBusinessId) {
      toast.error('Business context not available. Please refresh the page or select a business.');
      return;
    }

    refreshVideoMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <Card
        ref={cardRef}
        className="relative py-0 group overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        onClick={handleCardClick}
      >
      {/* Deletion skeleton overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="space-y-2 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Deleting...</p>
          </div>
        </div>
      )}

      <CardContent className="p-0">
        {/* Video/Thumbnail Container */}
        <div className="relative aspect-video bg-muted">
          {isVisible && (
            <>
              {/* Thumbnail with comprehensive fallbacks */}
                {(localThumbUrl || (video.thumbnailUrl && !thumbnailError)) ? (
                <>
                  {/* Try Next.js Image component first */}
                  <Image
                      src={localThumbUrl || video.thumbnailUrl || ''}
                    alt={video.prompt}
                    fill
                      preload
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    className={`object-cover transition-opacity duration-300 ${isHovering && previewLoaded ? 'opacity-0' : 'opacity-100'
                      }`}
                    onError={(error) => {
                      console.error('Next.js Image loading error:', error);
                      setThumbnailError(true);
                    }}
                    onLoad={() => {
                      console.log('Thumbnail loaded successfully');
                    }}
                      unoptimized
                  />
                </>
              ) : (
                // Fallback placeholder when no thumbnail or error
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="rounded-full bg-black/30 p-4 backdrop-blur-sm">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-xs text-white/80 px-2">
                      {video.provider}
                    </div>
                  </div>
                </div>
              )}

              {/* Video preview on hover */}
              {currentVideoUrl && (
                <video
                  ref={videoRef}
                  src={currentVideoUrl}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'
                    }`}
                  muted
                  loop
                  playsInline
                    preload="metadata"
                    onLoadedData={() => {
                      console.log('Video data loaded');
                      setPreviewLoaded(true);
                     setVideoError(false);
                    }}
                    onError={() => {
                      console.error('Video loading error');
                     setVideoError(true);
                     setPreviewLoaded(false);

                     // Automatic one-time refresh on error
                     if (!hasAutoRefreshed && video.status.toLowerCase() === 'completed') {
                       console.log('Attempting automatic URL refresh...');
                       setHasAutoRefreshed(true);
                       refreshVideoMutation.mutate();
                     }
                    }}
                    onCanPlay={() => {
                      console.log('Video can play');
                    }}
                  />
                )}

                {/* Video Error Message */}
                {videoError && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4 z-10 transition-opacity duration-300">
                    <RefreshCw className="h-8 w-8 text-white/80 mb-2" />
                    <p className="text-white text-xs font-medium mb-2">Video Unreachable</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshVideoMutation.mutate();
                      }}
                      className="h-7 text-[10px] bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Retry Loading
                    </Button>
                  </div>
                )}

              {/* Play button overlay */}
              {(!isHovering || !previewLoaded) && (
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
                  <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}

                {/* Click to expand indicator */}
                {video.status.toLowerCase() === "completed" && (
                  <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="bg-black/70 backdrop-blur-sm rounded-full p-1.5">
                      <Maximize2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}

                {/* Thumbnail Generation Loader */}
                {isGenerating && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                    <p className="text-white text-[10px] font-medium uppercase tracking-wider">Capturing Frame...</p>
                  </div>
                )}
            </>
            )}

            {/* Workflow Badge */}
            {video.workflow && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md border border-blue-400/30">
                <Zap className="h-3 w-3 fill-current" />
                <span className="uppercase tracking-wider">{video.workflow.name}</span>
              </div>
          )}

          <div className="flex gap-2">
            {/* Status indicator */}
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className={`${getStatusColor(video.status)} text-white border-none`}>
                {video.status}
              </Badge>
            </div>

            {/* Provider and quality badges */}
            <div className="absolute top-2 left-2 pl-16">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-black/70 text-white border-none text-xs">
                  {video.provider}
                </Badge>
                <Badge variant="secondary" className="bg-black/70 text-white border-none text-xs">
                  {video.quality}
                </Badge>
              </div>
            </div>

            {/* Duration badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/70 text-white border-none">
                  {formatDuration(video.duration)}
                </Badge>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload} disabled={isDeleting}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Refresh button for expired URLs */}
          {video.status.toLowerCase() === 'completed' && (
            <div className="absolute bottom-2 left-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={refreshVideoUrl}
                disabled={refreshVideoMutation.isPending || isDeleting}
                className="bg-black/70 text-white border-none hover:bg-black/80 mr-2"
              >
                  <RefreshCw className={`h-3 w-3 ${refreshVideoMutation.isPending ? 'animate-spin' : ''}`} />
                </Button>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3 className="font-medium text-sm mb-2 line-clamp-2">{video.prompt}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{formatDate(video.createdAt)}</span>
            {video.status.toLowerCase() === 'completed' && (
              <span className="text-green-600">Ready</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{video.provider}</span>
            <span>•</span>
            <span>{video.quality}</span>
            <span>•</span>
            <span>{video.aspectRatio}</span>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Video Modal */}
      <VideoModal
        video={video}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
