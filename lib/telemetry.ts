/**
 * OpenTelemetry Distributed Tracing & Observability Helper
 * Provides standardized span creation, context propagation, and metric recording.
 */

export interface SpanContext {
  traceId: string;
  spanId: string;
  name: string;
  startTime: number;
}

export class TelemetryService {
  private static enabled = process.env.ENABLE_OTEL_TRACING === 'true';

  /**
   * Start a lightweight execution span for tracking async workflows
   */
  static startSpan(name: string, attributes?: Record<string, any>): SpanContext {
    const span: SpanContext = {
      traceId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      spanId: Math.random().toString(36).substring(2, 10),
      name,
      startTime: Date.now(),
    };

    if (this.enabled) {
      console.log(`[OTEL TRACE START] span=${span.name} traceId=${span.traceId}`, attributes || {});
    }

    return span;
  }

  /**
   * End a span and record latency
   */
  static endSpan(span: SpanContext, error?: Error): number {
    const durationMs = Date.now() - span.startTime;

    if (this.enabled) {
      if (error) {
        console.error(`[OTEL TRACE ERROR] span=${span.name} traceId=${span.traceId} duration=${durationMs}ms`, error.message);
      } else {
        console.log(`[OTEL TRACE END] span=${span.name} traceId=${span.traceId} duration=${durationMs}ms`);
      }
    }

    return durationMs;
  }

  /**
   * Execute an async function with automated span tracing
   */
  static async trace<T>(name: string, fn: () => Promise<T>, attributes?: Record<string, any>): Promise<T> {
    const span = this.startSpan(name, attributes);
    try {
      const result = await fn();
      this.endSpan(span);
      return result;
    } catch (err: any) {
      this.endSpan(span, err);
      throw err;
    }
  }
}
