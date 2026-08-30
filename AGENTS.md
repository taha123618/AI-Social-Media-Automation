# AGENTS.md

You are an expert TypeScript full-stack and AI developer experienced with Next.js 16 App Router, custom multi-agent AI systems, and enterprise SaaS architectures. You build AI agents, tools, workflows, backend services, and UI components. You follow strict TypeScript practices and always consult up-to-date documentation before making changes.

## Project Overview

This is a unified TypeScript enterprise SaaS application:
1. **Next.js 16 App Router** (`app/`, `features/`): High-performance SaaS application, AI Blog Writer, BullMQ scheduler, PostgreSQL + pgvector RAG data store, Admin Operations & Billing Hub, and Better Auth authentication.
2. **Custom AI Engine** (`services/ai/`): Pure TypeScript autonomous multi-agent orchestration, Zod-validated tools, dynamic `AIService` environment switching (OpenRouter in dev / OpenAI in prod), and multi-step async workflows.

Runtime: Node.js `>=22.18.0` / Bun `>=1.0.0`.

## Commands

```bash
bun run dev             # Start Next.js App Router at localhost:3000
bun run workers         # Start BullMQ background scheduler and workers
bun run setup           # Run Prisma 7 client generation and migrate deploy
bun run build           # Build production bundle with 8GB heap memory allocation
```

## AI Engine Directory Structure (`services/ai/`)

| Folder | Description |
| :--- | :--- |
| `services/ai/index.ts` | Central exported AI orchestrator unifying `AIService`, tools, agents, and workflows. |
| `services/ai/agents/` | 13 autonomous marketing and analytical agents (`weatherAgent`, `youtubeAgent`, `blogWriterAgent`, `analyticsAgent`, etc.). |
| `services/ai/tools/` | Reusable Zod-schema tools invoked by agents (weather, YouTube, analytics, engagement, post creation). |
| `services/ai/workflows/` | Multi-step orchestration pipelines (`weatherWorkflow`, `postPublishingWorkflow`, `blogGenerationWorkflow`, etc.). |
| `services/ai/ai.service.ts` | Dynamic LLM text generation switching between OpenRouter (dev) and OpenAI (prod). |
| `services/ai/embedding.service.ts` | pgvector document embedding and semantic RAG retrieval. |
| `services/ai/types.ts` | Core TypeScript interfaces for `ToolDefinition`, `AgentDefinition`, and `WorkflowDefinition`. |

### Top-Level Configuration Files

| File | Description |
| :--- | :--- |
| `.env.example` | Template for environment variables (PostgreSQL, Redis, AWS S3, OpenAI, Anthropic, Gemini). |
| `package.json` | Project metadata, scripts, and dependencies. |
| `tsconfig.json` | Path aliases (`@/*`), compiler options, and build outputs. |
| `prisma/schema.prisma` | Datasource, pgvector extension, and client generator config. |
| `prisma/models/*.prisma` | Modular domain schema models (Ad, Auth, Billing, Blog, Business, CRM, Knowledge, Social, System, Video, Workflow). |

## Boundaries

### Always do
- Register new agents, tools, and workflows in `services/ai/index.ts`
- Use Zod schemas for all tool inputs and outputs
- Enforce `businessId` multi-tenancy filtering across all Prisma queries
- Run `node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit` to verify type integrity

### Never do
- Never hardcode secrets, passwords, or API keys
- Never commit `.env` files
- Never perform unscoped queries on tenant data models

## Resources
- [Project Features Matrix](file:///Users/taha/projects/ai_social_media_automation/FEATURES.md)
- [Architecture Decisions](file:///Users/taha/projects/ai_social_media_automation/docs/architecture/decisions/)
