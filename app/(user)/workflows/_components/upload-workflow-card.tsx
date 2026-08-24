'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Camera, Sparkles, Clock, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCurrentBusiness } from '@/hooks/use-current-business';

interface UploadWorkflowCardProps {
  workflowId: string;
  workflowName: string;
  uploadCategory: 'JOB_PHOTO' | 'BEFORE_AFTER' | 'PRODUCT';
  autoCaption: boolean;
  autoSchedule: boolean;
  platform: string;
  lastPostPreview?: string | null;
  initialResult?: { id: string; content: string | null; imageUrls: string[] } | null;
}

const CATEGORY_CONFIG = {
  JOB_PHOTO: { label: 'Job Photo', icon: Camera, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  BEFORE_AFTER: { label: 'Before & After', icon: ImageIcon, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  PRODUCT: { label: 'Product', icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
};

export function UploadWorkflowCard({ workflowId, workflowName, uploadCategory, autoCaption, autoSchedule, platform, lastPostPreview, initialResult }: UploadWorkflowCardProps) {
  const { businessId } = useCurrentBusiness();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ id: string; content: string | null; imageUrls: string[] } | null>(initialResult || null);

  const config = CATEGORY_CONFIG[uploadCategory];

  const handleUpload = useCallback(async (uploadFiles: File[]) => {
    if (!businessId || !workflowId) return;
    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('workflowId', workflowId);
      for (const f of uploadFiles) {
        formData.append('images', f);
      }

      const res = await fetch('/api/workflows/upload-trigger', {
        method: 'POST',
        headers: { 'x-business-id': businessId },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.draft);
        setFiles([]);
        toast.success('Images uploaded — draft created!');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setIsDragOver(false);
    }
  }, [businessId, workflowId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length) {
      setFiles(droppedFiles);
      handleUpload(droppedFiles);
    }
  }, [handleUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (selected.length) {
      setFiles(selected);
      handleUpload(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl', config.bg)}>
            <config.icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{workflowName}</h3>
            <p className="text-xs text-slate-500 font-medium">{config.label} upload</p>
          </div>
          <div className="flex items-center gap-1.5">
              {autoCaption && <Sparkles className="h-3.5 w-3.5 text-purple-500" aria-label="Auto-caption enabled" />}
            {autoSchedule && <Clock className="h-3.5 w-3.5 text-blue-500" aria-label="Auto-schedule enabled" />}
          </div>
        </div>

        {/* Last post preview */}
        {lastPostPreview && !result && (
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="text-xs text-slate-500 truncate">Last published: {lastPostPreview.slice(0, 60)}</span>
          </div>
        )}

        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`upload-input-${workflowId}`)?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer',
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50',
          )}
        >
          <input
            id={`upload-input-${workflowId}`}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          ) : (
            <Upload className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          )}
          <div className="text-center">
            {files.length > 0 ? (
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {files.length} {files.length === 1 ? 'image' : 'images'} selected
              </p>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {isDragOver ? 'Drop images here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Photos will be captioned{autoSchedule ? ' and scheduled' : ''} automatically
                </p>
              </>
            )}
          </div>
        </div>

        {/* Upload result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Draft created</span>
              </div>
              <button onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            {result.content && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{result.content}</p>
            )}
            <div className="flex gap-2">
              {result.imageUrls.slice(0, 3).map((url, i) => {
                const previewUrl = url.startsWith('pending://')
                  ? `/api/social/proxy-image?url=${encodeURIComponent(url)}`
                  : url;
                return (
                  <div key={i} className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                );
              })}
            </div>
            <Button
              size="sm"
              onClick={() => window.open(`/posts/edit/${result.id}`, '_blank')}
              className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              Edit Draft
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
