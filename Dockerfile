# ==============================================================================
# Multi-Stage Production Dockerfile for Next.js 16 SaaS & BullMQ Worker Platform
# Node.js 22-alpine + Non-Root User + Standalone Engine + Health Check Probes
# ==============================================================================

# 1. Base Stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl dumb-init curl
ENV NODE_ENV=production

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --include=dev

# 3. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NODE_ENV=production

# Generate Prisma 7 Client and build Next.js Standalone
RUN npx prisma generate
RUN npm run build

# 4. Web Runner Stage (Next.js 16 App Router)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create unprivileged application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/app/generated ./app/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# 5. BullMQ Worker Stage (Background Processor)
FROM base AS worker
WORKDIR /app

ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/app/generated ./app/generated
COPY --from=builder /app/prisma ./prisma
COPY . .

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workeruser && \
    chown -R workeruser:nodejs /app

USER workeruser

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "tsx", "./scripts/start-scheduler.ts"]
