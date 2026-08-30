# AI Social Media Automation — CLAUDE.md

> **Single source of truth** for AI-assisted development. All 18 domain skills under `.agents/skills/*/SKILL.md` provide deeper implementation detail; this document consolidates essential guidance, principles, and workflows.

---

## 1. Project Overview

Multi-tenant SaaS platform for AI-powered social media automation: content generation, scheduling, publishing, ad campaign management, analytics, and blog writing.

| Aspect | Detail |
|--------|--------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4 |
| **UI** | shadcn/ui, Radix UI, Framer Motion, GSAP, Three.js, Rive, TipTap |
| **UI Utilities** | Sonner (toasts), Recharts (charts), React Hook Form + Zod (forms), Zustand (state), cmdk (command), Embla Carousel, TanStack Table |
| **Backend** | Next.js Route Handlers, Server Actions, Zod validation |
| **Database** | PostgreSQL 16 + pgvector, Prisma ORM |
| **Queues** | BullMQ + Redis |
| **Storage** | AWS S3 v3 (presigned URLs, CDN via CloudFront) |
| **AI/ML** | LangChain, OpenRouter (dev), OpenAI (prod), Mastra Framework |
| **Auth** | Better Auth (email/password + Google OAuth, cookie sessions) |
| **Email** | Nodemailer with queue-based delivery |
| **Workers** | Separate entry points in `features/*/workers/`, started via `npm run workers` |
| **Runtime** | Node >=22.18.0, TypeScript strict mode |

---

## 2. Architecture

### 2.1 Multi-Tenant SaaS

```
Organization (top-level tenant)
  └── Business (sub-tenant / location)
       ├── Members (OWNER → ADMIN → EDITOR → VIEWER)
       ├── Social Accounts (platform connections)
       ├── Content & Posts
       ├── Ad Campaigns
       └── Brand Profiles
```

**CRITICAL**: ALL database queries MUST be scoped by `organizationId` or `businessId`. Unscoped queries are cross-tenant data leaks.

### 2.2 Feature-Based Module Structure

```
features/
  social/           # Social media integrations & providers
  ai-blog/          # AI blog writer (TipTap editor, SEO, export)
  ad-campaigns/     # Ad campaign management (Meta, Google)
  image_generation/ # Image gen with workers
  video_generation/ # Video gen with workers
  scheduler/        # Queue config & all workers
  analytics/        # Analytics & reporting
  knowledge/        # Knowledge base & vector search
  workflow/         # Multi-step workflow execution
  ...
```

Each feature is self-contained with:
`services/`, `components/`, `workers/`, `types/`, `hooks/`, `lib/`, `actions/`

### 2.3 AI Provider Abstraction

```
AIService (unified interface in services/ai/ai.service.ts)
  ├── Dev: OpenRouter (multi-model, cheap)
  └── Prod: OpenAI (direct, reliable)
```

Custom providers in `lib/ai/providers/`: OpenAI, Anthropic, Gemini, Groq, Ollama, LM Studio. Each extends `BaseAIProvider` with circuit breaker, rate limiter, retry, and caching.

### 2.4 Async Processing Pattern

```
API Route → Validate Input → Enqueue to BullMQ → Return 202
  └── Worker picks up job → Process → Store Result → Notify
```

**Never** execute AI calls, video processing, or social API posting synchronously in API Route Handlers.

### 2.5 Clean Architecture Layers

```
Route Handlers (interface adapters)  →  app/api/*/route.ts
  └── Services (use cases)           →  features/*/services/
       └── Prisma / External APIs    →  lib/prisma.ts, providers
            └── PostgreSQL / S3 / Redis
```

### 2.6 Architecture Decision Records (ADR)

Architectural decisions are documented in individual files under `docs/architecture/decisions/`. Each file follows a consistent `Context → Options → Decision → Consequences → Compliance` format.

