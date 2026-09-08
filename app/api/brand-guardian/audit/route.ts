import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BrandGuardianService } from '@/features/brand_guardian/services/brand-guardian.service';
import { SystemLogger } from '@/features/system/services/logger.service';

const auditCopySchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  text: z.string().min(1, 'Text content is required'),
  platform: z.enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'BLOG', 'EMAIL']).default('LINKEDIN'),
  targetAudience: z.string().optional(),
  desiredTone: z.string().optional(),
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
    const validatedData = auditCopySchema.parse(body);

    // Multi-tenant check
    const member = await prisma.businessMember.findFirst({
      where: {
        businessId: validatedData.businessId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You do not have access to this business workspace' },
        { status: 403 }
      );
    }

    const auditResult = await BrandGuardianService.auditCopy(validatedData);

    return NextResponse.json({ success: true, result: auditResult }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/brand-guardian/audit:', error);

    await SystemLogger.logError({
      message: error.message || 'Failed to audit copy',
      source: 'app/api/brand-guardian/audit/route.ts',
      path: '/api/brand-guardian/audit',
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error during brand audit' },
      { status: 500 }
    );
  }
}
