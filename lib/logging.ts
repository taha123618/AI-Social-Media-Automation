import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  businessId?: string;
  requestId?: string;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
  duration?: number;
  metadata?: Record<string, unknown>;
}

class Logger {
  private logFile: WriteStream | null = null;
  private logLevel: LogLevel = LogLevel.INFO;
  private requestId: string | null = null;

  constructor() {
    // Initialize file logging in production
    if (process.env.NODE_ENV === 'production') {
      const logPath = process.env.LOG_PATH || './logs';
      this.logFile = createWriteStream(join(logPath, 'app.log'), { flags: 'a' });
    }

    // Set log level from environment
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedEntry = this.formatLogEntry(entry);

    // Console output
    const consoleMethod = entry.level === LogLevel.ERROR ? 'error' :
      entry.level === LogLevel.WARN ? 'warn' :
        entry.level === LogLevel.DEBUG ? 'debug' : 'log';

    console[consoleMethod](`[${entry.level}] ${entry.message}`, {
      context: entry.context,
      userId: entry.userId,
      businessId: entry.businessId,
      requestId: entry.requestId,
      error: entry.error,
      duration: entry.duration,
    });

    // File output in production
    if (this.logFile) {
      this.logFile.write(formattedEntry + '\n');
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId: this.requestId || undefined,
    };
  }

  error(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    if (context?.error instanceof Error) {
      entry.error = {
        message: context.error.message,
        stack: context.error.stack,
        name: context.error.constructor.name,
      };
    }
    this.writeLog(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry(LogLevel.WARN, message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.writeLog(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  // Performance logging
  time(label: string): void {
    this.debug(`Timer started: ${label}`);
  }

  timeEnd(label: string): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, `Timer ended: ${label}`);
    // Note: In a real implementation, you'd track start times
    this.writeLog(entry);
  }

  // Request context
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  clearRequestId(): void {
    this.requestId = null;
  }

  // Business-specific logging methods
  logUserAction(action: string, userId: string, businessId?: string, context?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, {
      userId,
      businessId,
      action,
      ...context,
    });
  }

  logBusinessEvent(event: string, businessId: string, context?: Record<string, unknown>): void {
    this.info(`Business event: ${event}`, {
      businessId,
      event,
      ...context,
    });
  }

  logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string): void {
    const entry = this.createLogEntry(LogLevel.INFO, `API Request: ${method} ${path}`);
    entry.context = {
      method,
      path,
      statusCode,
      duration,
      userId,
    };
    entry.duration = duration;
    this.writeLog(entry);
  }

  logDatabaseQuery(query: string, duration: number, error?: Error): void {
    const level = error ? LogLevel.ERROR : LogLevel.DEBUG;
    const entry = this.createLogEntry(level, `Database Query: ${query.substring(0, 100)}...`);
    entry.duration = duration;
    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.constructor.name,
      };
    }
    this.writeLog(entry);
  }

  logExternalServiceCall(service: string, endpoint: string, duration: number, error?: Error): void {
    const level = error ? LogLevel.ERROR : LogLevel.INFO;
    const entry = this.createLogEntry(level, `External Service: ${service} ${endpoint}`);
    entry.context = {
      service,
      endpoint,
    };
    entry.duration = duration;
    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.constructor.name,
      };
    }
    this.writeLog(entry);
  }

  logSecurityEvent(event: string, context: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.WARN, `Security Event: ${event}`, context);
    entry.context = {
      ...context,
      securityEvent: true,
    };
    this.writeLog(entry);
  }

  // Cleanup
  close(): void {
    if (this.logFile) {
      this.logFile.end();
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Request middleware helper
export function withRequestLogging(requestId: string, fn: () => void): void {
  logger.setRequestId(requestId);
  try {
    fn();
  } finally {
    logger.clearRequestId();
  }
}

// Performance measurement helper
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T> | T,
  context?: Record<string, unknown>
): Promise<T> | T {
  const startTime = Date.now();

  logger.debug(`Starting operation: ${operation}`, context);

  const result = fn();

  if (result instanceof Promise) {
    return result
      .then((value) => {
        const duration = Date.now() - startTime;
        logger.debug(`Completed operation: ${operation}`, { ...context, duration, success: true });
        return value;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        logger.error(`Failed operation: ${operation}`, { ...context, duration, success: false, error });
        throw error;
      });
  } else {
    const duration = Date.now() - startTime;
    logger.debug(`Completed operation: ${operation}`, { ...context, duration, success: true });
    return result;
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  logger.close();
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  logger.close();
});
