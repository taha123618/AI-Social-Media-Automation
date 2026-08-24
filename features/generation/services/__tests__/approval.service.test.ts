import { ApprovalService } from '../approval.service';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const contentDraft = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const approvalLog = {
    create: jest.fn(),
  };
  const businessMember = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  };
  const client = { contentDraft, approvalLog, businessMember };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    contentDraft,
    approvalLog,
    businessMember,
  };
});

describe('ApprovalService', () => {
  const draftId = 'draft_appr_123';
  const userId = 'usr_editor_1';
  const businessId = 'biz_corp_1';

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.businessMember.findMany as jest.Mock).mockResolvedValue([]);
  });

  describe('submitForApproval', () => {
    it('submits a draft for review if the user has EDITOR role', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'DRAFT',
        business: {
          members: [
            { userId, role: 'EDITOR' },
          ],
        },
      });

      await ApprovalService.submitForApproval(draftId, userId);

      expect(prisma.contentDraft.update).toHaveBeenCalledWith({
        where: { id: draftId },
        data: { status: 'PENDING_REVIEW' },
      });
      expect(prisma.approvalLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING_REVIEW',
          draftId,
          userId,
        }),
      });
    });

    it('rejects submission if the user is not a member of the business', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'DRAFT',
        business: {
          members: [
            { userId: 'different_user', role: 'EDITOR' },
          ],
        },
      });

      await expect(ApprovalService.submitForApproval(draftId, userId)).rejects.toThrow(
        'User is not a member of this business'
      );
    });

    it('rejects submission if the user is only a VIEWER', async () => {
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'DRAFT',
        business: {
          members: [
            { userId, role: 'VIEWER' },
          ],
        },
      });

      await expect(ApprovalService.submitForApproval(draftId, userId)).rejects.toThrow(
        'User does not have permission to submit for approval'
      );
    });
  });

  describe('reviewDraft', () => {
    it('allows an ADMIN to approve a draft', async () => {
      const adminId = 'usr_admin_1';
      (prisma.contentDraft.findUnique as jest.Mock).mockResolvedValue({
        id: draftId,
        businessId,
        status: 'PENDING_REVIEW',
        business: {
          members: [
            { userId: adminId, role: 'ADMIN' },
          ],
        },
        approvals: [],
      });

      const workflow = await ApprovalService.reviewDraft({
        draftId,
        userId: adminId,
        status: 'APPROVED',
        comment: 'LGTM!',
      });

      expect(prisma.contentDraft.update).toHaveBeenCalledWith({
        where: { id: draftId },
        data: { status: 'APPROVED' },
      });
      expect(prisma.approvalLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'APPROVED',
          comment: 'LGTM!',
        }),
      });
    });
  });
});
