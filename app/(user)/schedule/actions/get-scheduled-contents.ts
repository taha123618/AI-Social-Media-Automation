'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SearchParams, ScheduledContentsResponse, ScheduledContent } from '../types';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';

export async function getScheduledContents(searchParams: SearchParams): Promise<ScheduledContentsResponse> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    // Return empty response instead of throwing error for unauthorized access
    return {
      scheduledContents: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');
  const search = searchParams.search || '';
  const status = searchParams.status;
  const platform = searchParams.platform;
  const dateFrom = searchParams.dateFrom;
  const dateTo = searchParams.dateTo;

  const skip = (page - 1) * limit;

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return {
    scheduledContents: [],
    pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
  };

  // Build where conditions
  const where: Record<string, unknown> = {
    businessId: businessId,
    status: {
      in: ['SCHEDULED', 'POSTED', 'FAILED']
    }
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { customPrompt: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (platform) {
    where.platforms = {
      has: platform
    };
  }

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo);
    }
    where.scheduledFor = dateFilter;
  }

  const [scheduledContents, total] = await Promise.all([
    prisma.contentDraft.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        posts: {
          select: {
            id: true,
            platform: true,
            externalPostId: true,
            postedAt: true
          }
        },
        workflow: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      },
      skip,
      take: limit
    }),
    prisma.contentDraft.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    scheduledContents: scheduledContents as unknown as ScheduledContent[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}
