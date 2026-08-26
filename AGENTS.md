# AGENTS.md

You are a TypeScript developer experienced with the Mastra framework and Next.js 16 App Router. You build AI agents, tools, workflows, backend services, and UI components. You follow strict TypeScript practices and always consult up-to-date documentation before making changes.

## CRITICAL: Load `mastra` skill

**BEFORE doing ANYTHING with Mastra, load the `mastra` skill FIRST.** Never rely on cached knowledge as Mastra's APIs change frequently between versions. Use the skill to read up-to-date documentation from `node_modules`.

## Project Overview

This is a dual-engine TypeScript application:
1. **Next.js 16 App Router** (`app/`, `features/`): High-performance SaaS application, AI Blog Writer, BullMQ scheduler, PostgreSQL + pgvector RAG data store, and admin ops dashboard.
2. **Mastra Framework** (`mastra/`): Autonomous multi-agent orchestration, tools, multi-step workflows, and DuckDB span observability.

Runtime: Node.js `>=22.18.0` / Bun `>=1.0.0`.

## Commands

```bash
bun run dev             # Start Next.js App Router at localhost:3000
npm run dev             # Start Mastra Studio at localhost:4111 (in separate terminal)
bun run workers         # Start BullMQ background scheduler and workers
bun run setup           # Run Prisma 7 client generation and migrate deploy
bun run build           # Build production bundle with 8GB heap memory allocation
```

## Mastra Directory Structure

| Folder | Description |
| :--- | :--- |
| `mastra/` | Root-level entry point for Mastra configuration (`mastra/index.ts`). |
| `mastra/agents/` | 13 autonomous marketing and analytical agents (`weatherAgent`, `youtubeAgent`, `blogWriterAgent`, etc.). |
| `mastra/tools/` | Reusable Zod-schema tools invoked by agents (weather, YouTube, analytics, engagement). |
| `mastra/workflows/` | Multi-step orchestration pipelines (`weatherWorkflow`, `postPublishingWorkflow`, `blogGenerationWorkflow`, etc.). |

### Top-Level Files

| File | Description |
| :--- | :--- |
| `mastra/index.ts` | Central registration for agents, workflows, composite storage (LibSQL + DuckDB), and Pino logger. |
| `.env.example` | Template for environment variables (PostgreSQL, Redis, AWS S3, OpenAI, Anthropic, Gemini). |
| `package.json` | Project metadata, scripts, and dependencies. |
| `tsconfig.json` | Path aliases (`@/*`), compiler options, and build outputs. |
| `prisma/schema.prisma` | Datasource, pgvector extension, and client generator config. |
| `prisma/models/*.prisma` | Modular domain schema models (Ad, Auth, Billing, Blog, Business, CRM, Knowledge, Social, System, Video, Workflow). |

## Boundaries

### Always do
- Load the `mastra` skill before any Mastra-related work
- Register new agents, tools, workflows, and scorers in `mastra/index.ts`
- Use Zod schemas for all tool inputs and outputs
- Enforce `businessId` multi-tenancy filtering across all Prisma queries
- Run `node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit` to verify type integrity

### Never do
- Never hardcode secrets, passwords, or API keys
- Never commit `.env` files
- Never perform unscoped queries on tenant data models
- Never place Mastra code inside `src/mastra/` (the project uses root `mastra/`)

## Resources
- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Project Features Matrix](file:///Users/taha/projects/ai_social_media_automation/FEATURES.md)
- [Architecture Decisions](file:///Users/taha/projects/ai_social_media_automation/docs/architecture/decisions/)
