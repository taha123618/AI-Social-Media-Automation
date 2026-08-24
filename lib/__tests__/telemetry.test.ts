import { TelemetryService } from '../telemetry';

describe('TelemetryService', () => {
  it('creates and ends execution spans with trace IDs and duration calculation', () => {
    const span = TelemetryService.startSpan('db_query', { table: 'KnowledgeChunk' });
    expect(span.name).toBe('db_query');
    expect(span.traceId).toBeDefined();
    expect(span.spanId).toBeDefined();

    const duration = TelemetryService.endSpan(span);
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('wraps async function execution and propagates result', async () => {
    const result = await TelemetryService.trace('compute_hash', async () => {
      return 42 * 2;
    });

    expect(result).toBe(84);
  });

  it('records errors during traced execution and rethrows', async () => {
    await expect(
      TelemetryService.trace('failing_op', async () => {
        throw new Error('Operation timed out');
      })
    ).rejects.toThrow('Operation timed out');
  });
});
