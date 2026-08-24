import prisma from "@/lib/prisma";

import * as fs from 'fs';
import * as path from 'path';

/**
 * SystemLogger - A Laravel-inspired logging service for Next.js
 *
 * Provides centralized logging to both the filesystem (logs/app.log) and the database.
 * Supports standard PSR-3 log levels.
 */
export class SystemLogger {
  private static LOG_DIR = path.join(process.cwd(), 'logs');
  private static MASTER_LOG = 'app.log';
  private static ENV = process.env.NODE_ENV || 'development';

  /**
   * Ensures the logs directory exists and performs simple daily rotation if needed.
   */
  private static ensureLogDir() {
    try {
      if (!fs.existsSync(this.LOG_DIR)) {
        fs.mkdirSync(this.LOG_DIR, { recursive: true });
      }

      // Simple rotation check for app.log
      const masterLogPath = path.join(this.LOG_DIR, this.MASTER_LOG);
      if (fs.existsSync(masterLogPath)) {
        const stats = fs.statSync(masterLogPath);
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB

        if (stats.size > maxSizeBytes) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const archivePath = path.join(this.LOG_DIR, `app-${timestamp}.log`);
          fs.renameSync(masterLogPath, archivePath);

          // Clean up old archives (keep last 5)
          const files = fs.readdirSync(this.LOG_DIR)
            .filter(f => f.startsWith('app-') && f.endsWith('.log'))
            .sort()
            .reverse();

          if (files.length > 5) {
            files.slice(5).forEach(f => {
              try { fs.unlinkSync(path.join(this.LOG_DIR, f)); } catch (e) { }
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to manage log directory or rotation:", error);
    }
  }


  /**
   * Internal core logging method that writes to the master log file.
   * Format matches Laravel: [YYYY-MM-DD HH:MM:SS] environment.LEVEL: Message {context}
   */
  private static logToMaster(level: string, message: string, context?: any) {
    this.ensureLogDir();

    // Format timestamp like Laravel: [2024-03-20 14:30:05]
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    const env = this.ENV.toLowerCase();
    const levelUpper = level.toUpperCase();

    // Format context similarly to Laravel
    let contextStr = '';
    if (context) {
      try {
        if (context instanceof Error) {
          contextStr = ` {"message": "${context.message}", "stack": "${context.stack?.replace(/\n/g, '\\n')}"}`;
        } else {
          // Filter out sensitive data if needed, or just stringify
          contextStr = ` ${JSON.stringify(context)}`;
        }
      } catch (e) {
        contextStr = ' [Circular or Unserializable Context]';
      }
    }

    const logEntry = `[${timestamp}] ${env}.${levelUpper}: ${message}${contextStr}\n`;

    try {
      // Production ready: using appendFile (async preferred for high volume, but sync is safer for crash logs)
      fs.appendFileSync(path.join(this.LOG_DIR, this.MASTER_LOG), logEntry);
    } catch (error) {
      console.error(`Failed to write to master log file:`, error);
    }
  }

  /**
   * Writes a log entry to a specific file.
   */
  private static writeToFile(filename: string, level: string, message: string, context?: any) {
    this.ensureLogDir();

    // Always log to master file for Laravel-like behavior
    this.logToMaster(level, message, context);

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${context ? ' | ' + JSON.stringify(context) : ''}\n`;

    try {
      fs.appendFileSync(path.join(this.LOG_DIR, filename), logEntry);
    } catch (error) {
      console.error(`Failed to write to log file ${filename}:`, error);
    }
  }

  /**
   * Core logging method
   */
  static async log(level: string, message: string, context?: any) {
    this.logToMaster(level, message, context);
  }

  // --- Laravel-style level methods ---

  static async emergency(message: string, context?: any) { await this.log('emergency', message, context); }
  static async alert(message: string, context?: any) { await this.log('alert', message, context); }
  static async critical(message: string, context?: any) { await this.log('critical', message, context); }
  static async error(message: string, context?: any) {
    // Handle specialized error logging if params object is passed
    if (typeof message === 'object' && (message as any).message && (message as any).source) {
      await this.logError(message as any);
      return;
    }
    await this.log('error', message, context);
  }
  static async warning(message: string, context?: any) { await this.log('warning', message, context); }
  static async notice(message: string, context?: any) { await this.log('notice', message, context); }
  static async info(message: string, context?: any) { await this.log('info', message, context); }
  static async debug(message: string, context?: any) { await this.log('debug', message, context); }

  // --- Compatibility Aliases ---
  static async warn(message: string, context?: any) { await this.warning(message, context); }
  static async logInfo(params: { message: string; context?: any } | string, context?: any) {
    if (typeof params === 'string') {
      await this.info(params, context);
    } else {
      await this.info(params.message, params.context);
    }
  }

  // --- Specialized Logging with DB Persistence ---

  /**
   * Log a general system or user activity.
   */
  static async logActivity(params: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    businessId?: string;
    details?: any;
  }) {
    try {
      const details = params.businessId 
        ? { ...(params.details || {}), businessId: params.businessId }
        : (params.details || {});

      await prisma.activityLog.create({
        data: {
          action: params.action,
          entity: params.entity || "system",
          entityId: params.entityId,
          userId: params.userId,
          details,
        },
      });
    } catch (error) {
      console.error("Failed to log activity to DB:", error);
    }
    this.writeToFile('activity.log', 'info', params.action, params);
  }

  /**
   * Log an application error with full context and stack trace.
   */
  static async logError(params: {
    message: string;
    source: string;
    stack?: string;
    path?: string;
    context?: any;
  }) {
    try {
      await prisma.errorLog.create({
        data: {
          message: params.message,
          source: params.source,
          stack: params.stack,
          path: params.path,
          context: params.context || {},
        },
      });
    } catch (error) {
      console.error("Failed to log error to DB:", error);
    }
    this.writeToFile('error.log', 'error', params.message, params);
  }

  /**
   * Log a security audit event.
   */
  static async logAudit(params: {
    action: string;
    resource: string;
    status: "SUCCESS" | "FAILURE";
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          action: params.action,
          resource: params.resource,
          status: params.status,
          userId: params.userId,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          details: params.details || {},
        },
      });
    } catch (error) {
      console.error("Failed to log audit event to DB:", error);
    }
    this.writeToFile('audit.log', params.status === 'SUCCESS' ? 'info' : 'warn', params.action, params);
  }

  /**
   * Record a system metric.
   */
  static async logMetric(params: {
    name: string;
    value: number;
    unit: string;
    tags?: any;
  }) {
    try {
      await prisma.systemMetric.create({
        data: {
          name: params.name,
          value: params.value,
          unit: params.unit,
          tags: params.tags || {},
        },
      });
    } catch (error) {
      console.error("Failed to log metric to DB:", error);
    }
    this.writeToFile('metrics.log', 'info', `${params.name}: ${params.value}${params.unit}`, params.tags);
  }

  /**
   * Log a cron job execution event.
   */
  static logCron(jobName: string, status: 'START' | 'SUCCESS' | 'FAILURE', details?: { message?: string; duration?: number; error?: any }) {
    const level = status === 'FAILURE' ? 'error' : 'info';
    const message = `[CRON] ${jobName} - ${status}${details?.message ? ': ' + details.message : ''}${details?.duration ? ' (duration: ' + details.duration + 'ms)' : ''}`;

    this.writeToFile('cron.log', level, message, details?.error);

    if (status !== 'START') {
      this.logActivity({
        action: `CRON_${jobName}_${status}`,
        entity: 'CronJob',
        details: details
      }).catch(() => { });
    }
  }

  /**
   * Log a queue worker event.
   */
  static logQueue(params: {
    queueName: string;
    jobId: string;
    status: 'START' | 'SUCCESS' | 'FAILURE' | 'STALLED';
    message?: string;
    error?: any;
  }) {
    const level = params.status === 'FAILURE' ? 'error' : (params.status === 'STALLED' ? 'warn' : 'info');
    const message = `[QUEUE] ${params.queueName}:${params.jobId} - ${params.status}${params.message ? ': ' + params.message : ''}`;

    this.writeToFile('queue.log', level, message, params.error);

    if (params.status === 'FAILURE' || params.status === 'SUCCESS') {
      this.logActivity({
        action: `QUEUE_${params.queueName}_${params.status}`,
        entity: 'QueueJob',
        entityId: params.jobId,
        details: params
      }).catch(() => { });
    }
  }
}


