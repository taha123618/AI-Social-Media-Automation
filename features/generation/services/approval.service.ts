import { ContentStatus } from '@/app/generated/prisma/client';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export const ApprovalRequestSchema = z.object({
  draftId: z.string(),
  userId: z.string(),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED']),
  comment: z.string().optional(),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export interface ApprovalWorkflow {
  draftId: string;
  currentStatus: ContentStatus;
  approvals: Array<{
    userId: string;
    status: ContentStatus;
    comment?: string;
    reviewedAt: Date;
    userName: string;
  }>;
  nextActions: Array<{
    action: string;
    allowedRoles: string[];
    description: string;
  }>;
}

export class ApprovalService {
  static async submitForApproval(draftId: string, userId: string): Promise<void> {
    // Verify user has permission
    const draft = await prisma.contentDraft.findUnique({
      where: { id: draftId },
      include: {
        business: {
          include: { members: true },
        },
      },
    });

    if (!draft) {
      throw new Error(`Content draft ${draftId} not found`);
    }

    const userMember = draft.business.members.find(
      member => member.userId === userId
    );

    if (!userMember) {
      throw new Error('User is not a member of this business');
    }

    // Only creators and above can submit for approval
    if (!['OWNER', 'ADMIN', 'EDITOR'].includes(userMember.role)) {
      throw new Error('User does not have permission to submit for approval');
    }

    // Update draft status
    await prisma.contentDraft.update({
      where: { id: draftId },
      data: { status: 'PENDING_REVIEW' },
    });

    // Create approval log entry
    await prisma.approvalLog.create({
      data: {
        status: 'PENDING_REVIEW',
        comment: 'Submitted for approval',
        userId,
        draftId,
      },
    });

    // Notify approvers (implementation would depend on notification system)
    await this.notifyApprovers(draft.businessId, draftId);
  }

  static async reviewDraft(request: ApprovalRequest): Promise<ApprovalWorkflow> {
    const validated = ApprovalRequestSchema.parse(request);

    const draft = await prisma.contentDraft.findUnique({
      where: { id: validated.draftId },
      include: {
        business: {
          include: { members: true },
        },
        approvals: {
          include: { user: true },
        },
      },
    });

    if (!draft) {
      throw new Error(`Content draft ${validated.draftId} not found`);
    }

    const userMember = draft.business.members.find(
      member => member.userId === validated.userId
    );

    if (!userMember) {
      throw new Error('User is not a member of this business');
    }

    // Check if user can approve/reject
    const canApprove = ['OWNER', 'ADMIN'].includes(userMember.role);
    const canReview = ['OWNER', 'ADMIN', 'EDITOR'].includes(userMember.role);

    if (!canReview) {
      throw new Error('User does not have permission to review content');
    }

    if ((validated.status === 'APPROVED' || validated.status === 'REJECTED') && !canApprove) {
      throw new Error('User does not have permission to approve or reject content');
    }

    // Create approval log entry
    await prisma.approvalLog.create({
      data: {
        status: validated.status,
        comment: validated.comment,
        userId: validated.userId,
        draftId: validated.draftId,
      },
    });

    // Update draft status based on approval
    await prisma.contentDraft.update({
      where: { id: validated.draftId },
      data: { status: validated.status },
    });

    // If approved, schedule for posting or mark as ready
    if (validated.status === 'APPROVED') {
      await this.handleApprovedDraft(validated.draftId);
    }

    // Return updated workflow
    return this.getApprovalWorkflow(validated.draftId);
  }

  static async getApprovalWorkflow(draftId: string): Promise<ApprovalWorkflow> {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: draftId },
      include: {
        business: {
          include: { members: true },
        },
        approvals: {
          include: { user: true },
          orderBy: { reviewedAt: 'desc' },
        },
      },
    });

    if (!draft) {
      throw new Error(`Content draft ${draftId} not found`);
    }

    const approvals = draft.approvals.map(approval => ({
      userId: approval.userId,
      status: approval.status,
      comment: approval.comment || undefined,
      reviewedAt: approval.reviewedAt,
      userName: approval.user.name || 'Unknown User',
    }));

    const nextActions = this.calculateNextActions(draft.status, draft.business.members);

    return {
      draftId,
      currentStatus: draft.status,
      approvals,
      nextActions,
    };
  }

  private static calculateNextActions(
    currentStatus: ContentStatus,
    _members: Array<{ userId: string; role: string }>
  ): Array<{ action: string; allowedRoles: string[]; description: string }> {
    const actions: Array<{ action: string; allowedRoles: string[]; description: string }> = [];

    switch (currentStatus) {
      case 'GENERATED':
        actions.push({
          action: 'SUBMIT_FOR_APPROVAL',
          allowedRoles: ['OWNER', 'ADMIN', 'EDITOR'],
          description: 'Submit draft for review and approval',
        });
        break;

      case 'PENDING_REVIEW':
        actions.push({
          action: 'REVIEW',
          allowedRoles: ['OWNER', 'ADMIN', 'EDITOR'],
          description: 'Review and provide feedback on the draft',
        });
        actions.push({
          action: 'APPROVE',
          allowedRoles: ['OWNER', 'ADMIN'],
          description: 'Approve the draft for posting',
        });
        actions.push({
          action: 'REJECT',
          allowedRoles: ['OWNER', 'ADMIN'],
          description: 'Reject the draft with feedback',
        });
        break;

      case 'APPROVED':
        actions.push({
          action: 'SCHEDULE',
          allowedRoles: ['OWNER', 'ADMIN', 'EDITOR'],
          description: 'Schedule the approved content for posting',
        });
        actions.push({
          action: 'POST_NOW',
          allowedRoles: ['OWNER', 'ADMIN'],
          description: 'Post the content immediately',
        });
        break;

      case 'REJECTED':
        actions.push({
          action: 'REVISE',
          allowedRoles: ['OWNER', 'ADMIN', 'EDITOR'],
          description: 'Revise the content based on feedback',
        });
        actions.push({
          action: 'RESUBMIT',
          allowedRoles: ['OWNER', 'ADMIN', 'EDITOR'],
          description: 'Resubmit the revised draft for approval',
        });
        break;

      case 'SCHEDULED':
        actions.push({
          action: 'RESCHEDULE',
          allowedRoles: ['OWNER', 'ADMIN'],
          description: 'Change the scheduled posting time',
        });
        actions.push({
          action: 'CANCEL',
          allowedRoles: ['OWNER', 'ADMIN'],
          description: 'Cancel the scheduled post',
        });
        break;

      default:
        break;
    }

    return actions;
  }

  private static async handleApprovedDraft(draftId: string): Promise<void> {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: draftId },
      include: { business: true },
    });

    if (!draft) return;

    // Check if business has auto-scheduling enabled
    // This would be a business setting, for now we'll just mark as ready
    console.log(`Draft ${draftId} approved and ready for scheduling`);
  }

  private static async notifyApprovers(businessId: string, draftId: string): Promise<void> {
    // Get members who can approve
    const approvers = await prisma.businessMember.findMany({
      where: {
        businessId,
        role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
    });

    // Implementation would send notifications via email, in-app, etc.
    for (const approver of approvers) {
      console.log(`Notifying ${approver.user.name} about draft ${draftId} awaiting approval`);
    }
  }

  static async getPendingApprovals(businessId: string): Promise<ApprovalWorkflow[]> {
    const drafts = await prisma.contentDraft.findMany({
      where: {
        businessId,
        status: 'PENDING_REVIEW',
      },
      include: {
        approvals: {
          include: { user: true },
          orderBy: { reviewedAt: 'desc' },
        },
      },
    });

    const workflows: ApprovalWorkflow[] = [];

    for (const draft of drafts) {
      const workflow = await this.getApprovalWorkflow(draft.id);
      workflows.push(workflow);
    }

    return workflows;
  }

  static async bulkApprove(
    draftIds: string[],
    userId: string,
    comment?: string
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const draftId of draftIds) {
      try {
        await this.reviewDraft({
          draftId,
          userId,
          status: 'APPROVED',
          comment,
        });
        success.push(draftId);
      } catch (error) {
        failed.push(draftId);
        console.error(`Failed to approve draft ${draftId}:`, error);
      }
    }

    return { success, failed };
  }

  static async getApprovalStats(businessId: string, days: number = 30): Promise<{
    totalSubmitted: number;
    approved: number;
    rejected: number;
    pending: number;
    averageApprovalTime: number; // in hours
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const drafts = await prisma.contentDraft.findMany({
      where: {
        businessId,
        createdAt: { gte: startDate },
      },
      include: {
        approvals: {
          orderBy: { reviewedAt: 'asc' },
        },
      },
    });

    const totalSubmitted = drafts.length;
    const approved = drafts.filter(d => d.status === 'APPROVED').length;
    const rejected = drafts.filter(d => d.status === 'REJECTED').length;
    const pending = drafts.filter(d => d.status === 'PENDING_REVIEW').length;

    // Calculate average approval time
    const approvalTimes: number[] = [];
    for (const draft of drafts) {
      if (draft.approvals.length > 0) {
        const firstApproval = draft.approvals[0];
        const timeDiff = firstApproval.reviewedAt.getTime() - draft.createdAt.getTime();
        approvalTimes.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
      }
    }

    const averageApprovalTime = approvalTimes.length > 0
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
      : 0;

    return {
      totalSubmitted,
      approved,
      rejected,
      pending,
      averageApprovalTime,
    };
  }
}
