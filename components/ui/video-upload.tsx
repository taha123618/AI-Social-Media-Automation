'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Video, CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedVideo {
  id: string;
  file: File;
  previewUrl: string;
  publicUrl?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  errorMessage?: string;
}

interface VideoUploadProps {
  onVideoUploaded?: (publicUrl: string) => void;
  currentVideo?: string;
  onVideoRemove?: () => void;
  folder?: string;
}

export function VideoUpload({
  onVideoUploaded,
  currentVideo,
  onVideoRemove,
  folder = 'videos'
}: VideoUploadProps) {
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedVideo?.previewUrl) {
        URL.revokeObjectURL(uploadedVideo.previewUrl);
      }
    };
  }, [uploadedVideo?.previewUrl]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileSelect = useCallback(async (file: File) => {
    // Enhanced file validation
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, MOV, WEBM, or OGG)');
      return;
    }

    // Validate file size (100MB limit for video)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size must be less than 100MB');
      return;
    }

    const newVideo: UploadedVideo = {
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    };

    setUploadedVideo(newVideo);
    setIsUploading(true);

    try {
      setUploadedVideo(prev => prev ? { ...prev, status: 'uploading' } : null);

      // Request presigned URL from API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: newVideo.file.name,
          contentType: newVideo.file.type,
          fileSize: newVideo.file.size,
          folder
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { data: { uploadUrl, publicUrl } } = await response.json();

      // Upload to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: newVideo.file,
        headers: {
          'Content-Type': newVideo.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Success
      setUploadedVideo(prev => prev ? {
        ...prev,
        status: 'uploaded',
        publicUrl
      } : null);

      toast.success('Video uploaded successfully!');
      onVideoUploaded?.(publicUrl);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setUploadedVideo(prev => prev ? {
        ...prev,
        status: 'error',
        errorMessage
      } : null);

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [onVideoUploaded, folder]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const removeVideo = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (uploadedVideo?.previewUrl) {
      URL.revokeObjectURL(uploadedVideo.previewUrl);
    }
    setUploadedVideo(null);
    onVideoRemove?.();
  }, [uploadedVideo?.previewUrl, onVideoRemove]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      {!uploadedVideo && !currentVideo ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors bg-purple-500/5 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <Video className="h-12 w-12 mx-auto mb-4 text-purple-500 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold mb-2">Upload Source Video</h3>
          <p className="text-sm text-muted-foreground">
            Click to browse or drag and drop a video here
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports MP4, MOV, WEBM • Max 100MB
          </p>
        </div>
      ) : (
        <div className="relative group">
          <div className="rounded-xl overflow-hidden border border-muted/30 bg-muted/10 shadow-lg">
            <div className="aspect-video relative bg-black/20 flex items-center justify-center">
              <video
                src={uploadedVideo?.previewUrl || currentVideo}
                className="max-h-full max-w-full"
                controls
              />

              {/* Status overlay */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadedVideo?.status === 'uploaded' && (
                  <CheckCircle className="h-12 w-12 text-green-500 scale-125" />
                )}
                {uploadedVideo?.status === 'error' && (
                  <AlertCircle className="h-12 w-12 text-red-500 scale-125" />
                )}
                {uploadedVideo?.status === 'uploading' && (
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Remove button */}
              {!isUploading && (
                <button
                  onClick={removeVideo}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-xl z-20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3">
            {uploadedVideo?.status === 'uploading' && (
              <p className="text-sm text-blue-600 font-medium flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading video...
              </p>
            )}
            {uploadedVideo?.status === 'uploaded' && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Video ready for generation
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
