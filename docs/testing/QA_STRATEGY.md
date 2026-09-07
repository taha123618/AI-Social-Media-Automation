# SQA Engineering Strategy & Testing Guide

## 1. Overview & Quality Vision
This document outlines the testing architecture, quality assurance procedures, multi-tenant security verification, and automation protocols for the **AI Social Media Automation** enterprise SaaS platform.

As an enterprise-grade SaaS application with autonomous AI agents, multi-tenant billing, and external social network publishing, software quality is maintained through deterministic test suites, strict multi-tenant authorization boundaries, and continuous verification.

---

## 2. Testing Pyramid & Framework Stack

```
           / \
          /   \     E2E / Integration Tests (Route Handlers & Workflows)
         /     \    57 Test Suites · 264+ Automated Tests
        /-------\
       /         \   Unit & Guard Tests (Services, Zod Schemas, Entitlements)
      /-----------\
     /             \  Type Integrity & Static Analysis (`tsc --noEmit`, ESLint)
    /---------------\
```

| Layer | Technology | Primary Directory | Scope |
| :--- | :--- | :--- | :--- |
| **Type Integrity** | TypeScript 5.x | Entire repository | Zero-error static compile checks via `tsc --noEmit`. |
| **Unit Testing** | Jest 29.x / `ts-jest` | `features/*/services/__tests__`, `lib/__tests__` | Business logic, calculations, string sanitization, entitlement algorithms. |
| **API & Integration** | Next.js Route Handlers + Jest | `app/api/**/__tests__` | Request validation, auth verification, RBAC, state transitions, HTTP status codes. |
| **State Machine** | Jest | `features/workflow`, `app/api/workflow` | Content draft lifecycle (`GENERATED` -> `PENDING_REVIEW` -> `APPROVED`/`REJECTED` -> `SCHEDULED`). |
| **Security Gates** | Jest + Mocked Prisma | `lib/__tests__`, `app/api/**/__tests__` | Multi-tenant query isolation, IDOR prevention, entitlement feature access. |

---

## 3. Multi-Tenant Security Standards (IDOR Prevention)

In a multi-tenant SaaS architecture, data isolation is a critical security requirement.

### Rule 1: Authenticate the Session First
Every Route Handler that accesses or mutates business resources must extract and verify the user session:
```typescript
const session = await auth.api.getSession({ headers: request.headers });
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Rule 2: Never Trust Untrusted Tenant Headers Alone
An `x-business-id` header or `?businessId=` query parameter provided by a client **must** be cross-referenced against the authenticated user's business memberships:
```typescript
const membership = await prisma.businessMember.findFirst({
  where: {
    businessId: targetBusinessId,
    userId: session.user.id,
  },
});

if (!membership) {
  return NextResponse.json(
    { error: 'Forbidden: Access denied to this business workspace' },
    { status: 403 }
  );
}
```

### Rule 3: Enforce Tenant Scoping in Prisma Queries
Never execute unscoped queries on tenant data models (`ContentDraft`, `ApiKey`, `Webhook`, `Lead`, `SocialAccount`). Always include `where: { businessId }`.

---

## 4. Test Execution Commands

### Running All Automated Tests
```bash
bun run test
# or
npm test
```
*Expected result: 57 passed test suites, 264+ passed tests.*

### Running Specific Test Suites
```bash
# Test API Routes only
bun run test app/api/

# Test Billing & Entitlements
bun run test features/billing/ lib/__tests__/entitlement-guard.test.ts

# Test Workflow State Machine
bun run test features/workflow/ app/api/workflow/
```

### Running TypeScript Verification
```bash
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit
```
*Expected result: 0 errors.*

---

## 5. Mocking Architecture & Conventions

### Prisma Client Dual Mock
Prisma is imported both as `default` and named `prisma`. Mocks must supply both to avoid runtime resolution errors:
```typescript
jest.mock('@/lib/prisma', () => {
  const businessMember = { findUnique: jest.fn(), findFirst: jest.fn() };
  const client = { businessMember };
  return {
    __esModule: true,
    default: client,
    prisma: client,
    businessMember,
  };
});
```

### Next.js Route Handler Mocking
Simulate HTTP requests using `NextRequest`:
```typescript
import { NextRequest } from 'next/server';

const req = new NextRequest('http://localhost:3000/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-business-id': 'biz_test_123',
  },
  body: JSON.stringify({ payload: 'data' }),
});
const response = await POST(req);
expect(response.status).toBe(200);
```

---

## 6. Bug Severity Classification & Reporting

When logging issues or reviewing pull requests, use the following standardized severity matrix:

| Severity | Definition | SLA / Action |
| :--- | :--- | :--- |
| **Critical** | Data loss, multi-tenant data leaks, unauthenticated destructive actions, payment bypass. | Immediate hotfix; blocks deployment. |
| **High** | Broken core user workflows (e.g. posting failure, AI generation timeout, broken queue dispatch). | Fix within 24 hours. |
| **Medium** | Minor functional bugs, missing validations that fail gracefully, UI inconsistencies. | Schedule in current sprint. |
| **Low** | Cosmetic glitches, non-blocking visual alignment, minor copy edits. | Backlog / polish. |

---

## 7. Pre-PR Quality Gate Checklist
Before any code change is merged:
- [x] All 57 Jest test suites pass (100% pass rate)
- [x] `tsc --noEmit` reports 0 type errors
- [x] Every new API route includes authentication and multi-tenant membership checks
- [x] Input parameters are validated with Zod schemas
- [x] No secrets, private keys, or API tokens are hardcoded
