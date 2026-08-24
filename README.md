# AI Social Media & Content Automation Platform

A high-performance enterprise SaaS platform for automated social media scheduling, multi-platform ad campaign generation, autonomous multi-agent marketing workflows, business knowledge RAG, and an AI-powered blog writer.

---

## 🌟 Key Capabilities & Highlights

- **AI Blog Writer**: TipTap rich text editor with real-time SEO auditing, context-aware Unsplash image insertion, and Gutenberg/Word/PDF/Markdown export serializers.
- **Mastra Multi-Agent Engine**: 13 autonomous agents coordinating research, competitor monitoring, weather-based hooks, YouTube transcription, and multi-location franchises.
- **Social Media Autopilot & Scheduling**: Intelligent multi-platform scheduling (Meta, LinkedIn, X, TikTok, YouTube) with BullMQ queues, optimal time-slot jitter, and background retry pipelines.
- **Business Knowledge Base (RAG)**: Document ingestion (PDF/TXT) with PostgreSQL + `pgvector` cosine similarity embeddings.
- **Ad Campaign Manager**: Automated ad copy synthesis, A/B variant testing, campaign launch queues, and live performance metrics sync.
- **Video & Image Synthesis**: Script-to-video processing (HeyGen, Replicate) and high-resolution image generation (Flux, Stable Diffusion) saved directly to AWS S3 / Cloudflare R2.
- **Review Booster & CRM**: Automated review generation (SMS/Email), AI response generation, and 5-star review-to-social post converter.
- **Interactive Marketing & Admin Suite**: GSAP + Framer Motion animated landing pages with Lenis smooth scroll, plus an operational admin dashboard.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js 16 (App Router), React 19, Tailwind CSS, Radix UI, Framer Motion, GSAP, Lenis, Recharts, TipTap Editor |
| **Backend & APIs** | Next.js Route Handlers, Server Actions, Zod Validation, Auth.js / NextAuth (Prisma Adapter) |
| **AI Framework & Engines** | Mastra Framework (`mastra/`), Vercel AI SDK (`ai`, `@ai-sdk/*`), LangChain (`@langchain/*`) |
| **Model Providers** | OpenAI (`gpt-4o`, `gpt-4o-mini`), Anthropic (`claude-3-5-sonnet`), Google Gemini (`gemini-2.0-flash`), Groq, OpenRouter, Ollama |
| **Database & ORM** | PostgreSQL 18 with `pgvector` extension, Prisma 7 (`@prisma/client` 7.9.1, output `app/generated/prisma`) |
| **Queue & Cache** | BullMQ, Redis (`ioredis`), TSX background worker processes |
| **Cloud Storage** | AWS S3 / Cloudflare R2 presigned URLs, S3 client |
| **Containers & Deploy** | Multi-stage Docker, Docker Compose, NGINX Reverse Proxy, PM2 Cluster Mode |
| **Observability** | Enterprise Health Checks (`/api/health`, `/api/health/ready`), Pino Logger, DuckDB spans |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>=22.18.0` or **Bun**: `>=1.0.0`
- **PostgreSQL**: PostgreSQL 16+ with the `pgvector` extension
- **Redis**: Redis 6+ (locally or via Docker)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/taha123618/AI-Social-Media-Automation.git
cd AI-Social-Media-Automation

# Install dependencies with bun or npm
bun install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 3. Initialize Database & Run Migrations
```bash
bun run setup
```
*(Runs `prisma generate && prisma migrate deploy`)*

### 4. Start Development Servers
```bash
# Terminal 1: Start Next.js App Router (http://localhost:3000)
bun run dev

# Terminal 2: Start BullMQ background workers & schedulers
bun run workers

# Terminal 3 (Optional): Start Mastra Studio (http://localhost:4111)
npm run dev
```

---

## 🐳 Docker & Container Deployment

### Local Development (Dependencies Only)
```bash
# Start PostgreSQL 18 with pgvector & Redis 7 in background
docker-compose -f docker-compose.dev.yml up -d
```

### Full Production Container Stack
```bash
# Build and run Web App, BullMQ Worker, PostgreSQL, and Redis
docker-compose up --build -d

# Verify Container Health
./scripts/healthcheck.sh
```

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `next dev` | Start Next.js development server |
| `build` | `NODE_OPTIONS='--max-old-space-size=8192' next build` | Production bundle build |
| `start` | `next start` | Start production server |
| `setup` | `prisma generate && prisma migrate deploy` | Generate Prisma client & apply migrations |
| `test` | `jest` (or `bun test`) | Run complete automated test suite (95 tests) |
| `workers` | `tsx scripts/start-scheduler.ts` | Start all BullMQ workers & schedulers |
| `health` | `./scripts/healthcheck.sh` | Run system & database health check probe |
| `backup:db` | `./scripts/backup-db.sh` | Run gzip-compressed PostgreSQL database backup |
| `restore:db`| `./scripts/restore-db.sh <file>` | Restore database from backup archive |
| `skills:sync` | `bash scripts/sync-agent-skills.sh` | Sync `.agents/skills/*` into IDE agents (`.cursor`, `.claude`, `.trae`, etc.) |

---

## 📖 Further Documentation

- [DevOps Assessment & Guide](file:///Users/taha/projects/ai_social_media_automation/DEVOPS_REPORT.md) — Production architecture, Docker, CI/CD, and disaster recovery.
- [QA & Test Report](file:///Users/taha/projects/ai_social_media_automation/QA_REPORT.md) — Comprehensive SQA report, test matrix (95 tests across 27 suites), bug fixes, and security audit.
- [Features Matrix & Status](file:///Users/taha/projects/ai_social_media_automation/FEATURES.md) — Comprehensive feature matrix for all 19 modules.
- [Mastra & Agent Guidelines](file:///Users/taha/projects/ai_social_media_automation/AGENTS.md) — AI agent conventions and boundaries.
- [Architecture Decisions](file:///Users/taha/projects/ai_social_media_automation/docs/architecture/decisions/) — ADRs for BullMQ, multi-tenancy, and feature structures.

---

## 📄 License
MIT License. Built for scalable, intelligent AI automation.
