# Enterprise DevOps Operations & Runbook

This document is the definitive operational handbook for engineering, DevOps, and SRE teams running, deploying, monitoring, and troubleshooting the AI Social Media Automation enterprise SaaS platform.

---

## 1. System Architecture Overview

The system consists of three decoupled operational tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Traffic                         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │   NGINX Proxy      │          │ Kubernetes Ingress │
    │   (SSL & Limits)   │          │ (TLS & Cert-Mgr)   │
    └──────────┬─────────┘          └──────────┬─────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────────────────────────────────────┐
    │          Next.js 16 Web Application Engine         │
    │  (Standalone Node.js 22, Port 3000, App Router)    │
    └──────────┬───────────────────────────────┬─────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │ PostgreSQL 16 / 18 │          │   Redis 7 Alpine   │
    │ (pgvector RAG, DB) │          │ (BullMQ & Caching) │
    └────────────────────┘          └──────────┬─────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │ BullMQ Worker Pods │
                                    │ (15 Queues, AI Hub)│
                                    └────────────────────┘
```

- **Web Application Engine**: Next.js 16.1.6 App Router running in standalone mode (`output: "standalone"`), Node.js 22-alpine on port 3000.
- **Background Worker & Scheduler**: BullMQ runner (`scripts/start-scheduler.ts`) managing 15 asynchronous queues with a heartbeat health probe.
- **Primary Data Tier**: PostgreSQL 16 with `pgvector` extension and Prisma 7 ORM (`@prisma/adapter-pg`).
- **Cache & Message Broker**: Redis 7 Alpine (`lib/redis.ts` safe connection singleton).
- **Observability Tier**: Prometheus 2.51, Alertmanager 0.27, Grafana 10.4, Loki 2.9, and Node Exporter 1.7.

---

## 2. Local Development Workflow

### Prerequisites
- Node.js `>=22.18.0` / Bun `>=1.0.0`
- Docker & Docker Compose
- PostgreSQL 16+ & Redis 7+ (or use `docker-compose.dev.yml`)

### Quick Start
```bash
# 1. Start local PostgreSQL (with pgvector) and Redis
docker compose -f docker-compose.dev.yml up -d

# 2. Copy and customize environment variables
cp .env.example .env

# 3. Validate environment configuration
npx tsx scripts/validate-env.ts

# 4. Generate Prisma 7 client and apply migrations
bun run setup

# 5. Start Next.js development server
bun run dev

# 6. (In a separate terminal) Start background worker runner
bun run workers
```

---

## 3. Containerization Strategy

The application uses a production-ready, multi-stage `Dockerfile`:

| Stage | Base Image | Role | Output / User |
| :--- | :--- | :--- | :--- |
| `base` | `node:22-alpine` | Installs system libraries (`libc6-compat`, `openssl`, `dumb-init`, `curl`) | `/app` |
| `deps` | `base` | Installs production & dev dependencies (`npm ci`) | `/app/node_modules` |
| `builder` | `base` | Generates Prisma 7 client & builds Next.js standalone bundle | `/app/.next/standalone` |
| `runner` | `base` | Production web runner for Next.js 16 App Router | `nextjs:nodejs` (UID 1001) |
| `worker` | `base` | Background processor for BullMQ queues with heartbeat probe | `workeruser:nodejs` (UID 1001) |

### Building and Running Containers
```bash
# Build standalone web runner
docker build --target runner -t social-automation-app:latest .

# Build background worker runner
docker build --target worker -t social-automation-worker:latest .

# Launch full production stack with automated migration initialization
docker compose up -d

# Check service statuses and healthcheck probes
docker compose ps
```

---

## 4. CI/CD Pipelines

GitHub Actions workflows in `.github/workflows/`:

1. **`ci.yml` (Continuous Integration)**:
   - Triggers on push and pull requests (`main`, `staging`).
   - Runs ESLint and strict TypeScript typechecking with 8GB heap allocation (`node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit`).
   - Runs 57 Jest test suites (264 automated tests) with active PostgreSQL and Redis service containers.
   - Validates Next.js standalone production build and Docker container build targets.

2. **`deploy.yml` (VPS Continuous Deployment)**:
   - Triggers on release pushes to `main` or manual trigger via `workflow_dispatch`.
   - Connects to Hostinger VPS via SSH (`appleboy/ssh-action`).
   - Automatically takes a pre-migration database snapshot with `./scripts/backup-db.sh`.
   - Runs `npx prisma migrate deploy` safely.
   - Builds Next.js standalone bundle.
   - Performs zero-downtime PM2 process reload (`pm2 reload ecosystem.config.cjs`).
   - Probes `http://localhost:3000/api/health` and automatically aborts/reverts if unhealthy.

3. **`k8s-deploy.yml` (Kubernetes Continuous Deployment)**:
   - Triggers on version tags (`v*`) or manual trigger.
   - Validates Kustomize overlays.
   - Applies deployment manifests to the target cluster.
   - Verifies rolling updates with `kubectl rollout status`.

