import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AIService } from '@/services/ai/ai.service';
import { ImageStorageService } from '@/services/image-storage.service';
import { ContentIntent, Platform } from '@/app/generated/prisma/enums';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = req.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    const member = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: session.user.id, businessId } }
    });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const formData = await req.formData();
    const workflowId = formData.get('workflowId') as string;
    const files = formData.getAll('images') as File[];

    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'workflowId required' }, { status: 400 });
    }

    if (!files.length) {
      return NextResponse.json({ success: false, error: 'At least one image required' }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId, businessId },
      include: {
        uploadConfig: true,
        business: { include: { profile: true } }
      }
    });

    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    if (!workflow.uploadConfig) {
      return NextResponse.json({ success: false, error: 'Workflow has no upload config' }, { status: 400 });
    }

    const config = workflow.uploadConfig;
    const profile = workflow.business.profile;
    const uploadCategory = config.uploadCategory;

    // Step 1: Upload images (S3 with DB fallback)
    const imageUrls: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await ImageStorageService.ingestImageFromBuffer(
        buffer,
        file.name,
        file.type,
        {
          businessId,
          userId: session.user.id,
          folder: `workflows/${workflowId}`,
        }
      );

      imageUrls.push(result.url);
    }

    // Step 2: Generate AI caption if enabled
    let caption = '';
    if (config.autoCaption) {
      const categoryLabels: Record<string, string> = {
        JOB_PHOTO: 'a job/project photo showing work in progress or completed work',
        BEFORE_AFTER: 'a before-and-after transformation photo',
        PRODUCT: 'a product photo',
      };

      const brandContext = [
        `Business: ${workflow.business.name}`,
        profile?.uniqueValueProposition && `UVP: ${profile.uniqueValueProposition}`,
        profile?.productsServices && `Products/Services: ${JSON.stringify(profile.productsServices).slice(0, 300)}`,
        profile?.targetAudience && `Target: ${profile.targetAudience}`,
        profile?.tone && `Tone: ${profile.tone}`,
      ].filter(Boolean).join('\n');

      caption = await AIService.generateWithOpenRouter({
        prompt: `You are a social media caption writer for a local business.

Brand Context:
${brandContext}

Image type: ${categoryLabels[uploadCategory] || 'a business photo'}

Write an engaging social media caption (under 200 words) for this ${categoryLabels[uploadCategory] || 'business photo'}.
Include a clear call-to-action. Format for ${config.platform || 'INSTAGRAM'}.
${config.platform === 'INSTAGRAM' ? 'Include 5-10 relevant hashtags at the end.' : ''}

Return only the caption, no extra text.`,
        maxTokens: 500,
        temperature: 0.7,
      });
    }

    // Step 3: Create ContentDraft with AI caption
    const draft = await prisma.contentDraft.create({
      data: {
        businessId,
        creatorId: session.user.id,
        workflowId,
        content: caption || null,
        intent: 'ENGAGEMENT' as ContentIntent,
        platforms: [config.platform as Platform || 'INSTAGRAM' as Platform],
        mediaUrl: imageUrls[0] || null,
        contentJson: { mediaUrls: imageUrls },
        status: 'DRAFT' as any,
      },
    });

    // Step 4: Auto-schedule if enabled
    let scheduledFor: Date | null = null;
    if (config.autoSchedule) {
      const schedule = await prisma.postingSchedule.findUnique({
        where: { businessId },
        include: { slots: { where: { enabled: true }, take: 1 } }
      });

      if (schedule?.slots.length) {
        const slot = schedule.slots[0];
        const now = new Date();
        const nextSlot = new Date();
        const dayDiff = (slot.dayOfWeek as unknown as number) - now.getDay();
        nextSlot.setDate(now.getDate() + (dayDiff <= 0 ? dayDiff + 7 : dayDiff));
        nextSlot.setHours(slot.hour, slot.minute, 0, 0);

        if (nextSlot < now) {
          nextSlot.setDate(nextSlot.getDate() + 7);
        }

        scheduledFor = new Date(nextSlot.getTime() + config.scheduleOffsetMinutes * 60000);

        await prisma.contentDraft.update({
          where: { id: draft.id },
          data: { scheduledFor, status: 'SCHEDULED' as any }
        });
      }
    }

    return NextResponse.json({
      success: true,
      draft: { id: draft.id, content: draft.content, scheduledFor, imageUrls },
      message: 'Images uploaded and draft created',
    });
  } catch (error: any) {
    console.error('[Upload Trigger Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
