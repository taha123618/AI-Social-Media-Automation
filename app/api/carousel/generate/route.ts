import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CarouselService } from '@/features/carousel_builder/services/carousel.service';
import { SystemLogger } from '@/features/system/services/logger.service';

const generateCarouselSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  sourceText: z.string().optional(),
  targetPlatform: z.enum(['LINKEDIN', 'INSTAGRAM', 'TWITTER']).default('LINKEDIN'),
  aspectRatio: z.enum(['1:1', '4:5', '16:9']).default('4:5'),
  theme: z.enum([
    'DARK_GLASS',
    'CYBER_NEON',
    'MINIMAL_LIGHT',
    'SUNSET_CORAL',
    'EMERALD_GROWTH',
    'CORPORATE_BLUE',
  ]).default('DARK_GLASS'),
  slideCount: z.number().min(3).max(10).default(5),
  brandVoiceTone: z.string().optional(),
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
    const validatedData = generateCarouselSchema.parse(body);

    // Multi-tenant authorization check
    const membership = await prisma.businessMember.findFirst({
      where: {
        businessId: validatedData.businessId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have access to this business workspace' },
        { status: 403 }
      );
    }

    const deck = await CarouselService.generateCarouselDeck(validatedData);

    return NextResponse.json({ success: true, deck }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/carousel/generate:', error);

    await SystemLogger.logError({
      message: error.message || 'Failed to generate carousel deck',
      source: 'app/api/carousel/generate/route.ts',
      path: '/api/carousel/generate',
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error generating carousel' },
      { status: 500 }
    );
  }
}
