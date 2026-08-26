'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Loader2, Search, Plus, RefreshCcw,
  TrendingUp, Calendar as CalendarIcon, Filter, MoreVertical,
  Edit2, Trash2, Copy, Eye, BarChart3,
  Sparkles, CheckCircle2, Clock, AlertCircle, MessageSquare, X
} from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter
} from 'react-icons/fa6';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { usePosts, useAnalyticsOverview } from '@/hooks/api-hooks';
import { PostListItem } from '@/features/social/types/social-posting.types';
import { SocialAccountIcons } from '@/components/social/SocialAccountIcons';
import { PostAnalyticsCards } from '@/components/social/PostAnalyticsCards';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { deletePostDraft, duplicatePostDraft, reschedulePostDraft, updatePostStatus, updatePostLabels, togglePostTrash } from './actions/post-creation';
import { QuickViewDialog } from './_components/quick-view-dialog';
import { LabelsModal } from '@/components/social/LabelsModal';
import { Tag as TagIcon } from 'lucide-react';
import { useDeleteContentDraft } from '@/hooks/use-content-draft';

function safeFormatDate(val: any, formatStr: string, fallback = 'Unscheduled'): string {
  if (!val) return fallback;
  const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val;
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return fallback;
  try {
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}

interface PostUI {
  id: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  platforms: string[];
  scheduledFor?: Date;
  postedAt?: Date;
  likes: number;
  comments: number;
  reach: number;
  mediaUrls: string[];
  accounts: any[];
  firstComment?: string;
  fullContent?: string;
  labels: string[];
  isDeleted: boolean;
  rawPost: any;
}

export default function PostsPage() {

  const router = useRouter();
  const { businessId } = useCurrentBusiness();
  const [activeTab, setActiveTab] = useState<'all' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'Trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleIds, setRescheduleIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('12:00');

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const [selectedQuickViewPost, setSelectedQuickViewPost] = useState<PostListItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [labelingPost, setLabelingPost] = useState<{ id: string, labels: string[] } | null>(null);

  const { data: result, isLoading, error, refetch } = usePosts(businessId || '');
  const { data: analyticsData } = useAnalyticsOverview(businessId || '', 30);
  const { mutateAsync: deleteDraftSync } = useDeleteContentDraft();

  const posts = useMemo((): PostUI[] => {
    if (result?.success && result.data?.posts) {
      return result.data.posts.map((post: PostListItem): PostUI => ({

        id: post.id,
        content: post.content,
        status: post.status === 'POSTED' ? 'PUBLISHED' :
               post.status === 'SCHEDULED' ? 'SCHEDULED' :
               post.status === 'FAILED' ? 'FAILED' : 'DRAFT',
        platforms: post.platforms,
        scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : undefined,
        postedAt: post.postedAt ? new Date(post.postedAt) : undefined,
        likes: post?.likes || 0,
        comments: post?.comments || 0,
        reach: post?.reach || 0,
        mediaUrls: post.mediaUrls || [],
        accounts: post.accounts,
        firstComment: post.firstComment,
        fullContent: post.fullContent,
        labels: (post.contentJson as any)?.labels || [],
        isDeleted: (post.contentJson as any)?.isDeleted || false,
        rawPost: post // Keep the original for QuickView
      }));
    }
    return [];
  }, [result]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post: PostUI) => {

      const isTrash = activeTab === 'Trash';
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || post.platforms.includes(selectedPlatform);
      const matchesTab = isTrash ? post.isDeleted : (!post.isDeleted && (activeTab === 'all' || post.status === activeTab));

      return matchesSearch && matchesTab && matchesPlatform;
    });
  }, [posts, searchQuery, activeTab, selectedPlatform]);

  const handleSyncMetrics = async () => {
    setIsSyncing(true);
    const syncPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/social/sync', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
          refetch();
          resolve(data);
        } else {
          reject(new Error(data.error || 'Sync failed'));
        }
      } catch (err) {
        reject(err);
      } finally {
        setIsSyncing(false);
      }
    });

    toast.promise(syncPromise, {
      loading: 'Fetching latest metrics from social platforms...',
      success: (data: any) => `Successfully synchronized ${data.syncedCount} posts!`,
      error: (err) => err.message || 'Metrics sync failed. Please try again later.'
    });
  };

  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };
    window.addEventListener('drafts-updated', handleUpdate);
    window.addEventListener('content-deleted', handleUpdate);
    return () => {
      window.removeEventListener('drafts-updated', handleUpdate);
      window.removeEventListener('content-deleted', handleUpdate);
    };
  }, [refetch]);

  const handleDeletePost = async (id: string, isDeleted: boolean = true) => {
    if (!confirm(isDeleted ? 'Move post to trash?' : 'Permanently delete this post?')) return;

    try {
      if (activeTab === 'Trash') {
        const result = await deleteDraftSync(id);
        if (result) {
          toast.success('Post permanently deleted');
          refetch();
        }
      } else {
        const result = await togglePostTrash(id, true);
        if (result?.success) {
          toast.success('Post moved to trash');
          refetch();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleRestorePost = async (id: string) => {
    try {
      const result = await togglePostTrash(id, false);
      if (result?.success) {
        toast.success('Post restored successfully');
        refetch();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore post');
    }
  };

  const handleLabelsUpdate = async (id: string, labels: string[]) => {
    try {
      const result = await updatePostLabels(id, labels);
      if (result?.success) {
        toast.success('Labels updated');
        refetch();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update labels');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPostIds.length} posts?`)) return;

    toast.info(`Deleting ${selectedPostIds.length} posts...`);

    const results = await Promise.allSettled(
      selectedPostIds.map(id => deletePostDraft(id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.success).length;

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} posts`);
      setSelectedPostIds([]);
      refetch();
    } else {
      toast.error('Failed to delete selected posts');
    }
  };

  const handleBulkDuplicate = async () => {
    toast.info(`Duplicating ${selectedPostIds.length} posts...`);

    const results = await Promise.allSettled(
      selectedPostIds.map(id => duplicatePostDraft(id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.success).length;

    if (successCount > 0) {
      toast.success(`Duplicated ${successCount} posts successfully`);
      setSelectedPostIds([]);
      refetch();
    } else {
      toast.error('Failed to duplicate selected posts');
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedDate || rescheduleIds.length === 0) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes);

    toast.info(`Rescheduling ${rescheduleIds.length} posts...`);

    let successCount = 0;
    for (const id of rescheduleIds) {
      try {
        await reschedulePostDraft(id, scheduledAt);
        successCount++;
      } catch (err) {
        console.error(`Failed to reschedule post ${id}`, err);
      }
    }

    if (successCount > 0) {
      toast.success(`Rescheduled ${successCount} posts to ${safeFormatDate(scheduledAt, 'MMM d, p')}`);
      setIsRescheduleOpen(false);
      setSelectedPostIds([]);
      refetch();
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return { color: 'green', icon: CheckCircle2, label: 'Published' };
      case 'POSTED': return { color: 'green', icon: CheckCircle2, label: 'Published' };
      case 'SCHEDULED': return { color: 'blue', icon: Clock, label: 'Scheduled' };
      case 'FAILED': return { color: 'red', icon: AlertCircle, label: 'Failed' };
      default: return { color: 'slate', icon: Edit2, label: 'Draft' };
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const result = await updatePostStatus(id, newStatus);
      if (result?.success) {
        toast.success(`Status updated to ${newStatus}`);
        refetch();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <FaFacebook className="h-3 w-3" />;
      case 'INSTAGRAM': return <FaInstagram className="h-3 w-3" />;
      case 'LINKEDIN': return <FaLinkedin className="h-3 w-3" />;
      case 'TWITTER':
      case 'X':
        return <FaXTwitter className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Post Management
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
              Multi-Channel
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            Oversee autonomous cross-platform publication, live performance metrics, and campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncMetrics}
            disabled={isSyncing}
            className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5 text-muted-foreground", isSyncing && "animate-spin text-primary")} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </Button>
          <Button
            onClick={() => router.push('/posts/create')}
            size="sm"
            className="h-9 rounded-xl px-4 text-xs font-semibold shadow-xs gap-1.5 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Post</span>
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <PostAnalyticsCards
        stats={{
          totalReach: analyticsData?.data?.impressions || 0,
          engagementRate: parseFloat(analyticsData?.data?.engagementRate || '0'),
          scheduledCount: posts.filter((p: PostUI) => !p.isDeleted && (p.status === 'SCHEDULED' as any)).length,
          growth: analyticsData?.data?.growthNum || 0
        }}
      />

      {/* Filter & Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto no-scrollbar">
          {['all', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'Trash'].map((tab) => {
            const count = posts.filter((p: PostUI) => {
              if (tab === 'Trash') return p.isDeleted;
              if (p.isDeleted) return false;
              if (tab === 'all') return true;
              return p.status === tab;
            }).length;

            const isCurrent = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer',
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
              >
                <span>{tab === 'all' ? 'All Posts' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded-md text-[10px] font-mono',
                  isCurrent
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content, caption, or labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-secondary/30 border-border/70 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['all', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER'].map((p) => (
              <Button
                key={p}
                variant={selectedPlatform === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPlatform(p)}
                className={cn(
                  'h-8 px-2.5 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider',
                  selectedPlatform === p ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p === 'all' ? 'All Platforms' : p}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Loading posts...</p>
                  <p className="text-xs text-muted-foreground">Fetching your social media content</p>
                </div>
              </motion.div>
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="py-4 px-6 w-12 text-center">
                  <Checkbox
                    checked={selectedPostIds.length === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={() => setSelectedPostIds(selectedPostIds.length === filteredPosts.length ? [] : filteredPosts.map(p => p.id))}
                    className="rounded-md border-slate-300"
                  />
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-900 dark:text-white">Content</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-900 dark:text-white">Media</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-900 dark:text-white">Labels</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-900 dark:text-white">Accounts</th>
                <th className="py-4 px-6 text-right text-xs font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence mode="popLayout" initial={false}>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <motion.tr
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="border-b border-slate-50 dark:border-slate-800"
                    >
                      <td className="py-5 px-6 text-center">
                        <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                      </td>
                      <td className="py-5 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                            <div className="w-16 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                          </div>
                          <div className="w-20 h-3 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse ml-5.5" />
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                            <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                            <div className="w-3/4 h-3 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex gap-1.5">
                          <div className="w-12 h-5 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                          <div className="w-16 h-5 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <tr key="empty-state">
                    <td colSpan={7} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <TrendingUp className="h-12 w-12 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-bold text-slate-900 dark:text-white">No campaigns found</p>
                          <p className="text-sm font-medium">Try adjusting your platform or status filters.</p>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl font-bold"
                          onClick={() => { setActiveTab('all'); setSelectedPlatform('all'); setSearchQuery(''); }}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                      <>
                        {filteredPosts?.map((post: any, i: number) => (
                          <motion.tr
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-all"
                          >
                            <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedPostIds.includes(post.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedPostIds(prev => checked ? [...prev, post.id] : prev.filter(id => id !== post.id));
                                }}
                                className="rounded-md border-slate-300"
                              />
                            </td>
                            <td className="py-5 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <div className="space-y-1 group/status cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "h-2.5 w-2.5 rounded-full ring-4 ring-offset-0 transition-all shadow-sm",
                                        post.status === 'PUBLISHED' ? "bg-green-500 ring-green-500/10" :
                                          post.status === 'SCHEDULED' ? "bg-blue-500 ring-blue-500/10" :
                                            post.status === 'FAILED' ? "bg-red-500 ring-red-500/10" : "bg-slate-500 ring-slate-500/10"
                                      )} />
                                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/status:text-blue-600 transition-colors">
                                        {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                                      </span>
                                    </div>
                                    <div
                                       className="text-[11px] font-bold text-slate-400 ml-5.5 pl-0.5 tracking-tight uppercase opacity-60"
                                       suppressHydrationWarning
                                     >
                                       {safeFormatDate(post.postedAt || post.scheduledFor, 'EEE, MMM d, h:mmaaa', 'Unscheduled')}
                                     </div>

                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 p-1 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl z-50">
                                  {['DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'].map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => handleStatusUpdate(post.id, s === 'PUBLISHED' ? 'POSTED' : s)}
                                      className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-3"
                                    >
                                      <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        s === 'PUBLISHED' ? "bg-green-500" :
                                          s === 'SCHEDULED' ? "bg-blue-500" :
                                            s === 'FAILED' ? "bg-red-500" : "bg-slate-500"
                                      )} />
                                      {s}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                            <td className="py-5 px-4 align-top">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  {post.platforms.map((p: any) => (
                                    <div key={p} className="h-5 w-5 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                                      {getPlatformIcon(p)}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-start gap-2">
                                  <p className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed max-w-xs font-medium">
                                    {post.content}
                                  </p>
                                  {post.firstComment && (
                                    <Popover>
                                      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <div className="p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-help group/msg shrink-0 mt-0.5">
                                          <MessageSquare className="h-3.5 w-3.5 text-blue-500 group-hover/msg:scale-110 transition-transform" />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="p-4 rounded-xl border-blue-100 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xl max-w-xs z-[60]">
                                        <div className="space-y-2">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">First Comment Preview</p>
                                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug font-medium italic">"{post.firstComment}"</p>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              {post.mediaUrls && post.mediaUrls.length > 0 ? (
                                <div className="relative group/media">
                                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shrink-0 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                    <img
                                      src={`/api/social/proxy-image?url=${encodeURIComponent(post.mediaUrls[0])}`}
                                      className="h-full w-full object-cover transition-transform group-hover/media:scale-110"
                                      alt="Media preview"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.media-fallback');
                                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                      }}
                                    />
                                    <div className="media-fallback hidden items-center justify-center w-full h-full">
                                      <Plus className="h-4 w-4 text-slate-300 rotate-45" />
                                    </div>
                                  </div>
                                  {post.mediaUrls.length > 1 && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                                      {post.mediaUrls.length}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                                  <Eye className="h-4 w-4 text-slate-200" />
                                  </div>
                              )}
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[120px]">
                                {(post as any).labels?.length > 0 ? (
                                  (post as any).labels.map((L: string) => (
                                    <Badge key={L} variant="ghost" className="h-5 px-2 text-[9px] font-black uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-none rounded-md">
                                      {L}
                                    </Badge>
                                  ))
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLabelingPost({ id: post.id, labels: (post as any).labels || [] });
                                      setIsLabelsModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-300 hover:text-blue-500 transition-all"
                                  >
                                    <TagIcon className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <SocialAccountIcons accounts={post?.accounts} />
                            </td>
                            <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => router.push(`/posts/edit/${post.id}`)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56 p-1 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl z-50">
                                    <DropdownMenuItem onClick={() => router.push(`/posts/create?id=${post.id}&duplicate=true`)} className="h-11 rounded-xl text-sm font-bold gap-3">
                                      <Copy className="h-4 w-4 text-slate-400" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedQuickViewPost((post as any).rawPost); setIsQuickViewOpen(true); }} className="h-11 rounded-xl text-sm font-bold gap-3">
                                      <Eye className="h-4 w-4 text-slate-400" />
                                      Quick Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setLabelingPost({ id: post.id, labels: (post as any).labels || [] });
                                        setIsLabelsModalOpen(true);
                                      }}
                                      className="h-11 rounded-xl text-sm font-bold gap-3"
                                    >
                                      <TagIcon className="h-4 w-4 text-slate-400" />
                                      Manage Labels
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="h-11 rounded-xl text-sm font-bold gap-3">
                                      <Sparkles className="h-4 w-4 text-slate-400" />
                                      Usage in API
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        navigator.clipboard.writeText(post.id);
                                        toast.success('ID copied to clipboard');
                                      }}
                                      className="h-11 rounded-xl text-sm font-bold gap-3 text-slate-600"
                                    >
                                      <Copy className="h-4 w-4 text-slate-400" />
                                      Copy UUID
                                    </DropdownMenuItem>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                                    {post.isDeleted ? (
                                      <DropdownMenuItem onClick={() => handleRestorePost(post.id)} className="h-11 rounded-xl text-sm font-bold gap-3 text-green-500">
                                        <RefreshCcw className="h-4 w-4" />
                                        Restore Post
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleDeletePost(post.id, true)} className="h-11 rounded-xl text-sm font-bold gap-3 text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                                        <Trash2 className="h-4 w-4 shrink-0" />
                                        Move to Trash
                                      </DropdownMenuItem>
                                    )}
                                    {post.isDeleted && (
                                      <DropdownMenuItem onClick={() => handleDeletePost(post.id, false)} className="h-11 rounded-xl text-sm font-bold gap-3 text-red-600 font-black">
                                        <Trash2 className="h-4 w-4" />
                                        Delete Permanently
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                  </>
                )}
              </AnimatePresence>
            </tbody>
          </table>
      </div>

      {/* Floating Action Bar for Selection */}
      <AnimatePresence>
        {selectedPostIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-card/95 backdrop-blur-xl text-foreground rounded-2xl shadow-2xl border border-border/90"
          >
            <div className="flex items-center gap-2 pr-3 border-r border-border/70">
              <Badge variant="default" className="h-6 px-2 text-[11px] font-mono">
                {selectedPostIds.length}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Posts Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDuplicate}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRescheduleIds(selectedPostIds);
                  setIsRescheduleOpen(true);
                }}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 text-primary"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Reschedule</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>

              <button
                onClick={() => setSelectedPostIds([])}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickViewDialog
        post={selectedQuickViewPost}
        isOpen={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        onEdit={(p) => router.push(`/posts/edit/${p.id}`)}
        onDelete={handleDeletePost}
        onReschedule={(p) => {
          setRescheduleIds([p.id]);
          setIsRescheduleOpen(true);
        }}
      />

      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="max-w-sm rounded-[32px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reschedule Posts</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Choose New Date</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Set Posting Time</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button
              variant="outline"
              onClick={() => setIsRescheduleOpen(false)}
              className="rounded-xl h-12 px-6 font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold flex-1"
            >
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        selectedLabels={labelingPost?.labels || []}
        onLabelsChange={(L) => {
          if (labelingPost) {
            handleLabelsUpdate(labelingPost.id, L);
            setLabelingPost({ ...labelingPost, labels: L });
          }
        }}
      />
    </div>
  );
}
