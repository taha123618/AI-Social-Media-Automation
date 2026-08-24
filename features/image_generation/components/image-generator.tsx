'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { useGenerateImage, useImageJobs } from "@/features/image_generation/hooks/use-image";
import { ImageGenerationRequestSchema, ImageGenerationRequestInput, IMAGE_TYPES, ImageGenerationResponse } from "@/features/image_generation/types";
import {
  Image as ImageIcon,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Palette,
  Monitor,
  Smartphone,
  Camera,
  RefreshCw
} from "lucide-react";

interface ImageGeneratorProps {
  businessId?: string;
  userId?: string;
  onImageGenerated?: (result: ImageGenerationResponse) => void;
}

interface ImageJob {
  id: string;
  businessId?: string;
  userId?: string;
  provider: string;
  prompt: string;
  status: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  aspectRatio: string;
  quality: string;
  style: string;
  variations: number;
  providerJobId?: string;
  createdAt: string;
  completedAt?: string;
}

// Validation helper
const validateBusinessId = (businessId?: string): boolean => {
  return !!(businessId && typeof businessId === 'string' && businessId.length > 0 && /^[a-zA-Z0-9-_]+$/.test(businessId));
};

const validateUserId = (userId?: string): boolean => {
  return !!(userId && typeof userId === 'string' && userId.length > 0 && /^[a-zA-Z0-9-_]+$/.test(userId));
};

