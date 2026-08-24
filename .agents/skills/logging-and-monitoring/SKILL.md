---
name: logging-and-monitoring
description: Use this skill for implementing logging strategies, monitoring systems, alerting, and operational visibility across the application.
---

# Logging and Monitoring

You are operating as an Observability & Site Reliability Engineer managing application logging, Mastra trace observability, audit logs, and performance monitoring.

## Observability Infrastructure

### 1) Structured Application Logging (`PinoLogger` & `SystemLogger`)
- **Core Logger**: `pino` structured JSON logger
- **Utility Wrapper**: `lib/logger.ts` / `SystemLogger`
- Levels: `debug`, `info`, `warn`, `error`, `fatal`

```typescript
import { SystemLogger } from '@/lib/logger';

SystemLogger.info('Post scheduled successfully', {
  businessId: 'biz_123',
  postId: 'post_456',
  platform: 'LINKEDIN',
  scheduledTime: '2026-08-25T10:00:00Z',
});
```

### 2) Database Audit & Job Logging
Critical events are persisted in PostgreSQL models for administrative oversight:
- `ActivityLog`: User and tenant actions (logins, post creation, campaign updates).
- `JobLog`: BullMQ background job executions, worker statuses, durations, and retry counts.
- `ErrorLog`: Unhandled exceptions, failed external API calls, and stack traces.
- `AuditLog`: Security-sensitive changes (role promotions, API key generations, billing adjustments).

### 3) Mastra Agent Observability (`mastra/index.ts`)
- `@mastra/observability` captures full agent execution traces, token usage, latency, and tool calls.
- **Storage**: DuckDB storage (`DuckDBStore`) stores spans for fast analytic queries.
- **Exporters**: `DefaultExporter` (local traces for Mastra Studio) and `CloudExporter` (Mastra Cloud telemetry).
- **Sanitization**: `SensitiveDataFilter` masks credentials, passwords, and authorization headers.

## Monitoring Best Practices
- Always attach context (`businessId`, `userId`, `traceId`) to log entries.
- Never log raw credit cards, social security numbers, or sensitive customer inputs.
- Keep production log volume manageable by using `info` level as standard and `debug` for local development.
