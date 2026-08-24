import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { ContentStatus, Platform, ContentIntent } from '@/app/generated/prisma/enums';

export interface CreateContentData {
  title?: string;
  intent: ContentIntent;
  platforms: Platform[];
  customPrompt?: string;
  contextUsed?: Prisma.InputJsonValue;
  generatedContent?: Prisma.InputJsonValue;
  mediaUrl?: string;
  businessId: string;
  creatorId: string;
}

export interface UpdateContentData {
  title?: string;
  customPrompt?: string;
  contextUsed?: Prisma.InputJsonValue;
  generatedContent?: Prisma.InputJsonValue;
  mediaUrl?: string;
  status?: ContentStatus;
  scheduledFor?: Date;
}

export interface ContentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  platform?: Platform;
  intent?: ContentIntent;
  dateFrom?: Date;
  dateTo?: Date;
}

export class ContentsService {
  static async create(data: CreateContentData) {
    return await prisma.contentDraft.create({
      data: {
        ...data,
        status: ContentStatus.GENERATED,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        posts: {
          select: {
            id: true,
            platform: true,
            externalPostId: true,
            postedAt: true,
          },
        },
      },
    });
  }

  static async findById(id: string, businessId: string) {
    return await prisma.contentDraft.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        posts: {
          select: {
            id: true,
            platform: true,
            externalPostId: true,
            postedAt: true,
          },
        },
      },
    });
  }

  static async findMany(businessId: string, filters: ContentFilters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      platform,
      intent,
      dateFrom,
      dateTo,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Record<string, unknown> = {
      businessId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { customPrompt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (platform) {
      where.platforms = {
        has: platform,
      };
    }

    if (intent) {
      where.intent = intent;
    }

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) {
        dateFilter.gte = dateFrom;
      }
      if (dateTo) {
        dateFilter.lte = dateTo;
      }
      where.createdAt = dateFilter;
    }

    const [contents, total] = await Promise.all([
      prisma.contentDraft.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvals: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          posts: {
            select: {
              id: true,
              platform: true,
              externalPostId: true,
              postedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contentDraft.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      contents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async update(id: string, businessId: string, data: UpdateContentData) {
    return await prisma.contentDraft.update({
      where: {
        id,
        businessId,
      },
      data,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        posts: {
          select: {
            id: true,
            platform: true,
            externalPostId: true,
            postedAt: true,
          },
        },
      },
    });
  }

  static async delete(id: string, businessId: string) {
    return await prisma.contentDraft.delete({
      where: {
        id,
        businessId,
      },
    });
  }

  static async updateStatus(id: string, businessId: string, status: ContentStatus, userId?: string) {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === ContentStatus.POSTED) {
      updateData.postedAt = new Date();
    }

    return await prisma.contentDraft.update({
      where: {
        id,
        businessId,
      },
      data: updateData,
    });
  }

  static async getScheduledContents(businessId: string, filters: Omit<ContentFilters, 'status'> = {}) {
    return await this.findMany(businessId, {
      ...filters,
      status: ContentStatus.SCHEDULED,
    });
  }
}
