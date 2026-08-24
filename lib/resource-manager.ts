import { logger } from '@/lib/logging';

export interface ResourceCleanup {
  cleanup: () => void;
  description: string;
}

export class ResourceManager {
  private static activeCleanups = new Set<ResourceCleanup>();
  private static cleanupScheduled = false;

  /**
   * Register a cleanup function that will be called when the process exits
   * or when manually triggered
   */
  static registerCleanup(cleanup: () => void, description: string): void {
    const resourceCleanup: ResourceCleanup = {
      cleanup,
      description,
    };

    this.activeCleanups.add(resourceCleanup);
    this.scheduleCleanup();

    logger.debug('Resource cleanup registered', { description });
  }

  /**
   * Register an object URL for cleanup
   */
  static registerObjectUrl(url: string, description?: string): void {
    this.registerCleanup(
      () => {
        try {
          URL.revokeObjectURL(url);
          logger.debug('Object URL revoked', { url, description });
        } catch (error) {
          logger.warn('Failed to revoke object URL', { url, description, error });
        }
      },
      description || `Object URL: ${url}`
    );
  }

  /**
   * Register multiple object URLs for cleanup
   */
  static registerObjectUrls(urls: string[], description?: string): void {
    urls.forEach((url, index) => {
      this.registerObjectUrl(url, `${description} [${index}]`);
    });
  }

  /**
   * Create object URLs and register them for cleanup
   */
  static createAndRegisterObjectUrls(files: File[], description?: string): string[] {
    const urls = files.map(file => URL.createObjectURL(file));
    this.registerObjectUrls(urls, description);
    return urls;
  }

  /**
   * Register a timeout/interval for cleanup
   */
  static registerTimer(
    timerId: NodeJS.Timeout,
    description: string
  ): void {
    this.registerCleanup(
      () => {
        clearTimeout(timerId);
        clearInterval(timerId);
        logger.debug('Timer cleaned up', { description });
      },
      description
    );
  }

  /**
   * Register an event listener for cleanup
   */
  static registerEventListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
    description?: string
  ): void {
    target.addEventListener(event, listener, options);

    this.registerCleanup(
      () => {
        target.removeEventListener(event, listener, options);
        logger.debug('Event listener removed', {
          event,
          target: target.constructor.name,
          description
        });
      },
      description || `Event listener: ${event} on ${target.constructor.name}`
    );
  }

  /**
   * Register a subscription for cleanup (for observables, etc.)
   */
  static registerSubscription(
    subscription: { unsubscribe: () => void },
    description: string
  ): void {
    this.registerCleanup(
      () => {
        try {
          subscription.unsubscribe();
          logger.debug('Subscription unsubscribed', { description });
        } catch (error) {
          logger.warn('Failed to unsubscribe', { description, error });
        }
      },
      description
    );
  }

  /**
   * Register a database connection for cleanup
   */
  static registerDatabaseConnection(
    connection: { close: () => Promise<void> },
    description: string
  ): void {
    this.registerCleanup(
      async () => {
        try {
          await connection.close();
          logger.debug('Database connection closed', { description });
        } catch (error) {
          logger.warn('Failed to close database connection', { description, error });
        }
      },
      description
    );
  }

  /**
   * Execute a cleanup immediately
   */
  static executeCleanup(cleanup: ResourceCleanup): void {
    try {
      cleanup.cleanup();
      this.activeCleanups.delete(cleanup);
    } catch (error) {
      logger.error('Cleanup execution failed', {
        description: cleanup.description,
        error,
      });
    }
  }

  /**
   * Execute all registered cleanups
   */
  static async executeAllCleanups(): Promise<void> {
    const cleanups = Array.from(this.activeCleanups);
    this.activeCleanups.clear();

    logger.info('Executing resource cleanups', { count: cleanups.length });

    // Execute cleanups in parallel, but handle errors individually
    await Promise.allSettled(
      cleanups.map(cleanup =>
        Promise.resolve().then(() => this.executeCleanup(cleanup))
      )
    );

    logger.info('Resource cleanups completed');
  }

  /**
   * Execute cleanups for a specific pattern
   */
  static executeCleanupsByPattern(pattern: RegExp): void {
    const matchingCleanups = Array.from(this.activeCleanups).filter(
      cleanup => pattern.test(cleanup.description)
    );

    logger.info('Executing pattern-based cleanups', {
      pattern: pattern.toString(),
      count: matchingCleanups.length
    });

    matchingCleanups.forEach(cleanup => this.executeCleanup(cleanup));
  }

  /**
   * Get count of active cleanups
   */
  static getActiveCleanupCount(): number {
    return this.activeCleanups.size;
  }

  /**
   * Get descriptions of active cleanups
   */
  static getActiveCleanupDescriptions(): string[] {
    return Array.from(this.activeCleanups).map(cleanup => cleanup.description);
  }

  /**
   * Schedule cleanup on process exit
   */
  private static scheduleCleanup(): void {
    if (this.cleanupScheduled) return;

    this.cleanupScheduled = true;

    // Schedule cleanup for various exit scenarios
    const cleanupHandler = async () => {
      logger.info('Process exit detected, executing cleanups');
      await this.executeAllCleanups();
    };

    process.on('exit', cleanupHandler);
    process.on('SIGINT', cleanupHandler);
    process.on('SIGTERM', cleanupHandler);
    process.on('uncaughtException', cleanupHandler);
    process.on('unhandledRejection', cleanupHandler);
  }

  /**
   * Force cleanup of all resources immediately
   */
  static forceCleanup(): Promise<void> {
    return this.executeAllCleanups();
  }
}

