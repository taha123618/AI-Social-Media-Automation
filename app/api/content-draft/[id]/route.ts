import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { ContentStatus } from '@/app/generated/prisma/enums';
import { SystemLogger } from '@/features/system/services/logger.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) return NextResponse.json({ success: false, error: 'No workspace' }, { status: 404 });

    const draft = await prisma.contentDraft.findFirst({
      where: { id, businessId }
    });

    if (!draft) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: {
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
    }});
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch draft' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) return NextResponse.json({ success: false, error: 'No workspace' }, { status: 404 });

    const draft = await prisma.contentDraft.findFirst({ where: { id, businessId } });
    if (!draft) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const { title, content, status } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (content !== undefined) {
      dataToUpdate.content = content;
      dataToUpdate.contentJson = { ...((draft.contentJson as any) || {}), text: content };
    }
    if (status !== undefined) {
      if (Object.values(ContentStatus).includes(status as any)) {
        dataToUpdate.status = status;
      } else {
        dataToUpdate.status = status === 'published' ? ContentStatus.POSTED : ContentStatus.DRAFT;
      }
    }

    const updated = await prisma.contentDraft.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, data: {
      id: updated.id,
      title: updated.title,
      content: updated.content || (updated.contentJson as any)?.text || (updated.contentJson as any)?.caption || '',
      intent: updated.intent,
      platforms: updated.platforms || [],
      customPrompt: updated.customPrompt,
      generatedContent: updated.contentJson || { text: updated.content },
      status: updated.status,
      userId: updated.creatorId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      workflow: null
    }});
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update draft' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const businessId = await getActiveWorkspaceIdSafe();
    if (!businessId) return NextResponse.json({ success: false, error: 'No workspace' }, { status: 404 });

    const draft = await prisma.contentDraft.findFirst({ where: { id, businessId } });
    if (!draft) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    // Also delete any linked posts cleanly to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      const posts = await tx.post.findMany({ where: { draftId: id } });
      if (posts.length > 0) {
        const postIds = posts.map(p => p.id);
        await tx.lead.deleteMany({ where: { postId: { in: postIds } } });
        // PostAnalytics are now flattened into Post model
        await tx.post.deleteMany({ where: { draftId: id } });
      }
      await tx.contentDraft.delete({ where: { id } });
    }, {
      timeout: 10000 // 10 seconds timeout
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete draft' }, { status: 500 });
  }
}
