'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  publicUrl?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  errorMessage?: string;
}
interface ImageUploadProps {
  onImageUploaded?: (publicUrl: string) => void;
  currentImage?: string;
  onImageRemove?: () => void;
  folder?: string;
  businessId?: string;
  userId?: string;
}

export function ImageUpload({
  onImageUploaded,
  currentImage,
  onImageRemove,
  folder = 'uploads',
  businessId,
  userId
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedImage?.previewUrl) {
        URL.revokeObjectURL(uploadedImage.previewUrl);
      }
    };
  }, [uploadedImage?.previewUrl]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileSelect = useCallback(async (file: File) => {
    // Reset any previous image load errors
    setImageLoadError(false);

    // Enhanced file validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const validateDimensions = () => {
      URL.revokeObjectURL(img.src); // Cleanup temporary URL
      if (img.width < 100 || img.height < 100) {
        toast.error('Image must be at least 100x100 pixels');
        return false;
      }
      if (img.width > 4096 || img.height > 4096) {
        toast.error('Image dimensions must not exceed 4096x4096 pixels');
        return false;
      }
      return true;
    };

    img.onload = () => {
      if (validateDimensions()) {
        proceedWithUpload();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      toast.error('Invalid or corrupted image file');
    };

    img.src = URL.createObjectURL(file);

    const proceedWithUpload = () => {
      const newImage: UploadedImage = {
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending'
      };

      setUploadedImage(newImage);

      // Inline the upload logic to avoid useCallback dependency issues
      setIsUploading(true);

      (async () => {
        try {
          // Update status to uploading
          setUploadedImage(prev => prev ? { ...prev, status: 'uploading' } : null);

          // Request presigned URL from API
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: newImage.file.name,
              contentType: newImage.file.type,
              fileSize: newImage.file.size,
              folder,
              businessId,
              userId
            })
          });

          if (!response.ok) {
            throw new Error('Failed to get upload URL');
          }

          const { data: { uploadUrl, publicUrl } } = await response.json();

          // Upload to S3 using presigned URL
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: newImage.file,
            headers: {
               'Content-Type': newImage.file.type,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }

          // Success
          setUploadedImage(prev => prev ? {
            ...prev,
            status: 'uploaded',
            publicUrl
          } : null);

          toast.success('Image uploaded successfully!');
          onImageUploaded?.(publicUrl);

        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';

          setUploadedImage(prev => prev ? {
            ...prev,
            status: 'error',
            errorMessage
          } : null);

          toast.error(errorMessage);
        } finally {
          setIsUploading(false);
        }
      })();
    };
  }, [onImageUploaded, folder, businessId, userId]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const removeImage = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setImageLoadError(false); // Reset image load error when removing image
    onImageRemove?.();
  }, [uploadedImage?.previewUrl, onImageRemove]);

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
      {!uploadedImage && !currentImage ? (
        // Upload area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-primary/5 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold mb-2">Upload Reference Image</h3>
          <p className="text-sm text-muted-foreground">
            Click to browse or drag and drop an image here
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports JPEG, PNG, GIF, WebP • Max 10MB
          </p>
        </div>
      ) : (
        // Preview area
        <div className="relative group">
          <div className="rounded-xl overflow-hidden border border-muted/30 bg-muted/10 shadow-lg">
            <div className="aspect-video relative">
              <img
                src={uploadedImage?.previewUrl || currentImage}
                alt="Reference image"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  setImageLoadError(true);
                }}
              />

              {/* Status overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadedImage?.status === 'uploaded' && (
                  <CheckCircle className="h-12 w-12 text-green-500 scale-125 transition-transform" />
                )}
                {uploadedImage?.status === 'error' && (
                  <AlertCircle className="h-12 w-12 text-red-500 scale-125 transition-transform" />
                )}
                {uploadedImage?.status === 'uploading' && (
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Remove button */}
              {!isUploading && (
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-xl z-20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status text */}
          <div className="mt-3">
            {currentImage && !uploadedImage && (
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Current reference image
              </p>
            )}
            {imageLoadError && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Failed to load reference image
              </p>
            )}
            {uploadedImage?.status === 'error' && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {uploadedImage.errorMessage}
              </p>
            )}
            {uploadedImage?.status === 'uploaded' && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Image uploaded successfully
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
