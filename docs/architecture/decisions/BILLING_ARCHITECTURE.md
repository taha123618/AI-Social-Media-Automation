# Centralized Billing, Subscription & Entitlement Architecture

**Architecture Decision Record (ADR) & System Specification**  
**Project**: AI Social Media & Content Marketing Automation SaaS  
**Status**: **Accepted & Production-Ready**  
**Stack**: Next.js 16 (App Router) + PostgreSQL 18 / pgvector + Stripe + TypeScript 5.8  

---

## 1. Overview & Objectives

This document establishes the single source of truth for the platform's billing, subscription lifecycle, plan-entitlements, and usage-metering system.

### Core Principles
1. **Single Source of Truth**: All plan configurations, feature keys, limits, and pricing are defined in [`features/billing/config/plans.config.ts`](file:///Users/taha/projects/ai_social_media_automation/features/billing/config/plans.config.ts).
2. **Backend-First Enforcement**: Frontend feature gates are UX conveniences; every server route, API endpoint, and agent workflow independently validates permissions using [`EntitlementGuard`](file:///Users/taha/projects/ai_social_media_automation/lib/guards/entitlement.guard.ts).
3. **Plan Inheritance**: The hierarchy (`Free` → `Starter` → `Pro` → `Enterprise`) automatically inherits lower-tier capabilities unless explicitly configured otherwise.
4. **Atomic Usage Metering**: Usage records in `SubscriptionUsage` are incremented atomically to eliminate race conditions under concurrent AI requests.
5. **Idempotent Stripe Webhooks**: All incoming webhook events are recorded in `WebhookEvent` and guarded against replay or duplicate execution.

---

## 2. Plan & Entitlement Specifications

| Feature Key | Description | Free Plan | Starter Plan ($29/mo) | Pro Plan ($99/mo) |
| :--- | :--- | :---: | :---: | :---: |
| `ai_posts` | Monthly AI Social Post Generations | **5 posts** | **50 posts** | **Unlimited** (`-1`) |
| `ai_articles` | Monthly AI Blog Articles | **20 articles** | **100 articles** | **Unlimited** (`-1`) |
| `article_word_limit` | Maximum Word Count per Article | **3,000 words** | **8,000 words** | **Unlimited** (`-1`) |
| `brand_voice_profiles`| Active Brand Voice Profiles | **1 profile** | **5 profiles** | **Unlimited** (`-1`) |
| `seo_scoring` | Real-time SEO Content Analysis | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| `topical_cluster_mapping` | SEO Topic Cluster Mapping | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| `topical_cluster_strategy`| Advanced SEO Cluster Strategy | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| `auto_internal_linking`| Automatic Internal Linking | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| `gsc_sync` | Google Search Console Sync | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| `ai_detection_bypass` | AI Detection Evasion Engine | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| `scheduling` | Multi-channel Post Scheduling | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| `cms_publishing` | 1-Click CMS Publishing | Basic (WP/Ghost) | ✅ All Supported CMS | ✅ All CMS Integrations |
| `advanced_analytics` | Deep Engagement & Revenue Attribution | Basic only | ✅ Enabled | ✅ Enabled |
| `white_label_reports` | Custom White-Label PDF/CSV Exports | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| `team_collaboration` | Team RBAC & Multi-user Seats | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| `api_access` | REST / GraphQL Developer API Access | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| `custom_model_finetuning` | Custom Model Training & Fine-Tuning | ❌ Disabled | ❌ Disabled | ✅ Enabled |
| `support_level` | Customer Support Tier | Standard | Priority | Dedicated CSM + SLA |

---

## 3. Developer Guide & Usage Patterns

### 3.1 Protecting API Routes with Server Guards
```typescript
import { EntitlementGuard } from '@/lib/guards/entitlement.guard';
import { UsageService } from '@/features/billing/services/usage.service';

// 1. Boolean Feature Check
const featureError = await EntitlementGuard.requireFeature(businessId, 'scheduling');
if (featureError) return featureError;

// 2. Metered Quota Check
const quotaError = await EntitlementGuard.requireUsageLimit(businessId, 'ai_posts', 1);
if (quotaError) return quotaError;

// 3. Word Count Check
const wordError = await EntitlementGuard.requireArticleWordLimit(businessId, wordCount);
if (wordError) return wordError;

// 4. Consume Usage Credit after successful operation
await UsageService.consume(businessId, 'ai_posts', 1);
```

### 3.2 Adding a New Feature
Developers can easily register a new feature using the extension abstractions:
```typescript
import { registerFeature, registerMeteredFeature } from '@/features/billing/config/plans.config';

// Boolean Feature
registerFeature({
  key: 'ai_video_effects',
  name: 'AI Video Visual Effects',
  tiers: {
    free: false,
    starter: true,
    pro: true,
    enterprise: true,
  },
});

// Metered Feature
registerMeteredFeature({
  key: 'ai_voiceovers',
  name: 'AI Audio Voiceovers',
  unit: 'audio_track',
  limits: {
    free: 0,
    starter: 10,
    pro: -1, // Unlimited
    enterprise: -1,
  },
});
```

---

## 4. Stripe Webhook Synchronization & Idempotency

All webhooks are received at `/api/billing/webhooks`:
- Signatures are cryptographically verified using `process.env.STRIPE_WEBHOOK_SECRET`.
- Event records are persisted in the `WebhookEvent` table (`eventId`, `eventType`, `payload`, `processedAt`, `error`).
- Handled events:
  - `checkout.session.completed`: Activates new subscriptions.
  - `customer.subscription.created / updated`: Updates period start/end and billing status.
  - `customer.subscription.deleted`: Gracefully downgrades tenant to `free` plan.
  - `invoice.payment_failed`: Transitions status to `PAST_DUE`.
  - `invoice.payment_succeeded`: Restores status to `ACTIVE`.

---

## 5. Testing & Verification

```bash
# Run all billing test suites
npm test -- features/billing/services/__tests__/

# Run complete repository test matrix (135 tests across 35 suites)
npm test && bun test

# Verify TypeScript type integrity
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit
```
