import { POST } from '../route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const client = {
    errorLog: {
      create: jest.fn().mockResolvedValue({ id: 'err_alert_1' }),
    },
  };
  return {
    __esModule: true,
    default: client,
    prisma: client,
  };
});

describe('Alertmanager Webhook /api/system/alerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes incoming alerts and logs them to errorLog table', async () => {
    const payload = {
      version: '4',
      status: 'firing',
      alerts: [
        {
          status: 'firing',
          labels: {
            alertname: 'HighDatabaseLatency',
            severity: 'warning',
          },
          annotations: {
            summary: 'PostgreSQL Query Latency high',
            description: 'Database ping latency is 620ms',
          },
        },
      ],
    };

    const req = new NextRequest('http://localhost:3000/api/system/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.processedAlerts).toBe(1);
    expect(prisma.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          message: expect.stringContaining('HighDatabaseLatency'),
          source: 'alertmanager:warning',
        }),
      })
    );
  });

  it('handles invalid json payloads gracefully', async () => {
    const req = new NextRequest('http://localhost:3000/api/system/alerts', {
      method: 'POST',
      body: 'invalid-json',
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
