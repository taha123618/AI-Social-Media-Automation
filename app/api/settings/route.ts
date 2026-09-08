import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from '@/lib/api-utils';
import { SettingsService } from '@/features/settings/services/settings.service';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

const updateBusinessSchema = z.object({
  name: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')).or(z.null()),
  logo: z.string().optional().or(z.null()),
  location: z.string().optional().or(z.null()),
  description: z.string().optional().or(z.null()),
  industry: z.string().optional().or(z.null()),
  size: z.string().optional().or(z.null()),
  timezone: z.string().optional(),
  autoApproveContent: z.boolean().optional(),
  requireApprovalForPosts: z.boolean().optional(),
  contentGuidelines: z.string().optional().or(z.null()),
});

const updateProfileSchema = z.object({
  mission: z.string().optional(),
  vision: z.string().optional(),
  uvp: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  industry: z.string().optional(),
  forbiddenWords: z.array(z.string()).optional(),
  usp: z.string().optional(),
  watermark: z.string().optional(),
});

// Helper to get session and businessId
async function getAuthContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Get businessId from cookie/header
  let businessId = req.headers.get('x-business-id') || 
    req.cookies.get('active-business-id')?.value;

  if (!businessId || businessId === 'active-workspace' || businessId === '') {
    const membership = await prisma.businessMember.findFirst({
      where: { userId: session.user.id },
      select: { businessId: true },
    });
    businessId = membership?.businessId;
  }

  if (!businessId) {
    throw new Error('Business ID required');
  }

  return { user: session.user, businessId };
}

export async function GET(req: NextRequest) {
  try {
    const { businessId } = await getAuthContext(req);

    const settings = await SettingsService.getBusinessSettings(businessId);
    
    if (!settings) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching business settings:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Business ID required') {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, businessId } = await getAuthContext(req);

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'business';

    // Check user is a member of the business
    const userMember = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: user.id, businessId } },
    });

    if (!userMember) {
      return NextResponse.json({ error: "Unauthorized - Not a member of this business" }, { status: 403 });
    }

    if (type === 'business') {
      const body = await parseBody(req, updateBusinessSchema);
      const result = await SettingsService.updateBusinessSettings(businessId, body);
      return NextResponse.json(result);
    } else if (type === 'profile') {
      const body = await parseBody(req, updateProfileSchema);
      const result = await SettingsService.updateBusinessProfile(businessId, body);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Business ID required') {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
