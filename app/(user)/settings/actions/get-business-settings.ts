'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BusinessSettings } from '../types';
import { getActiveWorkspaceId } from '@/app/(user)/actions/workspace';

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const session = await auth.api.getSession({
    headers: {
      cookie: ''
    }
  });

  if (!session?.user?.id) {
    // Return null instead of throwing error for unauthorized access
    return null;
  }

  const businessId = await getActiveWorkspaceId();
  if (!businessId) return null;

  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
    },
    include: {
      socialAccounts: true
    }
  });

  if (!business) {
    return null;
  }

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    website: business.website,
    logo: business.logo,
    description: null, // Would come from BusinessProfile
    industry: null, // Would come from BusinessProfile
    size: null, // Would come from BusinessProfile
    timezone: 'UTC', // Default timezone
    defaultPlatforms: business.socialAccounts.map(account => account.platform),
    autoApproveContent: false,
    requireApprovalForPosts: true,
    contentGuidelines: null,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
  };
}
