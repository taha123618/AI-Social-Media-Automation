import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SettingsService } from '@/features/settings/services/settings.service';
import prisma from '@/lib/prisma';

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId } = await getAuthContext(req);
    const { id: keyId } = await params;

    await SettingsService.deleteApiKey(businessId, keyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
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
