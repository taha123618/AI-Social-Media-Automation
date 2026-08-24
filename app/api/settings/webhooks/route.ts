import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SettingsService } from '@/features/settings/services/settings.service';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Valid URL is required'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().optional(),
});

// Helper to get auth context
async function getAuthContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const businessId = req.headers.get('x-business-id');
  if (!businessId) {
    throw new Error('Business ID required');
  }

  // Check user is a member of the business
  const userMember = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: session.user.id, businessId } },
  });

  if (!userMember) {
    throw new Error('Forbidden');
  }

  return { user: session.user, businessId };
}

export async function GET(req: NextRequest) {
  try {
    const { businessId } = await getAuthContext(req);

    const webhooks = await SettingsService.getWebhooks(businessId);

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === 'Business ID required') {
        return NextResponse.json({ error: "Business ID required" }, { status: 400 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await getAuthContext(req);

    const body = await req.json();
    const validatedData = createWebhookSchema.parse(body);

    const webhook = await SettingsService.createWebhook(businessId, validatedData);

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === 'Business ID required') {
        return NextResponse.json({ error: "Business ID required" }, { status: 400 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
