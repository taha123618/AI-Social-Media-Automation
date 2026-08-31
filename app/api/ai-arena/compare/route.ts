import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AIArenaService } from '@/features/ai_arena/services/ai-arena.service';
import { SystemLogger } from '@/features/system/services/logger.service';

const compareModelsSchema = z.object({
  businessId: z.string().optional(),
  prompt: z.string().min(3, 'Prompt must be at least 3 characters'),
  systemPrompt: z.string().optional(),
  models: z.array(z.enum(['gpt-4o', 'claude-3-5-sonnet', 'deepseek-r1', 'gemini-2-0-flash'])).min(1).default(['gpt-4o', 'claude-3-5-sonnet', 'deepseek-r1', 'gemini-2-0-flash']),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(50).max(4000).default(800),
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
    const validatedData = compareModelsSchema.parse(body);

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

    const response = await AIArenaService.compareModels({
      ...validatedData,
      businessId: targetBusinessId,
    });

    return NextResponse.json({ success: true, comparison: response }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/ai-arena/compare:', error);

    await SystemLogger.logError({
      message: error.message || 'Failed to execute AI Arena comparison',
      source: 'app/api/ai-arena/compare/route.ts',
      path: '/api/ai-arena/compare',
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to execute AI Arena comparison' },
      { status: 500 }
    );
  }
}
