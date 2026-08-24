import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

export class WorkflowService {
  /**
   * Submit a draft for review
   */
  static async submitForReview(draftId: string, userId: string) {
    const draft = await prisma.contentDraft.findUnique({ where: { id: draftId } });

    if (!draft) throw new Error("Draft not found");
    if (draft.status !== 'GENERATED' && draft.status !== 'REJECTED') {
      throw new Error(`Cannot submit draft in ${draft.status} state`);
    }

    const updated = await prisma.contentDraft.update({
      where: { id: draftId },
      data: { status: 'PENDING_REVIEW' }
    });

    await SystemLogger.logActivity({
      action: 'DRAFT_SUBMITTED_FOR_REVIEW',
      entity: 'ContentDraft',
      entityId: draftId,
      details: { userId, businessId: updated.businessId }
    });

    return updated;
  }

  /**
   * Approve a draft
   */
  static async approveDraft(draftId: string, userId: string, comment?: string) {
    const draft = await prisma.contentDraft.findUnique({ where: { id: draftId } });

    if (!draft) throw new Error("Draft not found");
    // Strict transition: Only PENDING_REVIEW -> APPROVED
    if (draft.status !== 'PENDING_REVIEW') {
      throw new Error("Draft is not pending review");
    }

    // 1. Log Approval
    await prisma.approvalLog.create({
      data: {
        draftId,
        userId,
        status: 'APPROVED',
        comment
      }
    });

    // 2. Update Status
    const updated = await prisma.contentDraft.update({
      where: { id: draftId },
      data: { status: 'APPROVED' }
    });

    await SystemLogger.logActivity({
      action: 'DRAFT_APPROVED',
      entity: 'ContentDraft',
      entityId: draftId,
      details: { userId, businessId: updated.businessId }
    });

    return updated;
  }

  /**
   * Reject a draft
   */
  static async rejectDraft(draftId: string, userId: string, reason: string) {
    const draft = await prisma.contentDraft.findUnique({ where: { id: draftId } });

    if (!draft) throw new Error("Draft not found");
    if (draft.status !== 'PENDING_REVIEW') {
      throw new Error("Draft is not pending review");
    }

    // 1. Log Rejection
    await prisma.approvalLog.create({
      data: {
        draftId,
        userId,
        status: 'REJECTED',
        comment: reason
      }
    });

    // 2. Update Status
    const updated = await prisma.contentDraft.update({
      where: { id: draftId },
      data: { status: 'REJECTED' }
    });

    await SystemLogger.logActivity({
      action: 'DRAFT_REJECTED',
      entity: 'ContentDraft',
      entityId: draftId,
      details: { userId, reason, businessId: updated.businessId }
    });

    return updated;
  }

  /**
   * Schedule the post (Final step before Queue)
   */
  static async scheduleDraft(draftId: string, userId: string, scheduledDate: Date) {
    const draft = await prisma.contentDraft.findUnique({ where: { id: draftId } });

    if (!draft) throw new Error("Draft not found");
    if (draft.status !== 'APPROVED') {
       throw new Error("Draft must be APPROVED before scheduling");
    }

    if (scheduledDate <= new Date()) {
        throw new Error("Scheduled date must be in the future");
    }

    const updated = await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        status: 'SCHEDULED',
        scheduledFor: scheduledDate
      }
    });

    await SystemLogger.logActivity({
      action: 'DRAFT_SCHEDULED',
      entity: 'ContentDraft',
      entityId: draftId,
      details: { userId, scheduledDate, businessId: updated.businessId }
    });

    return updated;

    // Note: The actual queuing logic (calling SchedulerService.schedulePost)
    // should be triggered by the Controller/Action after this DB update succeeds.
  }
}
