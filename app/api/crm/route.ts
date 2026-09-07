import { NextResponse } from 'next/server';
import { CrmService, CrmType } from '@/features/crm/services/crm.service';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || await getActiveWorkspaceIdSafe().catch(() => undefined);

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const membership = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this business' }, { status: 403 });
    }

    const status = await CrmService.getStatus(businessId);
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('CRM Status API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, businessId, crmType, data } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const membership = await prisma.businessMember.findFirst({
      where: { businessId, userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this business' }, { status: 403 });
    }

    switch (action) {
      case 'SYNC_CONTACTS':
      case 'EXPORT_LEADS': {
        const result = await CrmService.syncLeads(businessId, crmType as CrmType);
        return NextResponse.json(result);
      }
      
      case 'UPDATE_CONFIG': {
        // Direct DB update for configuration using ThirdPartyService

        await prisma.thirdPartyService.upsert({
          where: {
            businessId_platform: {
              businessId,
              platform: crmType as any
            }
          },
          update: {
            apiKey: typeof data === 'string' ? data : JSON.stringify(data),
            isActive: true
          },
          create: {
            businessId,
            platform: crmType as any,
            apiKey: typeof data === 'string' ? data : JSON.stringify(data),
            apiSecret: '', // Required field in schema
            isActive: true
          }
        });
        return NextResponse.json({ success: true, message: 'CRM configuration updated' });
      }

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CRM Sync POST API Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
