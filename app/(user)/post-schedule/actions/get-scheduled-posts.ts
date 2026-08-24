'use server';

import prisma from '@/lib/prisma';

export interface SearchParams {
  page?: string;
  limit?: string;
  status?: string;
  platform?: string;
}

export async function getScheduledPosts(params: SearchParams) {
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '20');
  const skip = (page - 1) * limit;

  try {
    // Build where clause based on filters
    const where: Record<string, unknown> = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.platform) {
      where.platform = params.platform;
    }

    // Fetch scheduled posts with related data
    const [scheduledPosts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          draft: {
            select: {
              title: true,
              status: true,
            },
          },
          business: {
            select: {
              name: true,
            },
          },
          workflow: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          scheduledFor: 'asc',
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Transform postedAt to createdAt for type compatibility
    const transformedPosts = scheduledPosts.map((post) => ({
      ...post,
      createdAt: post.postedAt || new Date(),
    }));

    return {
      scheduledPosts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Failed to fetch scheduled posts:', error);
    throw new Error('Failed to load scheduled posts');
  }
}
