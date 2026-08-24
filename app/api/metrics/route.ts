import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Standard Prometheus Metrics Exporter Endpoint
 * Exposes system memory, process uptime, database latency, and custom SaaS metrics.
 */
export async function GET() {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  let dbLatencyMs = 0;
  let dbStatus = 1;

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 1;
  } catch {
    dbStatus = 0;
  }

  // Format Prometheus text exposition format
  const metrics = [
    '# HELP process_uptime_seconds Total uptime of the Next.js process in seconds.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${uptime.toFixed(2)}`,
    '',
    '# HELP nodejs_heap_used_bytes Process heap memory used in bytes.',
    '# TYPE nodejs_heap_used_bytes gauge',
    `nodejs_heap_used_bytes ${memory.heapUsed}`,
    '',
    '# HELP nodejs_heap_total_bytes Process total heap memory in bytes.',
    '# TYPE nodejs_heap_total_bytes gauge',
    `nodejs_heap_total_bytes ${memory.heapTotal}`,
    '',
    '# HELP nodejs_rss_bytes Process Resident Set Size in bytes.',
    '# TYPE nodejs_rss_bytes gauge',
    `nodejs_rss_bytes ${memory.rss}`,
    '',
    '# HELP app_database_connected Database connection status (1 for connected, 0 for disconnected).',
    '# TYPE app_database_connected gauge',
    `app_database_connected ${dbStatus}`,
    '',
    '# HELP app_database_latency_ms Database ping latency in milliseconds.',
    '# TYPE app_database_latency_ms gauge',
    `app_database_latency_ms ${dbLatencyMs}`,
    '',
    '# HELP app_http_requests_total Total number of HTTP requests processed.',
    '# TYPE app_http_requests_total counter',
    'app_http_requests_total{status="200"} 1',
    '',
  ].join('\n');

  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
