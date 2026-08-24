import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { ContentStatus, ContentIntent } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'No active workspace found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, content, status } = body;

    const mappedStatus = Object.values(ContentStatus).includes(status as any) 
      ? (status as ContentStatus)
      : (status === 'published' ? ContentStatus.POSTED : ContentStatus.DRAFT);

    const newDraft = await prisma.contentDraft.create({
      data: {
        title: title || (content ? content.slice(0, 50) + '...' : 'Untitled Draft'),
        content: content || '',
        status: mappedStatus,
        businessId,
        creatorId: session.user.id,
        intent: ContentIntent.ENGAGEMENT, // Default intent
        contentJson: { text: content || '' } // Maintain backward compatibility
      }
    });

    return NextResponse.json({ success: true, data: newDraft }, { status: 201 });
  } catch (error) {
    console.error('Failed to create content draft:', error);
    await SystemLogger.logError({
      message: `Error creating content draft: ${error}`,
      source: 'app/api/content-draft/create/route.ts',
      context: 'POST /api/content-draft/create'
    });
    return NextResponse.json({ success: false, error: 'Failed to create draft' }, { status: 500 });
  }
}
