'use client';

import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Edit, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduledPostItem {
  id: string;
  scheduledFor: Date | null;
  createdAt: Date;
  platform: string;
  draft: {
    title?: string | null;
    status: string;
  };
  business: {
    name: string;
  };
  workflow?: {
    name: string;
  } | null;
}

interface PostScheduleListProps {
  scheduledPosts: ScheduledPostItem[];
  currentParams: Record<string, string>;
}

export function PostScheduleList({ scheduledPosts, currentParams }: PostScheduleListProps) {
  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;

    try {
      // TODO: Implement delete API call
      console.log('Deleting post:', postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleEdit = async (postId: string) => {
    // TODO: Implement edit functionality
    console.log('Editing post:', postId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Calendar,
        label: 'Scheduled'
      },
      POSTED: {
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle,
        label: 'Posted'
      },
      FAILED: {
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: XCircle,
        label: 'Failed'
      },
      DRAFT: {
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
        icon: AlertCircle,
        label: 'Draft'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  if (scheduledPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Scheduled Posts</h3>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
          You haven&apos;t created any scheduled posts yet. Create content and schedule it to be published automatically.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Clock className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {scheduledPosts.length} Scheduled {scheduledPosts.length === 1 ? 'Post' : 'Posts'}
          </span>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {scheduledPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Main Content */}
              <div className="flex-1 space-y-3">
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {post.draft.title || 'Untitled Post'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {post.business.name}
                    </p>
                  </div>
                  {getStatusBadge(post.draft.status)}
                </div>

                {/* Schedule Info */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {post.scheduledFor ? format(new Date(post.scheduledFor), 'MMM dd, yyyy') : 'Not scheduled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {post.scheduledFor ? format(new Date(post.scheduledFor), 'hh:mm a') : '--:--'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {post.platform}
                    </span>
                  </div>

                  {post.workflow && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 transition-all hover:scale-105 active:scale-95 shadow-xs">
                        <Zap className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                          {post.workflow.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Created {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(post.id)}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group/edit"
                  title="Edit schedule"
                >
                  <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors group/delete"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