| # | Title | File |
|---|-------|------|
| 001 | BullMQ for Background Jobs | `docs/architecture/decisions/001-bullmq-background-jobs.md` |
| 002 | Multi-Tenancy via organizationId with businessId Sub-Scope | `docs/architecture/decisions/002-multi-tenancy-organization-id.md` |
| 003 | Environment-Based AI Provider Switching | `docs/architecture/decisions/003-environment-ai-provider-switching.md` |
| 004 | Feature-Based Folder Structure | `docs/architecture/decisions/004-feature-based-folder-structure.md` |

To propose a new ADR, copy the template from `docs/architecture/decisions/000-adr-template.md`, increment the number, and add your file. If an ADR supersedes a previous one, update the previous ADR's status to `Superseded` and link to the new one.

---

## 3. Directory Map

```
app/
  (marketing)/       # Public pages (blog-writer, pricing, talk-to-sales)
  (user)/            # Authenticated user pages (dashboard, posts, analytics)
  (admin)/           # Admin dashboard (system, users, queues, config)
  (auth)/            # Login, register, password reset, invite
  api/               # All Route Handlers (auth, social, blog, cron, admin...)
features/            # Feature modules (see §2.2)
lib/                 # Shared utilities (auth, prisma, redis, s3, ai/providers)
services/            # Cross-cutting services (ai, image-storage, video-thumbnail)
mastra/              # Mastra framework agents, tools, workflows (root mastra/ directory)
prisma/              # Schema, migrations, models
components/          # Shared UI components
hooks/               # Shared React hooks
utils/               # Shared utility functions
types/               # Shared TypeScript types
scripts/             # Worker entry points, cron, admin tools
```

---

## 4. Engineering Principles

### 4.1 SOLID

| Principle | Practice |
|-----------|----------|
| **S**ingle Responsibility | Each service has one job (e.g., `CampaignLauncherService` only launches) |
| **O**pen/Closed | Extend behavior via parameters/config, not modification |
| **L**iskov Substitution | Social providers implement `ISocialProvider`; AI providers extend `BaseAIProvider` |
| **I**nterface Segregation | Small focused interfaces (Zod schemas, typed params) |
| **D**ependency Inversion | High-level services depend on abstractions, not concretions |

### 4.2 DRY — Don't Repeat Yourself

- Extract shared logic into services (see `features/*/services/`)
- Share types across feature boundaries via `types/` barrel files
- If code appears 3+ times, extract it

### 4.3 Domain-Driven Design (DDD)

While not a full tactical DDD implementation, the project uses DDD-adjacent patterns:
- **Bounded Contexts**: Feature modules (`features/*/`) act as bounded contexts with their own services, types, and components
- **Anti-Corruption Layer**: Social providers implement `ISocialProvider` to shield core logic from platform-specific API chaos
- **Domain Services**: `features/multi-location/services/multi-location.service.ts` resolves tenant hierarchy (organization → business)
- **Ubiquitous Language**: Use project terminology consistently across code, comments, and docs (e.g., "Organization", "Business", "Campaign", "Ad Set")

### 4.4 KISS — Keep It Simple

- Prefer clarity over cleverness; avoid premature abstraction
- One file = one responsibility; keep files under ~200 lines
- Use early returns to flatten conditionals

### 4.5 YAGNI — You Ain't Gonna Need It

- Do not add abstractions for hypothetical future requirements
- Implement what the current task requires; refactor when patterns emerge
- Avoid framework features until they solve an actual problem

---

## 5. Coding Standards

### 5.1 TypeScript

- **Strict mode** enabled (`strict: true` in `tsconfig.json`)
- **No `any`** — use `unknown` if type is truly dynamic, then narrow
- All props, params, and returns MUST be explicitly typed
- Use Zod schemas at EVERY data boundary (API input, tool I/O, env vars)
- Prefer `interface` for public APIs, `type` for unions/utility types

