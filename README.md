<div align="center">

# ⚡ SocialAI
### Autonomous Multi-Agent Social Media Automation & Marketing SaaS

[![CI Pipeline](https://github.com/taha123618/AI-Social-Media-Automation/actions/workflows/ci.yml/badge.svg)](https://github.com/taha123618/AI-Social-Media-Automation/actions/workflows/ci.yml)
[![Security Scan](https://github.com/taha123618/AI-Social-Media-Automation/actions/workflows/security.yml/badge.svg)](https://github.com/taha123618/AI-Social-Media-Automation/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<p align="center">
  <b>Deploy an autonomous fleet of 16 AI marketing agents that research trends, synthesize multi-platform campaigns, generate high-converting creative media, and automate publishing across Meta, X, LinkedIn, TikTok, and YouTube.</b>
</p>

[Key Features](#-key-capabilities--features) •
[Architecture](#-system-architecture) •
[Mobile App](#-mobile-companion-app) •
[Quick Start](#-quick-start-guide) •
[AI Engine](#-custom-ai-multi-agent-engine) •
[Verification](#-testing--code-quality) •
[Contributing](#-contributing) •
[Documentation](#-documentation--runbooks)

</div>

---

## 💡 Why SocialAI?

Modern social media marketing across 5+ networks requires constant content ideation, copywriting adaptations, video/image generation, optimal queue timing, engagement monitoring, and analytics reporting. For businesses and agencies, managing this manually is time-consuming and fragmented.

**SocialAI** solves this by providing a unified, production-grade enterprise SaaS platform powered by:
- **16 Specialized Autonomous AI Agents**: Working in coordination to research, write, audit, and schedule content.
- **RAG Semantic Memory**: Grounding copy in the business's actual products, voice, tone, and customer reviews using PostgreSQL + `pgvector`.
- **Fault-Tolerant Async Workers**: Dispatched via BullMQ and Redis with automatic jitter and retry mechanisms.
- **Enterprise Multi-Tenancy & Billing**: Organization and business-scoped tenancy, Better Auth authentication, and automated Stripe billing entitlements.

---

## 🌟 Key Capabilities & Features

### 🤖 Autonomous Multi-Agent Swarm
- **16 Autonomous Agents**: Coordinated in `services/ai/agents/` (Analytics, Blog Writer, Brand Guardian, Carousel Studio, Competitor Radar, DM Sales Bot, Engagement, Multi-Location, Post Creation, Review Booster, Social Listening, Template Blueprints, Trend Scout, Voice Studio, Weather Hook, YouTube Transcriber).
- **Dynamic AI Provider Switching**: Automatically switches between cost-effective OpenRouter in development and direct OpenAI/Anthropic/Gemini in production.
- **Semantic RAG Grounding**: Chunks brand documents and customer reviews into 1536-dimension embeddings stored in `pgvector` for zero-hallucination copy generation.

### 📅 Smart Scheduling & Social Autopilot
- **Cross-Platform Auto-Publishing**: Native integrations for **X (Twitter)**, **LinkedIn**, **Facebook Pages**, **Instagram**, **TikTok**, and **YouTube**.
- **Algorithmic Peak Queue**: Automates post dispatch around peak audience engagement slots with randomized humanized jitter.
- **Visual Drag-and-Drop Calendar**: Interactive monthly and weekly calendar views to preview visual feeds before they go live.

### 🎨 Creative Studio Hub (`/studio`)
- **Multimodal AI Studio**: Unified interface integrating Flux Pro image generation, Runway/Luma AI video synthesis, and media asset storage.
- **Smart Aspect-Ratio Adaptation**: Generates and formats assets automatically for Stories (9:16), Feeds (1:1), and Banners (16:9).
- **Direct S3 / Cloudflare R2 Uploads**: Hardened with binary magic byte validation and path traversal sanitization.

### ✍️ AI Blog Writer & Content Engine
- **Rich TipTap Editor**: Block-based editor featuring real-time SEO scoring, readability analysis, and brand guardian policy enforcement.
- **Multi-Format Serialization**: 1-click export to WordPress Gutenberg blocks, clean Markdown, medium-ready HTML, and formatted PDF.

### 💼 Enterprise SaaS Hub & Administration
- **Multi-Tenant Workspaces**: Switch effortlessly between brands and client accounts with tenant-isolated database models.
- **Stripe Subscription Billing**: Pre-configured plans (Free, Starter, Pro, Enterprise) with automated checkout, webhook synchronization, and live quota telemetry.
- **Admin Control Center (`/admin`)**: Real-time infrastructure telemetry, BullMQ worker queue monitoring, user impersonation, and audit trails.

### 📱 Mobile Companion App (`mobile-app/`)
- **Native Cross-Platform Experience**: Built with **Expo SDK 57**, **React Native 0.86**, and **React 19**.
- **On-the-Go Publishing & Discovery**: Review scheduled posts, inspect feeds, and discover AI content ideas directly from your iOS or Android device.
- **Fast Virtualized Lists**: Powered by `@shopify/flash-list` for smooth 60/120fps scrolling.
- **Resilient Offline Mode**: Includes graceful offline mock dataset fallbacks for local and testing workflows.

---

## 🏗️ System Architecture

```
                                  [ EXTERNAL CLIENTS ]
                    (Web Browser / Mobile Companion / REST API)
                                          │
                                          ▼ (HTTPS / TLS 1.3)
                        ┌───────────────────────────────────┐
                        │    Next.js Edge Proxy (proxy.ts)  │
                        │    - Deny-by-Default Perimeter    │
                        │    - Session / Admin Verification │
                        │    - SSRF & Security Headers      │
                        └─────────────────┬─────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │  App Router (app/*)    │                      │  Custom AI Engine      │
     │  - Next.js 16 (React 19)│                      │  (services/ai/*)       │
     │  - Tailwind CSS v4     │                      │  - 16 Autonomous Agents│
     │  - Better Auth + RBAC  │                      │  - 19 Zod Tool Schemas │
     │  - 29 Feature Modules  │                      │  - 6 Async Workflows   │
     └────────────┬───────────┘                      └───────────┬────────────┘
                  │                                               │
                  ├───────────────────────────────┬───────────────┘
                  ▼                               ▼
     ┌────────────────────────┐      ┌────────────────────────┐
     │  BullMQ Queue Engine   │      │  PostgreSQL 16 + RAG   │
     │  - 15 Background Queues│      │  - Prisma 7 ORM        │
     │  - Redis 7 State Store │      │  - pgvector Embeddings │
     │  - Exponential Retries │      │  - Multi-Tenant Scoped │
     └────────────┬───────────┘      └────────────────────────┘
                  │
                  ▼
     ┌────────────────────────────────────────────────────────┐
     │   External Integrations & Cloud Infrastructure        │
     │   - Social APIs: Meta, LinkedIn, X, TikTok, YouTube   │
     │   - AI Providers: OpenRouter, OpenAI, Anthropic, Gemini│
     │   - Cloud Storage: AWS S3 / Cloudflare R2 Presigned URLs│
     │   - Billing: Stripe Checkout & Webhook Lifecycle       │
     └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Framer Motion](https://www.framer.com/motion) |
| **Rich Text & Media** | [TipTap Editor](https://tiptap.dev/), [Three.js](https://threejs.org/), [GSAP](https://gsap.com/), [Recharts](https://recharts.org/) |
| **Authentication** | [Better Auth](https://better-auth.com/) with bcrypt (12 rounds) and Google OAuth 2.0 PKCE |
| **Database & ORM** | [PostgreSQL 16/18](https://www.postgresql.org/) with [`pgvector`](https://github.com/pgvector/pgvector), [Prisma 7 ORM](https://www.prisma.io/) |
| **Queue & Cache** | [BullMQ 5.68](https://bullmq.io/), [Redis 7](https://redis.io/) |
| **AI Orchestration** | Custom Multi-Agent Engine (`services/ai/*`), [LangChain](https://www.langchain.com/), OpenRouter, OpenAI, Anthropic, Gemini |
| **Storage & Assets** | AWS S3 / Cloudflare R2 presigned URLs, S3 Client SDK v3 |
| **Billing** | [Stripe SDK](https://stripe.com/), Customer Portal, Idempotent Webhook Handlers |
| **Containers & DevOps** | Docker Multi-Stage Builds, Docker Compose, Kubernetes & Helm Manifests, NGINX |
| **Testing** | Jest 30, TypeScript Compiler (`tsc --noEmit`), ESLint 9 |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `>=22.18.0` or **Bun**: `>=1.0.0`
- **PostgreSQL**: Version 16+ with the `pgvector` extension installed
- **Redis**: Version 6+ (running locally or via Docker)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/taha123618/AI-Social-Media-Automation.git
cd AI-Social-Media-Automation
```

### 2. Install Dependencies
```bash
# Using Bun (Recommended)
bun install

# Or using NPM
npm install
```

### 3. Environment Setup
Copy the template configuration file:
```bash
cp .env.example .env
```
Open `.env` and configure your credentials. At minimum for local development:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/social_automation_dev?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
BETTER_AUTH_SECRET="your-32-char-random-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
ADMIN_JWT_SECRET="your-32-char-random-admin-secret"
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### 4. Database Initialization & Migrations
Initialize the Prisma client and execute database migrations:
```bash
# Generate Prisma 7 client and deploy migrations
bun run setup
# or
npx prisma generate && npx prisma migrate deploy
```

*(Optional)* Seed initial admin user:
```bash
npm run admin:seed
```

### 5. Launch Development Services
In separate terminal windows:

```bash
# Terminal 1: Next.js Web Application (localhost:3000)
bun run dev
# or: npm run dev

# Terminal 2: BullMQ Background Queue Workers
bun run workers
# or: npm run workers
```

Visit [http://localhost:3000](http://localhost:3000) to access the application, or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the administrative console.

---

## 🐳 Docker Deployment

### Launch Full Stack via Docker Compose
Run the entire production stack (Web app, BullMQ background processor, PostgreSQL 16 with pgvector, and Redis 7):

```bash
# Build multi-stage production images
docker build --target runner -t social-automation-app:latest .
docker build --target worker -t social-automation-worker:latest .

# Launch all services in background
docker compose up -d
```

### Local Dev Databases Only
To spin up just PostgreSQL (with pgvector) and Redis locally:
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Observability & Telemetry Stack
Launch Prometheus, Grafana, Alertmanager, and Loki:
```bash
docker compose -f docker-compose.monitoring.yml up -d
# - Prometheus:   http://localhost:9090
# - Grafana:      http://localhost:3001 (Credentials: admin / admin)
# - App Metrics:  http://localhost:3000/api/metrics
```

---

## 🤖 Custom AI Multi-Agent Engine

The autonomous agent infrastructure lives under `services/ai/`:

| Directory | Purpose |
| :--- | :--- |
| `services/ai/index.ts` | Central exported orchestrator unifying `AIService`, tools, agents, and workflows. |
| `services/ai/agents/` | **16 autonomous marketing and analytical agents** (`weatherAgent`, `youtubeAgent`, `blogWriterAgent`, `analyticsAgent`, `brandGuardianAgent`, `carouselAgent`, `competitorAgent`, `dmAutomationAgent`, `engagementAgent`, `multiLocationAgent`, `postCreationAgent`, `reviewBoosterAgent`, `socialListeningAgent`, `templateAgent`, `trendEventAgent`, `voiceAgent`). |
| `services/ai/tools/` | **19 reusable Zod-validated tools** invoked by agents (weather, YouTube, analytics, engagement, post creation, voice, carousels, brand guardian, DM automation, etc.). |
| `services/ai/workflows/` | **6 multi-step asynchronous orchestration pipelines** (`blogWorkflow`, `carouselPublishingWorkflow`, `postPublishingWorkflow`, `socialListeningWorkflow`, `voiceNarrationWorkflow`, `weatherWorkflow`). |
| `services/ai/ai.service.ts` | Dynamic LLM text generation switching between OpenRouter (dev) and OpenAI/Anthropic (prod). |
| `services/ai/embedding.service.ts`| `pgvector` document embedding and semantic RAG retrieval. |
| `services/ai/types.ts` | Core TypeScript interfaces for `ToolDefinition`, `AgentDefinition`, and `WorkflowDefinition`. |

---

## 🧪 Testing & Code Quality

The repository enforces strict type integrity and automated regression coverage across all modules:

```bash
# 1. Run ESLint code quality analysis
npm run lint

# 2. Run TypeScript static analysis with 8GB heap allocation
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit

# 3. Run Jest automated test suites (58 suites / 281 tests)
npm test

# 4. Run test suites in watch mode during development
npm run test:watch

# 5. Build production bundle to verify compilation
npm run build
```

---

## 📁 Repository Structure

```text
ai_social_media_automation/
├── .agents/                    # AI Agent skills and development rules
│   └── skills/                 # 54 modular agent skill instructions
├── .github/                    # GitHub configuration & workflows
│   ├── ISSUE_TEMPLATE/         # Form-based bug & feature templates
│   ├── workflows/              # CI, Security, VPS & K8s deployment pipelines
│   ├── CODEOWNERS              # Domain ownership mapping
│   └── PULL_REQUEST_TEMPLATE.md# Pull request verification checklist
├── app/                        # Next.js 16 App Router pages & layouts
│   ├── (admin)/                # Administrative control center & billing hub
│   ├── (auth)/                 # Split-screen authentication & 2FA OTP onboarding
│   ├── (user)/                 # Primary customer SaaS dashboard (29 domain modules)
│   ├── (marketing)/            # Public landing pages & feature highlights
│   └── api/                    # Route Handlers protected by proxy.ts
├── components/                 # Shared UI components (Radix, shadcn, motion)
├── docs/                       # Architecture decisions (ADRs) & operations
│   ├── architecture/decisions/ # Architectural Decision Records
│   ├── ops/                    # DevOps, Alerting & Disaster Recovery runbooks
│   └── archive/                # Historical milestone specifications
├── features/                   # Self-contained domain modules
│   ├── ad-campaigns/           # Ad creation, A/B testing & sync workers
│   ├── ai-blog/                # TipTap editor, SEO analyzer & serializers
│   ├── ai_arena/               # Multi-model benchmarking (Claude, GPT, Gemini, DeepSeek)
│   ├── analytics/              # Social growth dashboards & metrics
│   ├── billing/                # Stripe checkout, webhooks & plan limits
│   ├── brand_guardian/         # Real-time brand voice linter & Flesch-Kincaid scoring
│   ├── carousel_builder/       # Multi-slide visual carousel studio
│   ├── dm_automation/          # Inbound DM automation & lead capture
│   ├── image_generation/       # Flux Pro image generation workers
│   ├── knowledge/              # RAG ingestion & pgvector search
│   ├── scheduler/              # BullMQ queue definitions & processors
│   ├── social/                 # Social channel OAuth & publishers
│   ├── social_listening/       # Omnichannel brand mention radar
│   ├── video_generation/       # Video synthesis & status workers
│   └── voice_studio/           # Narration playback & OpenAI TTS streaming
├── lib/                        # Core utilities, Better Auth, Prisma & security
├── mobile-app/                 # React Native / Expo SDK 57 mobile companion app
│   ├── src/app/                # Expo Router file-based screens & layouts
│   └── src/components/         # Mobile UI components & themed views
├── prisma/                     # Database schema & modular domain models
│   ├── schema.prisma           # Datasource & pgvector config
│   └── models/                 # Domain-specific Prisma model definitions
├── scripts/                    # CLI utilities, schedulers & skill synchronizers
└── services/ai/                # Autonomous AI agent orchestration engine
```

---

## 🤝 Contributing

We welcome contributions from the open-source community! Whether fixing a bug, adding an AI agent, improving documentation, or optimizing worker performance:

1. Review our [Contributing Guide](CONTRIBUTING.md) for branch naming and commit conventions.
2. Ensure your contributions abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
3. Review our [Security Architecture & Guardrails](SECURITY.md).
4. Run all local tests and static analysis checks before opening a pull request.

---

## 🔒 Security

Security is foundational to SocialAI. The platform enforces:
- **Deny-by-Default Edge Proxy**: All `/api/*` endpoints require explicit session or admin authentication unless explicitly registered in `PUBLIC_PREFIXES`.
- **SSRF Defense**: External URL fetching is validated against private CIDRs, loopbacks, and cloud metadata (IMDS `169.254.169.254`) via `SecurityService.validateSafeUrl()`.
- **Multi-Tenant Isolation**: All Prisma database queries require `businessId` or `organizationId` scoping.
- **Upload Hardening**: Media uploads enforce binary magic byte inspection and filename sanitization.

To report a vulnerability, please read our [Security Policy](SECURITY.md) and report it privately.

---

## 🗺️ Roadmap

- [x] Next.js 16 App Router & Tailwind CSS v4 migration
- [x] Custom AI Engine with 16 Autonomous Marketing Agents
- [x] PostgreSQL + `pgvector` RAG Knowledge Retrieval
- [x] BullMQ Background Worker Queues & Schedulers
- [x] Stripe Multi-Tenant Billing & Entitlements
- [x] Split-Screen Authentication & Admin Control Center
- [x] Cross-Platform Mobile Companion App (Expo SDK 57 / React Native 0.86)
- [x] Open-Source Repository Modernization & Community Infrastructure
- [ ] Direct TikTok & Instagram Stories Video Auto-Publishing API
- [ ] Self-Hosted Local LLM Runner Support (Ollama / vLLM integration)
- [ ] Multi-Language Localization (i18n) for Dashboard UI

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Maintainers & Community

Maintained with ❤️ by **[Taha](https://github.com/taha123618)** and the **SocialAI Open-Source Community**.

- **GitHub Issues**: [Report a Bug](https://github.com/taha123618/AI-Social-Media-Automation/issues)
- **Discussions**: [Join the Community](https://github.com/taha123618/AI-Social-Media-Automation/discussions)
- **Security**: [Report a Vulnerability](SECURITY.md)
