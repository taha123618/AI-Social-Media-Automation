'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserSettings } from '../types';

export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image,
      timezone: 'UTC',
      language: 'en',
      criticalInfrastructureUpdates: true,
      strategicIntelligence: true,
      osLevelSignals: true,
      contentPhaseSuccess: true,
      securityFirewallAlerts: true,
      collaboratorInvitations: true,
      globalSystemHealth: true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('[getUserSettings] Error fetching user settings:', error);
    return null;
  }
}
