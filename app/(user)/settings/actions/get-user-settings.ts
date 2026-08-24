'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserSettings } from '../types';

export async function getUserSettings(): Promise<UserSettings | null> {
  const session = await auth.api.getSession({
    headers: {
      cookie: ''
    }
  });

  if (!session?.user?.id) {
    // Return null instead of throwing error for unauthorized access
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

  // For now, return basic user settings. In a real app, you'd have a separate UserSettings table
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.image,
    timezone: 'UTC', // Default timezone
    language: 'en', // Default language
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
}
