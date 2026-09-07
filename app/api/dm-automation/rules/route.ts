import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DMAutomationService } from '@/features/dm_automation/services/dm-automation.service';

const createRuleSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  name: z.string().min(2, 'Rule name is required'),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN']),
  triggerKeywords: z.array(z.string()).min(1, 'At least one trigger keyword is required'),
  replyTemplate: z.string().min(3, 'Reply template is required'),
  aiEnhance: z.boolean().default(true),
  bookMeetingLink: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let businessId = searchParams.get('businessId');

    if (!businessId || businessId === 'active-workspace' || businessId === 'default') {
      const defaultMember = await prisma.businessMember.findFirst({
        where: { userId: session.user.id },
      });
      if (defaultMember) {
        businessId = defaultMember.businessId;
      }
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const membership = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this business' }, { status: 403 });
    }

    const rules = await DMAutomationService.getRules(businessId);
    return NextResponse.json({ success: true, rules }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRuleSchema.parse(body);

    const membership = await prisma.businessMember.findFirst({
      where: { businessId: validatedData.businessId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this business' }, { status: 403 });
    }

    const rule = await DMAutomationService.saveRule(validatedData.businessId, validatedData);
    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to save rule' }, { status: 500 });
  }
}
