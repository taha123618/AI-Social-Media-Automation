'use client';

import { useState, useRef } from 'react';
import { useClickOutside } from "@/hooks/useClickOutside";
import { format } from 'date-fns';
import {
  Clock,
  Check,
  X,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Share2,
  Loader2,
  Zap,
  Sparkles
} from 'lucide-react';
import { FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { ContentDraft } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeleteContentDraft } from '@/hooks/use-content-draft';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  content: ContentDraft;
  index?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

const PLATFORM_ICONS: Record<string, any> = {
  LINKEDIN: FaLinkedin,
  LINKED_IN: FaLinkedin,
  TWITTER: FaXTwitter,
  X: FaXTwitter,
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebook,
};

export function ContentCard({ content, index = 0, isSelected = false, onSelect }: ContentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { mutateAsync: deleteDraftMutation, isPending: isDelPending } = useDeleteContentDraft();
  const menuRef = useRef<HTMLDivElement>(null);

  const isDeleting = isDeletingLocal || isDelPending;

  useClickOutside(menuRef, () => {
    setShowActions(false);
    setShowConfirmDelete(false);
  });

  const handleDelete = async () => {
    setIsDeletingLocal(true);
    try {
      await deleteDraftMutation(content.id);
      toast.success('Content draft deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete content draft');
    } finally {
      setIsDeletingLocal(false);
      setShowConfirmDelete(false);
    }
  };

  const handleCopy = async () => {
    try {
      const text = typeof content.generatedContent === 'string'
        ? content.generatedContent
        : (content.generatedContent as any)?.text || JSON.stringify(content.generatedContent);

      if (!text) {
        toast.error('No content available to copy');
        return;
      }

      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy content');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'POSTED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">Approved</Badge>;
      case 'SCHEDULED':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono">Scheduled</Badge>;
      case 'PENDING_REVIEW':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-mono">Review</Badge>;
      case 'REJECTED':
      case 'FAILED':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] font-mono">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-secondary text-muted-foreground border-border text-[10px] font-mono">Draft</Badge>;
    }
  };

  const rawText = typeof content.generatedContent === 'string'
    ? content.generatedContent
    : (content.generatedContent as any)?.text || JSON.stringify(content.generatedContent, null, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all shadow-xs hover:shadow-md hover:border-primary/40 overflow-hidden',
        isSelected ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : 'border-border/80'
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect?.();
      }}
    >
      {/* Top selection indicator */}
      <div className={cn(
        'absolute top-4 left-4 z-20 h-5 w-5 rounded-md border flex items-center justify-center transition-all cursor-pointer',
        isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card opacity-0 group-hover:opacity-100'
      )}>
        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
      </div>

      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 pl-6 sm:pl-7">
            {getStatusBadge(content.status)}
            <Badge variant="secondary" className="text-[10px] font-mono font-medium uppercase tracking-wider">
              {content.intent?.replace('_', ' ') || 'ENGAGEMENT'}
            </Badge>
            {content.workflow && (
              <Badge variant="outline" className="text-[10px] font-mono bg-violet-500/10 text-violet-400 border-violet-500/30 gap-1">
                <Zap className="h-2.5 w-2.5" />
                <span>{content.workflow.name}</span>
              </Badge>
            )}
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowActions(!showActions);
                setShowConfirmDelete(false);
              }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Actions menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showConfirmDelete ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-destructive/30 bg-popover/95 backdrop-blur-xl p-4 shadow-xl text-foreground"
                >
                  <h4 className="font-bold text-xs text-destructive mb-1">Delete Draft?</h4>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-tight">
                    This action will permanently remove this draft from the workspace.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 h-7 text-xs rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 h-7 text-xs rounded-lg gap-1"
                    >
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      <span>Delete</span>
                    </Button>
                  </div>
                </motion.div>
              ) : showActions ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-border bg-popover/95 backdrop-blur-xl p-1.5 shadow-xl text-foreground"
                >
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('view-content-details', { detail: { content } }));
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Deep Inspection</span>
                  </button>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('edit-content', { detail: { content: JSON.parse(JSON.stringify(content)) } }));
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Polish Copy</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCopy();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-scheduler', { detail: { content } }));
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Schedule Post</span>
                  </button>

                  <div className="my-1 h-px bg-border/60" />

                  <button
                    onClick={() => {
                      setShowConfirmDelete(true);
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Discard Draft</span>
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors">
          {content.title || 'Untitled Content Draft'}
        </h3>

        {/* Snippet Preview */}
        {rawText && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans mb-4">
            {rawText}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border/60 space-y-2.5">
        {/* Platforms */}
        <div className="flex flex-wrap items-center gap-1.5">
          {content.platforms.map((platform) => {
            const Icon = PLATFORM_ICONS[platform] || Sparkles;
            return (
              <span
                key={platform}
                className="h-6 px-2 rounded-md bg-secondary/50 border border-border/70 text-[10px] font-medium text-foreground flex items-center gap-1"
              >
                <Icon className="h-2.5 w-2.5 text-primary" />
                <span>{platform.slice(0, 4)}</span>
              </span>
            );
          })}
        </div>

        {/* Timestamp & Fast Inspect Action */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono" suppressHydrationWarning>
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            <span>{format(new Date(content.createdAt), 'MMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('view-content-details', { detail: { content } }))}
              className="h-7 px-2 text-xs rounded-md gap-1 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('edit-content', { detail: { content: JSON.parse(JSON.stringify(content)) } }))}
              className="h-7 px-2 text-xs rounded-md gap-1 text-primary hover:bg-primary/10"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
