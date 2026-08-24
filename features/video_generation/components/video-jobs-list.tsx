import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Square,
  RotateCcw,
  Eye,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Zap,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Calendar,
  Monitor,
  Video
} from "lucide-react";
import { toast } from "sonner";
import { useVideoJobs, useCancelVideoJob, useApplyBrandFilters, useVideoWorkerActions } from "@/features/video_generation/hooks/use-video";
import { BrandFilterOptions } from "@/features/video_generation/types";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/** Hydration-safe date formatter — uses ISO string, no locale dependency */
function formatDate(dateStr: string) {
  return new Date(dateStr).toISOString().replace('T', ' ').substring(0, 16);
}

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

interface VideoJobsListProps {
  businessId: string;
}

export function VideoJobsList({ businessId }: VideoJobsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<BrandFilterOptions>({
    addWatermark: true,
    applyColorGrade: true,
    resizeForPlatform: "instagram"
  });

  // Use React Query hooks instead of manual state management
  const { data: jobs = [], isLoading, refetch } = useVideoJobs(businessId);
  const { addPendingJobs, addJobToQueue } = useVideoWorkerActions();
  const cancelMutation = useCancelVideoJob(businessId);
  const applyFiltersMutation = useApplyBrandFilters(businessId);

  const handleCancelJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel this job?")) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(jobId);
      toast.success("Job cancelled successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to cancel job");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "PROCESSING":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Completed</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20">Failed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Processing</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewVideo = (videoUrl: string) => {
    window.open(videoUrl, "_blank");
  };

  const handleDownload = async (videoUrl: string) => {
    try {
      const toastId = toast.loading("Preparing download...");
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const timestamp = new Date().getTime();
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `generated-video-${timestamp}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.dismiss(toastId);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download video. Opening in new tab instead.");
      window.open(videoUrl, "_blank");
    }
  };

  const openFilterDialog = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    setIsFilterDialogOpen(true);
  };

  const handleApplyFilters = async () => {
    if (!selectedVideoUrl) return;
    try {
      const result = await applyFiltersMutation.mutateAsync({
        videoUrl: selectedVideoUrl,
        options: filterOptions // { addWatermark, applyColorGrade, resizeForPlatform }
      });
      toast.success("Brand filters applied!");
      setIsFilterDialogOpen(false);
      handleViewVideo(result.videoUrl); // Opens the branded video
    } catch (error) {
      toast.error("Failed to apply brand filters");
    }
  };

  const handleAddPendingJobs = async () => {
    try {
      await addPendingJobs.mutateAsync();
      toast.success("Pending jobs added to queue!");
    } catch (error) {
      toast.error((error as Error).message || "Failed to add pending jobs");
    }
  };

  const handleAddJobToQueue = async (jobId: string) => {
    try {
      await addJobToQueue.mutateAsync({ jobId, businessId });
      toast.success("Job added to queue!");
    } catch (error) {
      toast.error((error as Error).message || "Failed to add job to queue");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your video gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Video History</h2>
          <p className="text-muted-foreground">Manage and download your generated videos</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="hidden md:flex">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="grid" className="px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ListIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => refetch()} variant="outline" size="sm" className="h-9">
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleAddPendingJobs} variant="default" size="sm" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
            <Zap className="mr-2 h-4 w-4" />
            Process All
          </Button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="py-0 border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Creating Videos</h3>
            <p className="text-muted-foreground max-w-sm text-center mb-6">
              Your video generation history will appear here once you start creating content.
            </p>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Generate First Video
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jobs?.map((job: VideoJob) => (
            <Card key={job.id} className="py-0 group overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {job.thumbnailUrl ? (
                  <Image
                    src={job.thumbnailUrl}
                    alt={job.prompt}
                    fill
                    preload
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Video className="h-10 w-10 opacity-20" />
                  </div>
                )}

                {/* Status Badge Over Thumbnail */}
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(job.status)}
                </div>

                {/* Hover Play Overlay */}
                {job.videoUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-12 h-12 rounded-full scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl"
                      onClick={() => handleViewVideo(job.videoUrl!)}
                    >
                      <Play className="h-6 w-6 fill-current" />
                    </Button>
                  </div>
                )}
              </div>

              <CardContent className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                    {job.prompt}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {job.provider}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.duration}s
                    </span>
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="h-3 w-3" />
                      {job.aspectRatio}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Created</span>
                    <span className="text-[11px] font-medium">{formatDate(job.createdAt).split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(job.status === "PENDING" || job.status === "PROCESSING") ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => handleCancelJob(job.id)}
                        title="Cancel Job"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    ) : job.videoUrl ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewVideo(job.videoUrl!)}>
                              <Eye className="mr-2 h-4 w-4" /> View Video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(job.videoUrl!)}>
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openFilterDialog(job.videoUrl!)}>
                              <Filter className="mr-2 h-4 w-4" /> Brand Filters
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddJobToQueue(job.id)}>
                              <RotateCcw className="mr-2 h-4 w-4" /> Re-run Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : job.status === "FAILED" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleAddJobToQueue(job.id)}
                            title="Retry Job"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          <Card className="border shadow-sm py-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Job Details</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Provider</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Duration</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Date</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs?.map((job: VideoJob) => (
                    <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0 border">
                            {job.thumbnailUrl ? (
                              <Image src={job.thumbnailUrl} alt="" width={48} height={48} className="object-cover w-full h-full" fill preload sizes="(max-width: 1024px) 100vw, 70vw" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Video className="h-5 w-5 opacity-20" /></div>
                            )}
                          </div>
                          <div className="max-w-[200px] sm:max-w-[300px]">
                            <p className="font-medium truncate leading-tight mb-1">{job.prompt}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">ID: {job.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{job.provider}</td>
                      <td className="p-4 text-muted-foreground">{job.duration}s</td>
                      <td className="p-4">{getStatusBadge(job.status)}</td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(job.createdAt).split(' ')[0]}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {job.videoUrl ? (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleViewVideo(job.videoUrl!)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(job.videoUrl!)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openFilterDialog(job.videoUrl!)}>
                                <Filter className="h-4 w-4" />
                              </Button>
                            </>
                          ) : job.status === "PENDING" || job.status === "PROCESSING" ? (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => handleCancelJob(job.id)}>
                              <Square className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAddJobToQueue(job.id)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
        </Card>
      )}

      {/* Brand Filter Options Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply Brand Filters</DialogTitle>
            <DialogDescription>
              Enhance your video with brand consistency filters before viewing or downloading.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="watermark"
                checked={filterOptions.addWatermark}
                onCheckedChange={(checked) =>
                  setFilterOptions({ ...filterOptions, addWatermark: !!checked })
                }
              />
              <Label htmlFor="watermark" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Add Brand Watermark
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="colorGrade"
                checked={filterOptions.applyColorGrade}
                onCheckedChange={(checked) =>
                  setFilterOptions({ ...filterOptions, applyColorGrade: !!checked })
                }
              />
              <Label htmlFor="colorGrade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Apply Brand Color Grading
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform">Target Platform (Resizing)</Label>
              <Select
                value={filterOptions.resizeForPlatform}
                onValueChange={(value) =>
                  setFilterOptions({ ...filterOptions, resizeForPlatform: value as BrandFilterOptions["resizeForPlatform"] })
                }
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram (1:1 / 4:5)</SelectItem>
                  <SelectItem value="tiktok">TikTok (9:16)</SelectItem>
                  <SelectItem value="youtube">YouTube (16:9)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters} disabled={applyFiltersMutation.isPending}>
              {applyFiltersMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Filters"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}