export default function ImageGenerator({ businessId, userId, onImageGenerated }: ImageGeneratorProps) {
  const [imageType, setImageType] = useState<ImageGenerationRequestInput["imageType"]>("custom");

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageGenerationRequestInput["style"]>("realistic");
  const [aspectRatio, setAspectRatio] = useState<ImageGenerationRequestInput["aspectRatio"]>("1:1");
  const [quality, setQuality] = useState<ImageGenerationRequestInput["quality"]>("standard");
  const [model, setModel] = useState<ImageGenerationRequestInput["model"]>("runway-gen4-image");
  const [variations, setVariations] = useState(1);
  const [includeBrand, setIncludeBrand] = useState(false);
  const [referenceImage, setReferenceImage] = useState("");

  // Use React Query hooks
  const { data: jobs = [], isLoading, isError } = useImageJobs(businessId, userId);
  const generateImageMutation = useGenerateImage(businessId, userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() && !referenceImage.trim()) {
      toast.error("Please enter a prompt or upload a reference image");
      return;
    }

    // 1. Zod Frontend Validation
    const validationResult = ImageGenerationRequestSchema.safeParse({
      businessId,
      userId,
      prompt: prompt.trim(),
      style,
      aspectRatio,
      quality,
      model,
      variations,
      includeBrand,
      referenceImage: referenceImage.trim() || undefined
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(`Invalid input: ${firstError.message}`);
      return;
    }

    // 2. Show loading toast and disable form
    const loadingToast = toast.loading("Starting image generation...");

    try {
      const result = await generateImageMutation.mutateAsync({
        businessId,
        userId,
        prompt: prompt.trim(),
        style,
        aspectRatio,
        quality,
        model,
        variations,
        includeBrand,
        imageType,
        referenceImage: referenceImage.trim() || undefined,
        brandId: undefined
      });

      toast.dismiss(loadingToast);
      toast.success("Image generation started! Your job is in the queue.");

      // Clear form after successful submission
      setPrompt("");
      setReferenceImage("");
      setImageType("custom");

      // Callback for parent component
      onImageGenerated?.(result);

      if (result.jobId) {
        console.log(`Image generation started with job ID: ${result.jobId}`);
      }
    } catch (error: unknown) {
      toast.dismiss(loadingToast);

      let errorMessage = "Failed to start image generation";

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { error?: string; type?: string } } };
        if (responseError.response?.data?.error) {
          errorMessage = responseError.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PROCESSING":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
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

  const handleViewImage = (imageUrl: string) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      toast.error('Invalid image URL');
      return;
    }
    try {
      window.open(imageUrl, "_blank");
    } catch (error) {
      console.error('Failed to open image:', error);
      toast.error('Failed to open image');
    }
  };

  const handleDownload = async (imageUrl: string, jobId?: string) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      toast.error('Invalid image URL');
      return;
    }

    const timestamp = new Date().getTime();
    const filename = `generated-image-${jobId || timestamp}.png`;

    try {
      const loadingToast = toast.loading("Preparing download...");

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
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
      toast.success(`Image downloaded as ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download image';
      toast.error(errorMessage);
    }
  };

  // Validate businessId prop
  if (!validateBusinessId(businessId)) {
    console.error('Invalid businessId provided to ImageGenerator:', businessId);
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
      {/* Generation Form (Modern Style) */}
      <Card className="relative overflow-hidden border-muted/30 bg-background/50 shadow-2xl backdrop-blur-xl rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary via-purple-500 to-emerald-500 opacity-80" />

        <div className="grid lg:grid-cols-[1fr_450px] divide-y lg:divide-y-0 lg:divide-x border-muted/30">

          {/* LEFT PANEL: PROMPT */}
          <div className="relative flex flex-col p-6 bg-muted/5 group transition-colors focus-within:bg-muted/10 border-b lg:border-b-0">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm text-foreground/80">AI Image Prompt Builder</span>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.substring(0, 3000))}
              placeholder="Describe the image you want to generate... be detailed about style, composition, colors, mood, and any specific elements you want included."
              className="resize-none border border-muted/30 bg-background/40 rounded-xl shadow-sm focus-visible:ring-primary/30 text-base leading-relaxed placeholder:text-muted-foreground/40 min-h-[280px] lg:min-h-[380px] p-4"
            />

            {/* Reference Image Upload */}
            <div className="mt-4">
              <Label className="text-sm font-bold mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" /> Reference Image
              </Label>
              <ImageUpload
                onImageUploaded={(url: string) => setReferenceImage(url)}
                currentImage={referenceImage}
                onImageRemove={() => setReferenceImage("")}
                folder="image-references"
                businessId={businessId}
                userId={userId}
              />
              <p className="text-[11px] text-muted-foreground/70 mt-2">Upload a product or reference image for style consistency (optional).</p>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground font-medium">{prompt.length}/3000 characters</span>
              {prompt.length > 2700 && (
                <span className="text-xs text-orange-500 font-semibold">Approaching limit</span>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: SETTINGS TABS */}
          <div className="flex flex-col bg-background/60">
            <Tabs defaultValue="general" className="flex-1 flex flex-col">

              <TabsList className="w-full justify-start rounded-none border-b border-muted/30 bg-transparent px-6 h-14 space-x-4">
                <TabsTrigger
                  value="general"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-0 font-bold cursor-pointer hover:text-primary/80 transition-colors"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-0 font-bold cursor-pointer hover:text-primary/80 transition-colors"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20">

                {/* GENERAL TAB */}
                <TabsContent value="general" className="m-0 space-y-6 animate-in slide-in-from-right-4 duration-500">

                  {/* Image Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                      Image Type
                      <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary/30 text-primary">Format</Badge>
                    </Label>
                    <Select
                      value={imageType || "custom"}
                      onValueChange={(val: string) => {
                        const typedVal = val as ImageGenerationRequestInput["imageType"];
                        setImageType(typedVal);
                        // Auto-set aspect ratio if it's a known non-custom type
                        const config = typedVal ? IMAGE_TYPES[typedVal as keyof typeof IMAGE_TYPES] : undefined;
                        if (config && typedVal !== 'custom') {
                          setAspectRatio(config.aspectRatio as ImageGenerationRequestInput["aspectRatio"]);
                        }
                      }}
                    >
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        {Object.values(IMAGE_TYPES).map((type) => (
                          <SelectItem key={type.id} value={type.id} className="py-2.5 font-medium">
                            <div className="flex flex-col text-left">
                              <span className="text-sm">{type.name}</span>
                              <span className="text-[10px] text-muted-foreground opacity-70">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI Model */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                      Intelligence Model
                      <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary/30 text-primary">AI</Badge>
                    </Label>
                    <Select value={model} onValueChange={(val: string) => setModel(val as ImageGenerationRequestInput["model"])}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="runway-gen4-image" className="py-2.5 font-medium">
                          <div className="flex flex-col text-left">
                            <span className="text-sm">Runway Gen-4 Default</span>
                            <span className="text-[10px] text-muted-foreground opacity-70">Consistent, highly realistic visuals</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="runway-gen4-image-turbo" className="py-2.5 font-medium">
                          <div className="flex flex-col text-left">
                            <span className="text-sm">Runway Gen-4 Turbo</span>
                            <span className="text-[10px] text-muted-foreground opacity-70">Lightning fast high-quality visuals</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gemini_2.5_flash" className="py-2.5 font-medium">
                          <div className="flex flex-col text-left">
                            <span className="text-sm">Gemini 2.5 Flash</span>
                            <span className="text-[10px] text-muted-foreground opacity-70">Consistent, highly realistic visuals</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Include Brand Toggle */}
                  <div className="p-4 rounded-xl border border-muted/40 bg-muted/5 flex items-center justify-between group hover:bg-muted/10 transition-colors">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors">Include Brand</Label>
                      <p className="text-[11px] text-muted-foreground">Create the image based on your brand DNA</p>
                    </div>
                    <Switch
                      checked={includeBrand}
                      onCheckedChange={setIncludeBrand}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Image Style */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Image Style</Label>
                    <Select value={style} onValueChange={(val) => setStyle(val as ImageGenerationRequestInput["style"])}>
                      <SelectTrigger className="h-14 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aesthetic</div>
                        <SelectItem value="realistic" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-xs shadow-inner">📸</div> Realistic</div>
                        </SelectItem>
                        <SelectItem value="artistic" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-purple-800 flex items-center justify-center text-xs shadow-inner">🎨</div> Artistic</div>
                        </SelectItem>
                        <SelectItem value="cinematic" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-blue-900 flex items-center justify-center text-xs shadow-inner">🎬</div> Cinematic</div>
                        </SelectItem>
                        <SelectItem value="anime" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-pink-800 flex items-center justify-center text-xs shadow-inner">🌸</div> Anime</div>
                        </SelectItem>
                        <SelectItem value="cartoon" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-yellow-800 flex items-center justify-center text-xs shadow-inner">🦊</div> Cartoon</div>
                        </SelectItem>
                        <SelectItem value="3d" className="font-medium py-2.5">
                          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md bg-emerald-800 flex items-center justify-center text-xs shadow-inner">🎮</div> 3D Render</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Aspect Ratio <span className="text-red-500">*</span></Label>
                    <Select value={aspectRatio} onValueChange={(val: string) => setAspectRatio(val as ImageGenerationRequestInput["aspectRatio"])}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="1:1" className="font-medium py-3 text-sm flex items-center gap-3"><Monitor className="w-4 h-4" /> Square (1:1)</SelectItem>
                        <SelectItem value="2:3" className="font-medium py-3 text-sm flex items-center gap-3"><Smartphone className="w-4 h-4" /> Portrait (2:3)</SelectItem>
                        <SelectItem value="3:2" className="font-medium py-3 text-sm flex items-center gap-3"><Camera className="w-4 h-4" /> Landscape (3:2)</SelectItem>
                        <SelectItem value="3:4" className="font-medium py-3 text-sm flex items-center gap-3"><Smartphone className="w-4 h-4" /> Portrait (3:4)</SelectItem>
                        <SelectItem value="4:3" className="font-medium py-3 text-sm flex items-center gap-3"><Monitor className="w-4 h-4" /> Landscape (4:3)</SelectItem>
                        <SelectItem value="4:5" className="font-medium py-3 text-sm flex items-center gap-3"><Smartphone className="w-4 h-4" /> Portrait (4:5)</SelectItem>
                        <SelectItem value="5:4" className="font-medium py-3 text-sm flex items-center gap-3"><Monitor className="w-4 h-4" /> Landscape (5:4)</SelectItem>
                        <SelectItem value="9:16" className="font-medium py-3 text-sm flex items-center gap-3"><Smartphone className="w-4 h-4" /> Portrait (9:16)</SelectItem>
                        <SelectItem value="16:9" className="font-medium py-3 text-sm flex items-center gap-3"><Monitor className="w-4 h-4" /> Landscape (16:9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variations Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold text-foreground/90 flex items-center gap-2">
                        Variations: <span className="text-primary font-semibold">{variations}</span>
                      </Label>
                    </div>
                    <div className="relative pt-2 pb-4">
                      <Slider
                        value={[variations]}
                        max={4}
                        min={1}
                        step={1}
                        onValueChange={(val) => setVariations(val[0])}
                        className="w-full py-4"
                      />
                      <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                      </div>
                    </div>
                  </div>

                </TabsContent>

                {/* ADVANCED TAB */}
                <TabsContent value="advanced" className="m-0 space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/90">Quality Level</Label>
                    <Select value={quality} onValueChange={(val) => setQuality(val as ImageGenerationRequestInput["quality"])}>
                      <SelectTrigger className="h-12 bg-background border-muted/40 hover:border-primary/50 transition-colors rounded-xl shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-muted/30">
                        <SelectItem value="standard" className="font-medium">Standard (Fast)</SelectItem>
                        <SelectItem value="hd" className="font-medium">High Definition</SelectItem>
                        <SelectItem value="ultra" className="font-medium">Ultra HD (Premium)</SelectItem>
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
                      setReferenceImage("");
                      setStyle("realistic");
                      setAspectRatio("1:1");
                      setQuality("standard");
                      setModel("runway-gen4-image");
                      setVariations(1);
                    }}
                    className="flex-1 h-12 rounded-xl border-muted/50 hover:border-primary/40 hover:bg-muted/20 transition-colors font-semibold shadow-sm"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={generateImageMutation.isPending || !(prompt.trim() || referenceImage.trim())}
                    className="flex-1 h-12 rounded-xl bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {generateImageMutation.isPending ? (
                      <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Synthesizing...</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" /> Generate Image</>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-center text-muted-foreground/60 font-semibold tracking-wide uppercase">
                  Est. Cost: <span className="text-foreground font-bold">{variations} {variations === 1 ? 'Credit' : 'Credits'}</span> • {quality.toUpperCase()} QUALITY
                </p>
              </div>

            </Tabs>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <Card className="relative overflow-hidden border-muted/50 bg-background/50 shadow-2xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
          <CardDescription>Your image generation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Loading image jobs...
              </p>
            ) : isError ? (
              <p className="text-destructive text-center py-8">
                Failed to load image jobs. Please try again.
              </p>
            ) : jobs?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No image jobs yet. Generate your first image!
              </p>
            ) : (
              jobs?.slice(0, 5)?.map((job: ImageJob) => (
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
                    <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> {job.style}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{job.aspectRatio}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="uppercase">{job.quality}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{job.variations} {job.variations === 1 ? 'variation' : 'variations'}</span>
                  </div>

                  {job.imageUrl && typeof job.imageUrl === 'string' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewImage(job.imageUrl!)}
                        className="w-full"
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(job.imageUrl!, job.id)}
                      >
                        <Download className="h-4 w-4" />
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
