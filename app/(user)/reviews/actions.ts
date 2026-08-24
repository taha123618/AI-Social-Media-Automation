'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateReviewSettings(businessId: string, autoRequest: boolean) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify access
  const businessMember = await prisma.businessMember.findFirst({
    where: {
      businessId,
      userId: session.user.id
    }
  });

  if (!businessMember) {
    throw new Error('Access denied');
  }

  const profile = await prisma.businessProfile.upsert({
    where: { businessId },
    update: { autoRequestReviews: autoRequest },
    create: {
      businessId,
      autoRequestReviews: autoRequest
    }
  });

  revalidatePath('/reviews');
  return { success: true, profile };
}

export async function getReviewSettings(businessId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { businessId }
  });

  return { autoRequestReviews: profile?.autoRequestReviews || false };
}
