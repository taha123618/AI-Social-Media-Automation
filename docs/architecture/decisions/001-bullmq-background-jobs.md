# ADR-001: BullMQ for Background Jobs

- **Status**: Accepted
- **Date**: 2025-01-01
- **Drivers**: Architecture team

## Context

AI generation and social posting are long-running operations that must not block API responses. Synchronous processing would result in:
- HTTP request timeouts for end users
- Poor UX (pages hanging while processing completes)
- No durability — if the server restarts mid-operation, work is lost
- No retry capability for transient failures

## Options Considered

- **In-process execution** — Simplest to implement, but blocks API responses and has no durability
- **BullMQ + Redis** — Durable queues with retries, delayed jobs, and worker concurrency control
- **Database-level queues** — Polling-based, no built-in retry or rate limiting

## Decision

Queue-based async processing with BullMQ + Redis. API routes validate input, enqueue the job, and return `202 Accepted` immediately. Workers process jobs asynchronously with exponential backoff retries.

## Consequences

- **Positive**: Workers can scale horizontally (more processes); jobs survive restarts; built-in retry with backoff; priority queuing; job chaining (dependencies)
- **Negative**: Requires Redis infrastructure; eventual consistency for job results; additional operational complexity for monitoring queue health

## Compliance

- All API routes performing operations >1 second MUST return `202 Accepted` with a job ID
- Workers MUST be idempotent (check for existing completion before acting)
- New queues MUST be registered in `QUEUE_NAMES`
- Queue concurrency/rate limits MUST be configured per workload type