// Helper function for creating object URLs with automatic cleanup
export function createObjectUrls(files: File[], description?: string): string[] {
  return ResourceManager.createAndRegisterObjectUrls(files, description);
}

// Helper function for creating a single object URL with automatic cleanup
export function createObjectUrl(file: File, description?: string): string {
  const url = URL.createObjectURL(file);
  ResourceManager.registerObjectUrl(url, description);
  return url;
}

// Helper function for managing timers with automatic cleanup
export function createTimer(
  callback: () => void,
  delay: number,
  description?: string
): NodeJS.Timeout {
  const timerId = setTimeout(callback, delay);
  ResourceManager.registerTimer(timerId, description || `Timer: ${delay}ms`);
  return timerId;
}

// Helper function for creating intervals with automatic cleanup
export function createInterval(
  callback: () => void,
  interval: number,
  description?: string
): NodeJS.Timeout {
  const intervalId = setInterval(callback, interval);
  ResourceManager.registerTimer(intervalId, description || `Interval: ${interval}ms`);
  return intervalId;
}

// Higher-order function that automatically cleans up resources
export function withResourceManagement<T>(
  operation: () => T,
  cleanup: () => void,
  description?: string
): T {
  ResourceManager.registerCleanup(cleanup, description || 'Unnamed resource cleanup');

  try {
    return operation();
  } catch (error) {
    // Clean up immediately on error
    ResourceManager.executeAllCleanups();
    throw error;
  }
}

// Higher-order function for async operations with resource management
export async function withAsyncResourceManagement<T>(
  operation: () => Promise<T>,
  cleanup: () => void | Promise<void>,
  description?: string
): Promise<T> {
  ResourceManager.registerCleanup(cleanup, description || 'Unnamed resource cleanup');

  try {
    return await operation();
  } catch (error) {
    // Clean up immediately on error
    await ResourceManager.executeAllCleanups();
    throw error;
  }
}

// React hook for resource management (if using React)
export function useResourceManager() {
  return {
    registerCleanup: ResourceManager.registerCleanup.bind(ResourceManager),
    registerObjectUrl: ResourceManager.registerObjectUrl.bind(ResourceManager),
    createObjectUrl,
    createObjectUrls,
    createTimer,
    createInterval,
    forceCleanup: ResourceManager.forceCleanup.bind(ResourceManager),
    getActiveCleanupCount: ResourceManager.getActiveCleanupCount.bind(ResourceManager),
    getActiveCleanupDescriptions: ResourceManager.getActiveCleanupDescriptions.bind(ResourceManager),
  };
}
