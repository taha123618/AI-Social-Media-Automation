'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Camera, Sparkles, Clock, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  JOB_PHOTO: { label: 'Job Asset', icon: Camera, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  BEFORE_AFTER: { label: 'Transformation', icon: ImageIcon, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  PRODUCT: { label: 'Product Hero', icon: ImageIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

export function UploadWorkflowCard({ workflowId, workflowName, uploadCategory, autoCaption, autoSchedule, platform, lastPostPreview, initialResult }: UploadWorkflowCardProps) {
  const { businessId } = useCurrentBusiness();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<{ id: string; content: string | null; imageUrls: string[] } | null>(initialResult || null);

  const config = CATEGORY_CONFIG[uploadCategory] || CATEGORY_CONFIG.JOB_PHOTO;

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
        toast.success('Images ingested — autonomous draft created!');
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
      className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden text-foreground"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', config.bg, config.border, 'border')}>
            <config.icon className={cn('h-4 w-4', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{workflowName}</h3>
            <p className="text-[11px] text-muted-foreground font-mono">{config.label} ingestion</p>
          </div>
          <div className="flex items-center gap-1">
            {autoCaption && <Badge variant="outline" className="text-[9px] font-mono py-0 text-primary border-primary/30">Vision</Badge>}
            {autoSchedule && <Badge variant="outline" className="text-[9px] font-mono py-0 text-emerald-500 border-emerald-500/30">Auto</Badge>}
          </div>
        </div>

        {/* Upload drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`upload-input-${workflowId}`)?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed transition-all cursor-pointer text-center',
            isDragOver
              ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
              : 'border-border/80 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40'
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
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}

          <div>
            {files.length > 0 ? (
              <p className="text-xs font-semibold text-emerald-500">
                {files.length} {files.length === 1 ? 'image' : 'images'} selected
              </p>
            ) : (
              <>
                <p className="text-xs font-semibold text-foreground">
                  {isDragOver ? 'Drop images here' : 'Drop images or browse'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Synthesizes caption {autoSchedule ? '& queues automatically' : ''}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Result preview */}
        {result && (
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-500 font-mono text-[10px] uppercase">Draft Created</span>
              <button onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {result.content && (
              <p className="text-xs text-muted-foreground line-clamp-2">{result.content}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('edit-content', { detail: { content: result } }))}
              className="w-full h-7 text-xs rounded-lg gap-1 text-primary"
            >
              <span>Inspect Draft</span>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
