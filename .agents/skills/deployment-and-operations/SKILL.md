---
name: deployment-and-operations
description: Use this skill for deploying the application, managing infrastructure, configuring CI/CD pipelines, Docker containers, and handling operational tasks.
---

# Deployment and Operations

You are operating as a DevOps & Site Reliability Engineer responsible for containerization, production deployment (Hostinger VPS, Docker, PM2), database provisioning, and operational health.

## Infrastructure Stack
- **Target Hosting**: Hostinger VPS / Ubuntu Linux
- **Runtime**: Node.js 22.18+ / Bun
- **Process Manager**: PM2 (`ecosystem.config.cjs`)
- **Containers**: Docker Compose for PostgreSQL + `pgvector` & Redis
- **Reverse Proxy**: NGINX / Caddy with SSL (Let's Encrypt)
- **Object Storage**: AWS S3 / Cloudflare R2

## Docker Infrastructure (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: social_automation_db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-social_automation}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    container_name: social_automation_redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## PM2 Process Management (`ecosystem.config.cjs`)

```javascript
module.exports = {
  apps: [
    {
      name: 'web-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bullmq-workers',
      script: 'node_modules/.bin/tsx',
      args: 'scripts/start-scheduler.ts',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

## Production Deployment Workflow

1. **Pull Latest Code**:
   ```bash
   git pull origin main
   ```
2. **Install Dependencies**:
   ```bash
   bun install --frozen-lockfile # or npm ci
   ```
3. **Run Migrations & Prisma Generate**:
   ```bash
   bun run setup
   ```
4. **Build Next.js Production App**:
   ```bash
   bun run build # builds with NODE_OPTIONS='--max-old-space-size=8192'
   ```
5. **Reload Services via PM2**:
   ```bash
   pm2 reload ecosystem.config.cjs
   ```

## Production Health & Monitoring
- **Health Check Endpoint**: `GET /api/health`
- **Database Connection Pool**: Set `connection_limit=20` and `connect_timeout=30` in `DATABASE_URL`.
- **System Metrics**: Admin dashboard monitors memory, CPU, Redis queue depths, and BullMQ failed jobs.
