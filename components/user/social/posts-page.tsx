/**
 * Posts Page - List all posts with tab filtering
 * UI matches the provided screenshots
 */

'use client';

import React, { useState } from 'react';
import { Badge, Button, Input, Loading, Modal } from '@/components/ui';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import { ContentStatus, Platform } from '@/app/generated/prisma/client';
import { ListPostsResponse, PostListItem, SocialPlatform } from '@/features/social/types/social-posting.types';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import Image from 'next/image';

type TabType = 'ALL' | 'DRAFTS' | 'SCHEDULED' | 'PUBLISHED' | 'TRASH';

export function PostsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | SocialPlatform | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const { businessId } = useWorkspace();

  const statusMap: Record<TabType, ContentStatus | undefined> = {
    ALL: undefined,
    DRAFTS: ContentStatus.DRAFT,
    SCHEDULED: ContentStatus.SCHEDULED,
    PUBLISHED: ContentStatus.POSTED,
    TRASH: undefined, // Would need a separate endpoint
  };

  // Fetch posts
  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['posts', activeTab, skip, take, searchQuery, selectedPlatform],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        take: take.toString(),
        ...(statusMap[activeTab] && { status: statusMap[activeTab] }),
        ...(selectedPlatform !== 'ALL' && { platform: selectedPlatform }),
        ...(searchQuery && { search: searchQuery }),
      });

      if (!businessId) throw new Error('Business ID is required');
      const response = await fetch(`/api/posts?${params.toString()}`, {
        headers: {
          'x-business-id': businessId,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch posts');
      return (await response.json()) as ListPostsResponse;
    },
    enabled: !!businessId,
  });

  // Status badge styling
  const getStatusColor = (status: ContentStatus) => {
    const colors: Record<ContentStatus, string> = {
      DRAFT: 'bg-gray-500',
      PENDING_REVIEW: 'bg-yellow-500',
      APPROVED: 'bg-blue-500',
      REJECTED: 'bg-red-500',
      SCHEDULED: 'bg-purple-500',
      POSTED: 'bg-green-500',
      FAILED: 'bg-red-600',
      GENERATED: 'bg-indigo-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  // Platform badge styling
  const getPlatformIcon = (platform: Platform) => {
    const icons: Record<Platform, string> = {
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
      GOHIGHLEVEL: '🚀',
      HUBSPOT: '🧡',
      SALESFORCE: '☁️',
    };
    return icons[platform] || '📱';
  };

  return (
    <div className="w-full h-full bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Posts</h1>
              <p className="text-slate-600 mt-2">Manage all your social media posts</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Post
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['ALL', 'DRAFTS', 'SCHEDULED', 'PUBLISHED', 'TRASH'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSkip(0);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => {
                  setSearchQuery(e.target.value);
                  setSkip(0);
                }}
                className="pl-10 py-2"
              />
            </div>
            <Select
              value={selectedPlatform}
              onValueChange={(value: string) => {
                setSelectedPlatform(value as Platform | SocialPlatform | 'ALL');
                setSkip(0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Platforms</SelectItem>
                <SelectItem value={Platform.FACEBOOK}>Facebook</SelectItem>
                <SelectItem value={Platform.INSTAGRAM}>Instagram</SelectItem>
                <SelectItem value={Platform.TWITTER}>Twitter</SelectItem>
                <SelectItem value={Platform.TIKTOK}>TikTok</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : postsData?.posts && postsData.posts.length > 0 ? (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Content</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Media</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Labels</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Accounts</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {postsData.posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedPosts.has(post.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedPosts);
                            if (e.target.checked) {
                              newSelected.add(post.id);
                            } else {
                              newSelected.delete(post.id);
                            }
                            setSelectedPosts(newSelected);
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={post.status === ContentStatus.POSTED ? 'secondary' : 'default'}>
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-slate-900 font-medium line-clamp-2">{post.content}</p>
                          <p className="text-xs text-slate-500 mt-1">{post.createdAt?.toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {post.mediaUrls && post.mediaUrls.length > 0 ? (
                          <div className="flex gap-2">
                            {post.mediaUrls.slice(0, 2).map((url, idx) => (
                              <Image key={idx} src={url} alt="" width={32} height={32} className="w-8 h-8 rounded object-cover" />
                            ))}
                            {post.mediaUrls.length > 2 && (
                              <span className="text-xs text-slate-600">+{post.mediaUrls.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{post.intent || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {post.accounts?.map((acc) => (
                            <div key={acc.id} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                              <span>{getPlatformIcon(acc.platform)}</span>
                              <span className="text-xs font-medium">{acc.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-slate-200 rounded">
                            <Eye size={16} />
                          </button>
                          <button className="p-1 hover:bg-slate-200 rounded">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-1 hover:bg-slate-200 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {postsData.total > take && (
              <div className="mt-6 flex items-center justify-center">
                <div className="text-sm text-slate-600">
                  Showing {skip + 1}-{Math.min(skip + take, postsData.total)} of {postsData.total}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-4">No posts yet</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white">
              Create Your First Post
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

// Create Post Modal Component
function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        <PostCreationEditor onSuccess={onSuccess} />
      </DialogContent>
    </Modal>
  );
}

// Post Creation Editor Component
function PostCreationEditor({ onSuccess }: { onSuccess: () => void }) {
  // Implementation in next file
  return <div>Post Editor Content</div>;
}

export default PostsPage;
