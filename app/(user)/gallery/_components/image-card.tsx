'use client'

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, MoreHorizontal, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Image from "next/image"
import ImageModal from "./image-modal"

interface ImageCardProps {
  image: {
    id: string
    url: string
    title: string
    createdAt: string
    size: number
    format: string
    workflow?: {
      id: string
      name: string
    }
  }
}


export default function ImageCard({ image }: ImageCardProps) {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    if (!image.url) {
      toast.error("No image URL available");
      return;
    }

    try {
      // Validate URL
      const url = new URL(image.url);
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol');
      }

      const response = await fetch(image.url);
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
      a.download = `image-${image.id}.${image.format || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Image downloaded successfully");
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to download image";
      toast.error(errorMessage);
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/gallery/images/${image.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Image deleted successfully")
        // Invalidate React Query cache instead of custom event
        queryClient.invalidateQueries({ queryKey: ["gallery-images"] })
      } else {
        throw new Error('Failed to delete image')
      }
    } catch (error) {
      toast.error("Failed to delete image")
    }
  }

  return (
    <>
    <Card
      ref={cardRef}
        className="py-0 group overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted">
          {isVisible && (
            <>
              {/* Loading skeleton */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}

              {/* Actual image */}
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={image.title || "Generated image"}
                  fill
                  className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  onLoad={() => setIsLoaded(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    preload
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-2 text-center">
                  Image URL unavailable
                </div>
              )}
            </>
          )}

            {/* Workflow Badge */}
            {image.workflow && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md border border-blue-400/30">
                <Zap className="h-3 w-3 fill-current" />
                <span className="uppercase tracking-wider">{image.workflow.name}</span>
              </div>
            )}

          {/* Quick actions */}
          <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-black/50 backdrop-blur-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Image Info */}
        <div className="p-4">
          <h3 className="font-medium text-sm mb-2 line-clamp-2">{image.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(image.createdAt)}</span>
            {image.size > 0 && (
              <span>{formatFileSize(image.size)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

      <ImageModal
        image={image}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
