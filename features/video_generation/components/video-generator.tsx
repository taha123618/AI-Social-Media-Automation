'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import {
  Play,
  Square,
  Eye,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Video,
  Clapperboard,
  Image as ImageIcon,
  MonitorPlay,
  Sparkles,
  Smartphone,
  Tv,
  Monitor
} from "lucide-react";
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useVideoJobs, useGenerateVideo, useApplyBrandFilters } from "@/features/video_generation/hooks/use-video";
import { VideoGenerationRequestSchema, VideoGenerationRequestInput } from "@/features/video_generation/types";

interface VideoJob {
  id: string;
  businessId: string;
  provider: string;
  prompt: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  createdAt: string;
  completedAt?: string;
}

export interface VideoGeneratorProps {
  businessId: string;
}

// Validation helper
const validateBusinessId = (businessId: string): boolean => {
  return typeof businessId === 'string' && businessId.length > 0 && /^[a-zA-Z0-9-_]+$/.test(businessId);
};

export function VideoGenerator({ businessId }: VideoGeneratorProps) {

  const [prompt, setPrompt] = useState("");
  const [promptImage, setPromptImage] = useState("");
  const [sourceVideoUrl, setSourceVideoUrl] = useState("");
  const [style, setStyle] = useState<VideoGenerationRequestInput["style"]>("cinematic");
  const [duration, setDuration] = useState(6);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState<VideoGenerationRequestInput["quality"]>("standard");
  const [model, setModel] = useState<VideoGenerationRequestInput["model"]>("gen4.5");

  const [contentType, setContentType] = useState("text_to_reel");

  // Use React Query hooks instead of manual state management
  const { data: jobs = [], isLoading, isError } = useVideoJobs(businessId);
  const generateVideoMutation = useGenerateVideo(businessId);
  const applyFiltersMutation = useApplyBrandFilters(businessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isVideoType = contentType === 'video_to_video';
    const isTextMode = contentType === 'text_to_reel';
    const isImageMode = !isTextMode && !isVideoType;

    // Validation logic for modern UI:
    // - Video-to-Video: Requires sourceVideoUrl. Prompt is optional.
    // - Text-to-Reel: Requires visual prompt.
    // - Image-based: Requires promptImage. Prompt is optional.
    const hasInput = !!prompt.trim() || !!promptImage.trim() || !!sourceVideoUrl.trim();

    if (!hasInput) {
      if (isVideoType) {
        toast.error("Please upload a source video for transformation");
      } else if (isTextMode) {
        toast.error("Please enter a visual prompt for your reel");
      } else {
        toast.error("Please enter a prompt or upload a reference image");
      }
      return;
    }

    // 1. Zod Frontend Validation step
    const validationResult = VideoGenerationRequestSchema.safeParse({
      visualPrompt: prompt,
      promptImage: promptImage.trim() || undefined,
      videoUri: sourceVideoUrl.trim() || undefined,
      contentType: contentType as VideoGenerationRequestInput["contentType"],
      style,
      duration,
      aspectRatio,
      quality,
      model,
    });

    if (!validationResult.success) {
      // Show beautifully formatted Zod error to user
      const firstError = validationResult.error.issues[0];
      toast.error(`Invalid input: ${firstError.message}`);
      return;
    }

    // 2. Show loading toast and disable form
    const loadingToast = toast.loading("Starting video generation...");

    try {
      const result = await generateVideoMutation.mutateAsync({
        visualPrompt: (prompt && prompt.trim()) ? prompt.trim() : undefined,
        promptImage: (contentType !== 'text_to_reel' && promptImage && promptImage.trim()) ? promptImage.trim() : undefined,
        videoUri: sourceVideoUrl.trim() || undefined,
        contentType: contentType as VideoGenerationRequestInput["contentType"],
        style,
        duration,
        aspectRatio,
        quality,
        model,
      });

      toast.dismiss(loadingToast);
      toast.success("Video generation started! Your job is in the queue.");

      // Clear form after successful submission
      setPrompt("");
      setPromptImage("");
      setSourceVideoUrl("");

      // Optionally start monitoring the new job
      if (result.jobId) {
        console.log(`Video generation started with job ID: ${result.jobId}`);
      }
    } catch (error: unknown) {
      toast.dismiss(loadingToast);

      // Enhanced error handling with specific error types
      let errorMessage = "Failed to start video generation";

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { error?: string; type?: string; docUrl?: string; creditsInfo?: any } } };
        if (responseError.response?.data?.error) {
          errorMessage = responseError.response.data.error;

          // Handle specific credit error
          if (responseError.response.data.type === 'CREDIT_ERROR') {
            toast.error(
              <div className="space-y-2">
                <div className="font-semibold text-amber-600">💳 Insufficient Credits</div>
                <div className="text-sm text-muted-foreground">
                  Your Runway account doesn't have enough credits to generate this video.
                </div>
                {responseError.response.data.creditsInfo && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Credits: {responseError.response.data.creditsInfo.currentCredits} / {responseError.response.data.creditsInfo.requiredCredits} required
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Please add credits to your Runway account and try again.
                </div>
                {responseError.response.data.docUrl && (
                  <a
                    href={responseError.response.data.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline block"
                  >
                    📚 View Documentation
                  </a>
                )}
              </div>,
              { duration: 8000 }
            );
            return;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (errorMessage.includes('credit')) {
        toast.error("Insufficient credits. Please upgrade your plan.");
      } else if (errorMessage.includes('rate limit')) {
        toast.error("Rate limit exceeded. Please try again in a few minutes.");
      } else if (errorMessage.includes('validation')) {
        toast.error(`Validation error: ${errorMessage}`);
      } else {
        toast.error(errorMessage);
      }
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
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "PROCESSING":
        return <Badge variant="secondary">Processing</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewVideo = (videoUrl: string) => {
    if (!videoUrl || typeof videoUrl !== 'string') {
      toast.error('Invalid video URL');
      return;
    }
    try {
      window.open(videoUrl, "_blank");
    } catch (error) {
      console.error('Failed to open video:', error);
      toast.error('Failed to open video');
    }
  };

  const handleDownload = async (videoUrl: string, jobId?: string) => {
    if (!videoUrl || typeof videoUrl !== 'string') {
      toast.error('Invalid video URL');
      return;
    }

    const timestamp = new Date().getTime();
    const filename = `generated-video-${jobId || timestamp}.mp4`;

    try {
      // Show loading toast
      const loadingToast = toast.loading("Preparing download...");

      // Fetch the video to ensure it's accessible
      const response = await fetch(videoUrl);
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
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success(`Video downloaded as ${filename}`);

      // Log download activity if jobId is provided
      if (jobId && typeof jobId === 'string') {
        try {
          await fetch("/api/system/log-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "VIDEO_DOWNLOADED",
              entity: "VideoGenerationJob",
              entityId: jobId,
              details: { timestamp, filename }
            })
          });
        } catch (logError) {
          console.warn('Failed to log download activity:', logError);
          // Don't show error to user as logging is non-critical
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
      toast.error(errorMessage);
    }
  };

  const handleApplyFilters = async (videoUrl: string, jobId?: string) => {
    if (!videoUrl || typeof videoUrl !== 'string') {
      toast.error('Invalid video URL');
      return;
    }

    try {
      const loadingToast = toast.loading("Applying brand filters...");

      const result = await applyFiltersMutation.mutateAsync({
        videoUrl,
        options: {
          addWatermark: true,
          applyColorGrade: true,
          resizeForPlatform: "instagram"
        }
      });

      if (!result?.videoUrl) {
        throw new Error('No video URL returned from filter application');
      }

      toast.dismiss(loadingToast);
      toast.success("Brand filters applied successfully!");

      // Log brand filter application
      if (jobId && typeof jobId === 'string') {
        try {
          await fetch("/api/system/log-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "BRAND_FILTERS_APPLIED",
              entity: "VideoGenerationJob",
              entityId: jobId,
              details: { filters: ["watermark", "colorGrade", "instagramResize"] }
            })
          });
        } catch (logError) {
          console.warn('Failed to log brand filter activity:', logError);
          // Don't show error to user as logging is non-critical
        }
      }

      handleViewVideo(result.videoUrl);
    } catch (error) {
      console.error('Brand filters failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply brand filters';
      toast.error(errorMessage);
    }
  };

  // Validate businessId prop
  if (!validateBusinessId(businessId)) {
    console.error('Invalid businessId provided to VideoGenerator:', businessId);
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Invalid business configuration. Please refresh the page.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Generation Form (GravityWrite Style) */}
      <Card className="relative overflow-hidden border-muted/30 bg-background/50 shadow-2xl backdrop-blur-xl rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

        <div className="grid lg:grid-cols-[1fr_450px] divide-y lg:divide-y-0 lg:divide-x border-muted/30">

          {/* LEFT PANEL: PROMPT */}
          <div className="relative flex flex-col p-6 bg-muted/5 group transition-colors focus-within:bg-muted/10 border-b lg:border-b-0">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Video className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-sm">Visual Prompt Builder</span>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.substring(0, 800))}
              placeholder="Enter your input for video generation... describe the scene, mood, characters, setting, and camera movement in detail."
              className="w-full  resize-none border border-muted/30 bg-background/40 rounded-xl shadow-sm focus-visible:ring-primary/30 text-base leading-relaxed placeholder:text-muted-foreground/40 min-h-[280px] lg:min-h-[380px] p-4"
            />

            {/* Image Upload — visible for all except strict text-to-reel */}
            {contentType !== 'text_to_reel' && (
              <div className="mt-4">
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> Reference Image
                </Label>
                <ImageUpload
                  onImageUploaded={(url: string) => setPromptImage(url)}
                  currentImage={promptImage}
                  onImageRemove={() => setPromptImage("")}
                  folder="video-references"
                  businessId={businessId}
                />
              </div>
            )}

            {/* Video Upload — only visible for video-to-video */}
            {contentType === 'video_to_video' && (
              <div className="mt-4">
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-500" /> Source Video (Required)
                </Label>
                <VideoUpload
                  onVideoUploaded={(url) => setSourceVideoUrl(url)}
                  currentVideo={sourceVideoUrl}
                  onVideoRemove={() => setSourceVideoUrl("")}
                  folder="video-transforms"
                />
                <p className="text-[11px] text-muted-foreground/70 mt-2">Upload the video you want to transform using AI prompts.</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground font-medium">{prompt.length}/800 characters</span>
              {prompt.length > 700 && (
                <span className="text-xs text-orange-500 font-semibold animate-pulse">Approaching limit</span>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: SETTINGS TABS */}
          <div className="flex flex-col bg-background/60">
            <Tabs defaultValue="general" className="flex-1 flex flex-col">

              <TabsList className="w-full justify-start rounded-none border-b border-muted/30 bg-transparent px-6 h-14 space-x-4">
                <TabsTrigger
                  value="general"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-0 font-semibold cursor-pointer hover:text-primary/80 transition-colors"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-0 font-semibold cursor-pointer hover:text-primary/80 transition-colors"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20">

                {/* GENERAL TAB */}
                <TabsContent value="general" className="m-0 space-y-8 animate-in slide-in-from-right-4 duration-500">

                  {/* Content Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="text_to_reel" className="font-medium">
                          <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-purple-500" /> Text to Reel Video</div>
                        </SelectItem>
                        <SelectItem value="image_to_360" className="font-medium">
                          <div className="flex items-center gap-2"><Clapperboard className="w-4 h-4  text-pink-500" /> Image To 360° Product Video</div>
                        </SelectItem>
                        <SelectItem value="image_to_vfx" className="font-medium">
                          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> Image To VFX Ad Video</div>
                        </SelectItem>
                        <SelectItem value="image_to_ugc" className="font-medium">
                          <div className="flex items-center gap-2"><Video className="w-4 h-4 text-blue-500" /> Image To UGC Ad Video</div>
                        </SelectItem>
                        <SelectItem value="image_to_commercial" className="font-medium">
                          <div className="flex items-center gap-2"><Tv className="w-4 h-4 text-orange-500" /> Image To Commercial Ad Video</div>
                        </SelectItem>
                        <SelectItem value="video_to_video" className="font-medium">
                          <div className="flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-indigo-500" /> Video to Video (Transformation)</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                        Video Duration: <span className="text-primary font-semibold">~ {duration} Seconds</span>
                      </Label>
                    </div>
                    <div className="relative pt-2 pb-4">
                      <Slider
                        value={[duration]}
                        max={60}
                        min={1}
                        step={1}
                        onValueChange={(val) => setDuration(val[0])}
                        className="w-full py-4"
                      />
                      <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2 px-1">
                        <span>1s</span>
                        <span>30s</span>
                        <span>60s</span>
                      </div>
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Aspect Ratio <span className="text-red-500">*</span></Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="3:4" className="font-medium py-3"><div className="flex items-center gap-3"><Square className="w-4 h-4" /> Classic (3:4)</div></SelectItem>
                        <SelectItem value="16:9" className="font-medium py-3"><div className="flex items-center gap-3"><MonitorPlay className="w-4 h-4" /> Landscape (16:9)</div></SelectItem>
                        <SelectItem value="9:16" className="font-medium py-3"><div className="flex items-center gap-3"><Smartphone className="w-4 h-4" /> Portrait (9:16)</div></SelectItem>
                        <SelectItem value="1:1" className="font-medium py-3"><div className="flex items-center gap-3"><Square className="w-4 h-4" /> Square (1:1)</div></SelectItem>
                        <SelectItem value="4:3" className="font-medium py-3"><div className="flex items-center gap-3"><Monitor className="w-4 h-4" /> Twitter/X (4:3)</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Video Style (GravityWrite maps this to Voice Over Style visually on their end, but we use Video Style dropdown as shown in screenshot 3) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Video Style</Label>
                    <Select value={style} onValueChange={(val) => setStyle(val as VideoGenerationRequestInput["style"])}>
                      <SelectTrigger className="h-14 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aesthetic</div>
                        <SelectItem value="realistic" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-xs shadow-inner">📸</div> Realistic</div>
                        </SelectItem>
                        <SelectItem value="animated" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-orange-800 flex items-center justify-center text-xs shadow-inner">🦊</div> Pixar 3D (Animated)</div>
                        </SelectItem>
                        <SelectItem value="cinematic" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-blue-900 flex items-center justify-center text-xs shadow-inner">🎬</div> Cinematic (Natural)</div>
                        </SelectItem>
                        <SelectItem value="artistic" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-purple-900 flex items-center justify-center text-xs shadow-inner">🎨</div> Comic / Artistic</div>
                        </SelectItem>
                        <SelectItem value="friendly" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-emerald-900 flex items-center justify-center text-xs shadow-inner">😊</div> Vivid & Friendly</div>
                        </SelectItem>
                        <SelectItem value="professional" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-xs shadow-inner">💼</div> Professional (UGC)</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </TabsContent>

                {/* ADVANCED TAB */}
                <TabsContent value="advanced" className="m-0 space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Quality Resolution</Label>
                    <Select value={quality} onValueChange={(val) => setQuality(val as VideoGenerationRequestInput["quality"])}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="standard" className="font-medium">Standard (1080p)</SelectItem>
                        <SelectItem value="hd" className="font-medium">High Definition (HD)</SelectItem>
                        <SelectItem value="4k" className="font-medium">Ultra HD (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Engine Model</Label>
                    <Select value={model} onValueChange={(val) => setModel(val as VideoGenerationRequestInput["model"])}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="gen4.5" className="font-medium">🏆 Runway Gen-4.5 (Premium)</SelectItem>
                        <SelectItem value="gen4_turbo" className="font-medium">⚡ Runway Gen-4 Turbo (Fast)</SelectItem>
                        <SelectItem value="gen4_aleph" className="font-medium">⚡ Runway Gen-4 Aleph (Fast)</SelectItem>
                        <SelectItem value="act_two" className="font-medium">⚡ Runway Act Two (Fast)</SelectItem>
                        <SelectItem value="veo3" className="font-medium">🔮 Google Veo 3</SelectItem>
                        <SelectItem value="veo3.1" className="font-medium">🎬 Google Veo 3.1 (High Fidelity)</SelectItem>
                        <SelectItem value="veo3.1_fast" className="font-medium">💨 Google Veo 3.1 (Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

              </div>

              {/* ACTION FOOTER */}
              <div className="p-6 border-t border-muted/30 bg-muted/10 space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPrompt("");
                      setPromptImage("");
                      setContentType("text_to_reel");
                      setStyle("cinematic");
                      setDuration(6);
                      setAspectRatio("16:9");
                      setQuality("standard");
                      setModel("gen4.5");
                    }}
                    className="flex-1 h-12 rounded-xl border-muted/50 hover:border-primary/40 hover:bg-muted/20 transition-colors font-semibold shadow-sm"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={generateVideoMutation.isPending}
                    className="flex-1 h-12 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {generateVideoMutation.isPending ? (
                      <><Square className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" /> Generate Video</>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-center text-muted-foreground/80 font-medium">
                  This generation will cost <span className="text-primary font-bold">7 credits</span> (~{duration}s, {quality.toUpperCase()})
                </p>
              </div>

            </Tabs>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <Card className="relative overflow-hidden border-muted/50 bg-background/50 shadow-2xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Your video generation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading video jobs...
              </p>
            ) : isError ? (
              <p className="text-destructive text-center py-8">
                Failed to load video jobs. Please try again.
              </p>
              ) : jobs?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No video jobs yet. Generate your first video!
              </p>
            ) : (
                    jobs?.slice(0, 5)?.map((job: VideoJob) => (
                      <div key={job.id} className="border border-muted/60 bg-muted/10 rounded-xl p-5 space-y-4 transition-all hover:bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(job.status)}
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{getStatusBadge(job.status)}</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                Model: {job.provider}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                            {job.createdAt ? new Date(job.createdAt).toISOString().substring(0, 10) : 'Unknown date'}
                          </span>
                        </div>

                        <p className="text-sm italic text-muted-foreground line-clamp-2 border-l-2 border-primary/30 pl-3">&ldquo;{job.prompt}&rdquo;</p>

                        <div className="flex flex-wrap gap-3 text-xs font-medium text-muted-foreground/80 bg-background/50 px-3 py-2 rounded-lg">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.duration}s</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{job.aspectRatio}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="uppercase">{job.quality}</span>
                        </div>

                        {job.videoUrl && typeof job.videoUrl === 'string' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewVideo(job.videoUrl!)}
                              className="w-full"
                            >
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(job.videoUrl!, job.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyFilters(job.videoUrl!, job.id)}
                              title="Apply Brand Filters"
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
            )}
          </div>

          {jobs && jobs.length > 5 && (
            <Button variant="ghost" className="w-full mt-6 border-t rounded-none border-muted/50 pt-4">
              View All History
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}