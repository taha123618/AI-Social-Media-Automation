"use client";
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';

import {
  createContentWithSchedule,
  getConnectedSocialAccounts,
  saveDraft,
  getPostDraftById,
  schedulePost,
  publishPostNow,
} from '../../actions/post-creation';
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';
import { useCurrentBusiness } from '@/hooks/use-current-business';
import { useSession } from '@/lib/auth-client';
import { pollJobStatus } from '@/lib/social-ai-utils';

import { SocialEditor } from '@/components/social/SocialEditor';
import { SocialPlatformPreview } from '@/components/social/SocialPlatformPreview';
import { CommentEditorModal } from '@/components/social/CommentEditorModal';
import { AddMediaModal } from '@/components/social/AddMediaModal';
import { AIAssistModal } from '@/components/social/AIAssistModal';
import { CommentAIAssistModal } from '@/components/social/CommentAIAssistModal';
import { LabelsModal } from '@/components/social/LabelsModal';
import { SchedulingPopover } from '@/components/social/SchedulingPopover';
import { ActivityTab } from './activity-tab';
import { RecommendBestTimeButton } from './recommend-best-time-button';
import { AIIdeasPanel } from '@/components/social/AIIdeasPanel';
import {
  ArrowLeft, Calendar, Wand2, Tag, History, MessageSquare, Eye, Bell, Zap, Sparkles, Lightbulb, TrendingUp, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SocialAccount {
  id: string;
  platform: Platform;
  username: string;
  profileImageUrl?: string | null;
  isConnected: boolean;
  platformId?: string;
}

interface MediaFile {
  file?: File;
  preview: string;
  id: string;
}

interface PostData {
  content: string;
  selectedPlatforms: Platform[];
  selectedAccounts: string[];
  intent: ContentIntent;
  scheduledDateTime: Date | null;
  isImmediate: boolean;
  mediaFiles: MediaFile[];
  postType: 'POST' | 'REEL' | 'STORY';
  labels: string[];
  firstComment: string;
}

const CHARACTER_LIMITS: Record<string, number> = {
  FACEBOOK: 63206,
  INSTAGRAM: 2200,
  TWITTER: 280,
  LINKEDIN: 3000,
  TIKTOK: 150,
  YOUTUBE: 5000,
  MASTODON: 5000,
  BLUESKY: 300,
  PINTEREST: 500,
  GOOGLE_BUSINESS: 1500,
  GOHIGHLEVEL: 5000,
  HUBSPOT: 5000,
  SALESFORCE: 5000,
};

export function EnhancedPostCreation({
  preselectedDateTime,
  editId,
  isDuplicate
}: {
  preselectedDateTime?: string | null;
  editId?: string;
  isDuplicate?: boolean;
}) {
  const router = useRouter();
  const { businessId } = useCurrentBusiness();
  const { data: session } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCommentAIModalOpen, setIsCommentAIModalOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(editId && !isDuplicate ? editId : undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEditMode = !!editId && !isDuplicate;

  const [postData, setPostData] = useState<PostData>({
    content: '',
    selectedPlatforms: [],
    selectedAccounts: [],
    intent: 'ENGAGEMENT',
    scheduledDateTime: preselectedDateTime ? new Date(preselectedDateTime.replace(' ', 'T') + ':00') : null,
    isImmediate: !preselectedDateTime,
    mediaFiles: [],
    postType: 'POST',
    labels: [],
    firstComment: '',
  });

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isAccountConnectedOverride, setIsAccountConnectedOverride] = useState(false);
  const isAccountConnected = socialAccounts.length > 0 || isAccountConnectedOverride;

  const handleAutoSave = useCallback(async () => {
    if (!postData.content.trim()) return;

    setIsSaving(true);
    try {
      const draft = await saveDraft({
        content: postData.content,
        platforms: postData.selectedPlatforms,
        accountIds: postData.selectedAccounts,
        intent: postData.intent,
        mediaFiles: postData.mediaFiles.filter(m => !!m.file).map(m => m.file as File),
        mediaUrls: postData.mediaFiles.filter(m => !m.file).map(m => m.preview),
        firstComment: postData.firstComment,
        labels: postData.labels,
        scheduledFor: postData.scheduledDateTime,
        contentId: currentDraftId
      });
      if (draft && draft.id && !currentDraftId) {
        setCurrentDraftId(draft.id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [postData.content, postData.selectedPlatforms, postData.selectedAccounts, postData.intent, postData.mediaFiles, postData.firstComment, postData.labels, postData.scheduledDateTime, currentDraftId]);

  const handleManualSave = async () => {
    setIsSubmitting(true);
    try {
      await handleAutoSave();
      if (isEditMode) {
        toast.success('Changes saved successfully!');
        // Stay on page so the user can keep editing
      } else {
        toast.success('Draft saved! Redirecting to dashboard...');
        router.push('/posts');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modern React Query for Social Accounts
  const { data: accountsData } = useQuery({
    queryKey: ['social-accounts', businessId],
    queryFn: async () => {
      const accounts = await getConnectedSocialAccounts();
      return accounts;
    },
    enabled: !!businessId,
  });

  useEffect(() => {
    if (accountsData) {
      setSocialAccounts(accountsData);
      // Auto-select first account if none selected
      if (postData.selectedAccounts.length === 0 && accountsData.length > 0) {
        setPostData(prev => ({
          ...prev,
          selectedAccounts: [accountsData[0].id],
          selectedPlatforms: [accountsData[0].platform]
        }));
      }
    }
  }, [accountsData, postData.selectedAccounts.length]);

  // Load draft / edit data via React Query.
  // In edit mode the API endpoint is the primary source; the Server Action is the fallback.
  const { data: draftData, isLoading: isDraftLoading } = useQuery({
    queryKey: ['post-draft', editId, isDuplicate],
    queryFn: async () => {
      if (!editId) return null;

      try {
        // Primary: fetch from the proper edit API (returns clean, pre-formatted data)
        const response = await fetch(`/api/posts/edit/${editId}`);
        if (response.ok) {
          const apiData = await response.json();
          if (apiData.id) {
            return { type: 'API' as const, data: apiData };
          }
        }

        // Fallback: Server Action (handles edge-case business context mismatches)
        const draft = await getPostDraftById(editId);
        if (draft) return { type: 'DRAFT' as const, data: draft };

        throw new Error('No draft data found');
      } catch (err) {
        console.error('Draft query function error:', err);
        throw err;
      }
    },
    enabled: !!editId,
    staleTime: 30 * 1000, // 30 seconds
  });


  useEffect(() => {
    if (!draftData) return;

    const draft = draftData.data;

    // Normalise fields regardless of response source
    let contentText: string;
    let firstComment: string;
    let accountIds: string[];
    let labels: string[];
    let mediaUrls: string[];
    let postType: 'POST' | 'REEL' | 'STORY';

    if (draftData.type === 'API') {
      // New, pre-formatted API response
      contentText = draft.content || '';
      firstComment = draft.firstComment || '';
      accountIds = draft.selectedAccountIds || [];
      labels = draft.labels || [];
      mediaUrls = draft.mediaUrls || [];
      postType = (draft.postType as 'POST' | 'REEL' | 'STORY') || 'POST';
    } else {
      // Server Action response (getPostDraftById)
      contentText = draft.content || '';
      firstComment = draft.firstComment || '';
      accountIds = draft.selectedAccountIds || [];
      labels = draft.labels || [];
      mediaUrls = draft.mediaUrls || [];
      postType = ((draft.contentJson as { postType?: string })?.postType as 'POST' | 'REEL' | 'STORY') || 'POST';
    }

    const existingMedia: MediaFile[] = (mediaUrls || []).map((url: string) => {
      const isPending = url.startsWith('pending://');
      const previewUrl = isPending
        ? `/api/social/proxy-image?url=${encodeURIComponent(url)}`
        : url;
      return {
        preview: previewUrl,
        id: Math.random().toString(36).substring(2, 9),
      };
    });

    setPostData(prev => ({
      ...prev,
      content: contentText,
      firstComment,
      selectedAccounts: accountIds,
      selectedPlatforms: draft.platforms || [],
      scheduledDateTime: draft.scheduledFor ? new Date(draft.scheduledFor) : prev.scheduledDateTime,
      isImmediate: !draft.scheduledFor,
      mediaFiles: existingMedia,
      labels,
      postType,
    }));

    setLastSaved(new Date());
    toast.success(isDuplicate ? 'Post details duplicated' : 'Post loaded — ready to edit');

    if (!contentText && !firstComment && (!mediaUrls || mediaUrls.length === 0)) {
      toast.warning('Draft loaded, but it appears to be empty!');
    }
  }, [draftData, isDuplicate]);

  const handleContentChange = (value: string) => {
    setPostData(prev => ({ ...prev, content: value }));
  };

  const handlePostTypeChange = (type: 'POST' | 'REEL' | 'STORY') => {
    setPostData(prev => ({ ...prev, postType: type }));
  };

  const handleMediaSelect = (files: File[]) => {
    const newMediaFiles: MediaFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setPostData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...newMediaFiles]
    }));
    toast.success(`${files.length} media file(s) added`);
  };

  const handleAIGenerate = async (prompt: string, tone: string, imageUrl?: string) => {
    setIsProcessingAI(true);
    try {
      // Logic for AI generation
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (businessId) {
        headers['x-business-id'] = businessId;
      }

      const response = await fetch('/api/social/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate-content',
          input: { prompt, tone, existingContent: postData.content, imageUrl }
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.text) {
          setPostData(prev => ({ ...prev, content: data.text }));
          setIsAIModalOpen(false);
          toast.success(`Generated ${tone.toLowerCase()} content`);
          setIsProcessingAI(false);
        } else if (data.jobId) {
          toast.info('Task queued... processing');
          pollJobStatus({
            jobId: data.jobId,
            businessId,
            onSuccess: async (result) => {
              if (result.text) {
                setPostData(prev => ({ ...prev, content: result.text }));
                setIsAIModalOpen(false);
                toast.success(`Generated ${tone.toLowerCase()} content`);
              }
            },
            onFinished: () => setIsProcessingAI(false)
          });
        }
      } else {
        throw new Error(data.error || 'AI generation failed');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('AI generation failed');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleCommentAIGenerate = async (prompt: string, tone: string) => {
    setIsProcessingAI(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (businessId) headers['x-business-id'] = businessId;

      const response = await fetch('/api/social/ai/comment', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate-comment',
          input: { prompt, tone, existingContent: postData.content }
        })
      });
      const data = await response.json();
      if (data.success && data.text) {
        await addAIComment(data.text);
        setIsCommentAIModalOpen(false);
        toast.success(`Generated ${tone.toLowerCase()} reply`);
      } else {
        throw new Error(data.error || 'Comment generation failed');
      }
    } catch (error) {
      console.error('Comment generation failed:', error);
      toast.error('Comment generation failed');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAIAction = async (action: string) => {
    setIsProcessingAI(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (businessId) {
        headers['x-business-id'] = businessId;
      }

      const response = await fetch('/api/social/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'refine-content',
          input: { refinement: action, content: postData.content }
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.text) {
          setPostData(prev => ({ ...prev, content: data.text }));
          setIsAIModalOpen(false);
          toast.success(`Content ${action}ed successfully`);
          setIsProcessingAI(false);
        } else if (data.jobId) {
          toast.info('Task queued... refining');
          pollJobStatus({
            jobId: data.jobId,
            businessId,
            onSuccess: async (result) => {
              if (result.text) {
                setPostData(prev => ({ ...prev, content: result.text }));
                setIsAIModalOpen(false);
                toast.success(`Content ${action}ed successfully`);
              }
            },
            onFinished: () => setIsProcessingAI(false)
          });
        }
      } else {
        throw new Error(data.error || 'AI refinement failed');
      }
    } catch (error) {
      console.error('AI refinement failed:', error);
      toast.error('AI refinement failed');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const addAIComment = async (content: string) => {
    if (isCommentModalOpen) {
      setPostData(prev => ({ ...prev, firstComment: prev.firstComment ? prev.firstComment + '\n' + content : content }));
    } else {
      window.dispatchEvent(new CustomEvent('ai-comment-generated', {
        detail: { content, draftId: currentDraftId }
      }));
    }
  };

  const handleAIImageGenerate = async (prompt: string, size: string) => {
    setIsProcessingAI(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (businessId) {
        headers['x-business-id'] = businessId;
      }

      const response = await fetch('/api/social/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate-image',
          input: { prompt, size }
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.imageUrl) {
          await processImageResult(data.imageUrl);
          setIsProcessingAI(false);
        } else if (data.jobId) {
          toast.info('Image generation queued...');
          pollJobStatus({
            jobId: data.jobId,
            businessId,
            onSuccess: async (result) => {
              if (result.imageUrl) {
                await processImageResult(result.imageUrl);
              }
            },
            onFinished: () => setIsProcessingAI(false)
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err) {
      toast.error('AI Image generation failed');
      console.error(err);
    } finally {
      // Don't set false here if polling is active
    }
  };

  const processImageResult = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'ai-generated.png', { type: 'image/png' });

    const newMedia: MediaFile = {
      file,
      preview: imageUrl,
      id: Math.random().toString(36).substr(2, 9),
    };

    setPostData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, newMedia]
    }));

    setIsMediaModalOpen(false);
    toast.success('AI Image generated and added to post');
  };

  const handleSubmit = async (action: 'schedule' | 'post_now' | 'queue') => {
    if (!postData.content.trim() && postData.mediaFiles.length === 0) {
      toast.error('Please enter content or select media for your post');
      return;
    }

    if (postData.selectedAccounts.length === 0) {
      toast.error('Please select at least one social media account');
      return;
    }

    setIsSubmitting(true);
    try {
      await createContentWithSchedule({
        content: postData.content.trim(),
        platforms: postData.selectedPlatforms,
        accountIds: postData.selectedAccounts,
        intent: postData.intent,
        scheduledFor: action === 'schedule' ? postData.scheduledDateTime : null,
        mediaFiles: postData.mediaFiles.filter(m => !!m.file).map(m => m.file as File),
        mediaUrls: postData.mediaFiles.filter(m => !m.file).map(m => m.preview),
        firstComment: postData.firstComment,
        labels: postData.labels,
        isImmediate: action === 'post_now'
      });

      toast.success(`Post ${action.replace('_', ' ')} successfully!`);
      window.dispatchEvent(new CustomEvent('drafts-updated'));
      router.push('/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Edit-mode submit — saves updated content to the existing draft then
   * publishes, schedules, or queues it without creating a new record.
   */
  const handleEditSubmit = async (action: 'schedule' | 'post_now' | 'queue') => {
    if (!postData.content.trim() && postData.mediaFiles.length === 0) {
      toast.error('Please enter content or select media for your post');
      return;
    }

    if (postData.selectedAccounts.length === 0) {
      toast.error('Please select at least one social media account');
      return;
    }

    if (!currentDraftId) {
      toast.error('Unable to find post ID — please refresh and try again.');
      return;
    }

    if (action === 'schedule' && !postData.scheduledDateTime) {
      toast.error('Please pick a scheduled date/time first.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Persist the updated content on the existing draft
      await saveDraft({
        content: postData.content.trim(),
        platforms: postData.selectedPlatforms,
        accountIds: postData.selectedAccounts,
        intent: postData.intent,
        mediaFiles: postData.mediaFiles.filter(m => !!m.file).map(m => m.file as File),
        mediaUrls: postData.mediaFiles.filter(m => !m.file).map(m => m.preview),
        firstComment: postData.firstComment,
        labels: postData.labels,
        scheduledFor: action === 'schedule' ? postData.scheduledDateTime : null,
        contentId: currentDraftId,
      });

      // 2. Execute the chosen action
      if (action === 'post_now') {
        await publishPostNow(currentDraftId);
        toast.success('Post published successfully!');
      } else if (action === 'schedule') {
        await schedulePost(currentDraftId, postData.scheduledDateTime!);
        toast.success(`Post scheduled for ${format(postData.scheduledDateTime!, 'MMM dd, p')}`);
      } else {
        // queue — draft is already saved above
        toast.success('Post saved to queue!');
      }

      window.dispatchEvent(new CustomEvent('drafts-updated'));
      router.push('/posts');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAccount = socialAccounts.find(a => postData.selectedAccounts.includes(a.id));
  const characterLimit = Math.min(...postData.selectedPlatforms.map(p => CHARACTER_LIMITS[p] || 5000));


  return (
    <div className="flex flex-col h-screen bg-slate-50/50 dark:bg-slate-950 relative">

      {isEditMode && isDraftLoading &&
        <div className="absolute inset-0 z-999 flex flex-col items-center justify-center gap-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 rounded-full animate-pulse" />
            <div className="relative p-8 bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700">
              <Wand2 className="h-10 w-10 text-blue-600 animate-bounce" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 tracking-wide">Loading post data…</p>
        </div>

      }
      {/* Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              {isEditMode ? 'Edit Post' : 'Your post'}
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700">
              <span className={`w-2 h-2 rounded-full ${lastSaved ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {isSaving ? 'Saving...' : lastSaved ? 'Saved' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-xl text-slate-500 hover:text-blue-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm" />
          </Button>
          <Button variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <History className="h-5 w-5" />
          </Button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <Button variant="secondary" disabled={isSubmitting || isSaving} className="rounded-xl font-bold px-6 shadow-sm border border-slate-100 dark:border-slate-800" onClick={handleManualSave}>
            {isEditMode ? 'Save Changes' : 'Save to Drafts'}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor Section */}
        <section className="flex-1 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-12 space-y-8">
            <SocialEditor
              content={postData.content}
              onContentChange={handleContentChange}
              firstComment={postData.firstComment}
              onFirstCommentChange={(val) => setPostData(prev => ({ ...prev, firstComment: val }))}
              selectedAccount={selectedAccount}
              postType={postData.postType}
              onPostTypeChange={handlePostTypeChange}
              characterLimit={characterLimit === Infinity ? 5000 : characterLimit}
              onOpenMedia={() => setIsMediaModalOpen(true)}
              onOpenAI={() => setIsAIModalOpen(true)}
              onOpenCommentEditor={() => setIsCommentModalOpen(true)}
              onOpenLabels={() => setIsLabelsModalOpen(true)}
              onOpenAIImage={() => setIsMediaModalOpen(true)}
              mediaFiles={postData.mediaFiles}
              onRemoveMedia={(id) => setPostData(prev => ({ ...prev, mediaFiles: prev.mediaFiles.filter(m => m.id !== id) }))}
              disabled={!isAccountConnected}
              onConnectClick={() => setIsAccountConnectedOverride(true)}
            />

          </div>
        </section>

        {/* Right Side: Preview Section */}
        <aside className="w-[450px] bg-slate-50/30 dark:bg-slate-900/50 flex flex-col border-l border-slate-200 dark:border-slate-800">
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <div className="px-6 border-b border-slate-200">
            <TabsList className="bg-transparent p-0 h-14 w-full justify-start gap-6 border-none">
                <TabsTrigger
                  value="preview"
                  className="px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none font-semibold text-slate-500 data-[state=active]:text-[#050505] transition-all gap-2 pb-1"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none font-semibold text-slate-500 data-[state=active]:text-[#050505] transition-all gap-2 pb-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="ideas"
                  className="px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600 rounded-none font-semibold text-slate-500 data-[state=active]:text-[#050505] transition-all gap-2 pb-1"
                >
                  <Lightbulb className="h-4 w-4" />
                  Ideas
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              <TabsContent value="preview" className="m-0 p-8 ">
                {postData.selectedPlatforms.length > 0 ? (
                  <div className="space-y-12">
                    {postData.selectedPlatforms.map(platform => (
                      <div key={platform} className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700 w-fit">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{platform}</span>
                        </div>
                        <SocialPlatformPreview
                          platform={platform}
                          content={postData.content}
                          firstComment={postData.firstComment}
                          mediaUrls={postData.mediaFiles.map(m => m.preview)}
                          accountName={selectedAccount?.username}
                          accountAvatar={selectedAccount?.profileImageUrl}
                          profileImageUrl={selectedAccount?.profileImageUrl}
                        />
                      </div>
                    ))}
                  </div>
                ) : (postData.content.length > 0 || postData.mediaFiles.length > 0) ? (
                    <div className="space-y-8">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/50 w-fit">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Draft Mode</span>
                      </div>
                      <SocialPlatformPreview
                        platform={'DRAFT' as Platform}
                        content={postData.content}
                        mediaUrls={postData.mediaFiles.map(m => m.preview)}
                        accountName={selectedAccount?.username}
                        accountAvatar={selectedAccount?.profileImageUrl}
                        profileImageUrl={selectedAccount?.profileImageUrl}
                      />
                      <p className="text-[11px] text-center text-slate-400 font-medium px-8 leading-relaxed">
                        Select a social account to see platform-specific optimizations and formatting.
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 rounded-full animate-pulse" />
                        <div className="relative p-10 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-700">
                          <Wand2 className="h-16 w-16 text-blue-600 animate-bounce" />
                        </div>
                      </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Post Studio 👋</h3>
                          <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto font-medium">
                            Start writing or add media in the left panel to see your post come to life!
                          </p>
                        </div>
                        <div className="flex gap-2">
                      {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />)}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="activity" className="m-0 flex flex-col h-full bg-[#f0f2f5]">
                <ActivityTab
                  draftId={currentDraftId}
                  selectedAccount={selectedAccount}
                  onOpenAI={() => setIsCommentAIModalOpen(true)}
                />
              </TabsContent>

              <TabsContent value="ideas" className="m-0 p-6">
                <AIIdeasPanel
                  businessId={businessId || ''}
                  selectedPlatforms={postData.selectedPlatforms.map(p => p.toString())}
                  onSelectIdea={(caption) => {
                    setPostData(prev => ({ ...prev, content: caption }));
                  }}
                />
              </TabsContent>

            </ScrollArea>
          </Tabs>
        </aside>
      </main>

      {/* Footer Floating Action Bar */}
      <footer className="px-12 py-6 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <button
            disabled={!isAccountConnected}
            onClick={() => setIsLabelsModalOpen(true)}
            className={`flex items-center h-11 rounded-xl px-6 font-bold border border-slate-200 dark:border-slate-800 transition-all relative ${!isAccountConnected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Tag className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Labels</span>
            {postData.labels.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                {postData.labels.length}
              </span>
            )}
          </button>

          <SchedulingPopover
            scheduledDateTime={postData.scheduledDateTime}
            onDateTimeChange={(dt) => setPostData(prev => ({ ...prev, scheduledDateTime: dt }))}
          >
            <button disabled={!isAccountConnected} className={`flex items-center h-11 rounded-xl px-6 font-bold border border-slate-200 dark:border-slate-800 transition-all gap-2 ${!isAccountConnected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {mounted && postData.scheduledDateTime ? format(postData.scheduledDateTime, 'MMM dd, p') : 'Pick Time'}
              </span>
            </button>
          </SchedulingPopover>

          <RecommendBestTimeButton
            businessId={businessId}
            onSelectTime={(dt) => setPostData(prev => ({ ...prev, scheduledDateTime: dt }))}
            disabled={!isAccountConnected}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Edit mode: show Schedule as a dedicated button when a time is set */}
          {isEditMode && postData.scheduledDateTime && (
            <Button
              variant="outline"
              onClick={() => handleEditSubmit('schedule')}
              disabled={!isAccountConnected || isSubmitting || (!postData.content.trim() && postData.mediaFiles.length === 0)}
              className="h-11 rounded-xl px-8 border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 font-bold gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Update
            </Button>
          )}
          <Button
            onClick={() => isEditMode ? handleEditSubmit('post_now') : handleSubmit('post_now')}
            disabled={!isAccountConnected || isSubmitting || (!postData.content.trim() && postData.mediaFiles.length === 0)}
            className="h-11 rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-500/20"
          >
            <Zap className="h-4 w-4 fill-current" />
            {isEditMode ? 'Update & Post' : 'Post Now'}
          </Button>
          <Button
            variant="outline"
            onClick={() => isEditMode ? handleEditSubmit('queue') : handleSubmit('queue')}
            disabled={!isAccountConnected || isSubmitting || (!postData.content.trim() && postData.mediaFiles.length === 0)}
            className="h-11 rounded-xl px-8 border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 font-bold gap-2"
          >
            <History className="h-4 w-4" />
            {isEditMode ? 'Save to Queue' : 'Add to Queue'}
          </Button>
        </div>
      </footer>

      <AddMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        postText={postData.content}
        onSelectMedia={handleMediaSelect}
        onGenerateAIImage={handleAIImageGenerate}
      />

      <AIAssistModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleAIGenerate}
        onAction={handleAIAction}
        isProcessing={isProcessingAI}
        mediaFiles={postData.mediaFiles}
        businessId={businessId || undefined}
        userId={session?.user?.id || undefined}
      />

      <CommentAIAssistModal
        isOpen={isCommentAIModalOpen}
        onClose={() => setIsCommentAIModalOpen(false)}
        onGenerate={handleCommentAIGenerate}
        isProcessing={isProcessingAI}
        businessId={businessId || undefined}
      />

      <LabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        selectedLabels={postData.labels}
        onLabelsChange={(labels) => setPostData(prev => ({ ...prev, labels }))}
      />

      <CommentEditorModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        comment={postData.firstComment}
        onCommentChange={(val) => setPostData(prev => ({ ...prev, firstComment: val }))}
        platformLimits={CHARACTER_LIMITS}
        onOpenAI={() => setIsCommentAIModalOpen(true)}
      />
    </div>
  );
}
