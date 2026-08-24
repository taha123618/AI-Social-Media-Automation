'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  MessageSquare,
  Share2,
  Copy,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { PostListItem } from '@/features/social/types/social-posting.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickViewDialogProps {
  post: PostListItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (post: PostListItem) => void;
  onDelete: (id: string) => void;
  onReschedule: (post: PostListItem) => void;
}

export function QuickViewDialog({
  post,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  onReschedule
}: QuickViewDialogProps) {
  if (!post) return null;

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Content Copied", {
      description: "Post content has been copied to your clipboard.",
    });
  };

  const getProxiedUrl = (url: string) => {
    if (!url) return '';
    // Always proxy pending:// URLs or external URLs to avoid CORS/scheme issues
    if (url.startsWith('pending://') || url.startsWith('http')) {
      return `/api/social/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'POSTED':
      case 'PUBLISHED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'SCHEDULED': return <Clock className="w-4 h-4 text-sky-500" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const statusColors: Record<string, string> = {
    POSTED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    SCHEDULED: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    FAILED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[95vw] md:w-[min(1200px,90vw)] h-[85vh] p-0 overflow-hidden rounded-[2.5rem] border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)]">
        <div className="flex h-full flex-col md:flex-row overflow-hidden">
          {/* Left: Media Gallery Panel */}
          <div className="w-full md:w-1/2 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center p-6 md:p-12 border-r border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
            {/* Background Decorative Blur */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
              <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-blue-500/20 blur-[120px] rounded-full" />
              <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-indigo-500/20 blur-[120px] rounded-full" />
            </div>

            {post.mediaUrls && post.mediaUrls.length > 0 ? (
              <div className="relative w-full max-w-lg aspect-square group animate-in fade-in zoom-in duration-700">
                <div className="absolute inset-0 bg-slate-900/10 dark:bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />
                <div className="relative w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-[1.01] transition-transform duration-700">
                  <img
                    src={getProxiedUrl(post.mediaUrls[0])}
                    alt="Post preview"
                    loading='lazy'
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {post.mediaUrls.length > 1 && (
                  <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl text-slate-900 dark:text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-black/5 dark:border-white/10">
                    + {post.mediaUrls.length - 1} Media
                  </div>
                )}
              </div>
            ) : (
                <div className="flex flex-col items-center gap-6 text-slate-300 dark:text-slate-600 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Share2 className="w-10 h-10 opacity-30" />
                </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No Visual Assets</p>
              </div>
            )}
          </div>

          {/* Right: Content & Metadata Details Panel */}
          <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-transparent overflow-y-auto">
            {/* Fixed Header */}
            <div className="p-6 md:p-10 pb-4 md:pb-6 space-y-6 shrink-0">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1 min-w-0">
                  <DialogTitle className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.95] md:leading-[0.9] break-words">
                    {post.title || "Untitled Post"}
                  </DialogTitle>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none shadow-sm", statusColors[post.status])}>
                      <span className="mr-2 opacity-70">{getStatusIcon(post.status)}</span>
                      {post.status}
                    </Badge>

                    {(post.contentJson as any)?.labels?.map((label: string) => (
                      <Badge key={label} variant="ghost" className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-500 dark:text-blue-400 border border-blue-500/10">
                        {label}
                      </Badge>
                    ))}

                    {post.postedAt && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        {format(new Date(post.postedAt), 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 w-12 h-12 transition-all active:scale-90"
                    onClick={() => onEdit(post)}
                  >
                    <Edit3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 w-12 h-12 group transition-all active:scale-90"
                    onClick={() => onDelete(post.id)}
                  >
                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Center Content Area */}
            <ScrollArea className="flex-1" type="always">
              <div className="p-6 md:p-10 pb-10 space-y-10">
                {/* Visual Separator */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                {/* Content Block */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Publication Transcript</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 group rounded-xl"
                      onClick={() => handleCopyContent(post.fullContent || post.content)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2 transition-transform group-active:scale-90" />
                      Copy Content
                    </Button>
                  </div>
                  <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 text-lg lg:text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap overflow-y-auto">
                    {post.fullContent || post.content}
                  </div>
                </div>

                {/* Response / Comment Block */}
                {post.firstComment && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Automated First Response
                    </label>
                    <div className="p-8 bg-amber-500/5 dark:bg-amber-500/10 rounded-[2rem] border border-dashed border-amber-500/20 text-slate-600 dark:text-slate-400 relative">
                      <div className="absolute -top-3 left-8 px-4 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                        Post Synchronized
                       </div>
                      <p className="leading-relaxed italic">
                        "{post.firstComment}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Target Channels Block */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Distribution Nodes</label>
                    <Badge variant="ghost" className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {post.accounts.length || post.platforms.length} Active Targets
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {post.accounts.map((acc) => (
                      <div key={acc.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/20 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all duration-300">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 p-0.5 ring-2 ring-slate-100 dark:ring-slate-800 shrink-0 overflow-hidden">
                           {acc.avatar ? (
                            <img src={getProxiedUrl(acc.avatar)} alt={acc.name} className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                              <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                <Share2 className="w-4 h-4 text-slate-400" />
                              </div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{acc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            {acc.platform}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    ))}

                    {post.accounts.length === 0 && post.platforms.map((platform) => (
                      <div key={platform} className="flex items-center gap-4 p-4 bg-slate-50/30 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                           <Share2 className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{platform}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Channel Pending</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Fixed Footer Actions */}
            <div className="p-6 md:p-10 pt-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98] group"
                onClick={() => onReschedule(post)}
              >
                <Clock className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                Reschedule Distribution
              </Button>
              <Button
                className="w-full sm:w-auto flex-[1.5] rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-2xl dark:shadow-none transition-all active:scale-[0.98] group"
                onClick={() => onEdit(post)}
              >
                Proceed to Studio Editor
                <ExternalLink className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