### 5.2 Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Files | `kebab-case` | `blog-generator.service.ts` |
| Classes/Interfaces | `PascalCase` | `class BlogGeneratorService` |
| Functions/Variables | `camelCase` | `function generateOutline()` |
| Constants | `UPPER_SNAKE_CASE` | `QUEUE_NAMES`, `MAX_RETRIES` |
| React Components | `PascalCase` | `function BlogEditor()` |
| Route Handlers | `PascalCase` or export default | `export async function POST()` |
| Types/Interfaces | `PascalCase` | `interface BlogPost`, `type PostStatus` |
| Test files | Co-located `.test.ts` | `google-account-parser.test.ts` |

### 5.3 Imports & Organization

```typescript
// 1. External modules
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// 2. Internal modules (use `@/` path alias)
import { SystemLogger } from "@/features/system/services/logger.service";

// 3. Types
import type { BlogPost } from "@/features/ai-blog/types/blog.types";
```

### 5.4 Error Handling

```typescript
// GOOD: Structured, logged, user-safe
try {
  const data = schema.parse(body);
  const result = await processData(data);
  return NextResponse.json({ data: result }, { status: 200 });
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } },
      { status: 400 },
    );
  }
  await SystemLogger.logError({
    message: error instanceof Error ? error.message : "Unknown error",
    source: "RouteHandler",
    context: { /* relevant debugging context */ },
    severity: "HIGH",
  });
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 },
  );
}
```

### 5.5 Logging

Use `SystemLogger` (from `features/system/services/logger.service.ts`) for all logging:

- `logError({ message, source, context?, severity? })` — system errors
- `logAudit({ action, resource, status, userId?, details? })` — security events
- `logActivity({ action, entity, entityId?, userId?, details? })` — user actions

Never log PII, tokens, or secrets.

### 5.6 Configuration

- All secrets in environment variables (`.env`), validated with Zod at startup
- `.env.example` must stay in sync with actual variables
- Use `process.env.NODE_ENV === "development"` for environment-sensitive switching

---

## 6. Development Workflow

### 6.1 Task Analysis (Before Coding)

1. **Understand the requirement** — Read the issue/spec carefully
2. **Gather context** — Find relevant files (read, search, explore patterns)
3. **Identify existing patterns** — Check how similar features are implemented
4. **Plan the approach** — Consider architecture, security, multi-tenancy, async needs
5. **Confirm understanding** — Ask clarifying questions when ambiguous

### 6.2 Implementation Sequence

1. **Create/update Prisma model** (if new DB entity needed), run `npm run prisma:migrate`
2. **Define types & schemas** (Zod schemas, TypeScript interfaces)
3. **Implement service layer** (business logic, isolated, testable)
4. **Wire up API routes** (thin handlers that delegate to services)
5. **Build UI components** (Server Components first, Client where needed)
6. **Add workers** (if the operation is heavy/async)
7. **Register new Mastra agents/tools/workflows** in `src/mastra/index.ts` (MUST — required to compile)
8. **Write tests** (unit for services, integration for endpoints)

### 6.3 Feature Implementation Checklist

- [ ] Feature follows existing module structure (`features/*/`)
- [ ] Service layer extracted from route handler
- [ ] Multi-tenancy isolation respected (ALL queries scoped by `organizationId`)
- [ ] Zod schemas validate all external input
- [ ] Background processing used for operations >1s
- [ ] Error handling with `SystemLogger` at boundaries
- [ ] Loading, empty, and error states for all UI
- [ ] Tests for success + failure paths (services)
- [ ] Documentation updated if public API changes

### 6.4 Bug Fix Checklist

- [ ] Reproduce and understand the root cause
- [ ] Add a test that fails with the bug (before fixing)
- [ ] Apply minimal fix targeting root cause
- [ ] Verify fix doesn't break related functionality

### 6.5 Refactoring Checklist

- [ ] Read and understand the full code path
- [ ] Identify all callers before changing interfaces
- [ ] Make one logical change per commit
- [ ] Run tests after each step
- [ ] Remove dead code and unused imports
- [ ] Never refactor and add features in the same commit

---

## 7. API Design

### 7.1 Response Format

