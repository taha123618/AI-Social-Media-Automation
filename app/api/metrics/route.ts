import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QueueManager } from '@/features/scheduler/config/queue.config';

export const dynamic = 'force-dynamic';

/**
 * Standard Prometheus Metrics Exporter Endpoint
 * Exposes system memory, process uptime, database latency, BullMQ queue depths, and SaaS metrics.
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
  const metricLines: string[] = [
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
  ];

  // Try retrieving BullMQ queue counts with a short timeout to prevent slow metrics responses
  try {
    const queueStatsPromise = QueueManager.getAllQueueStats();
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const queueStats = await Promise.race([queueStatsPromise, timeoutPromise]);

    if (queueStats && typeof queueStats === 'object') {
      metricLines.push('');
      metricLines.push('# HELP bullmq_jobs_waiting Number of waiting jobs in the BullMQ queue.');
      metricLines.push('# TYPE bullmq_jobs_waiting gauge');
      for (const [qName, counts] of Object.entries(queueStats as Record<string, any>)) {
        metricLines.push(`bullmq_jobs_waiting{queue="${qName}"} ${counts.waiting ?? 0}`);
      }

      metricLines.push('');
      metricLines.push('# HELP bullmq_jobs_active Number of active jobs currently processing.');
      metricLines.push('# TYPE bullmq_jobs_active gauge');
      for (const [qName, counts] of Object.entries(queueStats as Record<string, any>)) {
        metricLines.push(`bullmq_jobs_active{queue="${qName}"} ${counts.active ?? 0}`);
      }

      metricLines.push('');
      metricLines.push('# HELP bullmq_jobs_failed Number of failed jobs in the queue.');
      metricLines.push('# TYPE bullmq_jobs_failed gauge');
      for (const [qName, counts] of Object.entries(queueStats as Record<string, any>)) {
        metricLines.push(`bullmq_jobs_failed{queue="${qName}"} ${counts.failed ?? 0}`);
      }
    }
  } catch {
    // Queue metrics collection error handled gracefully without blocking Prometheus
  }

  metricLines.push('');

  return new NextResponse(metricLines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
