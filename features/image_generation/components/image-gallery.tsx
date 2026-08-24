'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import ImagePreviewModal from './image-preview-modal';
import { toast } from 'sonner';
import { useImageJobs } from '@/features/image_generation/hooks/use-image';
import {
  Download,
  Eye,
  Trash2,
  Calendar,
  Monitor,
  Palette,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImageGalleryProps {
  businessId?: string;
  userId?: string;
  refreshTrigger?: number;
}

interface ImageJob {
  id: string;
  businessId?: string;
  userId?: string;
  prompt: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  status: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  model?: string;
  variations?: number;
  thumbnailUrl?: string;
}

export default function ImageGallery({ businessId, userId, refreshTrigger }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageJob | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'prompt'>('newest');

  // Use the use-image hook for fetching jobs
  const { data: jobs = [], isLoading, error, refetch } = useImageJobs(businessId, userId);

  const deleteJob = useCallback(async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch('/api/image/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, businessId, userId })
      });

      const data = await response.json();

      if (data.success) {
        // Refetch jobs to update the list
        refetch();
        if (selectedImage?.id === jobId) {
          setSelectedImage(null);
        }
        toast.success('Image deleted successfully');
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  }, [businessId, userId, selectedImage, refetch]);

  const toggleLike = (imageId: string) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
        toast.success('Removed from favorites');
      } else {
        newSet.add(imageId);
        toast.success('Added to favorites');
      }
      return newSet;
    });
  };

  const shareImage = async (image: ImageJob) => {
    if (!image.imageUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: image.prompt,
          url: image.imageUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(image.imageUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const downloadImage = (image: ImageJob) => {
    if (!image.imageUrl) return;
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `image-${image.id}.png`;
    link.click();
    toast.success('Download started');
  };

  // Sort jobs based on selected criteria
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'prompt':
          return a.prompt.localeCompare(b.prompt);
        default:
          return 0;
      }
    });
  }, [jobs, sortBy]);

  useEffect(() => {
    // Refetch when refreshTrigger changes
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Gallery</h2>
            <p className="text-gray-600">Your generated images ({jobs.length} total)</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'prompt')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="prompt">Sort by Prompt</option>
            </select>

            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No images generated yet</div>
          <p className="text-gray-400">Start creating images with the AI generator!</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="relative h-48 bg-gray-200">
                    {job.imageUrl ? (
                      <Image
                        src={job.imageUrl}
                        alt={job.prompt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        preload
                        className="object-cover cursor-pointer"
                        onClick={() => setSelectedImage(job)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500 text-center">
                          <div className="mb-2">🔄</div>
                          <div className="text-sm">Processing...</div>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'PROCESSING' || job.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(job.id)}
                      className="absolute top-2 left-2 p-1 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                    >
                      <Heart
                        className={`w-4 h-4 ${likedImages.has(job.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {job.prompt}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium">{job.model || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setSelectedImage(job)}
                        className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded text-sm hover:bg-indigo-700 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>

                      {job.imageUrl && (
                        <>
                          <button
                            onClick={() => downloadImage(job)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                                <MoreHorizontal className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => shareImage(job)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteJob(job.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // List View
                <div className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 relative">
                      {job.imageUrl ? (
                        <Image
                          src={job.imageUrl}
                          alt={job.prompt}
                          fill
                            sizes="(max-width: 1024px) 100vw, 70vw"
                            preload
                          className="object-cover rounded-lg cursor-pointer"
                          onClick={() => setSelectedImage(job)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-500 text-center">
                            <div className="text-lg">🔄</div>
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-1 right-1">
                        <span className={`px-1 py-0.5 text-xs font-semibold rounded ${job.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'PROCESSING' || job.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {job.prompt}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Monitor className="w-3 h-3" />
                              {job.model || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            {job.style && (
                              <span className="flex items-center gap-1">
                                <Palette className="w-3 h-3" />
                                {job.style}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleLike(job.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Heart
                              className={`w-4 h-4 ${likedImages.has(job.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                            />
                          </button>

                          <button
                            onClick={() => setSelectedImage(job)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {job.imageUrl && (
                            <>
                              <button
                                onClick={() => downloadImage(job)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => shareImage(job)}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => deleteJob(job.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Image Preview Modal */}
      {selectedImage && (
        <ImagePreviewModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={deleteJob}
        />
      )}
    </div>
  );
}
