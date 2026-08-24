'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';

export async function getConnectedSocialAccounts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const businessId = await getActiveWorkspaceId();
  if (!businessId) return [];

  try {
    const accounts = await prisma.socialAccount.findMany({
      where: {
        businessId,
        isActive: true
      },
      select: {
        id: true,
        platform: true,
        name: true,
        avatar: true,
        isActive: true
      },
      orderBy: [
        { platform: 'asc' },
        { name: 'asc' }
      ]
    });

    return accounts.map(account => ({
      ...account,
      username: account.name || 'Unknown',
      profileImageUrl: account.avatar,
      isConnected: account.isActive
    }));

  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return [];
  }
}
