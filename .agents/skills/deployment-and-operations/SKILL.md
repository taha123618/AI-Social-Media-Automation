---
name: deployment-and-operations
description: Use this skill for deploying the application, managing infrastructure, configuring CI/CD pipelines, Docker containers, Kubernetes (K8s) clusters, Prometheus/Grafana observability, and handling operational tasks.
---

# Deployment, Kubernetes and Operations

You are operating as a Senior DevOps & Site Reliability Engineer responsible for containerization, Kubernetes orchestration, Prometheus & Grafana observability, production deployment (Hostinger VPS, Docker, PM2, K8s), database provisioning, and operational health.

## Infrastructure Stack
- **Target Hosting**: Kubernetes (EKS / GKE / K3s) or Hostinger VPS (Ubuntu Linux 22.04 LTS)
- **Runtime**: Node.js 22.18+ / Bun 1.3+
- **Process Manager**: PM2 (`ecosystem.config.cjs`) with zero-downtime cluster reloads
- **Containers**: Multi-Stage Dockerfile (`runner` for Web, `worker` for BullMQ queues)
- **Kubernetes Manifests**: `k8s/` (Namespace, ConfigMap, Secrets, PostgreSQL StatefulSet, Redis, App Web, Worker, Ingress, HPA)
- **Observability**: Prometheus (`monitoring/prometheus/`) + Grafana (`monitoring/grafana/`) + `/api/metrics`
- **Database**: PostgreSQL 18 with `pgvector` extension
- **Caching & Broker**: Redis 7 Alpine with BullMQ queues
- **Reverse Proxy**: NGINX with Let's Encrypt SSL, rate limiting, and HTTP/2 proxying
- **Object Storage**: AWS S3 / Cloudflare R2

---

## 1. Kubernetes (K8s) Cluster Deployment (`k8s/`)

Deploy the entire production stack into Kubernetes with a single command:

```bash
# Apply all Kubernetes manifests via Kustomize
kubectl apply -k k8s/

# Check pod statuses in namespace
kubectl get pods -n social-automation

# Check Horizontal Pod Autoscaler (HPA)
kubectl get hpa -n social-automation
```

---

## 2. Prometheus & Grafana Observability (`monitoring/`)

```bash
# Launch Prometheus (9090), Grafana (3001), and Node Exporter (9100)
docker-compose -f docker-compose.monitoring.yml up -d

# Endpoints:
# - Prometheus UI:   http://localhost:9090
# - Grafana UI:      http://localhost:3001 (User: admin, Pass: admin)
# - App Metrics:     http://localhost:3000/api/metrics
```

---

## 3. Docker Multi-Stage Container Strategy (`Dockerfile`)

```bash
# Build production web container
docker build --target runner -t social-automation-app .

# Build background worker container with health probe
docker build --target worker -t social-automation-worker .

# Start full production stack (includes automatic database migration runner)
docker compose up -d

# Start local development dependencies only (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d
```

---

## 4. Health Probes & Monitoring

- `GET /api/health`: General system health, memory usage, uptime, and database connection status.
- `GET /api/health/ready`: Kubernetes/ECS readiness probe verifying PostgreSQL and critical services.
- `GET /api/metrics`: Prometheus metric exposition including BullMQ queue counts (`bullmq_jobs_waiting`, `bullmq_jobs_active`, `bullmq_jobs_failed`).
- `scripts/worker-healthcheck.sh`: Worker container heartbeat probe checking active event-loop ticks.

Run CLI health check:
```bash
./scripts/healthcheck.sh
./scripts/worker-healthcheck.sh
```

---

## 5. Database Backup & Disaster Recovery

```bash
# 1. Run database backup (gzip compressed with integrity verification & optional S3 sync)
./scripts/backup-db.sh ./backups/postgres

# 2. Restore database from backup
./scripts/restore-db.sh ./backups/postgres/social_automation_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 6. CI/CD Pipeline (`.github/workflows/`)

- **`ci.yml`**: Triggers on push and pull requests. Runs ESLint, TypeScript 8GB typecheck, 57 Jest test suites (264 tests), Prisma migration deploy check, and Docker multi-stage build check.
- **`deploy.yml`**: Continuous deployment to VPS via SSH with automated pre-migration database snapshot, Next.js standalone build, PM2 zero-downtime reload, and post-deploy health check probe.
- **`security.yml`**: Scheduled weekly and PR vulnerability scan using Trivy, TruffleHog secrets detection, and npm audit.
- **`k8s-deploy.yml`**: Kustomize Kubernetes deployment with automated rollout verification.

