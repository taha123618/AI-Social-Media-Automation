/**
 * Posts Page - List all posts with tab filtering & responsive view
 */

'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Trash2, Calendar, Sparkles, Send, Layers } from 'lucide-react';
import { ContentStatus, Platform } from '@/app/generated/prisma/client';
import { ListPostsResponse, SocialPlatform } from '@/features/social/types/social-posting.types';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'ALL' | 'DRAFTS' | 'SCHEDULED' | 'PUBLISHED' | 'TRASH';

export function PostsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | SocialPlatform | 'ALL'>('ALL');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const { businessId } = useWorkspace();

  const statusMap: Record<TabType, ContentStatus | undefined> = {
    ALL: undefined,
    DRAFTS: ContentStatus.DRAFT,
    SCHEDULED: ContentStatus.SCHEDULED,
    PUBLISHED: ContentStatus.POSTED,
    TRASH: undefined,
  };

  // Fetch posts
  const { data: postsData, isLoading } = useQuery({
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
    <div className="w-full space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Social Posts Feed
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/20">
              DISPATCH QUEUE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage scheduled publications, drafts, and cross-platform campaign vectors.
          </p>
        </div>

        <Link href="/posts/create">
          <Button size="sm" className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create New Post</span>
          </Button>
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-border/70">
        {(['ALL', 'DRAFTS', 'SCHEDULED', 'PUBLISHED', 'TRASH'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSkip(0);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap touch-manipulation ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search by topic, caption or tag..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSkip(0);
            }}
            className="pl-9 h-9 text-xs bg-secondary/30 rounded-lg border-border/70"
          />
        </div>
        <Select
          value={selectedPlatform}
          onValueChange={(value: string) => {
            setSelectedPlatform(value as Platform | SocialPlatform | 'ALL');
            setSkip(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs rounded-lg border-border/70 bg-card">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Platforms</SelectItem>
            <SelectItem value={Platform.LINKEDIN}>LinkedIn</SelectItem>
            <SelectItem value={Platform.TWITTER}>X / Twitter</SelectItem>
            <SelectItem value={Platform.INSTAGRAM}>Instagram</SelectItem>
            <SelectItem value={Platform.FACEBOOK}>Facebook</SelectItem>
            <SelectItem value={Platform.TIKTOK}>TikTok</SelectItem>
            <SelectItem value={Platform.YOUTUBE}>YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-muted-foreground font-mono">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span>Syncing posts feed...</span>
        </div>
      ) : postsData?.posts && postsData.posts.length > 0 ? (
        <>
          {/* Mobile View: Responsive Card Grid */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {postsData.posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={post.status === ContentStatus.POSTED ? 'default' : 'outline'}
                    className="text-[10px] font-mono uppercase"
                  >
                    {post.status}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>

                <p className="text-xs text-foreground font-medium line-clamp-3 leading-relaxed">
                  {post.content || 'Untitled draft'}
                </p>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {post.mediaUrls.slice(0, 3).map((url, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/70">
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {post.accounts?.map((acc) => (
                      <span key={acc.id} className="text-xs" title={acc.name}>
                        {getPlatformIcon(acc.platform)}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/posts/edit/${post.id}`}>
                      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Clean Table */}
          <div className="hidden md:block rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border/70">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      onChange={(e) => {
                        if (e.target.checked && postsData?.posts) {
                          setSelectedPosts(new Set(postsData.posts.map((p) => p.id)));
                        } else {
                          setSelectedPosts(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Content</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Media</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Platforms</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {postsData.posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedPosts.has(post.id)}
                        onChange={(e) => {
                          const next = new Set(selectedPosts);
                          if (e.target.checked) next.add(post.id);
                          else next.delete(post.id);
                          setSelectedPosts(next);
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={post.status === ContentStatus.POSTED ? 'default' : 'outline'}
                        className="text-[10px] font-mono uppercase"
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-foreground font-medium line-clamp-2 leading-relaxed">{post.content}</p>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {post.mediaUrls && post.mediaUrls.length > 0 ? (
                        <div className="flex gap-1.5">
                          {post.mediaUrls.slice(0, 2).map((url, idx) => (
                            <div key={idx} className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/70">
                              <Image src={url} alt="" fill className="object-cover" />
                            </div>
                          ))}
                          {post.mediaUrls.length > 2 && (
                            <span className="text-[10px] font-mono text-muted-foreground self-center">
                              +{post.mediaUrls.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {post.accounts?.map((acc) => (
                          <span key={acc.id} className="text-sm" title={acc.name}>
                            {getPlatformIcon(acc.platform)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/posts/edit/${post.id}`}>
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center max-w-md mx-auto">
          <Send className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground mb-1">No posts found</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Create your first automated cross-platform post or generate one with AI.
          </p>
          <Link href="/posts/create">
            <Button size="sm" className="h-8 text-xs font-semibold rounded-lg">
              Create New Post
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default PostsPage;
