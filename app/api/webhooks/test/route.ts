import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { WebhookService } from '@/features/webhooks/services/webhook.service';

const testWebhookSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  endpointId: z.string().min(1, 'Endpoint ID is required'),
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
    const { businessId, endpointId } = testWebhookSchema.parse(body);

    const member = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const endpoints = await WebhookService.getEndpoints(businessId);
    const endpoint = endpoints.find((ep) => ep.id === endpointId);

    if (!endpoint) {
      return NextResponse.json({ error: 'Webhook endpoint not found' }, { status: 404 });
    }

    const testPayload = {
      message: 'This is an enterprise test event from AI Social Media Automation',
      test: true,
      sender: session.user.email,
      timestamp: new Date().toISOString(),
    };

    const deliveryLog = await WebhookService.sendWebhook(endpoint, 'post.published', testPayload);

    return NextResponse.json({ success: true, delivery: deliveryLog }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch test webhook' },
      { status: 500 }
    );
  }
}
