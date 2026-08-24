import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { Platform } from '@/app/generated/prisma/client';

/**
 * GET: Fetch all social accounts for the active business
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    console.log(`[Social Accounts GET] Fetching for businessId: ${businessId}`);
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const accounts = await prisma.socialAccount.findMany({
      where: { businessId },
      orderBy: { platform: 'asc' }
    });

    console.log(`[Social Accounts GET] Found ${accounts.length} accounts`);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('[Social Accounts GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Schema for adding/updating a social account
 */
const addAccountSchema = z.object({
  platform: z.nativeEnum(Platform),
  platformId: z.string().min(1),
  name: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  tokenExpiresAt: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});

/**
 * POST: Create or Update a social account (Upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const body = await req.json();
    const validatedData = addAccountSchema.parse(body);

    // Modern and Clean Upsert Logic
    const result = await prisma.socialAccount.upsert({
      where: {
        businessId_platform_platformId: {
          businessId,
          platform: validatedData.platform,
          platformId: validatedData.platformId
        }
      },
      update: validatedData,
      create: {
        ...validatedData,
        businessId
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Social Accounts POST] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Failed',
        details: error.issues
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE: Remove a social account
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || !businessId) return NextResponse.json({ error: 'Missing ID or Business ID' }, { status: 400 });

    await prisma.socialAccount.delete({
      where: { id, businessId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Social Accounts DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
