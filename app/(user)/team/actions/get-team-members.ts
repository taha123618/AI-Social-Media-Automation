'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { TeamMember } from '../types';

export async function getTeamMembers(businessId: string, search: string = ''): Promise<TeamMember[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id || !businessId) {
    // Return empty array instead of throwing error for unauthorized access
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

  const members = await prisma.businessMember.findMany({
    where: {
      businessId: business.id,
      ...(search ? {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      } : {})
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      business: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      joinedAt: 'asc'
    }
  });

  return members as unknown as TeamMember[];
}
