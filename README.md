# AI Social Media & Content Automation Platform

A high-performance enterprise SaaS platform for automated social media scheduling, multi-platform ad campaign generation, autonomous multi-agent marketing workflows, business knowledge RAG, AI-powered blog writing, and multi-tenant subscription billing.

---

## 🌟 Key Capabilities & Highlights

- **Enterprise SaaS Billing & Plan Entitlements**: Centralized plan matrix (`Free`, `Starter`, `Pro`, `Enterprise`), transactional usage metering, automatic Free plan activation on registration, Stripe Checkout & Customer Portal integration, and idempotent webhook lifecycle management.
- **Route Protection & Security Hardening**: Strict proxy middleware enforcing authentication and multi-tenant isolation, safe open-redirect protections, magic byte media upload inspection, and HSTS security headers.
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
| **Backend & APIs** | Next.js Route Handlers, Server Actions, Zod Validation, Better Auth (Prisma Adapter), Stripe SDK |
| **AI Framework & Engines** | Mastra Framework (`mastra/`), Vercel AI SDK (`ai`, `@ai-sdk/*`), LangChain (`@langchain/*`) |
| **Model Providers** | OpenAI (`gpt-4o`, `gpt-4o-mini`), Anthropic (`claude-3-5-sonnet`), Google Gemini (`gemini-2.0-flash`), Groq, OpenRouter, Ollama |
| **Database & ORM** | PostgreSQL 18 with `pgvector` extension, Prisma 7 (`@prisma/client` 7.9.1, output `app/generated/prisma`) |
| **Queue & Cache** | BullMQ, Redis (`ioredis`), TSX background worker processes |
| **Cloud Storage** | AWS S3 / Cloudflare R2 presigned URLs, S3 client |
| **Containers & Deploy** | Multi-stage Docker, Docker Compose, NGINX Reverse Proxy, Kubernetes & Helm manifests |
| **Observability** | Prometheus Metrics (`/api/metrics`), Alertmanager Webhooks, Grafana, Loki, Pino Logger, DuckDB spans |

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

### 4. Run Development Servers
```bash
# Terminal 1: Next.js App Router (localhost:3000)
bun run dev

# Terminal 2: Mastra Multi-Agent Studio (localhost:4111)
npm run dev

# Terminal 3: BullMQ Background Workers
bun run workers
```

---

## 🧪 Test Suite & Verification Matrix

Run the comprehensive test matrix across both test runners and execute the TypeScript compiler:

```bash
# Run unit & integration tests across both runners
npm test
bun test

# Run TypeScript static analysis with 8GB heap allocation
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit
```
