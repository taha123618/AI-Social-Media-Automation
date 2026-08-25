---
name: api-and-core-backend
description: Use this skill for writing Next.js Route Handlers, middleware, input validation, server actions, backend services, billing entitlements, and managing LLM/AI SDK orchestration.
---

# API, Core Backend & Entitlement Architecture

You are operating as a Senior Backend & Systems Engineer responsible for Next.js App Router Route Handlers, Server Actions, multi-tenant isolation, database queries, background job dispatches, and centralized billing entitlement enforcement.

## 1. Centralized Billing & Entitlements Engine
- **Plans Configuration**: Single source of truth in [`features/billing/config/plans.config.ts`](file:///Users/taha/projects/ai_social_media_automation/features/billing/config/plans.config.ts) (`Free`, `Starter`, `Pro`, `Enterprise`).
- **Entitlement Checks**: [`EntitlementService`](file:///Users/taha/projects/ai_social_media_automation/features/billing/services/entitlement.service.ts)
- **Usage Metering & Consumption**: [`UsageService`](file:///Users/taha/projects/ai_social_media_automation/features/billing/services/usage.service.ts)
- **Billing Service**: [`BillingService`](file:///Users/taha/projects/ai_social_media_automation/features/billing/services/billing.service.ts)
- **Server-Side Guards**: [`EntitlementGuard`](file:///Users/taha/projects/ai_social_media_automation/lib/guards/entitlement.guard.ts)
- **Stripe Webhook Processing**: [`WebhookService`](file:///Users/taha/projects/ai_social_media_automation/features/billing/services/webhook.service.ts)

### 1.1 Backend Entitlement Enforcement Pattern
Before executing any resource-intensive or premium feature (AI generation, post scheduling, CMS publishing, word counts):
```typescript
import { EntitlementGuard } from '@/lib/guards/entitlement.guard';
import { UsageService } from '@/features/billing/services/usage.service';

// 1. Feature Boolean Check (e.g. scheduling, advanced analytics)
const featureError = await EntitlementGuard.requireFeature(businessId, 'scheduling');
if (featureError) return featureError;

// 2. Metered Quota Check (e.g. ai_posts, ai_articles)
const quotaError = await EntitlementGuard.requireUsageLimit(businessId, 'ai_posts', 1);
if (quotaError) return quotaError;

// 3. Word Count Check
const wordError = await EntitlementGuard.requireArticleWordLimit(businessId, requestedWords);
if (wordError) return wordError;

// 4. Atomically consume credit after generation
await UsageService.consume(businessId, 'ai_posts', 1);
```

### 1.2 Dedicated Billing API Handlers
- `GET /api/billing/usage`: Current consumption & quota breakdown for the active workspace.
- `GET /api/billing/entitlements`: Resolved feature flags and capabilities.
- `GET /api/billing/invoices`: Historical Stripe invoice records and PDF receipt URLs.
- `POST /api/billing/checkout`: Creates Stripe Checkout Session URLs.
- `POST /api/billing/portal`: Creates Stripe Customer Portal sessions.
- `POST /api/billing/cancel`: Schedules cancellation at period end.
- `POST /api/billing/reactivate`: Reactivates pending cancellations.
- `POST /api/billing/webhooks`: Idempotent Stripe webhook listener.
- `GET /api/cron/billing-reconciliation`: Periodic reconciliation and monthly usage reset cron.

---

## 2. Route Protection & Middleware (`proxy.ts`)
- Enforces session validation on protected routes (`/dashboard`, `/contents`, `/schedule`, `/settings`, `/team`, `/workflow`, `/videos`, `/analytics`, `/knowledge`, `/posts`, `/api/*`).
- Redirects unauthenticated requests to `/login?redirect=...`.
- Whitelists `/api/auth`, `/api/billing/webhooks`, `/api/system/alerts`, `/login`, `/register`, `/pricing`, `/terms`, `/privacy`.

---

## 3. Multi-Tenant Scoping Rule
Every Prisma query on tenant models must enforce `businessId` filtering:
```typescript
const drafts = await prisma.contentDraft.findMany({
  where: { businessId },
});
```
