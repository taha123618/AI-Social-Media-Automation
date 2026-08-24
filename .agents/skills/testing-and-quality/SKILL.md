---
name: testing-and-quality
description: Use this skill for implementing testing strategies, writing tests, managing test suites, and ensuring code quality across the project.
---

# Testing and Quality Assurance Standards

You are operating as a Senior SQA Engineer responsible for test architecture, automated test suites, quality gates, and regression testing across the platform.

## Test Architecture & Frameworks

- **Runners**: Jest (`jest.config.cjs`) and Bun Test (`bun test`)
- **Assertion Libraries**: Jest matchers & `@testing-library/jest-dom`
- **Mocking Strategy**: Top-level factory mocks (`jest.mock(...)`) with dual export compatibility for Prisma (`default` and `prisma`), Redis, and AI SDK providers.
- **Location Convention**: `features/{feature_name}/services/__tests__/*.test.ts` and `lib/__tests__/*.test.ts`.

## Test Suites Matrix (51 Automated Tests)

| Test Suite | File Location | Scope & Assertions |
| :--- | :--- | :--- |
| **AI Blog HTML Serializer** | `features/ai-blog/services/__tests__/blog-html-serializer.test.ts` | WordPress Gutenberg block generation, Webflow inline styling, Medium semantic HTML, Shopify/Notion exports, script/style sanitization |
| **AI Blog SEO Auditor** | `features/ai-blog/services/__tests__/blog-seo.test.ts` | 0-100 overall score, keyword density, title/meta length validations, heading hierarchy |
| **AI Blog Clipboard** | `features/ai-blog/services/__tests__/blog-clipboard.test.ts` | Multi-MIME rich HTML (`text/html`) and clean plaintext (`text/plain`) stripping |
| **Consistency Scorer** | `features/analytics/services/__tests__/consistency-scorer.test.ts` | 90-day streak calculation, posting frequency analysis, industry benchmarks |
| **Revenue Attribution** | `features/analytics/services/__tests__/revenue-attribution.test.ts` | Post-to-lead conversion rates, customer lifetime value (CLV), estimated ROI |
| **Vector & RAG Service** | `features/knowledge/services/__tests__/vector.service.test.ts` | Text chunking boundaries, overlap handling, numerical embedding generation |
| **CRM Integration** | `features/crm/services/__tests__/crm.service.test.ts` | Batch lead synchronization, webhook payloads, `NEW` -> `SYNCED` state transitions |
| **GDPR Compliance** | `features/compliance/services/__tests__/compliance.service.test.ts` | Meta data deletion request auditing, GDPR data export structure |
| **Multi-Tenant Security** | `lib/__tests__/auth-security.test.ts` | RBAC permissions (`OWNER`/`ADMIN`/`EDITOR`/`VIEWER`), `businessId` query scoping, cross-tenant isolation |
| **Image Generation** | `features/image_generation/services/__tests__/image.service.test.ts` | Model registry, aspect ratio dimension mapping, brand profile watermark & filter injection |
| **Ad Accounts & Meta/Google** | `features/ad-campaigns/services/__tests__/*.test.ts` | Ad account creation, primary switching, token refresh lifecycles, API response parsing |

## Mocking Best Practices

### 1) Prisma Client Dual Mock
Always mock `@/lib/prisma` with both `default` and named `prisma` properties:

```typescript
jest.mock('@/lib/prisma', () => {
  const business = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const client = { business };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    business,
  };
});
```

### 2) External AI / Embedding Providers
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
   npm test # or bun test
   ```
   *Requirement: 100% pass rate.*
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
