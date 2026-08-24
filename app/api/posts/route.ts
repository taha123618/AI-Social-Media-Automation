/**
 * GET /api/posts
 * List all posts with filters, pagination, and sorting - Enhanced version
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';
import { ListPostsResponse, PostListItem, PostErrorCode, ApiResponse, PostContent } from '@/features/social/types/social-posting.types';
import { ContentStatus, Platform as PrismaPlatform, Prisma } from '@/app/generated/prisma/client';
import { SocialPlatform } from '@/features/social/types/social-posting.types';
export const dynamic = 'force-dynamic';

type AccountDetail = {
  id: string;
  name: string | null;
  avatar: string | null;
  platform: PrismaPlatform
};

// Helper function to extract text content from various content structures
function extractContentText(contentJson: ContentJson | null | undefined): string {
  if (!contentJson) return '';
  return contentJson.text || contentJson.caption || contentJson.description || '';
}

interface ContentJson extends PostContent {
  title?: string;
  accountIds?: string[];
  mediaUrls?: string[];
}

/**
 * Validates if the user is a member of the business
 */
async function checkBusinessAccess(userId: string, businessId: string) {
  const membership = await prisma.businessMember.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId,
      },
    },
    select: { id: true, role: true }
  });

  return !!membership;
}

export async function GET(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const businessId = req.headers.get('x-business-id');
    await SystemLogger.info(`Incoming GET /api/posts`, {
      requestId,
      businessId,
      url: req.url,
      headers: {
        userAgent: req.headers.get('user-agent'),
        referer: req.headers.get('referer')
      }
    });

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      await SystemLogger.warn(`Unauthorized access attempt to GET /api/posts`, { requestId, businessId });
      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.AUTHENTICATION_FAILED, message: 'Unauthorized' } } as ApiResponse<null>,
        { status: 401 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_HEADER', message: 'Business ID required' } } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Strict Multi-Tenancy Protection
    const hasAccess = await checkBusinessAccess(session.user.id, businessId);
    if (!hasAccess) {

      await SystemLogger.logAudit({
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: 'Post',
        status: 'FAILURE',
        userId: session.user.id,
        details: { businessId, path: req.nextUrl.pathname }
      });

      return NextResponse.json(
        { success: false, error: { code: PostErrorCode.INSUFFICIENT_PERMISSIONS, message: 'Access denied to this business' } } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const take = Math.min(parseInt(url.searchParams.get('take') || '20'), 100); // Cap at 100
    const status = url.searchParams.get('status');
    const platform = url.searchParams.get('platform');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'date';
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as Prisma.SortOrder;

    // Build order by
    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    if (sortBy === 'engagement') {
      orderBy.likes = sortOrder;
    } else if (sortBy === 'reach') {
      orderBy.impressions = sortOrder;
    } else {
      orderBy.postedAt = sortOrder;
    }

    // Build where clause for Posts
    const where: Prisma.PostWhereInput = { businessId };
    if (platform) where.platform = platform as PrismaPlatform;
    
    if (status === 'PUBLISHED') {
      where.status = ContentStatus.POSTED;
    } else if (status === 'SCHEDULED') {
      where.status = ContentStatus.SCHEDULED;
    }

    if (search) {
      where.draft = {
        OR: [
          { customPrompt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Helper to fetch account details for orphan drafts with proper typing
    const fetchAccountDetails = async (drafts: { contentJson: any }[]): Promise<Map<string, AccountDetail>> => {
      const allAccountIds = new Set<string>();
      drafts.forEach(d => {
        const content = d.contentJson as ContentJson;
        content?.accountIds?.forEach(id => allAccountIds.add(id));
      });

      if (allAccountIds.size === 0) return new Map();

      const accounts = await prisma.socialAccount.findMany({
        where: { id: { in: Array.from(allAccountIds) } },
        select: { id: true, name: true, avatar: true, platform: true }
      });
      return new Map<string, AccountDetail>(accounts.map(a => [a.id, a]));
    };

    // Unified parallelized fetching
    const orphanWhere: Prisma.ContentDraftWhereInput = {
      businessId,
      posts: { none: {} },
    };

    if (status === 'DRAFT') {
      orphanWhere.status = { in: [ContentStatus.DRAFT, ContentStatus.GENERATED, ContentStatus.APPROVED] };
    } else if (!status || status === 'all') {
      orphanWhere.status = { in: [ContentStatus.DRAFT, ContentStatus.GENERATED, ContentStatus.APPROVED, ContentStatus.POSTED, ContentStatus.SCHEDULED] };
    } else {
      orphanWhere.id = 'none';
    }

    const [posts, totalLive, orphanDrafts, totalOrphans] = await Promise.all([
      status !== 'DRAFT' ? prisma.post.findMany({
        where,
        include: {
          draft: { select: { id: true, title: true, content: true, contentJson: true, mediaUrl: true } },
          socialAccount: { select: { id: true, name: true, avatar: true, platform: true } }
        },
        orderBy,
        skip,
        take,
      }) : Promise.resolve([]),
      status !== 'DRAFT' ? prisma.post.count({ where }) : Promise.resolve(0),
      (status === 'DRAFT' || !status || status === 'all') ? prisma.contentDraft.findMany({
        where: orphanWhere,
        select: {
          id: true,
          title: true,
          content: true,
          contentJson: true,
          mediaUrl: true,
          platforms: true,
          status: true,
          scheduledFor: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: { updatedAt: sortOrder }
      }) : Promise.resolve([]),
      (status === 'DRAFT' || !status || status === 'all') ? prisma.contentDraft.count({ where: orphanWhere }) : Promise.resolve(0)
    ]);

    const accountMap = orphanDrafts.length > 0 ? await fetchAccountDetails(orphanDrafts) : new Map<string, AccountDetail>();

    const resultPosts: PostListItem[] = [
      ...posts.map(post => {
        const contentJson = (post.draft?.contentJson as ContentJson) || {};
        return {
          id: post.id,
          title: contentJson.title || post.draft?.title || 'Social Post',
          content: post.draft?.content || extractContentText(contentJson).substring(0, 150),
          fullContent: post.draft?.content || extractContentText(contentJson),
          platforms: [post.platform as SocialPlatform],
          status: post.status as any,
          postedAt: post.postedAt || undefined,
          scheduledFor: undefined,
          createdAt: post.postedAt || post.analyticsUpdatedAt,
          updatedAt: post.postedAt || post.analyticsUpdatedAt,
          mediaUrls: contentJson.mediaUrls || (post.draft?.mediaUrl ? [post.draft.mediaUrl] : []),
          accounts: post.socialAccount ? [{
            id: post.socialAccount.id,
            name: post.socialAccount.name || '',
            platform: post.socialAccount.platform,
            avatar: post.socialAccount.avatar || undefined,
          }] : [],
          likes: post.likes || 0,
          comments: post.comments || 0,
          reach: post.reach || 0,
          impressions: post.impressions || 0,
          shares: post.shares || 0,
          saves: post.saves || 0,
          videoViews: post.videoViews || 0,
          videoCompletionRate: post.videoCompletionRate || undefined,
          reelWatchTime: post.reelWatchTime || 0,
          profileVisits: post.profileVisits || 0,
          websiteClicks: post.websiteClicks || 0,
          bookingClicks: post.bookingClicks || 0,
          phoneClicks: post.phoneClicks || 0,
          messageClicks: post.messageClicks || 0,
          directionRequests: post.directionRequests || 0,
          storyExits: post.storyExits || 0,
          storyTaps: post.storyTaps || 0,
          analytics: {
            likes: post.likes || 0,
            shares: post.shares || 0,
            comments: post.comments || 0,
            impressions: post.impressions || 0,
            reach: post.reach || 0,
            engagementRate: 0,
          },
          externalPostId: post.externalPostId || undefined,
          publishedUrl: post.publishedUrl || undefined,
        };
      }),
      ...orphanDrafts.map(draft => {
        const contentJson = (draft.contentJson as ContentJson) || {};
        return {
          id: draft.id,
          title: draft.title || 'Draft Content',
          content: draft.content || extractContentText(contentJson).substring(0, 150),
          fullContent: draft.content || extractContentText(contentJson),
          platforms: draft.platforms as SocialPlatform[],
          status: draft.status as any,
          postedAt: undefined,
          scheduledFor: draft.scheduledFor || undefined,
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
          mediaUrls: contentJson.mediaUrls || (draft.mediaUrl ? [draft.mediaUrl] : []),
          accounts: (contentJson.accountIds || [])
            .map(id => accountMap.get(id))
            .filter((a): a is AccountDetail => !!a)
            .map(account => ({
              id: account.id,
              name: account.name || '',
              platform: account.platform,
              avatar: account.avatar || undefined,
            })),
          likes: 0,
          comments: 0,
          reach: 0,
          impressions: 0,
          shares: 0,
          saves: 0,
          videoViews: 0,
          videoCompletionRate: undefined,
          reelWatchTime: 0,
          profileVisits: 0,
          websiteClicks: 0,
          bookingClicks: 0,
          phoneClicks: 0,
          messageClicks: 0,
          directionRequests: 0,
          storyExits: 0,
          storyTaps: 0,
          analytics: {
            likes: 0,
            shares: 0,
            comments: 0,
            impressions: 0,
            reach: 0,
            engagementRate: 0,
          },
          contentJson: draft.contentJson,
        };
      })
    ];

    // Final sorting for unified view
    if (!status || status === 'all') {
      resultPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        posts: resultPosts.slice(0, take),
        total: totalLive + totalOrphans,
        skip,
        take
      }
    });

  } catch (error) {
    await SystemLogger.logError({
      message: error instanceof Error ? error.message : 'Unknown API Error',
      source: 'GET /api/posts',
      stack: error instanceof Error ? error.stack : undefined,
      context: { businessId: req.headers.get('x-business-id') }
    });

    return NextResponse.json(
      { success: false, error: { message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

