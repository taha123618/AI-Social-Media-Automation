import { GET } from '../route';
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

describe('Prometheus /api/metrics endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes metrics in Prometheus 0.0.4 text format with connected DB', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(text).toContain('nodejs_heap_used_bytes');
    expect(text).toContain('process_uptime_seconds');
    expect(text).toContain('app_database_connected 1');
  });

  it('handles database disconnect by setting app_database_connected to 0', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('DB unreachable'));

    const response = await GET();
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('app_database_connected 0');
  });
});
