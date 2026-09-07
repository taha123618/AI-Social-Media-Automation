---
name: testing-and-quality
description: Use this skill for implementing testing strategies, writing tests, managing test suites, and ensuring code quality across the project.
---

# Testing and Quality Assurance Standards

You are operating as a Senior SQA Engineer responsible for test architecture, automated test suites, quality gates, and regression testing across the platform.

## Test Architecture & Frameworks

- **Runners**: Jest (`jest.config.cjs`) and Bun Test (`bun test`)
- **Assertion Libraries**: Jest matchers & `@testing-library/jest-dom`
- **Mocking Strategy**: Top-level factory mocks (`jest.mock(...)`) with dual export compatibility for Prisma (`default` and `prisma`), Redis, Better Auth, and AI SDK providers.
- **Location Convention**:
  - Services: `features/{feature_name}/services/__tests__/*.test.ts`
  - Libraries & Core: `lib/__tests__/*.test.ts`
  - Route Handlers & APIs: `app/api/**/__tests__/*.test.ts`

## Test Suites Matrix (57 Automated Test Suites · 264+ Tests)

| Test Suite | File Location | Scope & Assertions |
| :--- | :--- | :--- |
| **Developer API Keys & Webhooks** | `app/api/settings/__tests__/api-keys-and-webhooks.test.ts` | 401 unauthenticated, 403 non-member, 403 entitlement gate, 400 validation, REST CRUD, HMAC secrets |
| **CRM Integration API** | `app/api/crm/__tests__/crm-api.test.ts` | Session auth verification, tenant scoping, contact sync, third-party CRM configuration updates |
| **Posting Schedule API** | `app/api/posting-schedule/__tests__/posting-schedule-api.test.ts` | Session authentication, tenant scoping, slot addition, day toggling, slot removal, clearAll |
| **DM Automation API** | `app/api/dm-automation/__tests__/dm-automation-api.test.ts` | Inbound DM simulation, intent classification, multi-tenant rules CRUD, cross-tenant isolation |
| **Brand Guardian Audit API** | `app/api/brand-guardian/__tests__/brand-guardian-api.test.ts` | Copy auditing, compliance grading (A+ to F), forbidden word detection, tenant scoping |
| **Workflow State Machine API** | `app/api/workflow/__tests__/workflow-lifecycle-api.test.ts` | `submitForReview`, `approveDraft`, `rejectDraft`, `scheduleDraft`, BullMQ queue dispatch |
| **Entitlement Guard** | `lib/__tests__/entitlement-guard.test.ts` | `requireFeature` (403), `requireUsageLimit` (429), `requireArticleWordLimit`, `requireBrandVoiceLimit` |
| **Multi-Tenant Security** | `lib/__tests__/auth-security.test.ts` | RBAC permissions (`OWNER`/`ADMIN`/`EDITOR`/`VIEWER`), `businessId` query scoping, cross-tenant isolation |
| **AI Blog HTML Serializer** | `features/ai-blog/services/__tests__/blog-html-serializer.test.ts` | WordPress Gutenberg block generation, Webflow inline styling, Medium semantic HTML, Shopify/Notion exports |
| **AI Blog SEO Auditor** | `features/ai-blog/services/__tests__/blog-seo.test.ts` | 0-100 overall score, keyword density, title/meta length validations, heading hierarchy |
| **AI Blog Clipboard** | `features/ai-blog/services/__tests__/blog-clipboard.test.ts` | Multi-MIME rich HTML (`text/html`) and clean plaintext (`text/plain`) stripping |
| **Consistency Scorer** | `features/analytics/services/__tests__/consistency-scorer.test.ts` | 90-day streak calculation, posting frequency analysis, industry benchmarks |
| **Revenue Attribution** | `features/analytics/services/__tests__/revenue-attribution.test.ts` | Post-to-lead conversion rates, customer lifetime value (CLV), estimated ROI |
| **Vector & RAG Service** | `features/knowledge/services/__tests__/vector.service.test.ts` | Text chunking boundaries, overlap handling, numerical embedding generation |
| **CRM Service** | `features/crm/services/__tests__/crm.service.test.ts` | Batch lead synchronization, webhook payloads, `NEW` -> `SYNCED` state transitions |
| **GDPR Compliance** | `features/compliance/services/__tests__/compliance.service.test.ts` | Meta data deletion request auditing, GDPR data export structure |
| **Image Generation** | `features/image_generation/services/__tests__/image.service.test.ts` | Model registry, aspect ratio dimension mapping, brand profile watermark & filter injection |
| **Ad Accounts & Meta/Google** | `features/ad-campaigns/services/__tests__/*.test.ts` | Ad account creation, primary switching, token refresh lifecycles, API response parsing |
| **Billing Entitlements & Overrides** | `features/billing/services/__tests__/entitlement.service.test.ts` | Capability checks (`canAccess`), plan tier resolution (`Free`, `Starter`, `Pro`, `Enterprise`), database feature overrides |
| **Transactional Usage Metering** | `features/billing/services/__tests__/usage.service.test.ts` | Atomic quota increments (`consume`), remaining credit calculations, exhaustion errors (`QuotaExceededError`) |
| **Stripe Webhook Processing** | `features/billing/services/__tests__/webhook.service.test.ts` | Idempotent event handling (`checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`) |

## Mocking Best Practices

### 1) Prisma Client Dual Mock
Always mock `@/lib/prisma` at the top of the test file with both `default` and named `prisma` properties:

```typescript
jest.mock('@/lib/prisma', () => {
  const business = { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() };
  const businessMember = { findUnique: jest.fn(), findFirst: jest.fn() };
  const client = { business, businessMember };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
    businessMember,
  };
});
```

### 2) Route Handler Authentication Mock
When testing Next.js Route Handlers, mock Better Auth (`@/lib/auth`):

```typescript
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));
```

### 3) Multi-Tenant IDOR Security Rule
Every route handler accepting a `businessId` (whether via header, query parameter, or body) **MUST** authenticate the session user and verify that `prisma.businessMember` contains an active record linking `session.user.id` to `businessId`. Never trust unauthenticated `x-business-id` headers alone.

### 4) External AI / Embedding Providers
Never make live network calls to OpenAI, Anthropic, or external APIs during tests. Mock embedding and completion providers:

```typescript
jest.mock('@/services/ai/embedding.service', () => ({
  EmbeddingService: {
    embeddings: {
      embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
    },
  },
}));
```

## Pre-Commit & Pre-PR QA Checklist
Before creating a pull request or merging code:
1. **Run Full Test Suite**:
   ```bash
   bun run test
   ```
   *Requirement: 100% pass rate (57/57 suites, 264+ tests).*
2. **Run TypeScript Check**:
   ```bash
   node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit
   ```
   *Requirement: 0 TypeScript errors.*
3. **Verify Database Setup**:
   ```bash
   bun run setup
   ```
   *Requirement: Clean Prisma generation and migration deploy.*
