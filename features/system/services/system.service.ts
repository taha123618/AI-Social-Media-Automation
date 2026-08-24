import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { SystemLogger } from "@/features/system/services/logger.service";

export class SystemService {
  /**
   * Fetch paginated and filterable activity logs.
   */
  static async getActivityLogs(params: {
    page: number;
    limit: number;
    search?: string;
    entity?: string;
    userId?: string;
  }) {
    const { page, limit, search, entity, userId } = params;

    const where: Prisma.ActivityLogWhereInput = {};
    if (search) {
      where.action = { contains: search, mode: "insensitive" };
    }
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    await SystemLogger.logActivity({
      action: "SYSTEM_ACTIVITY_LOGS_VIEWED",
      entity: "SystemLogs",
      details: { page, limit, hasSearch: !!search }
    });

    return { total, logs, page, limit };
  }

  /**
   * Fetch paginated and filterable error logs.
   */
  static async getErrorLogs(params: {
    page: number;
    limit: number;
    search?: string;
    source?: string;
    resolved?: boolean;
  }) {
    const { page, limit, search, source, resolved } = params;

    const where: Prisma.ErrorLogWhereInput = {};
    if (search) {
      where.message = { contains: search, mode: "insensitive" };
    }
    if (source) where.source = source;
    if (resolved !== undefined) where.resolved = resolved;

    const [total, logs] = await Promise.all([
      prisma.errorLog.count({ where }),
      prisma.errorLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    await SystemLogger.logActivity({
      action: "SYSTEM_ERROR_LOGS_VIEWED",
      entity: "SystemLogs",
      details: { page, limit, hasSearch: !!search }
    });

    return { total, logs, page, limit };
  }

  /**
   * Fetch paginated and filterable audit logs.
   */
  static async getAuditLogs(params: {
    page: number;
    limit: number;
    search?: string;
    action?: string;
    status?: string;
  }) {
    const { page, limit, search, action, status } = params;

    const where: Prisma.AuditLogWhereInput = {};
    if (search) {
      where.resource = { contains: search, mode: "insensitive" };
    }
    if (action) where.action = action;
    if (status) where.status = status;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    await SystemLogger.logActivity({
      action: "SYSTEM_AUDIT_LOGS_VIEWED",
      entity: "SystemLogs",
      details: { page, limit, hasSearch: !!search }
    });

    return { total, logs, page, limit };
  }

  /**
   * Fetch system metrics grouped by name over a timeframe.
   */
  static async getMetrics(params: {
    timeframe: "1h" | "24h" | "7d" | "30d";
  }) {
    const { timeframe } = params;
    const now = new Date();
    let fromDate = new Date();

    switch (timeframe) {
      case "1h": fromDate.setHours(now.getHours() - 1); break;
      case "24h": fromDate.setHours(now.getHours() - 24); break;
      case "7d": fromDate.setDate(now.getDate() - 7); break;
      case "30d": fromDate.setDate(now.getDate() - 30); break;
    }

    const metrics = await prisma.systemMetric.findMany({
      where: {
        timestamp: { gte: fromDate, lte: now }
      },
      orderBy: { timestamp: "asc" }
    });

    await SystemLogger.logActivity({
      action: "SYSTEM_METRICS_VIEWED",
      entity: "SystemMetrics",
      details: { timeframe }
    });

    return metrics;
  }
}
