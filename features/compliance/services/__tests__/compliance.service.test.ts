import { ComplianceService } from '../compliance.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
  prisma: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logAudit: jest.fn(),
  },
}));

describe('ComplianceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handeMetaDataDeletion', () => {
    it('deletes user record and logs audit trail for GDPR compliance', async () => {
      const mockUser = {
        id: 'usr_del_123',
        email: 'user@example.com',
        ownedOrganizations: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await ComplianceService.handeMetaDataDeletion('user@example.com');

      expect(result.success).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'usr_del_123' },
      });
      expect(SystemLogger.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DATA_DELETION_REQUESTED',
          userId: 'usr_del_123',
        })
      );
    });

    it('throws an error if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ComplianceService.handeMetaDataDeletion('nonexistent@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('exportUserData', () => {
    it('exports all user data as formatted JSON and logs audit trail', async () => {
      const mockUserData = {
        id: 'usr_exp_123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        ownedOrganizations: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);

      const exportedJson = await ComplianceService.exportUserData('usr_exp_123');
      const parsed = JSON.parse(exportedJson);

      expect(parsed.id).toBe('usr_exp_123');
      expect(parsed.email).toBe('jane@example.com');
      expect(SystemLogger.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DATA_EXPORT_REQUESTED',
          userId: 'usr_exp_123',
        })
      );
    });
  });
});
