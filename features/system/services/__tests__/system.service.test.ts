import { SystemService } from '../system.service';
import prisma from '@/lib/prisma';
import { SystemLogger } from '@/features/system/services/logger.service';

jest.mock('@/lib/prisma', () => {
  const activityLog = {
    count: jest.fn(),
    findMany: jest.fn(),
  };
  const errorLog = {
    count: jest.fn(),
    findMany: jest.fn(),
  };
  const auditLog = {
    count: jest.fn(),
    findMany: jest.fn(),
  };
  const systemMetric = {
    findMany: jest.fn(),
  };
  const client = { activityLog, errorLog, auditLog, systemMetric };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    activityLog,
    errorLog,
    auditLog,
    systemMetric,
  };
});

jest.mock('@/features/system/services/logger.service', () => ({
  SystemLogger: {
    logActivity: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('SystemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivityLogs', () => {
    it('retrieves paginated activity logs and records viewing action in audit', async () => {
      (prisma.activityLog.count as jest.Mock).mockResolvedValue(10);
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'log_1', action: 'POST_PUBLISHED', entity: 'Post', createdAt: new Date() },
      ]);

      const result = await SystemService.getActivityLogs({ page: 1, limit: 10 });
      expect(result.total).toBe(10);
      expect(result.logs).toHaveLength(1);
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'SYSTEM_ACTIVITY_LOGS_VIEWED',
        })
      );
    });
  });

  describe('getErrorLogs', () => {
    it('retrieves paginated error logs filtered by search and source', async () => {
      (prisma.errorLog.count as jest.Mock).mockResolvedValue(1);
      (prisma.errorLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'err_1', message: 'API rate limited', source: 'TwitterAdapter', resolved: false },
      ]);

      const result = await SystemService.getErrorLogs({ page: 1, limit: 10, search: 'rate limited' });
      expect(result.total).toBe(1);
      expect(result.logs[0].source).toBe('TwitterAdapter');
    });
  });

  describe('getAuditLogs', () => {
    it('retrieves paginated audit trail logs', async () => {
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(5);
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'audit_1', resource: 'Settings', action: 'UPDATE', status: 'SUCCESS' },
      ]);

      const result = await SystemService.getAuditLogs({ page: 1, limit: 10, search: 'Settings' });
      expect(result.total).toBe(5);
      expect(result.logs).toHaveLength(1);
    });
  });

  describe('getMetrics', () => {
    it('retrieves system metrics across selected timeframe', async () => {
      (prisma.systemMetric.findMany as jest.Mock).mockResolvedValue([
        { id: 'met_1', name: 'API_LATENCY', value: 120, timestamp: new Date() },
      ]);

      const metrics = await SystemService.getMetrics({ timeframe: '24h' });
      expect(metrics).toHaveLength(1);
      expect(SystemLogger.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'SYSTEM_METRICS_VIEWED',
        })
      );
    });
  });
});
