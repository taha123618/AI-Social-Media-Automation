import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SocialListeningService } from '@/features/social_listening/services/social-listening.service';

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

    const report = await SocialListeningService.getRadarReport(businessId);
    return NextResponse.json({ success: true, report }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
