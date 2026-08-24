import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SettingsService } from '@/features/settings/services/settings.service';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
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

    const apiKeys = await SettingsService.getApiKeys(businessId);

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
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
    const validatedData = createApiKeySchema.parse(body);

    const apiKey = await SettingsService.createApiKey(businessId, validatedData);

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
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