```typescript
// Success
{ "data": { ... }, "meta": { page, limit, total, totalPages } }

// Validation Error (400)
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }

// Async/Accepted (202)
{ "jobId": "abc123", "status": "queued", "statusUrl": "/api/jobs/abc123" }

// Not Found (404)
{ "error": { "code": "NOT_FOUND", "message": "Resource not found" } }

// Auth Error (401)
{ "error": { "code": "UNAUTHORIZED", "message": "Authentication required" } }

// Forbidden (403)
{ "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" } }
```

### 7.2 HTTP Status Codes

`200` Success · `201` Created · `202` Accepted (async) · `204` No Content (DELETE) · `400` Validation · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `422` Unprocessable · `429` Rate Limited · `500` Internal Error

### 7.3 Route Handler Pattern

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({ /* ... */ });

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorized();

  const body = await req.json();
  const data = schema.parse(body);

  // Delegate to service, return structured response
}
```

---

## 8. Frontend Guidelines

### 8.1 Component Architecture

- **Server Components** by default — for data fetching, SEO, initial load
- **Client Components** (`"use client"`) — only for interactivity, browser APIs, state
- Minimize Client Component boundaries; keep them leaf-level

### 8.2 Data Fetching

```typescript
// Server Component — fetch directly
const posts = await prisma.post.findMany({ where: { business: { organizationId } } });

// Client Component — use TanStack Query
const { data } = useQuery({
  queryKey: ["posts", filter],
  queryFn: () => fetchPosts(filter),
  staleTime: 30_000,       // 30s for frequently-changing data
  gcTime: 5 * 60_000,      // keep in cache 5 minutes
});
```

**Stale time guidelines**: Dashboard data → 5min, Posts → 30s, Analytics → 5min, Social accounts → 1min

### 8.3 Styling

- Tailwind CSS v4 with `cn()` utility (`lib/utils.ts`)
- shadcn/ui components from `components/ui/`
- Animations: Framer Motion for interactions, GSAP for scroll-triggered
- Responsive: mobile-first, test at 320px, 768px, 1024px, 1440px

### 8.4 Loading & Error States

```typescript
// loading.tsx — per route segment
export default function Loading() {
  return <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full" />;
}

// error.tsx — per route segment
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div>{/* error UI with retry */}</div>;
}
```

---

## 9. Database & Prisma

### 9.1 Multi-Tenancy (CRITICAL)

```typescript
// ✅ CORRECT — scoped
prisma.post.findMany({ where: { business: { organizationId } } });

// ❌ WRONG — cross-tenant leak
prisma.post.findMany();

// If only businessId is available, resolve organizationId via the helper:
import { resolveOrganizationIdFromBusiness } from "@/features/multi-location/services/multi-location.service";
const organizationId = await resolveOrganizationIdFromBusiness(businessId);
```

### 9.2 Best Practices

- Always use `select` to fetch only needed fields
- Use `$transaction` for atomic multi-table operations
- Paginate all list endpoints (`skip`/`take`, return `meta`)
- Use Prisma parameterized queries (never raw SQL with user input)
- Vector/chunk operations: use `prisma.$queryRaw` for pgvector operators

### 9.3 Migrations

```bash
npm run prisma:migrate   # Create migration (dev)
npm run setup            # Generate client + apply migrations
npm run prisma:studio    # Browse data
```

---

## 10. Background Processing (BullMQ)

### 10.1 Queue Names

Registered in `QUEUE_NAMES`: `GENERATION`, `MEDIA`, `POSTING`, `SCHEDULING`, `AUTOPILOT`, `KNOWLEDGE`, `EMAIL`, `WORKFLOW`, `SOCIAL`, `ASSET`, `ANALYTICS`, `VIDEO_STATUS`, `IMAGE_STATUS`, `IMAGE_GENERATION`

### 10.2 Producer Pattern

```typescript
import { socialQueue } from "@/lib/socialQueue";

