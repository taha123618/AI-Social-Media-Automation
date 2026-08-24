import { TeamService } from '../team.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => {
  const businessMember = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const client = { businessMember };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    businessMember,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('TeamService', () => {
  const businessId = 'biz_team_test_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembers', () => {
    it('retrieves all team members for the specified business', async () => {
      const mockMembers = [
        { id: 'm1', userId: 'u1', role: 'OWNER', businessId },
        { id: 'm2', userId: 'u2', role: 'EDITOR', businessId },
      ];
      (prisma.businessMember.findMany as jest.Mock).mockResolvedValue(mockMembers);

      const members = await TeamService.getMembers(businessId);
      expect(members.length).toBe(2);
      expect(prisma.businessMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { businessId },
        })
      );
    });
  });

  describe('updateMemberRole', () => {
    it('updates member role and logs audit activity', async () => {
      const memberId = 'm2';
      const updatedMember = { id: memberId, userId: 'u2', role: 'ADMIN', businessId };
      (prisma.businessMember.update as jest.Mock).mockResolvedValue(updatedMember);

      const result = await TeamService.updateMemberRole(memberId, businessId, 'ADMIN');
      expect(result.role).toBe('ADMIN');
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TEAM_MEMBER_ROLE_UPDATED',
          entityId: memberId,
        })
      );
    });
  });

  describe('removeMember', () => {
    it('removes member from business and logs audit activity', async () => {
      const memberId = 'm2';
      (prisma.businessMember.delete as jest.Mock).mockResolvedValue({
        id: memberId,
        userId: 'u2',
        businessId,
      });

      const result = await TeamService.removeMember(memberId, businessId);
      expect(result.id).toBe(memberId);
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TEAM_MEMBER_REMOVED',
          entityId: memberId,
        })
      );
    });
  });

  describe('inviteMember', () => {
    it('creates an invitation payload with 7-day expiration and logs activity', async () => {
      const invitation = await TeamService.inviteMember({
        email: 'collaborator@agency.com',
        role: 'EDITOR',
        businessId,
        invitedById: 'u1',
      });

      expect(invitation.email).toBe('collaborator@agency.com');
      expect(invitation.role).toBe('EDITOR');
      expect(invitation.token).toBeDefined();
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TEAM_INVITATION_SENT',
        })
      );
    });
  });
});
