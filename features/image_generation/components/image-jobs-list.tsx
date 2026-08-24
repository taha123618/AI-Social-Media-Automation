'use client';

import React, { useState } from 'react';
import { useImageJobs, useApplyImageBrandFilters } from '@/features/image_generation/hooks/use-image';
import { ImageGenerationJob } from '@/features/image_generation/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Eye,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Monitor,
  Image as ImageIcon,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ImageJobsListProps {
  businessId?: string;
  userId?: string;
  onJobSelect?: (job: ImageGenerationJob) => void;
  refreshTrigger?: number;
}

export default function ImageJobsList({ businessId, userId, onJobSelect }: ImageJobsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    addWatermark: boolean;
    applyColorGrade: boolean;
    resizeForPlatform: "instagram" | "tiktok" | "youtube" | "linkedin" | "facebook";
  }>({
    addWatermark: true,
    applyColorGrade: true,
    resizeForPlatform: "instagram"
  });

  // Use the use-image hook for fetching jobs
  const { data: jobs = [], isLoading, refetch } = useImageJobs(businessId, userId);
  const applyFiltersMutation = useApplyImageBrandFilters(businessId || "");

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

  const handleViewImage = (imageUrl: string) => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank");
  };

  const handleDownload = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
      const toastId = toast.loading("Preparing download...");
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const timestamp = new Date().getTime();
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `generated-image-${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.dismiss(toastId);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image. Opening in new tab instead.");
      window.open(imageUrl, "_blank");
    }
  };

  const openFilterDialog = (imageUrl: string) => {
    if (!imageUrl) return;
    setSelectedImageUrl(imageUrl);
    setIsFilterDialogOpen(true);
  };

  const handleApplyFilters = async () => {
    if (!selectedImageUrl) return;
    try {
      const result = await applyFiltersMutation.mutateAsync({
        imageUrl: selectedImageUrl,
        options: filterOptions // { addWatermark, applyColorGrade, resizeForPlatform }
      });
      toast.success("Brand filters applied!");
      setIsFilterDialogOpen(false);
      handleViewImage(result.imageUrl); // Opens the branded image
    } catch (error) {
      toast.error("Failed to apply brand filters");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your image gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Image History</h2>
          <p className="text-muted-foreground">Manage and download your generated images</p>
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
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="py-0 border-dashed border-2 bg-muted/30 pt-0">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Creating Images</h3>
            <p className="text-muted-foreground max-w-sm text-center mb-6">
              Your image generation history will appear here once you start creating content.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jobs?.map((job) => (
            <Card key={job.id} className="py-0 group overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer" onClick={() => onJobSelect?.(job)}>
              <div className="relative aspect-square overflow-hidden bg-muted">
                {job.imageUrl ? (
                  <Image
                    src={job.imageUrl}
                    alt={job.prompt}
                    fill
                    preload
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-20" />
                  </div>
                )}

                {/* Status Badge Over Thumbnail */}
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(job.status)}
                </div>

                {/* Hover Play Overlay */}
                {job.imageUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-12 h-12 rounded-full scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.imageUrl) handleViewImage(job.imageUrl);
                      }}
                    >
                      <Eye className="h-6 w-6" />
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
                      {job.model || 'AI Model'}
                    </span>
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="h-3 w-3" />
                      {job.aspectRatio || '1:1'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Created</span>
                    <span className="text-[11px] font-medium">{formatDate(job.createdAt).split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {job.imageUrl ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            if (job.imageUrl) handleViewImage(job.imageUrl);
                          }}>
                            <Eye className="mr-2 h-4 w-4" /> View Image
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            if (job.imageUrl) handleDownload(job.imageUrl);
                          }}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            if (job.imageUrl) openFilterDialog(job.imageUrl);
                          }}>
                            <Filter className="mr-2 h-4 w-4" /> Brand Filters
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(job.id);
                            toast.success("Job ID copied!");
                          }}>
                            <Copy className="mr-2 h-4 w-4" /> Copy ID
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Model</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Date</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs?.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => onJobSelect?.(job)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0 border">
                            {job.imageUrl ? (
                              <Image src={job.imageUrl} alt="" sizes="(max-width: 1024px) 100vw, 70vw" fill preload width={48} height={48} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 opacity-20" /></div>
                            )}
                          </div>
                          <div className="max-w-50 sm:max-w-75">
                            <p className="font-medium truncate leading-tight mb-1">{job.prompt}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">ID: {job.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{job.model || 'AI Model'}</td>
                      <td className="p-4">{getStatusBadge(job.status)}</td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(job.createdAt).split(' ')[0]}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {job.imageUrl ? (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation();
                                if (job.imageUrl) handleViewImage(job.imageUrl);
                              }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation();
                                if (job.imageUrl) handleDownload(job.imageUrl);
                              }}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation();
                                if (job.imageUrl) openFilterDialog(job.imageUrl);
                              }}>
                                <Filter className="h-4 w-4" />
                              </Button>
                            </>
                          ) : null}
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
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Apply Brand Filters</DialogTitle>
            <DialogDescription>
              Enhance your image with brand consistency filters before viewing or downloading.
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
                onValueChange={(value: "instagram" | "tiktok" | "youtube" | "linkedin" | "facebook") =>
                  setFilterOptions({ ...filterOptions, resizeForPlatform: value })
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
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
