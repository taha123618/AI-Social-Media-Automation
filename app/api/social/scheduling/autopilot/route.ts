import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

    const member = await prisma.businessMember.findUnique({
      where: { userId_businessId: { userId: session.user.id, businessId } }
    });
    if (!member) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });

    const { action } = await req.json();

    if (action === 'status') {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      const autopilot = (business?.preferences as any)?.autopilot;
      return NextResponse.json({ success: true, autopilot: autopilot || null });
    }

    if (action === 'enable') {
      const { days = 30 } = await req.json().catch(() => ({}));

      const business = await prisma.business.findUnique({ where: { id: businessId } });
      const currentPrefs = (business?.preferences as any) || {};
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      await prisma.business.update({
        where: { id: businessId },
        data: {
          preferences: {
            ...currentPrefs,
            autopilot: {
              enabled: true,
              days,
              startedAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              enabledBy: session.user.id,
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: `30-day autopilot enabled until ${endDate.toLocaleDateString()}`,
        endsAt: endDate.toISOString(),
      });
    }

    if (action === 'disable') {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      if (business) {
        const currentPrefs = (business.preferences as any) || {};
        await prisma.business.update({
          where: { id: businessId },
          data: {
            preferences: {
              ...currentPrefs,
              autopilot: { enabled: false }
            }
          }
        });
      }

      return NextResponse.json({ success: true, message: 'Autopilot disabled' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Autopilot Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id') || req.nextUrl.searchParams.get('businessId');
    if (!businessId) return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    const autopilot = (business?.preferences as any)?.autopilot || null;

    if (autopilot?.enabled && autopilot?.endsAt) {
      const endsAt = new Date(autopilot.endsAt);
      const now = new Date();
      if (endsAt < now) {
        const currentPrefs = (business?.preferences as any) || {};
        await prisma.business.update({
          where: { id: businessId },
          data: {
            preferences: { ...currentPrefs, autopilot: { enabled: false } }
          }
        });
        return NextResponse.json({ success: true, autopilot: { enabled: false } });
      }
      const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return NextResponse.json({ success: true, autopilot: { ...autopilot, daysLeft } });
    }

    return NextResponse.json({ success: true, autopilot: autopilot || { enabled: false } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
