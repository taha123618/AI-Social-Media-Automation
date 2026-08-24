import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const memory = process.memoryUsage();

  const healthData: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    system: {
      memory: {
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    },
    services: {
      database: 'checking',
    },
  };

  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`;
    healthData.services.database = 'connected';
  } catch (dbError: any) {
    healthData.status = 'degraded';
    healthData.services.database = `disconnected (${dbError.message || 'unknown error'})`;
  }

  healthData.responseTimeMs = Date.now() - startTime;

  const httpStatus = healthData.status === 'healthy' ? 200 : 503;
  return NextResponse.json(healthData, { status: httpStatus });
}
