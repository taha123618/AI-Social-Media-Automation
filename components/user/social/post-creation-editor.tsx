/**
 * Post Creation Editor Component
 * Rich editor with account selection, content editing, media upload, and preview
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  Button,
  Input,
  Textarea,
  Badge,
  Card,
  Modal,
  Loading,
} from '@/components/ui';
import {
  Image,
  Smile,
  Hash,
  AtSign,
  Send,
  Calendar,
  Zap,
  X
} from 'lucide-react';
import { Platform, ContentIntent } from '@/app/generated/prisma/client';
import { ConnectedAccount, PostContent, CreatePostDraftRequest, ContentTone, SocialPlatform } from '@/features/social/types/social-posting.types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';

interface PostCreationEditorProps {
  draftId?: string;
  onSuccess: () => void;
}

export function PostCreationEditor({ draftId, onSuccess }: PostCreationEditorProps) {
  const { businessId } = useWorkspace();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [content, setContent] = useState<PostContent>({
    text: '',
    hashtags: [],
    mentions: [],
    callToAction: '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [intent, setIntent] = useState<ContentIntent>(ContentIntent.ENGAGEMENT);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date>();
  const [showMediaModal, setShowMediaModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch connected accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['socialAccounts', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('Business ID is required');
      const response = await fetch(`/api/social/accounts`, {
        headers: { 'x-business-id': businessId },
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return (await response.json()).accounts as ConnectedAccount[];
    },
    enabled: !!businessId,
  });

  // Fetch draft data if draftId is provided
  const { data: draftData } = useQuery({
    queryKey: ['draft', draftId],
    queryFn: async () => {
      if (!draftId || !businessId) return null;
      const response = await fetch(`/api/posts/draft/${draftId}`, {
        headers: { 'x-business-id': businessId },
      });
      if (!response.ok) throw new Error('Failed to fetch draft');
      return await response.json();
    },
    enabled: !!draftId && !!businessId,
  });

  // Initialize form with draft data when available
  React.useEffect(() => {
    if (draftData) {
      setContent(prevContent => draftData.contentJson || prevContent);
      setIntent(draftData.intent || ContentIntent.ENGAGEMENT);
      setSelectedAccounts(draftData.socialAccountIds || []);
      if (draftData.mediaUrls) {
        setMediaPreviews(draftData.mediaUrls);
      }
    }
  }, [draftData]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      const uploadedUrls: string[] = [];

      // Upload media files
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload/media', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload media');
        const uploadData = await uploadResponse.json();
        uploadedUrls.push(uploadData.url);
      }

      // Create post draft
      const payload: CreatePostDraftRequest = {
        platforms: [...new Set(selectedAccounts.map((id) => accounts.find((a) => a.id === id)?.platform))].filter(Boolean) as SocialPlatform[],
        socialAccountIds: selectedAccounts,
        contentJson: content,
        mediaUrls: uploadedUrls,
        intent,
        ...(showSchedule && { scheduledFor: scheduledTime }),
      };

      if (!businessId) throw new Error('Business ID is required');
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create post');
      return await response.json();
    },
    onSuccess,
  });

  // Handle media upload
  const handleMediaUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setMediaFiles((prev) => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle hashtag addition
  const addHashtag = (tag: string) => {
    if (!tag.startsWith('#')) tag = '#' + tag;
    if (!content.hashtags?.includes(tag)) {
      setContent((prev) => ({
        ...prev,
        hashtags: [...(prev.hashtags || []), tag],
      }));
    }
  };

  // Handle mention addition
  const addMention = (mention: string) => {
    if (!mention.startsWith('@')) mention = '@' + mention;
    if (!content.mentions?.includes(mention)) {
      setContent((prev) => ({
        ...prev,
        mentions: [...(prev.mentions || []), mention],
      }));
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 bg-linear-to-br from-slate-50 to-slate-100">
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Content Editor */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {/* Account Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Social Media Accounts
              </label>
              <div className="flex flex-wrap gap-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccounts((prev) =>
                        prev.includes(account.id) ? prev.filter((id) => id !== account.id) : [...prev, account.id]
                      );
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedAccounts.includes(account.id)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                  >
                    <span>{getPlatformEmoji(account.platform)}</span>
                    {account.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Intent Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Content Intent
              </label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value as ContentIntent)}
                className="w-full p-3 border border-slate-300 rounded-lg"
              >
                {Object.values(ContentIntent).map((intentOption) => (
                  <option key={intentOption} value={intentOption}>
                    {intentOption.charAt(0) + intentOption.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Content */}
            <div className="mb-6">
              <Textarea
                value={content.text || ''}
                onChange={(e) => setContent({ ...content, text: e.target.value })}
                placeholder="Write your post content here..."
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-lg"
              />
              <div className="mt-2 text-xs text-slate-500">
                {content.text?.length || 0} / 5000 characters
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="mb-6 flex gap-2 pb-6 border-b border-slate-200">
              <button
                title="Bold"
                className="p-2 hover:bg-slate-100 rounded font-bold"
                onClick={() => setContent({ ...content, text: `${content.text || ''}**text**` })}
              >
                B
              </button>
              <button
                title="Italic"
                className="p-2 hover:bg-slate-100 rounded italic"
                onClick={() => setContent({ ...content, text: `${content.text || ''}*text*` })}
              >
                I
              </button>
              <div className="h-6 border-l border-slate-300 mx-2" />
              <button
                title="Add Hashtag"
                className="p-2 hover:bg-slate-100 rounded flex items-center gap-1"
                onClick={() => setShowAIAssistant(true)}
              >
                <Hash size={16} />
                Hashtags
              </button>
              <button
                title="Add Mention"
                className="p-2 hover:bg-slate-100 rounded flex items-center gap-1"
                onClick={() => {
                  const mention = prompt('Enter mention (@username):');
                  if (mention) addMention(mention);
                }}
              >
                <AtSign size={16} />
                Mention
              </button>
              <button
                title="Add Emoji"
                className="p-2 hover:bg-slate-100 rounded"
                onClick={() => setContent({ ...content, text: `${content.text || ''} 😊` })}
              >
                <Smile size={16} />
              </button>
            </div>

            {/* Hashtags & Mentions Display */}
            {(content.hashtags?.length || 0) > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {content.hashtags?.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        setContent({
                          ...content,
                          hashtags: content.hashtags?.filter((_, i) => i !== idx),
                        });
                      }}
                    >
                      {tag} <X size={12} className="ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Media Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Media</label>
              <div
                className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setShowMediaModal(true)}
                onKeyDown={(e) => e.key === 'Enter' && setShowMediaModal(true)}
                role="button"
                tabIndex={0}
              >
                <img src="/icons/upload.svg" alt="Upload icon" width={24} height={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e.target.files)}
                />
              </div>

              {/* Media Previews */}
              {mediaPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {mediaPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img src={preview} alt={`Media preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Call to Action</label>
              <Input
                type="text"
                value={content.callToAction || ''}
                onChange={(e) => setContent({ ...content, callToAction: e.target.value })}
                placeholder="e.g., Shop Now, Learn More, Sign Up"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview & Actions */}
        <div className="col-span-1">
          {/* Preview */}
          <Card className="mb-6 p-6 bg-white border border-slate-200">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Preview</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {accounts[0]?.name?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{accounts[0]?.name}</p>
                    <p className="text-xs text-slate-500">now</p>
                  </div>
                </div>

                {/* Preview Content */}
                <p className="text-sm text-slate-700 mb-3 line-clamp-3">{content.text}</p>

                {/* Preview Media */}
                {mediaPreviews.length > 0 && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-slate-200">
                    <img src={mediaPreviews[0]} alt="Post media preview" className="w-full h-40 object-cover" />
                  </div>
                )}

                {/* Preview Engagement */}
                <div className="flex gap-4 text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>👍 116</span>
                  <span>💬 0</span>
                  <span>↗️ 0</span>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2"
              onClick={() => setShowAIAssistant(true)}
            >
              <Zap size={16} />
              AI Assistant
            </Button>

            {/* Scheduling */}
            <Button
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <Calendar size={16} />
              {showSchedule ? 'Now' : 'Schedule'}
            </Button>

            {showSchedule && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="datetime-local"
                  onChange={(e) => setScheduledTime(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => createPostMutation.mutate()}
                disabled={selectedAccounts.length === 0 || !content.text || createPostMutation.isPending}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {createPostMutation.isPending ? <Loading /> : <Send size={16} />}
                {showSchedule ? 'Schedule Post' : 'Post Now'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Save draft logic here
                  const draftPayload = {
                    contentJson: content,
                    socialAccountIds: selectedAccounts,
                    intent,
                    mediaUrls: mediaPreviews,
                  };
                  // API call to save/update draft
                  if (!businessId) throw new Error('Business ID is required');
                  fetch(`/api/posts/draft${draftId ? `/${draftId}` : ''}`, {
                    method: draftId ? 'PUT' : 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-business-id': businessId,
                    },
                    body: JSON.stringify(draftPayload),
                  }).then(() => {
                    onSuccess();
                  }).catch(() => {
                    // Handle error silently in production
                  });
                }}
              >
                {draftId ? 'Update Draft' : 'Save as Draft'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                Add to Queue
              </Button>
            </div>
          </Card>

          {/* Engagement Metrics Preview */}
          <Card className="p-6 bg-white border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Estimated Metrics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Expected Reach</p>
                <p className="text-lg font-semibold text-slate-900">–</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Engagement Rate</p>
                <p className="text-lg font-semibold text-slate-900">–</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Best Time to Post</p>
                <p className="text-lg font-semibold text-slate-900">–</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistantModal
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Media Upload Modal */}
      {showMediaModal && (
        <Modal open={showMediaModal} onOpenChange={(open) => !open && setShowMediaModal(false)}>
          <div className="space-y-4">
            <div
              className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <Image size={32} className="mx-auto mb-4 text-slate-400" aria-label="Upload icon" />
              <p className="text-sm text-slate-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">PNG, JPG, GIF, MP4 up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  handleMediaUpload(e.target.files);
                  setShowMediaModal(false);
                }}
              />
            </div>

            {/* Media Preview in Modal */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {mediaPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt="Media preview" className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMediaModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowMediaModal(false)}
                className="flex-1 bg-blue-600 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// AI Assistant Modal
function AIAssistantModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<ContentTone>(ContentTone.CASUAL);

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">What would you like to write about?</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write about a social media strategy for a small-medium business"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as ContentTone)} className="w-full p-3 border border-slate-300 rounded-lg">
            {Object.values(ContentTone).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <Button className="w-full bg-blue-600 text-white">Generate</Button>
      </div>
    </Modal>
  );
}

function getPlatformEmoji(platform: Platform): string {
  const emojis: Record<Platform, string> = {
    FACEBOOK: '📘',
    INSTAGRAM: '📷',
    TWITTER: '𝕏',
    TIKTOK: '🎵',
    YOUTUBE: '▶️',
    LINKEDIN: '💼',
    MASTODON: '🐘',
    BLUESKY: '🦋',
    PINTEREST: '📌',
    GOOGLE_BUSINESS: '🏢',
    GOHIGHLEVEL: '🎯',
    HUBSPOT: '🧡',
    SALESFORCE: '☁️',
  };
  return emojis[platform] || '📱';
}

export default PostCreationEditor;
