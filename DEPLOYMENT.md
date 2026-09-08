# Production Deployment Guide 🚀

This guide details the supported production deployment patterns for the **SocialAI** enterprise platform, covering VPS deployment with PM2, Docker containerization, Kubernetes clusters, and EAS mobile distribution.

---

## 1. Supported Deployment Targets

| Target | Recommended For | Core Components |
| :--- | :--- | :--- |
| **Hostinger VPS / Linux Server** | Single-node production & cost efficiency | Ubuntu 22.04/24.04, PM2, NGINX, Node.js 22, PostgreSQL 16+ pgvector |
| **Docker Compose** | Isolated containerized environments | `Dockerfile` (multi-stage), `docker-compose.prod.yml`, Redis 7 |
| **Kubernetes (K8s)** | High-availability auto-scaling clusters | `k8s/` manifests, Horizontal Pod Autoscaler (HPA), Ingress |
| **EAS (Expo Application Services)** | Mobile companion distribution | iOS App Store & Android Google Play production builds |

---

## 2. Hostinger VPS / Linux Deployment (PM2 & NGINX)

For full step-by-step instructions on Hostinger VPS deployment, consult the dedicated [VPS Deployment Runbook](file:///Users/taha/projects/ai_social_media_automation/PRODUCTION_SETUP.md).

### Summary Workflow
1. Provision Ubuntu 22.04 LTS or 24.04 LTS VPS with minimum 4GB RAM.
2. Install Node.js 22, Bun, PostgreSQL 16 with `pgvector`, and Redis.
3. Clone repository and install dependencies with `bun install`.
4. Run migrations: `bun run setup`.
5. Build Next.js production bundle: `bun run build`.
6. Start web app and workers under PM2 cluster management:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```
7. Configure NGINX reverse proxy with Let's Encrypt SSL (`certbot`).

---

## 3. Docker Containerized Deployment

SocialAI uses a hardened multi-stage `Dockerfile` with separate targets for the web runner and background workers:

### 3.1 Build Web & Worker Images
```bash
# Build the web application container
docker build --target runner -t social-automation-web:latest .

# Build the background worker container
docker build --target worker -t social-automation-worker:latest .
```

### 3.2 Run via Docker Compose
```bash
# Start Web, Worker, PostgreSQL (with pgvector), and Redis
docker compose -f docker-compose.prod.yml up -d
```

---

## 4. Kubernetes (K8s) Cluster Deployment (`k8s/`)

The repository includes enterprise Kubernetes manifests ready for EKS, GKE, or self-hosted K3s clusters:

```bash
# 1. Apply all resources using Kustomize
kubectl apply -k k8s/

# 2. Verify pods across the social-automation namespace
kubectl get pods -n social-automation

# 3. Check Horizontal Pod Autoscaler (HPA)
kubectl get hpa -n social-automation

# 4. View ingress routing
kubectl get ingress -n social-automation
```

### Health & Readiness Probes
Configure Kubernetes liveness and readiness probes against:
- **Liveness Probe**: `GET /api/health` (Checks HTTP server availability)
- **Readiness Probe**: `GET /api/health/ready` (Checks PostgreSQL and Redis connectivity)
- **Prometheus Metrics**: `GET /api/metrics` (Exports operational telemetry)

---

## 5. Mobile Companion App Release (EAS)

The `mobile-app/` companion is deployed to mobile platforms via **Expo Application Services (EAS)**:

```bash
cd mobile-app

# 1. Login to Expo EAS
bunx eas-cli login

# 2. Build development client for testing
bunx eas-cli build --profile development --platform all

# 3. Build release binaries for Apple App Store and Google Play
bunx eas-cli build --profile production --platform all

# 4. Submit directly to app stores
bunx eas-cli submit --platform ios
bunx eas-cli submit --platform android

# 5. Push over-the-air hotfix updates
bunx eas-cli update --branch production --message "Production release hotfix"
```

---

## 6. Pre-Flight Checklist

Before cutting a production deployment:
- [ ] Database migrations deployed (`bun run setup`)
- [ ] All 58 test suites pass (`npm test`)
- [ ] TypeScript static analysis passes with 0 errors (`node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit`)
- [ ] Production secrets set in `.env` (Never commit credentials)
- [ ] `NEXT_PUBLIC_APP_URL` matches your custom production domain
- [ ] Stripe webhook secret matches active Stripe endpoint
- [ ] CORS and CSRF protections active via `proxy.ts`
