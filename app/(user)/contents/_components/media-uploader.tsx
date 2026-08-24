'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  previewUrl?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  errorMessage?: string;
  publicUrl?: string;
}

interface MediaUploadProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  folder?: string;
}

export function MediaUploader({
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  folder = 'uploads'
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: MediaFile[] = Array.from(fileList)
      .filter(file => acceptedTypes.includes(file.type))
      .slice(0, maxFiles - files.length)
      .map(file => ({
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
        uploadProgress: 0,
        status: 'pending' as const
      }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const uploadFile = async (mediaFile: MediaFile) => {
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id ? { ...f, status: 'uploading', uploadProgress: 10 } : f
      ));

      // Request presigned URL from API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: mediaFile.file.name,
          contentType: mediaFile.file.type,
          fileSize: mediaFile.file.size,
          folder
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { data: { uploadUrl, publicUrl } } = await response.json();

      // Simulate upload progress (in real implementation, use actual upload)
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id ? { ...f, uploadProgress: 50 } : f
      ));

      // Upload to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: mediaFile.file,
        headers: {
          'Content-Type': mediaFile.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Complete
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id ? {
          ...f,
          status: 'uploaded',
          uploadProgress: 100,
          publicUrl
        } : f
      ));

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f =>
        f.id === mediaFile.id ? {
          ...f,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));
    }
  };

  const handleUploadAll = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const file of pendingFiles) {
      await uploadFile(file);
    }

    // Notify parent component when all uploads complete
    const uploadedFiles = files.filter(f => f.status === 'uploaded');
    if (onUploadComplete && uploadedFiles.length > 0) {
      setTimeout(() => onUploadComplete(uploadedFiles), 500);
    }
  }, [files, onUploadComplete]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const hasPendingFiles = files.some(f => f.status === 'pending');
  const hasUploadedFiles = files.some(f => f.status === 'uploaded');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Drop photos here or click to upload
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Support for JPEG, PNG, GIF, WebP • Max 10MB each
        </p>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {files.map((mediaFile) => (
              <motion.div
                key={mediaFile.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {/* Preview */}
                <div className="aspect-square relative">
                  {mediaFile.previewUrl ? (
                    <img
                      src={mediaFile.previewUrl}
                      alt={mediaFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                      <FileText className="h-12 w-12 text-slate-400" />
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {mediaFile.status === 'uploaded' && (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    )}
                    {mediaFile.status === 'error' && (
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    )}
                    {mediaFile.status === 'uploading' && (
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    )}
                  </div>

                  {/* Remove Button */}
                  {mediaFile.status !== 'uploading' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(mediaFile.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {mediaFile.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mediaFile.uploadProgress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                )}

                {/* Filename */}
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {mediaFile.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {hasPendingFiles && (
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setFiles([])}
            className="px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Clear All
          </button>
          <button
            onClick={handleUploadAll}
            disabled={!hasPendingFiles}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Upload {files.filter(f => f.status === 'pending').length} File{files.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Success Message */}
      {hasUploadedFiles && !hasPendingFiles && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="font-medium text-green-900 dark:text-green-200">
              {files.filter(f => f.status === 'uploaded').length} file{files.filter(f => f.status === 'uploaded').length !== 1 ? 's' : ''} uploaded successfully!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
