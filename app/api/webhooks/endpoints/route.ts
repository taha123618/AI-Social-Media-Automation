import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { WebhookService } from '@/features/webhooks/services/webhook.service';

const createWebhookSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  url: z.string().url('Must be a valid HTTPS webhook URL'),
  description: z.string().optional(),
  events: z.array(
    z.enum([
      'post.published',
      'post.scheduled',
      'blog.generated',
      'lead.captured',
      'review.received',
      'workflow.completed',
    ])
  ).min(1, 'Select at least one event subscription'),
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
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const member = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const endpoints = await WebhookService.getEndpoints(businessId);
    return NextResponse.json({ success: true, endpoints }, { status: 200 });
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
    const validatedData = createWebhookSchema.parse(body);

    const member = await prisma.businessMember.findFirst({
      where: {
        businessId: validatedData.businessId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Admin or Owner privileges required to configure webhooks' },
        { status: 403 }
      );
    }

    const endpoint = await WebhookService.createEndpoint(validatedData);
    return NextResponse.json({ success: true, endpoint }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to create endpoint' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const endpointId = searchParams.get('endpointId');

    if (!businessId || !endpointId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const member = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await WebhookService.deleteEndpoint(businessId, endpointId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete endpoint' }, { status: 500 });
  }
}
