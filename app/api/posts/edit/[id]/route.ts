import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { ContentStatus, Platform } from '@/app/generated/prisma/enums';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';


/**
 * GET /api/posts/edit/[id]
 * Returns formatted post data for the edit form.
 * Accepts either a ContentDraft ID or a Post ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const businessId = await getActiveWorkspaceId();

    // Primary: find by contentDraft id or linked post id, scoped to business
    let draft = await prisma.contentDraft.findFirst({
      where: {
        OR: [{ id }, { posts: { some: { id } } }],
        businessId: businessId ?? undefined,
      },
      include: {
        posts: { include: { socialAccount: true } },
      },
    });

    // Fallback: creator owns the draft but business context differs
    if (!draft) {
      draft = await prisma.contentDraft.findFirst({
        where: {
          OR: [{ id }, { posts: { some: { id } } }],
          creatorId: session.user.id,
        },
        include: {
          posts: { include: { socialAccount: true } },
        },
      });
    }

    if (!draft) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const contentJson = (draft.contentJson as Record<string, unknown>) ?? {};
    const mediaUrls: string[] = Array.isArray(contentJson.mediaUrls)
      ? (contentJson.mediaUrls as string[])
      : draft.mediaUrl
      ? [draft.mediaUrl]
      : [];

    // Resolve selected account IDs — live post links take precedence over stored JSON
    const selectedAccountIds =
      draft.posts.length > 0
        ? draft.posts.map((p) => p.socialAccountId)
        : Array.isArray(contentJson.accountIds)
        ? (contentJson.accountIds as string[])
        : [];

    // Use primary content field if available, otherwise fall back to JSON or prompt
    const content = draft.content || (contentJson.text as string) || draft.customPrompt || draft.title || '';

    return NextResponse.json({
      id: draft.id,
      content,
      firstComment: (contentJson.firstComment as string) || '',
      platforms: draft.platforms,
      selectedAccountIds,
      scheduledFor: draft.scheduledFor ?? null,
      mediaUrls,
      labels: Array.isArray(contentJson.labels) ? (contentJson.labels as string[]) : [],
      status: draft.status,
      postType: (contentJson.postType as string) || 'POST',
      intent: draft.intent,
    });
  } catch (error) {
    console.error('[GET /api/posts/edit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/posts/edit/[id]
 * Updates an existing ContentDraft with new post data.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const businessId = await getActiveWorkspaceId();

    const body: {
      content?: string;
      firstComment?: string;
      platforms?: string[];
      accountIds?: string[];
      scheduledFor?: string | null;
      mediaUrls?: string[];
      labels?: string[];
      postType?: string;
      intent?: string;
    } = await req.json();

    // Resolve the actual contentDraft record
    const existing = await prisma.contentDraft.findFirst({
      where: {
        OR: [{ id }, { posts: { some: { id } } }],
        businessId: businessId ?? undefined,
      },
      select: {
        id: true,
        contentJson: true,
        platforms: true,
        status: true,
        scheduledFor: true,
        posts: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const currentJson = (existing.contentJson as Record<string, unknown>) ?? {};
    const content = body.content ?? (currentJson.text as string) ?? '';

    // Determine target status: preserve POSTED/SCHEDULED if already there
    let targetStatus = existing.status;
    if (body.scheduledFor) {
      targetStatus = ContentStatus.SCHEDULED;
    } else if (existing.status === ContentStatus.POSTED || existing.posts.length > 0) {
      targetStatus = ContentStatus.POSTED;
    } else if (existing.status === ContentStatus.GENERATED || existing.status === ContentStatus.APPROVED) {
      // Keep it as is
    } else {
      targetStatus = ContentStatus.DRAFT;
    }

    const updatedDraft = await prisma.contentDraft.update({
      where: { id: existing.id },
      data: {
        title: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
        customPrompt: content,
        content: content,
        platforms: (body.platforms as Platform[]) ?? existing.platforms,
        scheduledFor: body.scheduledFor === null ? null : (body.scheduledFor ? new Date(body.scheduledFor) : existing.scheduledFor),

        status: targetStatus,
        contentJson: {
          ...currentJson,
          text: content,
          firstComment: body.firstComment ?? (currentJson.firstComment as string) ?? '',
          mediaUrls: body.mediaUrls ?? (currentJson.mediaUrls as string[]) ?? [],
          labels: body.labels ?? (currentJson.labels as string[]) ?? [],
          accountIds: body.accountIds ?? (currentJson.accountIds as string[]) ?? [],
          postType: body.postType ?? (currentJson.postType as string) ?? 'POST',
        },
        updatedAt: new Date(),
      },
    });

    revalidatePath('/posts');

    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (error) {
    console.error('[PUT /api/posts/edit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
