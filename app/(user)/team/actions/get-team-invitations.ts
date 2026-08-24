import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { TeamInvitation } from '../types';

export async function getTeamInvitations(businessId: string): Promise<TeamInvitation[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id || !businessId) {
    return [];
  }

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      members: {
        some: {
          userId: session.user.id
        }
      }
    }
  });

  if (!business) {
    return [];
  }

  const invitations = await prisma.teamInvitation.findMany({
    where: {
      businessId: business.id
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return invitations as TeamInvitation[];
}
