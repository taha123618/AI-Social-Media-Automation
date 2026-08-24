'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';

export async function getCurrentBusinessAndUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const userId = session.user.id;
    const activeBusinessId = await getActiveWorkspaceId();

    if (!activeBusinessId) {
      return { error: 'No business found' };
    }

    // Get the specific business member record
    const businessMember = await prisma.businessMember.findFirst({
      where: {
        userId,
        businessId: activeBusinessId
      },
      include: { business: true }
    });

    if (!businessMember) {
      // Fallback if the active business ID doesn't match a membership
      // (though getActiveWorkspaceId should have handled this)
      const fallbackMember = await prisma.businessMember.findFirst({
        where: { userId },
        include: { business: true }
      });

      if (!fallbackMember) {
        return { error: 'No business found' };
      }

      return {
        businessId: fallbackMember.businessId,
        creatorId: userId,
        business: fallbackMember.business
      };
    }

    return {
      businessId: businessMember.businessId,
      creatorId: userId,
      business: businessMember.business
    };
  } catch (error) {
    console.error('Failed to get business and user:', error);
    return { error: 'Failed to authenticate' };
  }
}
