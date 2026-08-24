import "dotenv/config";
import os from "os";
import prisma from "@/lib/prisma";
import { SystemLogger } from "@/features/system/services/logger.service";

export async function collectSystemMetrics() {
  console.log("Collecting system metrics...");
  const startTime = Date.now();

  try {
    await SystemLogger.logCron("SYSTEM_METRICS", "START");

    // Basic CPU usage calculation (Linux/macOS)
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) =>
      acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq + cpu.times.idle, 0
    );

    // In a real cron running every minute, we'd need to compare this to previous ticks.
    // As a point in time approximation, we use load average or a static conversion here.
    const loadAvg = os.loadavg()[0];
    const cpuUsagePercent = (loadAvg / cpus.length) * 100;

    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    await SystemLogger.logMetric({
      name: "CPU_USAGE",
      value: Math.min(cpuUsagePercent, 100), // Cap at 100%
      unit: "PERCENTAGE",
      tags: { source: os.hostname() }
    });

    await SystemLogger.logMetric({
      name: "MEMORY_USAGE",
      value: memUsagePercent,
      unit: "PERCENTAGE",
      tags: { source: os.hostname() }
    });

    // Active Users — count distinct users who have at least one non-expired session
    const activeUsers = await prisma.user.count({
      where: {
        sessions: {
          some: { expiresAt: { gt: new Date() } },
        },
      },
    });

    await SystemLogger.logMetric({
      name: "ACTIVE_USERS",
      value: activeUsers,
      unit: "COUNT",
    });

    await SystemLogger.logCron("SYSTEM_METRICS", "SUCCESS", {
      duration: Date.now() - startTime,
      message: `Active Users: ${activeUsers}`,
      data: { activeUsers, cpuUsagePercent, memUsagePercent }
    } as any);

    console.log("Metrics collected successfully.");
  } catch (error: any) {
    console.error("Failed to collect metrics:", error);
    await SystemLogger.logCron("SYSTEM_METRICS", "FAILURE", {
      duration: Date.now() - startTime,
      error: error.message
    });
    await SystemLogger.logError({
      message: "Failed to collect system metrics",
      source: "MetricsCron",
      stack: error.stack,
    });
  }
}

// In a real production app, you might use bullmq, node-cron, or Vercel cron.
// Since the package.json has a "worker:posting" using TSX, let's allow running this manually or via a basic interval here.
if (import.meta.url === `file://${process.argv[1]}`) {
  collectSystemMetrics()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
