'use client';

import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, Edit2, Zap, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      console.log('Deleting post:', postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleEdit = async (postId: string) => {
    console.log('Editing post:', postId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'POSTED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-mono gap-1"><CheckCircle2 className="h-3 w-3" /> Posted</Badge>;
      case 'FAILED':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] font-mono gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      case 'SCHEDULED':
      default:
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono gap-1"><Clock className="h-3 w-3" /> Scheduled</Badge>;
    }
  };

  if (scheduledPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/40 text-center">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-xs">
          <Calendar className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">Queue Empty</h3>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          No posts currently waiting for execution. Schedule content from the Content Library or through autonomous workflows.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {scheduledPosts.length} Queued Payload{scheduledPosts.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-3">
        {scheduledPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
            className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Main Content */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      {post.draft.title || 'Untitled Post'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Workspace: {post.business.name}
                    </p>
                  </div>
                  {getStatusBadge(post.draft.status)}
                </div>

                {/* Schedule Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {post.scheduledFor ? format(new Date(post.scheduledFor), 'MMM dd, yyyy') : 'Unscheduled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {post.scheduledFor ? format(new Date(post.scheduledFor), 'hh:mm a') : '--:--'}
                    </span>
                  </div>

                  <Badge variant="secondary" className="text-[10px] font-mono uppercase">
                    {post.platform}
                  </Badge>

                  {post.workflow && (
                    <Badge variant="outline" className="text-[10px] font-mono text-violet-400 border-violet-500/30 gap-1 bg-violet-500/10">
                      <Zap className="h-3 w-3" />
                      <span>{post.workflow.name}</span>
                    </Badge>
                  )}
                </div>

                {/* Metadata */}
                <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                  Ingested {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(post.id)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                  title="Edit schedule"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post.id)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
