import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SettingsService } from '@/features/settings/services/settings.service';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateWebhookSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  secret: z.string().optional(),
  isActive: z.boolean().optional(),
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId } = await getAuthContext(req);
    const { id: webhookId } = await params;

    const body = await req.json();
    const validatedData = updateWebhookSchema.parse(body);

    await SettingsService.updateWebhook(businessId, webhookId, validatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating webhook:', error);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId } = await getAuthContext(req);
    const { id: webhookId } = await params;

    await SettingsService.deleteWebhook(businessId, webhookId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
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
