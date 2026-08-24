'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function acceptTeamInvitation(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: 'You must be logged in to accept an invitation.' };
  }

  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
  });

  if (!invitation) return { error: 'Invitation not found or invalid.' };
  if (invitation.acceptedAt) return { error: 'Invitation has already been accepted.' };
  if (invitation.expiresAt < new Date()) return { error: 'Invitation has expired.' };

  // Check if they are already a member
  const existingMember = await prisma.businessMember.findFirst({
    where: {
      userId: session.user.id,
      businessId: invitation.businessId,
    },
  });

  if (existingMember) {
    return { error: 'You are already a member of this workspace.' };
  }

  // Create the member and mark invitation as accepted
  await prisma.$transaction([
    prisma.businessMember.create({
      data: {
        userId: session.user.id,
        businessId: invitation.businessId,
        role: invitation.role,
      },
    }),
    prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  revalidatePath('/team');
  return { success: true };
}
