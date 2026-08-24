import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: 'pass' | 'fail'; message?: string; latencyMs?: number }> = {};
  let allHealthy = true;

  // 1. PostgreSQL + pgvector check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'pass',
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    allHealthy = false;
    checks.database = {
      status: 'fail',
      message: err.message || 'Database connection error',
    };
  }

  const responsePayload = {
    status: allHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(responsePayload, { status: allHealthy ? 200 : 503 });
}
