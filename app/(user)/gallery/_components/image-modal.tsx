"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Share2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageModalProps {
  image: {
    id: string;
    url: string;
    title: string;
    createdAt: string;
    size: number;
    format: string;
    model?: string;
    aspectRatio?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

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
    if (!image.url) {
      toast.error("No image URL available");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(image.url);
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
      link.download = `image-${image.id}.${image.format || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully");
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download image';
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!image.url) {
      toast.error("No image URL available");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Generated Image - ${image.id}`,
          text: image.title,
          url: image.url,
        });
        toast.success("Image shared successfully");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(image.url);
        toast.success("Image URL copied to clipboard");
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error("Failed to share image");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[800px] max-h-full overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-4 bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Image Preview</DialogTitle>
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

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row w-full h-full min-h-[50vh]">
          {/* Image Section */}
          <div className="flex-1 lg:flex-2 bg-black flex items-center justify-center relative order-1 overflow-hidden p-4">
            {image.url ? (
              <div className="relative w-full h-full min-h-[40vh] max-h-[70vh]">
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  preload
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Image Not Available</h3>
                </div>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="w-full lg:w-96 bg-muted/30 border-t lg:border-t-0 lg:border-l p-6 overflow-y-auto order-2 max-h-[70vh]">
            {/* Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <span className="text-sm font-medium uppercase">{image.format || 'JPG'}</span>
                  </div>

                  {image.size > 0 && (
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">Size</span>
                       <span className="text-sm font-medium">{formatFileSize(image.size)}</span>
                     </div>
                  )}

                  {image.model && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Model</span>
                      <span className="text-sm font-medium">{image.model}</span>
                    </div>
                  )}

                  {image.aspectRatio && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Aspect Ratio</span>
                      <span className="text-sm font-medium">{image.aspectRatio}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt */}
              {image.title && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Prompt</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {image.title}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">{formatDate(image.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 mt-6 border-t">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Actions</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading || !image.url}
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download Image'}
                </Button>

                <Button
                  onClick={handleShare}
                  disabled={!image.url}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
