import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { ContentStatus } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'No active workspace found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const where: any = { businessId };
    
    if (status) {
      if (Object.values(ContentStatus).includes(status as any)) {
        where.status = status;
      } else {
        // Fallback or mapping for non-enum strings like 'published'
        where.status = status === 'published' ? ContentStatus.POSTED : ContentStatus.DRAFT;
      }
    } else {
      // Exclude POSTED items by default from the drafts view
      where.status = { not: ContentStatus.POSTED };
    }

    // Always exclude items that have already been published via a linked Post
    where.posts = { none: { status: ContentStatus.POSTED } };



    const drafts = await prisma.contentDraft.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const activeDrafts = drafts.filter(draft => {
      const json = draft.contentJson as any;
      return !json?.isDeleted;
    });

    const transformed = activeDrafts.map(draft => ({
      id: draft.id,
      title: draft.title,
      content: draft.content || (draft.contentJson as any)?.text || (draft.contentJson as any)?.caption || draft.customPrompt || '',
      intent: draft.intent,
      platforms: draft.platforms || [],
      customPrompt: draft.customPrompt,
      generatedContent: draft.contentJson || { text: draft.content },
      status: draft.status,
      userId: draft.creatorId,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      workflow: null
    }));

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Failed to list content drafts:', error);
    await SystemLogger.logError({
      message: `Error listing content drafts: ${error}`,
      source: 'app/api/content-draft/route.ts',
      context: 'GET /api/content-draft'
    });
    return NextResponse.json({ success: false, error: 'Failed to list drafts' }, { status: 500 });
  }
}
