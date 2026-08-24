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
| **Database & ORM** | PostgreSQL 16+ with `pgvector` extension, Prisma 7 (`@prisma/client` 7.9.1, output `app/generated/prisma`) |
| **Queue & Cache** | BullMQ, Redis (`ioredis`), TSX background worker processes |
| **Cloud Storage** | AWS S3 / Cloudflare R2 presigned URLs, S3 client |
| **Observability** | Pino structured logger, `@mastra/observability` with DuckDB span storage |

---

## 📁 Project Directory Structure

```text
├── app/                        # Next.js 16 App Router
│   ├── (admin)/                # Admin operations dashboard & AI blog templates
│   ├── (auth)/                 # Auth.js login, register, reset, verification
│   ├── (marketing)/            # High-conversion marketing pages (GSAP animations)
│   ├── (user)/                 # SaaS user portal (social, scheduler, CRM, knowledge)
│   ├── api/                    # REST API routes & platform webhooks
│   └── generated/prisma/       # Generated Prisma 7 client
├── features/                   # Domain feature modules
│   ├── ad-campaigns/           # Ad generation, campaign launch, sync workers
│   ├── admin/                  # Admin state & metrics services
│   ├── ai-blog/                # AI Blog Writer, TipTap editor, serializers, workers
│   ├── analytics/              # Multi-platform social analytics & charts
│   ├── billing/                # Stripe subscription checkout & customer portal
│   ├── compliance/             # Brand safety & forbidden keyword audits
│   ├── crm/                    # Lead management, demo bookings & review booster
│   ├── generation/             # Core prompt synthesis
│   ├── image_generation/       # Flux/SD image workers & S3 storage
│   ├── knowledge/              # pgvector RAG embeddings & document ingestion
│   ├── multi-location/         # Multi-branch franchise management
│   ├── organization/           # Team members, invitations, RBAC
│   ├── post-creation/          # Multi-platform post composer & media attach
│   ├── scheduler/              # Cron scheduler & BullMQ posting queues
│   ├── settings/               # Business profiles & brand voice settings
│   ├── social/                 # OAuth connectors & social publishing adapters
│   ├── system/                 # Activity logs, job logs, error logs
│   ├── video_generation/       # Video generation jobs & status workers
│   └── workflow/               # Multi-step business automation workflows
├── mastra/                     # Mastra Multi-Agent Engine
│   ├── index.ts                # Mastra initialization & central registration
│   ├── agents/                 # 13 autonomous marketing agents
│   ├── tools/                  # Tools (analytics, social, weather, youtube)
│   └── workflows/              # Multi-step agent workflows
├── prisma/                     # Database layer
│   ├── schema.prisma           # Datasource & client generator config
│   ├── models/                 # Modular domain schema models
│   └── migrations/             # SQL migrations (PostgreSQL + pgvector)
├── scripts/                    # Worker startup scripts & cron runners
├── .agents/skills/             # AI Agent skill definitions
└── docs/                       # Architectural decisions, API docs & guides
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>=22.18.0` or **Bun**: `>=1.0.0`
- **PostgreSQL**: PostgreSQL 16+ with the `pgvector` extension
- **Redis**: Redis 6+ (locally or via Docker)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd ai_social_media_automation

# Install dependencies with bun or npm
bun install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Key environment variables:
```dotenv
DATABASE_URL="postgresql://user:password@127.0.0.1:5432/social_automation_db"
REDIS_HOST="localhost"
REDIS_PORT="6379"
AUTH_SECRET="your-auth-secret-here"
OPENAI_API_KEY="sk-..."
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_BUCKET_NAME=""
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

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `next dev` | Start Next.js development server |
| `build` | `NODE_OPTIONS='--max-old-space-size=8192' next build` | Production bundle build |
| `start` | `next start` | Start production server |
| `setup` | `prisma generate && prisma migrate deploy` | Generate Prisma client & apply migrations |
| `test` | `jest` (or `bun test`) | Run complete automated test suite (55 tests) |
| `workers` | `tsx scripts/start-scheduler.ts` | Start all BullMQ workers & schedulers |
| `worker:blog` | `tsx features/ai-blog/workers/blog-generation.worker.ts` | Start AI blog generation worker |
| `worker:posting` | `tsx features/scheduler/workers/posting.worker.ts` | Start social posting worker |
| `worker:image` | `tsx features/image_generation/workers/image-generation.worker.ts` | Start image generation worker |
| `worker:video` | `tsx features/video_generation/workers/video-status.worker.ts` | Start video polling worker |
| `skills:sync` | `bash scripts/sync-agent-skills.sh` | Sync `.agents/skills/*` into IDE agents (`.cursor`, `.claude`, `.trae`, etc.) |

---

## 📖 Further Documentation

- [QA & Test Report](file:///Users/taha/projects/ai_social_media_automation/QA_REPORT.md) — Comprehensive SQA report, test matrix (55 tests), bug fixes, and security audit.
- [Features Matrix & Status](file:///Users/taha/projects/ai_social_media_automation/FEATURES.md) — Comprehensive feature matrix for all 19 modules.
- [Mastra & Agent Guidelines](file:///Users/taha/projects/ai_social_media_automation/AGENTS.md) — AI agent conventions and boundaries.
- [Architecture Decisions](file:///Users/taha/projects/ai_social_media_automation/docs/architecture/decisions/) — ADRs for BullMQ, multi-tenancy, and feature structures.
- [Dashboard API Guide](file:///Users/taha/projects/ai_social_media_automation/docs/DASHBOARD_API.md) — REST API specifications and integration guides.

---

## 📄 License
MIT License. Built for scalable, intelligent AI automation.
