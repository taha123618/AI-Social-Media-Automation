import { WorkflowService } from '../workflow.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => {
  const contentDraft = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const approvalLog = {
    create: jest.fn(),
  };
  const client = { contentDraft, approvalLog };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    contentDraft,
    approvalLog,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('WorkflowService State Machine', () => {
  const draftId = 'draft_wf_123';
  const userId = 'usr_reviewer_1';
  const businessId = 'biz_wf_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitForReview', () => {
    it('transitions draft status from GENERATED to PENDING_REVIEW', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'GENERATED',
      });
      (prisma.contentDraft.update as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'PENDING_REVIEW',
      });

      const result = await WorkflowService.submitForReview(draftId, userId);
      expect(result.status).toBe('PENDING_REVIEW');
      expect(prisma.contentDraft.update).toHaveBeenCalledWith({
        where: { id: draftId },
        data: { status: 'PENDING_REVIEW' },
      });
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DRAFT_SUBMITTED_FOR_REVIEW',
        })
      );
    });

    it('throws an error if the draft is already approved or scheduled', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'APPROVED',
      });

      await expect(WorkflowService.submitForReview(draftId, userId)).rejects.toThrow(
        'Cannot submit draft in APPROVED state'
      );
    });
  });

  describe('approveDraft', () => {
    it('approves draft only when in PENDING_REVIEW state and creates approval log', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'PENDING_REVIEW',
      });
      (prisma.contentDraft.update as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'APPROVED',
      });

      const result = await WorkflowService.approveDraft(draftId, userId, 'Approved for publishing');
      expect(result.status).toBe('APPROVED');
      expect(prisma.approvalLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          draftId,
          userId,
          status: 'APPROVED',
          comment: 'Approved for publishing',
        }),
      });
    });

    it('rejects approval attempt if draft is not in PENDING_REVIEW state', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'GENERATED',
      });

      await expect(
        WorkflowService.approveDraft(draftId, userId, 'Approved')
      ).rejects.toThrow('Draft is not pending review');
    });
  });

  describe('rejectDraft', () => {
    it('rejects draft, logs reason, and updates status to REJECTED', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'PENDING_REVIEW',
      });
      (prisma.contentDraft.update as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'REJECTED',
      });

      const result = await WorkflowService.rejectDraft(draftId, userId, 'Needs more hashtags');
      expect(result.status).toBe('REJECTED');
      expect(prisma.approvalLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          draftId,
          userId,
          status: 'REJECTED',
          comment: 'Needs more hashtags',
        }),
      });
    });
  });
});
