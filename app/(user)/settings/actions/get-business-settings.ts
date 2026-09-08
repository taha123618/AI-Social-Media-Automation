'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BusinessSettings } from '../types';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';
import { SettingsService } from '@/features/settings/services/settings.service';

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.id) {
      return null;
    }

    let businessId = await getActiveWorkspaceId();

    if (!businessId || businessId === 'active-workspace' || businessId === '') {
      const membership = await prisma.businessMember.findFirst({
        where: { userId: session.user.id },
        select: { businessId: true },
      });
      businessId = membership?.businessId || null;
    }

    if (!businessId) return null;

    const settings = await SettingsService.getBusinessSettings(businessId);
    return settings as BusinessSettings | null;
  } catch (error) {
    console.error('[getBusinessSettings] Error fetching business settings:', error);
    return null;
  }
}
