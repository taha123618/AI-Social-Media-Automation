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

### 1.3 Key Application API Endpoints
- **Mobile & Authentication**: `/api/auth/*` (Better Auth), `/api/auth/register/send-otp`, `/api/auth/register/verify-otp`.
- **Content & Scheduling**: `/api/posts`, `/api/posting-schedule`, `/api/contents`.
- **Autonomous Features**: `/api/dm-automation`, `/api/brand-guardian`, `/api/social-listening`, `/api/carousels`, `/api/voice`.
- **System & Observability**: `/api/health`, `/api/health/ready`, `/api/metrics`, `/api/system/alerts`.

---

## 2. Route Protection & Perimeter Gateway (`proxy.ts`)
- Edge proxy enforces **Deny by Default** for all `/api/*` endpoints.
- Any API route not explicitly enumerated in `PUBLIC_PREFIXES` automatically requires a valid session or admin token.
- Downstream route handlers receive pre-verified user identity headers (`x-user-id`, `x-user-email`).
- Public exemptions are strictly minimal: `/api/auth/*`, `/api/billing/webhooks`, `/api/system/alerts`, `/api/maintenance/status`, `/api/cron/*`, `/api/health`, `/api/metrics`, `/api/reviews/submit`, `/api/talk-to-sales/leads`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/terms`, `/privacy`.

---

## 3. Multi-Tenant Ownership Verification & API Defense
1. **Never trust client-provided IDs**: Do not trust `businessId` or `userId` supplied in query strings or JSON request bodies without server-side verification.
2. **Mandatory Tenant Membership Check**:
```typescript
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 1. Session check
const session = await auth.api.getSession({ headers: request.headers });
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// 2. Tenant membership check
const membership = await prisma.businessMember.findFirst({
  where: { businessId, userId: session.user.id },
});
if (!membership) {
  return NextResponse.json({ error: 'Forbidden: Access denied to this business' }, { status: 403 });
}
```
3. **SSRF Pre-Validation**: Any endpoint accepting external URLs (e.g. scrapers, webhooks, RSS feeds) must validate destination addresses with `SecurityService.validateSafeUrl()` before issuing `fetch()`.
4. **Input Validation**: Use Zod schemas on all request bodies and query parameters. Fail early with HTTP 400 Bad Request on schema mismatch.
