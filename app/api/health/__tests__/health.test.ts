import { GET as healthHandler } from '../route';
import { GET as readyHandler } from '../ready/route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const client = {
    $queryRaw: jest.fn(),
  };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    $queryRaw: client.$queryRaw,
  };
});

describe('/api/health endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns healthy 200 status when database responds', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

      const response = await healthHandler();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('healthy');
      expect(body.services.database).toBe('connected');
      expect(body.system.memory).toBeDefined();
    });

    it('returns degraded 503 status when database fails', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const response = await healthHandler();
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.status).toBe('degraded');
      expect(body.services.database).toContain('disconnected');
    });
  });

  describe('GET /api/health/ready', () => {
    it('returns ready 200 when all critical dependency checks pass', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

      const response = await readyHandler();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('ready');
      expect(body.checks.database.status).toBe('pass');
    });

    it('returns not_ready 503 when a dependency check fails', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Timeout'));

      const response = await readyHandler();
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.status).toBe('not_ready');
      expect(body.checks.database.status).toBe('fail');
    });
  });
});
