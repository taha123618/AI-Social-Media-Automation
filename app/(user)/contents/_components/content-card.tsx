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
  Edit,
  Trash2,
  MoreVertical,
  Share2,
  Loader,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import { ContentDraft } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteContentDraft } from '../actions/mutations';
import { useDeleteContentDraft } from '@/hooks/use-content-draft';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ContentCardProps {
  content: ContentDraft;
  index?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ContentCard({ content, index = 0, isSelected = false, onSelect }: ContentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { mutateAsync: deleteDraftMutation, isPending: isDelPending } = useDeleteContentDraft();
  const menuRef = useRef<HTMLDivElement>(null);

  const isDeleting = isDeletingLocal || isDelPending;

  // Close dropdown when clicking outside
  useClickOutside(menuRef, () => {
    setShowActions(false);
    setShowConfirmDelete(false);
  });

  const handleDelete = async () => {
    setIsDeletingLocal(true);
    try {
      await deleteDraftMutation(content.id);
      toast.success('Content draft deleted successfully');
      // No need for window.dispatchEvent as react-query will magically update the UI
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

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      GENERATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PENDING_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      SCHEDULED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      POSTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return statusColors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: 'h-3.5 w-3.5' };
    switch (status) {
      case 'GENERATED':
        return <Loader {...iconProps} className="h-3.5 w-3.5 animate-spin" />;
      case 'PENDING_REVIEW':
        return <Clock {...iconProps} />;
      case 'APPROVED':
        return <Check {...iconProps} />;
      case 'REJECTED':
        return <X {...iconProps} />;
      case 'SCHEDULED':
        return <Calendar {...iconProps} />;
      case 'POSTED':
        return <Check {...iconProps} />;
      case 'FAILED':
        return <X {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10, scale: 1.01 }}
      className={`group relative flex flex-col h-full rounded-[2.5rem] border ${isSelected ? 'border-blue-500 bg-blue-50/30 dark:border-blue-400 dark:bg-blue-900/20' : 'border-slate-200/60 bg-white/70 dark:border-slate-800/60 dark:bg-slate-900/70'} backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden cursor-pointer`}
      onClick={(e) => {
        // If clicking on a button or action, don't toggle select
        if ((e.target as HTMLElement).closest('button')) return;
        onSelect?.();
      }}
    >
      {/* Selection Indicator */}
      <div className={`absolute top-6 left-6 z-20 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100'}`}>
        {isSelected && <Check className="h-4 w-4 text-white stroke-[4px]" />}
      </div>
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0H100V100H0V0Z" fill="url(#content-grid)" />
          <defs>
            <pattern id="content-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
        </svg>
      </div>

      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px] transition-all duration-700 group-hover:bg-blue-500/10 group-hover:scale-125" />

      {/* Action dropdown  */}
      <div ref={menuRef}>

        {showConfirmDelete ? (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-[1.5rem] border border-rose-200/60 bg-white backdrop-blur-xl p-5 shadow-3xl dark:border-rose-800/60 dark:bg-slate-900/90"
          >
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                  <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Confirm Deletion</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to discard <span className="font-semibold text-slate-900 dark:text-white">&quot;{content.title || 'Untitled Content'}&quot;</span>?
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setShowActions(true);
                }}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-linear-to-r from-rose-600 to-rose-700 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:from-rose-700 hover:to-rose-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : showActions ? (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              {[
                { icon: <Eye className="h-4.5 w-4.5" />, label: 'Deep Analysis', onClick: () => window.dispatchEvent(new CustomEvent('view-content-details', { detail: { content } })) },
                {
                  icon: <Edit className="h-4.5 w-4.5" />,
                  label: 'Polish Draft',
                  onClick: () => window.dispatchEvent(new CustomEvent('edit-content', { detail: { content: JSON.parse(JSON.stringify(content)) } })),
                  isPrimary: true
                },
                {
                  icon: isCopied ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Share2 className="h-4.5 w-4.5" />,
                  label: isCopied ? 'Copied!' : 'Copy Content',
                  onClick: handleCopy
                },
                { icon: <Calendar className="h-4.5 w-4.5" />, label: 'Schedule Post', onClick: () => window.dispatchEvent(new CustomEvent('open-scheduler', { detail: { content } })) }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => { action.onClick(); setShowActions(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all group/item disabled:opacity-50 disabled:cursor-not-allowed ${action.isPrimary
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-600/20 dark:text-blue-300 dark:hover:bg-blue-600/30 border border-blue-200/50 dark:border-blue-600/30'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                disabled={isDeleting}
              >
                <div className={`transition-all ${action.isPrimary
                  ? 'text-blue-600 group-hover/item:text-blue-700 group-hover/item:scale-110'
                  : 'text-slate-400 group-hover/item:text-blue-600 group-hover/item:scale-110'
                  }`}>
                  {action.icon}
                </div>
                <span className={action.isPrimary ? 'text-blue-700 dark:text-blue-300' : ''}>
                    {action.label}
                </span>
              </button>
            ))}
            <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
            <button
              onClick={() => { setShowConfirmDelete(true); setShowActions(false); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-all group/del disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Trash2 className="h-4.5 w-4.5 text-rose-400 group-hover/del:text-rose-600 group-hover/del:scale-110 transition-all" />
              )}
              {isDeleting ? 'Deleting...' : 'Discard Draft'}
            </button>
          </motion.div>
        ) : null}
      </div>

      <div className="relative z-10 flex items-start justify-between gap-6 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${getStatusColor(content.status)} shadow-xs`}>
              {getStatusIcon(content.status)}
              {content.status?.replace('_', ' ') || 'DRAFT'}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 px-3 py-1 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-white dark:border-slate-600 shadow-xs">
              {content.intent?.replace('_', ' ') || 'ENGAGEMENT'}
            </div>
            {content.workflow && (
              <div className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 px-3 py-1 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest border border-purple-200 dark:border-purple-800/50 shadow-xs">
                <Zap className="h-3 w-3" />
                {content.workflow.name}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white line-clamp-2 leading-[1.2] tracking-tighter transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {content.title || 'Untitled Content'}
          </h3>
        </div>

        {/* <div className="relative"  */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 transition-all hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-lg dark:hover:bg-slate-700 dark:hover:text-blue-400 dark:hover:border-blue-800 group"
          title="More options"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5 transition-transform group-hover:rotate-90" />
        </button>



        {/* </div> */}
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {content.platforms.map((platform) => (
            <div
              key={platform}
              className="rounded-lg bg-blue-600/5 dark:bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400 border border-blue-500/10"
            >
              {platform}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:rotate-6 transition-transform">
              <Clock className="h-5 w-5 stroke-[2.5px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Generation Date</span>
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight" suppressHydrationWarning>
                {format(new Date(content.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* <Button
            onClick={() => window.dispatchEvent(new CustomEvent('view-content-details', { detail: { content } }))}
            className="group/btn relative flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-110 active:scale-90 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <ChevronRight className="h-7 w-7 stroke-[3px] transition-transform group-hover/btn:translate-x-0.5" />
          </Button> */}
        </div>
      </div>
    </motion.div>
  );
}
