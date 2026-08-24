'use client';

import { format } from 'date-fns';
import { X, Clock, Check, AlertCircle, ExternalLink, Calendar, User, Briefcase, Share2, Eye, Edit3, Trash2, CalendarOff, Loader } from 'lucide-react';
import { ScheduledContent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { updateSchedule, deleteContentDraft } from '../../contents/actions/mutations';
import { toast } from 'sonner';

interface ScheduledContentModalProps {
  content: ScheduledContent;
  onClose: () => void;
}

export function ScheduledContentModal({ content, onClose }: ScheduledContentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUnschedule = async () => {
    setIsUpdating(true);
    try {
      await updateSchedule(content.id, null);
      toast.success('Content unscheduled successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to unschedule content');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this content?')) return;
    setIsDeleting(true);
    try {
      await deleteContentDraft(content.id);
      toast.success('Content deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete content');
    } finally {
      setIsDeleting(false);
    }
  };
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      POSTED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      FAILED: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return statusColors[status] || 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: 'h-3.5 w-3.5' };
    switch (status) {
      case 'SCHEDULED':
        return <Clock {...iconProps} />;
      case 'POSTED':
        return <Check {...iconProps} />;
      case 'FAILED':
        return <AlertCircle {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="flex items-start justify-between p-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                {content.title || 'Untitled Content'}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(content.status)}`}>
                  {getStatusIcon(content.status)}
                  {content.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {content?.intent?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-8 pb-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-1.5">
                    <Share2 className="h-3 w-3" /> Platforms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {content.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Scheduled For
                    </h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {content.scheduledFor ? format(new Date(content.scheduledFor), 'PPP p') : 'Not scheduled'}
                    </p>
                  </div>
                  {content.postedAt && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2 flex items-center gap-1.5">
                        <Check className="h-3 w-3" /> Posted At
                      </h3>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {format(new Date(content.postedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Metadata
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-500">Creator</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{content.creator.name || content.creator.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3" /> Business
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{content.business.name}</span>
                    </div>
                  </div>
                </div>

                {content.posts.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Published Posts</h3>
                    <div className="space-y-2">
                      {content.posts.map((post) => (
                        <div key={post.id} className="group/post flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 transition-colors hover:border-blue-200">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {post.platform}
                            </span>
                            {post.postedAt && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {format(new Date(post.postedAt), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          {post.externalPostId && (
                            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleUnschedule}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-all hover:bg-amber-50 hover:text-amber-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
              >
                {isUpdating ? <Loader className="h-4 w-4 animate-spin" /> : <CalendarOff className="h-4 w-4" />}
                Unschedule
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-rose-50 text-sm font-bold text-rose-600 transition-all hover:bg-rose-600 hover:text-white active:scale-95 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white"
              >
                {isDeleting ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
