import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getActiveWorkspaceIdSafe } from '@/app/(user)/actions/workspace';
import { SearchParams, Workflow, WorkflowWithTeam } from '@/features/workflow/types';


export async function getWorkflows(searchParams: SearchParams = {}): Promise<WorkflowWithTeam[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return [];
  }

  const businessId = await getActiveWorkspaceIdSafe();
  if (!businessId) return [];

  const search = searchParams.search || '';
  const status = searchParams.status;

  const where: any = {
    businessId: businessId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  const [workflows, teamMembers, executionStats] = await Promise.all([
    prisma.workflow.findMany({
      where,
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
        uploadConfig: true,
        contentDrafts: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.businessMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    }),
    prisma.workflowExecution.groupBy({
      by: ['workflowId', 'status'],
      where: { workflow: { businessId } },
      _count: { id: true }
    })
  ]);

  // Aggregate execution stats by workflowId
  const workflowStats: Record<string, { total: number; completed: number }> = {};
  executionStats.forEach((stat: any) => {
    if (!workflowStats[stat.workflowId]) {
      workflowStats[stat.workflowId] = { total: 0, completed: 0 };
    }
    workflowStats[stat.workflowId].total += stat._count.id;
    if (stat.status === 'COMPLETED') {
      workflowStats[stat.workflowId].completed += stat._count.id;
    }
  });

  // Serialize workflows for client-side consumption
  return workflows.map(workflow => {
    const stats = workflowStats[workflow.id] || { total: 0, completed: 0 };
    const successRate = stats.total > 0
      ? ((stats.completed / stats.total) * 100).toFixed(1) + '%'
      : '100%';

    return {
      ...workflow,
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
      lastRunAt: workflow.lastRunAt?.toISOString() || null,
      successRate,
      lastDraft: workflow.contentDrafts?.[0] ? {
        id: workflow.contentDrafts[0].id,
        content: workflow.contentDrafts[0].content,
        imageUrls: (workflow.contentDrafts[0].contentJson as any)?.mediaUrls || [],
        createdAt: workflow.contentDrafts[0].createdAt.toISOString(),
      } : null,
      teamMembers: teamMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
      })),
      creatorName: workflow.creator.name,
      creatorImage: workflow.creator.image,
    };
  }) as unknown as WorkflowWithTeam[];
}