4. **`security.yml` (DevSecOps & Vulnerability Scanning)**:
   - Runs weekly scheduled and pull request security scans.
   - Executes TruffleHog secrets scanner across the commit tree.
   - Scans filesystem and containers for vulnerabilities using Aqua Security Trivy.
   - Runs `npm audit --audit-level=high`.

---

## 5. Database Management & Migrations

### Applying Migrations Safely
Never run `prisma db push` in production. Always use versioned migrations:

```bash
# In development (create new migration):
bun run prisma:migrate

# In production (apply pending migrations atomically):
npx prisma migrate deploy
```

### Pre-Migration Safeguards
Before running migrations in any production or staging environment:
```bash
# Take an immediate database snapshot
./scripts/backup-db.sh /var/backups/postgres
```

---

## 6. Background Queue Operations & Administration

The background processing system uses BullMQ with 15 specialized queues:

| Queue Name | Function | Concurrency | Limiter |
| :--- | :--- | :--- | :--- |
| `content-generation` | AI copy & text generation | 5 | 20 / min |
| `social-posting` | Multi-platform publishing | 2 | 10 / sec |
| `media-synthesis` | Video & image asset generation | 3 | 15 / min |
| `autopilot-generation`| Autonomous calendar filler | 2 | 5 / min |
| `knowledge-generation`| Vector document embeddings | 3 | 10 / min |
| `ad-campaigns` | Meta & Google Ads sync | 2 | 10 / min |
| `emailQueue` | Transactional email delivery | 5 | None |

### Worker Health Monitoring
The worker writes a heartbeat file `/tmp/worker-heartbeat` every 15 seconds.
Run health probe:
```bash
./scripts/worker-healthcheck.sh
```

---

## 7. Observability & Monitoring

### Metrics Endpoints
- **`GET /api/health`**: General server status, uptime, memory, and database connectivity.
- **`GET /api/health/ready`**: Kubernetes readiness probe verifying PostgreSQL.
- **`GET /api/metrics`**: Prometheus text format exposing:
  - `process_uptime_seconds`
  - `nodejs_heap_used_bytes` / `nodejs_heap_total_bytes` / `nodejs_rss_bytes`
  - `app_database_connected` / `app_database_latency_ms`
  - `bullmq_jobs_waiting{queue="..."}`
  - `bullmq_jobs_active{queue="..."}`
  - `bullmq_jobs_failed{queue="..."}`

### Launching the Monitoring Stack
```bash
docker compose -f docker-compose.monitoring.yml up -d
```
Access dashboards:
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (Admin user: `admin`, pass: `admin`)
- Alertmanager: `http://localhost:9093`
- Loki: `http://localhost:3100`

---

## 8. Backup & Disaster Recovery (BC/DR)

- **Recovery Point Objective (RPO)**: `< 1 Hour` (Daily automated backup + pre-deploy snapshots).
- **Recovery Time Objective (RTO)**: `< 15 Minutes` to restore operational status.

### Manual Backup
```bash
./scripts/backup-db.sh ./backups/postgres
```

### Database Restore Procedure
```bash
# 1. Identify backup archive
ls -lt ./backups/postgres/

# 2. Execute restoration script (requires explicit 'yes' confirmation)
./scripts/restore-db.sh ./backups/postgres/social_automation_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Regenerate Prisma client and verify
bun run setup
```

---

## 9. Incident Response & Runbooks

### Incident A: Web Application Instance Down (`AppDown`)
1. Check PM2 status: `pm2 status` or K8s pods: `kubectl get pods -n social-automation`.
2. Inspect application logs: `pm2 logs ai_social_media_automation --lines 100` or `kubectl logs -l app=app-web -n social-automation`.
3. Check memory exhaustion: if OOM killed, restart and verify swap or increase container memory limits.
4. Restart process: `pm2 restart ai_social_media_automation` or `kubectl rollout restart deployment/app-web -n social-automation`.

### Incident B: Database Connection Failure (`DatabaseDisconnected`)
1. Verify PostgreSQL container / service status: `docker ps | grep postgres` or `sudo systemctl status postgresql`.
2. Test network ping and port accessibility: `pg_isready -h localhost -p 5432`.
3. Check PostgreSQL connection pool capacity: `SELECT count(*) FROM pg_stat_activity;`.
4. Inspect database server logs for errors or disk space exhaustion: `df -h /var/lib/postgresql/data`.

### Incident C: BullMQ Queue Backlog Spike (`BullMQQueueBacklog`)
1. Inspect Prometheus `/api/metrics` to identify which queue has accumulated waiting jobs.
2. Check worker process status: `./scripts/worker-healthcheck.sh` or `pm2 status social-scheduler`.
3. If workers are stalled, restart scheduler: `pm2 restart social-scheduler`.
4. If rate-limited by external APIs (Twitter, LinkedIn, Meta), inspect queue concurrency settings in `features/scheduler/config/queue.config.ts`.