const job = await socialQueue.add(taskData.type, taskData, {
  priority: taskData.type === "publish-post" ? 10 : 5,
});
return NextResponse.json({ jobId: job.id }, { status: 202 });
```

### 10.3 Worker Pattern

```typescript
const worker = new Worker(QUEUE_NAMES.SOCIAL, async (job) => {
  // Idempotent processing — check if already done before acting
  const existing = await prisma.job.findUnique({ where: { jobId: job.id } });
  if (existing) return;

  await processJob(job.data);
  await prisma.job.create({ data: { jobId: job.id, status: "COMPLETED" } });
}, {
  connection: REDIS_CONNECTION_CONFIG,
  concurrency: 5,
});

worker.on("failed", (job, err) => {
  SystemLogger.logError({ message: err.message, source: "Worker", context: { jobId: job?.id } });
});
```

### 10.4 Queue Configuration

```typescript
export const QUEUE_CONFIG = {
  GENERATION: { concurrency: 5, limiter: { max: 20, duration: 60000 } },
  POSTING:    { concurrency: 2, limiter: { max: 10, duration: 1000 } },    // API rate limits
  MEDIA:      { concurrency: 3, limiter: { max: 15, duration: 60000 } },
  AUTOPILOT:  { concurrency: 2, limiter: { max: 5, duration: 60000 } },
  KNOWLEDGE:  { concurrency: 3, limiter: { max: 10, duration: 60000 } },
};
```

### 10.5 Idempotency Mandate

Workers MUST be **idempotent** — retries must not cause duplicate side effects (charges, emails, API calls). Check for existing completion before processing. Use `p-retry` for custom retry logic beyond BullMQ's built-in exponential backoff.

---

## 11. AI Integration

### 11.1 Provider Abstraction

Use `AIService` (`services/ai/ai.service.ts`) — never call provider SDKs directly in application code.

```typescript
// ✅ Use the abstraction
const response = await AIService.generateJSON<BlogOutline>({
  model: AIService.getEnvironmentInfo().defaultModel,
  messages: [ /* ... */ ],
});

// ❌ Don't call provider APIs directly
const res = await fetch("https://api.openai.com/v1/chat/completions", { ... });
```

### 11.2 Environment-Based Model Selection

```typescript
const model = process.env.NODE_ENV === "development"
  ? "google/gemini-2.5-flash-lite"   // Cheap for dev
  : "gpt-4o";                          // Reliable for prod
```

### 11.3 Prompt Structure

```typescript
const systemPrompt = `You are an expert [role].

Core Requirements:
- [specific task]
- [constraints and boundaries]
- [output format: JSON / HTML / markdown]

DO NOT:
- [negative instructions]
- [things to avoid]`;
```

### 11.4 Mastra Agents

- Define agents in `mastra/agents/*.ts` (root directory, NOT `src/mastra`)
- Create tools with Zod schemas in `mastra/tools/*.ts`
- Multi-step workflows in `mastra/workflows/*.ts`
- **MUST register** all new agents, tools, and workflows in `mastra/index.ts` — this is a hard requirement; unregistered components will not compile
- Run `npm run build` to verify compilation

---

## 12. Security

### 12.1 Authentication & Authorization

- Better Auth with cookie sessions (7-day expiry, 1-day update age)
- Role hierarchy: `OWNER > ADMIN > EDITOR > VIEWER`
- Every protected route must verify session AND role
- All multi-tenant queries scoped by `organizationId`

### 12.2 Input Validation

Zod schemas at EVERY API boundary — request body, query params, route params. Never trust user input.

### 12.3 Secrets

- All in environment variables, validated at startup
- Never commit `.env` files or hardcode keys
- Use GitHub Secrets for CI/CD

### 12.4 Common Vulnerabilities

| Risk | Prevention |
|------|-----------|
| Mass Assignment | Never pass raw body to Prisma `create`/`update` |
| IDOR | Verify user/business ownership before access |
| SQL Injection | Prisma parameterized queries only |
| XSS | React auto-escapes; avoid `dangerouslySetInnerHTML` |
| CSRF | SameSite cookies; validate origin/referer |
| Rate Limiting | Implement on auth and API endpoints |
| Info Leakage | Don't expose stack traces or internal details |

---

## 13. Testing Strategy

### 13.1 Test Types

| Type | Focus | Location |
|------|-------|----------|
| Unit | Services, utilities, pure functions | `*.test.ts` co-located |
| Integration | API + DB flows | `features/*/services/__tests__/` |
| E2E | Critical user flows | Playwright (separate setup) |

### 13.2 Writing Tests

```typescript
describe("ServiceName", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should do something when condition", async () => {
    // Arrange
    mockExternalApi.mockResolvedValue(mockData);

    // Act
    const result = await ServiceName.method(input);

    // Assert
    expect(result).toEqual(expected);
    expect(mockExternalApi).toHaveBeenCalledWith(expectedArgs);
  });

  it("should handle error when condition", async () => {
    mockExternalApi.mockRejectedValue(new Error("reason"));
    await expect(ServiceName.method(input)).rejects.toThrow("expected message");
  });
});
```

### 13.3 Commands

```bash
npm test                    # All tests
npx jest --testPathPattern="parser"  # Pattern match
npx jest --coverage         # With coverage
```

### 13.4 Quality Gates

- [ ] All tests pass
- [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] No `.only` or `.skip` in committed tests
- [ ] Code coverage hasn't decreased significantly
- [ ] No TODO/FIXME without linked issues

---

## 14. Deployment & Operations

### 14.1 Local Development

```bash
docker compose up -d         # Postgres + Redis
npm run dev                  # Next.js dev server (port 3000)
npm run workers              # All BullMQ workers (separate terminal)
npm run setup                # Generate Prisma client + run migrations
```

### 14.2 Build & Run (Production)

```bash
npm run build                # Production bundle
npm run start                # Production server

