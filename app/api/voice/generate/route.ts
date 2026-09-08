import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { VoiceStudioService } from '@/features/voice_studio/services/voice.service';
import { SystemLogger } from '@/features/system/services/logger.service';

const generateVoiceSchema = z.object({
  businessId: z.string().optional(),
  text: z.string().min(3, 'Script text must be at least 3 characters'),
  voiceId: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'adam', 'rachel', 'antoni', 'bella']).default('nova'),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  targetPlatform: z.enum(['TIKTOK', 'INSTAGRAM_REELS', 'YOUTUBE_SHORTS', 'PODCAST']).default('INSTAGRAM_REELS'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateVoiceSchema.parse(body);

    // Resolve active business workspace
    let targetBusinessId = validatedData.businessId;

    let membership = null;
    if (targetBusinessId && targetBusinessId !== 'active-workspace' && targetBusinessId !== 'default') {
      membership = await prisma.businessMember.findFirst({
        where: {
          businessId: targetBusinessId,
          userId: session.user.id,
        },
      });
    }

    // Fallback to user's first active business membership
    if (!membership) {
      membership = await prisma.businessMember.findFirst({
        where: {
          userId: session.user.id,
        },
      });
      if (membership) {
        targetBusinessId = membership.businessId;
      }
    }

    if (!membership || !targetBusinessId) {
      return NextResponse.json(
        { error: 'Forbidden: No active business workspace found for your account' },
        { status: 403 }
      );
    }

    const result = await VoiceStudioService.generateNarration({
      ...validatedData,
      businessId: targetBusinessId,
    });

    return NextResponse.json({ success: true, voice: result }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating voice narration:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error in Voice Studio' },
      { status: 500 }
    );
  }
}
