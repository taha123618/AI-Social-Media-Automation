import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import AdAccountService from '@/features/ad-campaigns/services/ad-account.service';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = req.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

    const url = new URL(req.url);
    const id = url.pathname.split('/').slice(-3)[0];
    const body = await req.json();
    const action = body.action as string;

    // Verify account belongs to business
    const account = await prisma.adAccount.findUnique({ where: { id } });
    if (!account || account.businessId !== businessId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'refresh') {
      if (account.platform === 'META') {
        const updated = await AdAccountService.refreshMetaDetails(id);
        return NextResponse.json({ success: true, account: updated });
      }
      if (account.platform === 'GOOGLE') {
        const updated = await AdAccountService.refreshGoogleDetails(id);
        return NextResponse.json({ success: true, account: updated });
      }
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    if (action === 'delete') {
      await AdAccountService.deleteAccount(id);
      return NextResponse.json({ success: true });
    }

    if (action === 'setPrimary') {
      const updated = await AdAccountService.setPrimaryAccount(businessId!, id);
      return NextResponse.json({ success: true, account: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Account Action]', err);
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
