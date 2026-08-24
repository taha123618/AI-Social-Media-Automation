'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Calendar, Clock, Image as ImageIcon, Send, X,
  Plus, LayoutGrid, Eye, Settings, Sparkles, BarChart3,
  Smartphone, Monitor, Globe, ChevronRight, CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { PostEditor } from './PostEditor';
import { AIImageModal } from './AIImageModal';
import { SocialPlatformPreview } from './SocialPlatformPreview';
import { getConnectedSocialAccounts, createContentWithSchedule } from '@/app/(user)/posts/actions/post-creation';
import { Platform } from '@/app/generated/prisma/enums';

interface SocialAccount {
  id: string;
  platform: Platform;
  username: string;
  profileImageUrl?: string | null;
  isConnected: boolean;
}

export function PostCreationDashboard({
  preselectedDateTime,
  editId,
  isDuplicate
}: {
  preselectedDateTime: string | null;
  editId?: string;
  isDuplicate?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<SocialAccount[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [aiGeneratedUrls, setAiGeneratedUrls] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [postType, setPostType] = useState<'POST' | 'REEL' | 'STORY'>('POST');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'platforms'>('preview');
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);

  // Parse preselected date time from URL
  useEffect(() => {
    if (preselectedDateTime) {
      try {
        const decoded = decodeURIComponent(preselectedDateTime);
        const [datePart, timePart] = decoded.split(' ');
        if (datePart && timePart) {
          const dateTime = new Date(`${datePart}T${timePart}:00`);
          if (!isNaN(dateTime.getTime())) {
            setScheduledDateTime(dateTime);
          }
        }
      } catch (error) {
        console.error('Error parsing date time:', error);
      }
    }
  }, [preselectedDateTime]);

  // Load accounts
  useEffect(() => {
    async function load() {
      try {
        const accounts = await getConnectedSocialAccounts();
        setConnectedAccounts(accounts);
      } catch (err) {
        toast.error('Failed to load social accounts');
      }
    }
    load();
  }, []);

  // Load existing post for edit/duplicate
  useEffect(() => {
    async function loadEditData() {
      if (!editId || connectedAccounts.length === 0) return;

      setIsLoading(true);
      try {
        const { getPostDraftById } = await import('@/app/(user)/posts/actions/post-creation');
        const draft = await getPostDraftById(editId);
        if (draft) {
          setContent(draft.content);
          setFirstComment(draft.firstComment || '');
          setMediaUrls(draft.mediaUrls);
          setAiGeneratedUrls(draft.mediaUrls);

          if (!isDuplicate && draft.scheduledFor) {
            setScheduledDateTime(new Date(draft.scheduledFor));
          }

          // Map selected account IDs back to account objects
          const selected = connectedAccounts.filter(acc => draft.selectedAccountIds.includes(acc.id));
          setSelectedAccounts(selected);

          toast.success(isDuplicate ? 'Post copied for duplicating' : 'Post loaded for editing');
        }
      } catch (err) {
        console.error('Failed to load edit data:', err);
        toast.error('Failed to load post data');
      } finally {
        setIsLoading(false);
      }
    }
    loadEditData();
  }, [editId, isDuplicate, connectedAccounts]);

  const toggleAccount = (account: SocialAccount) => {
    setSelectedAccounts(prev =>
      prev.find(a => a.id === account.id)
        ? prev.filter(a => a.id !== account.id)
        : [...prev, account]
    );
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);

    const newUrls = newFiles.map(f => URL.createObjectURL(f));
    setMediaUrls(prev => [...prev, ...newUrls]);
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media');
      return;
    }
    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one account');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createContentWithSchedule({
        content: content.trim(),
        firstComment: firstComment.trim(),
        platforms: Array.from(new Set(selectedAccounts.map(a => a.platform))),
        accountIds: selectedAccounts.map(a => a.id),
        intent: 'ENGAGEMENT',
        scheduledFor: scheduledDateTime,
        mediaFiles,
        mediaUrls: aiGeneratedUrls,
        isImmediate: !scheduledDateTime
      });

      if (result.success) {
        toast.success(scheduledDateTime ? 'Post scheduled successfully!' : 'Post published successfully!');
        router.push('/posts');
      } else {
        throw new Error('Failed to create post');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] p-6 lg:p-10">
      <div className="max-w-[1440px] mx-auto">

        {/* Top Navigation */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Create New Post</h1>
              <p className="text-sm text-slate-500 font-medium">Drafting for {selectedAccounts.length || '...'} platforms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-semibold border-slate-200 dark:border-slate-800">
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
            <Button
              onClick={handlePost}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold px-6"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Publish Now
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">

          {/* Main Content Area - Left (Editor) */}
          <div className="col-span-12 lg:col-span-7 space-y-6">

            {/* Account Selector Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Select Destinations</h3>
                <span className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer">Manage Accounts</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {connectedAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account)}
                    className={`group relative flex flex-col items-center gap-2 p-1 transition-all ${selectedAccounts.find(a => a.id === account.id) ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                      }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all overflow-hidden ${selectedAccounts.find(a => a.id === account.id)
                        ? 'border-blue-500 shadow-md scale-105'
                        : 'border-slate-200 dark:border-slate-800 grayscale'
                      }`}>
                      {account.profileImageUrl ? (
                        <img src={account.profileImageUrl} alt={account.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold">
                          {account.username[0]}
                        </div>
                      )}
                      {selectedAccounts.find(a => a.id === account.id) && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-sm border-2 border-white dark:border-slate-900">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold dark:text-slate-300 truncate max-w-[60px] uppercase">{account.platform}</span>
                  </button>
                ))}

                <button className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all">
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Editor Phase */}
            <PostEditor
              content={content}
              onContentChange={setContent}
              firstComment={firstComment}
              onFirstCommentChange={setFirstComment}
              platforms={selectedAccounts}
            />

            {/* Media Area */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold dark:text-white">Media Library</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400"
                    onClick={() => setIsAiModalOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> AI Generator
                  </Button>
                  <label className="cursor-pointer">
                    <input type="file" multiple className="hidden" onChange={handleMediaUpload} accept="image/*,video/*" />
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800" asChild>
                      <span><Plus className="h-4 w-4 mr-2" /> Upload</span>
                    </Button>
                  </label>
                </div>
              </div>

              {mediaUrls.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  <AnimatePresence>
                    {mediaUrls.map((url, idx) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm"
                      >
                        <img src={url} alt="Media" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              // If it's a blob, find index in mediaFiles
                              const isBlob = url.startsWith('blob:');
                              if (isBlob) {
                                const blobIndex = mediaUrls.filter((u, i) => i < idx && u.startsWith('blob:')).length;
                                setMediaFiles(prev => prev.filter((_, i) => i !== blobIndex));
                                URL.revokeObjectURL(url);
                              } else {
                                setAiGeneratedUrls(prev => prev.filter(u => u !== url));
                              }
                              setMediaUrls(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="h-8 w-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold">
                          {idx + 1}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No media uploaded yet</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Drag and drop files here</p>
                </div>
              )}
            </div>

            {/* Post Type Selector (Platform Specific) */}
            <div className="flex items-center gap-4">
              <Button
                variant={postType === 'POST' ? 'default' : 'outline'}
                className="rounded-xl px-6"
                onClick={() => setPostType('POST')}
              >
                Standard Post
              </Button>
              <Button
                variant={postType === 'REEL' ? 'default' : 'outline'}
                className="rounded-xl px-6"
                onClick={() => setPostType('REEL')}
              >
                Reel / Video
              </Button>
              <Button
                variant={postType === 'STORY' ? 'default' : 'outline'}
                className="rounded-xl px-6"
                onClick={() => setPostType('STORY')}
              >
                Story
              </Button>
            </div>

          </div>

          {/* Right Preview Panel */}
          <div className="col-span-12 lg:col-span-5 sticky top-10 self-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">

              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="font-bold dark:text-white text-lg">Live Preview</h3>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-white">
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-10 bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col items-center justify-center min-h-[600px]">
                {selectedAccounts.length > 0 ? (
                  <div className="w-full space-y-12">
                    {/* Show first selected platform preview */}
                    <SocialPlatformPreview
                      platform={selectedAccounts[0].platform}
                      content={content}
                      firstComment={firstComment}
                      mediaUrls={mediaUrls}
                      accountName={selectedAccounts[0].username}
                      postType={postType}
                    />

                    {selectedAccounts.length > 1 && (
                      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <span>And {selectedAccounts.length - 1} other platform{selectedAccounts.length > 2 ? 's' : ''}</span>
                        <Plus className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center opacity-50">
                      <LayoutGrid className="h-10 w-10 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white mb-1">Peek inside the future</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">Select a platform from the left to see how your stunning content will look live.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Footer Stats */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Estimated Reach</span>
                    <span className="font-bold dark:text-white">2.4K - 5.8K</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Engagement Potential</span>
                    <span className="font-bold text-green-500">High (84%)</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* AI Modal */}
        <AIImageModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onSelect={(url) => {
            setAiGeneratedUrls(prev => [...prev, url]);
            setMediaUrls(prev => [...prev, url]);
          }}
        />

      </div>
    </div>
  );
}
