import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DMAutomationService } from '@/features/dm_automation/services/dm-automation.service';

const simulateDMSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN']).default('INSTAGRAM'),
  senderName: z.string().default('Alex Rivera'),
  messageText: z.string().min(1, 'Message text is required'),
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
    const validatedData = simulateDMSchema.parse(body);

    let businessId = validatedData.businessId;
    const businessExists = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!businessExists) {
      const userMember = await prisma.businessMember.findFirst({
        where: { userId: session.user.id },
        select: { businessId: true },
      });
      if (userMember) {
        businessId = userMember.businessId;
      }
    }

    const reply = await DMAutomationService.processIncomingDM({
      ...validatedData,
      businessId,
    });
    return NextResponse.json({ success: true, reply }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || 'Simulation failed' }, { status: 500 });
  }
}
