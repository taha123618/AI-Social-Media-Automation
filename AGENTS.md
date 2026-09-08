# AGENTS.md

You are an expert TypeScript full-stack and AI developer experienced with Next.js 16 App Router, custom multi-agent AI systems, Expo SDK 57 React Native mobile applications, and enterprise SaaS architectures. You build AI agents, tools, workflows, backend services, and UI components. You follow strict TypeScript practices and always consult up-to-date documentation before making changes.

## Project Overview

This is a unified TypeScript enterprise SaaS application:
1. **Next.js 16 App Router** (`app/`, `features/`): High-performance SaaS application with 29 user dashboard modules in `app/(user)/`, Admin Operations & Billing Command Center (`app/(admin)/`), AI Blog Writer, BullMQ scheduler, PostgreSQL 16/18 + pgvector RAG data store, and Better Auth authentication.
2. **Custom AI Engine** (`services/ai/`): Pure TypeScript autonomous multi-agent orchestration, 16 autonomous marketing and analytical agents, 19 Zod-validated tools, dynamic `AIService` environment switching (OpenRouter in dev / OpenAI in prod), and 6 multi-step async workflows.
3. **Mobile Companion App** (`mobile-app/`): Cross-platform mobile client built with Expo SDK 57, React Native 0.86, Expo Router, TanStack Query, Zustand, FlashList, and Reanimated.

Runtime: Node.js `>=22.18.0` / Bun `>=1.0.0`.

## Commands

```bash
# Web Application & Workers
bun run dev             # Start Next.js App Router at localhost:3000
bun run workers         # Start BullMQ background scheduler and workers
bun run setup           # Run Prisma 7 client generation and migrate deploy
bun run build           # Build production bundle with 8GB heap memory allocation
npm test                # Run all 58 Jest test suites (281 tests)
npm run skills:sync     # Sync .agents/skills/* to .cursor, .claude, .trae, .devin, .github

# Mobile Companion App (mobile-app/)
cd mobile-app
bunx expo start         # Start Expo Metro bundler
bunx expo start --ios   # Launch in iOS Simulator
bunx expo start --android # Launch in Android Emulator
npx tsc --noEmit        # Typecheck mobile app
```

## AI Engine Directory Structure (`services/ai/`)

| Folder | Description |
| :--- | :--- |
| `services/ai/index.ts` | Central exported AI orchestrator unifying `AIService`, tools, agents, and workflows. |
| `services/ai/agents/` | **16 autonomous marketing and analytical agents** (`analyticsAgent`, `blogWriterAgent`, `brandGuardianAgent`, `carouselAgent`, `competitorAgent`, `dmAutomationAgent`, `engagementAgent`, `multiLocationAgent`, `postCreationAgent`, `reviewBoosterAgent`, `socialListeningAgent`, `templateAgent`, `trendEventAgent`, `voiceAgent`, `weatherAgent`, `youtubeAgent`). |
| `services/ai/tools/` | **19 reusable Zod-schema tools** (`adBoosterTool`, `analyticsTool`, `blogTool`, `brandGuardianTool`, `carouselTool`, `competitorTool`, `crmIntegrationTool`, `dmAutomationTool`, `growthScoreTool`, `industryTemplateTool`, `localEventTool`, `multiLocationTool`, `postCreationTool`, `reviewBoosterTool`, `socialEngagementTool`, `socialListeningTool`, `voiceTool`, `weatherTool`, `youtubeTool`). |
| `services/ai/workflows/` | **6 multi-step orchestration pipelines** (`blogWorkflow`, `carouselPublishingWorkflow`, `postPublishingWorkflow`, `socialListeningWorkflow`, `voiceNarrationWorkflow`, `weatherWorkflow`). |
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

## Boundaries & Cybersecurity Guardrails

### Always do
- Inspect architecture and threat boundaries before modifying security-sensitive code
- Register new agents, tools, and workflows in `services/ai/index.ts`
- Use Zod schemas for all tool inputs and outputs
- Enforce `businessId` multi-tenancy filtering across all Prisma queries
- Validate all external URLs against SSRF using `SecurityService.validateSafeUrl()` before executing `fetch()`
- Enforce **Deny by Default** for any new `/api/*` endpoints via `proxy.ts` unless explicitly public
- Sanitize filenames with `SecurityService.sanitizeFilename()` and validate magic bytes on uploads
- Verify permissions and resource ownership server-side; never trust client-supplied roles or tenant IDs
- Add regression tests (`lib/__tests__/cybersecurity-regression.test.ts`) for any security fixes
- Run `node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit` to verify type integrity
- Run `npm test` (Jest) to ensure all 58 test suites (281 tests) pass without regression

### Never do
- Never hardcode secrets, passwords, or API keys
- Never commit `.env` files or exposed credentials
- Never perform unscoped queries on tenant data models
- Never disable or weaken security controls, CSP, or CORS to make tests pass
- Never trust client-side authorization or role fields passed from the frontend
- Never concatenate untrusted user input into raw SQL queries or OS commands
- Never bypass input validation or sanitize logic
- Never disable TLS certificate verification as a permanent fix
- Never add unrestricted or unauthenticated admin endpoints
- Never upload files directly into executable directories or bypass magic byte validation
- Never log credentials, session tokens, passwords, or raw authentication headers
- Never introduce unnecessary dependencies with known CVEs
- Never silently weaken or alter authentication or password-length semantics

## Resources
- [Project Features Matrix](file:///Users/taha/projects/ai_social_media_automation/FEATURES.md)
- [System Architecture](file:///Users/taha/projects/ai_social_media_automation/ARCHITECTURE.md)
- [Local Development Guide](file:///Users/taha/projects/ai_social_media_automation/DEVELOPMENT.md)
- [Production Deployment Guide](file:///Users/taha/projects/ai_social_media_automation/DEPLOYMENT.md)
- [Mobile App Companion](file:///Users/taha/projects/ai_social_media_automation/mobile-app/README.md)