# For production process management, PM2 config is at ecosystem.config.cjs
pm2 start ecosystem.config.cjs
```

### 14.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
steps:
  - run: npm ci
  - run: npm run lint
  - run: npx tsc --noEmit
  - run: npm test
  - run: npm run build
```

### 14.4 Git Workflow

- `main` — production (protected)
- `development` — integration branch
- `feature/*` — from `development`
- `fix/*` — bug fixes
- `fix/hotfix/*` — critical prod issues (from `main`)

**Commits**: `type(scope): description` — types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`

---

## 15. Definition of Done (DoD)

**Every task must satisfy ALL checks before being marked complete:**

### Functionality
- [ ] Feature works as specified (manual verification)
- [ ] All edge cases handled (empty states, errors, validation)
- [ ] Multi-tenancy isolation verified
- [ ] Background processing used for heavy operations (>1s)

### Code Quality
- [ ] TypeScript compiles with zero errors
- [ ] Lint passes with zero errors
- [ ] No `any` types introduced
- [ ] No dead code (unused imports, variables, functions)
- [ ] Follows project naming conventions and file structure
- [ ] SOLID principles respected (single responsibility, dependency inversion)

### Testing
- [ ] Unit tests for new services/utilities
- [ ] Tests cover success and failure paths
- [ ] All existing tests still pass
- [ ] No `.only` or `.skip` left in tests

### Security
- [ ] Zod validation on all external input
- [ ] Auth check for protected routes
- [ ] Multi-tenant data scoping (`organizationId`)
- [ ] No secrets in code (env vars only)
- [ ] Error messages don't leak internals

### Documentation
- [ ] Public API changes reflected in relevant docs
- [ ] JSDoc comments for new services/components
- [ ] `.env.example` updated if new env vars added

### Operations
- [ ] Build succeeds (`npm run build`)
- [ ] No new critical vulnerabilities introduced
- [ ] Logging added for key operations

---

## 16. Review Process (Code Review)

### 16.1 Focus Areas

1. **Architecture**: Does it fit existing patterns? Multi-tenancy respected?
2. **Security**: Input validation, auth checks, no secrets in code
3. **Performance**: Heavy ops in background? Server Components used?
4. **TypeScript**: Strict mode, no `any`, proper typing
5. **Testing**: Coverage of success + failure paths

### 16.2 Red Flags

- 🔴 Missing `organizationId` scoping (cross-tenant leak)
- 🔴 Synchronous heavy ops in API handlers
- 🔴 Hardcoded secrets
- 🟡 Missing error handling
- 🟡 `any` types
- 🟡 Missing Zod validation
- 🟢 Dead code or duplication

---

## 17. Performance Expectations

- **Server Components** for initial data fetch; Client Components only for interactivity
- **Background workers** for anything taking >1 second
- **Prisma `select`** to fetch only needed fields
- **Pagination** for all list endpoints (default 20, max 100)
- **Redis caching** for frequently accessed data
- **Next.js `<Image>`** for optimized image delivery
- **TanStack Query `staleTime`** tuned per data type
- **Code-split** large feature modules with `dynamic()` import
- **Debounce** expensive user interactions (search, filtering)

---

## 18. Cloud Storage

- All uploads use **presigned URLs** — never upload directly through the API
- Path pattern: `businesses/{businessId}/uploads/{filename}`
- S3 Block Public Access enabled; CloudFront OAI for secure serving
- Lifecycle policies for cost optimization
- See `.agents/skills/cloud-storage/SKILL.md` for detailed patterns

---

## 19. Billing, Subscriptions & Entitlements

- **Plan Configuration**: `features/billing/config/plans.config.ts` (`Free`, `Starter`, `Pro`, `Enterprise`)
- **Entitlement Checks**: `EntitlementService.canAccess(businessId, feature)` and `EntitlementGuard.requireFeature(...)`
- **Transactional Usage Metering**: `UsageService.consume(businessId, feature, quantity)`
- **Dynamic Client Gating**: `<FeatureGate feature="..." />` and `useEntitlements(feature)` hook
- **Admin Billing Command Center**: `/admin/billing` with subscription directory, live MRR/ARR KPIs, and manual plan override modal with audit trail logging

---

## 20. Skill Reference

For detailed implementation guidance on specific domains, refer to the corresponding skill:

| Domain | Skill Path |
|--------|-----------|
| Architecture & System Design | `.agents/skills/architecture-and-system-design/SKILL.md` |
| API & Core Backend | `.agents/skills/api-and-core-backend/SKILL.md` |
| AI Agent Development (Mastra) | `.agents/skills/ai-agent-development/SKILL.md` |
| AI Provider Integration | `.agents/skills/ai-provider-development/SKILL.md` |
| Prompt Engineering | `.agents/skills/prompt-engineering/SKILL.md` |
| Frontend UI Development | `.agents/skills/frontend-ui-development/SKILL.md` |
| Testing & Quality | `.agents/skills/testing-and-quality/SKILL.md` |
| Background Processing | `.agents/skills/background-processing/SKILL.md` |
| Authentication & Security | `.agents/skills/authentication-and-security/SKILL.md` |
| Database & Migrations | `.agents/skills/database-and-migrations/SKILL.md` |
| Logging & Monitoring | `.agents/skills/logging-and-monitoring/SKILL.md` |
| Cloud Storage | `.agents/skills/cloud-storage/SKILL.md` |
| Code Review | `.agents/skills/code-review/SKILL.md` |
| Code Refactoring | `.agents/skills/code-refactoring/SKILL.md` |
| Documentation | `.agents/skills/documentation/SKILL.md` |
| SEO & Content | `.agents/skills/seo-and-content/SKILL.md` |
| Deployment & Operations | `.agents/skills/deployment-and-operations/SKILL.md` |

---

## 20. Quick Reference (Commands)

```bash
npm run dev                  # Start dev server (port 3000)
npm run build                # Production build
npm run start                # Production server
npm run lint                 # ESLint
npm test                     # Jest tests
npm run workers              # Start all BullMQ workers
npm run setup                # Prisma generate + migrate
npm run prisma:studio        # Browse database
npx tsc --noEmit             # TypeScript type check
docker compose up -d         # Start Postgres + Redis
```
