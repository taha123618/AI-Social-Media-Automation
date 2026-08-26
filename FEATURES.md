# Features & Capabilities Matrix

This document provides a comprehensive overview of all features and modules implemented across the **AI Social Media & Content Automation Platform**, their current implementation status, underlying architecture, and integration points.

---

## Feature Matrix Summary

| Domain Module | Primary Location | Status | Key Technologies & Capabilities |
| :--- | :--- | :--- | :--- |
| **Subscription & Billing Engine** | `features/billing/`, `app/api/billing/` | ✅ Production-Ready | Stripe Checkout & Customer Portal, Centralized Plan Entitlements (`free`, `starter`, `pro`, `enterprise`), Transactional Metering, Idempotent Webhooks, Auto-Activation on Registration, Quota Exhaustion Offer Banners |
| **Route Protection & Security Middleware** | `proxy.ts`, `lib/security.ts` | ✅ Production-Ready | Multi-Path Protection, Session Extraction, Safe Open-Redirect Defense, Magic Byte File Upload Validation, HSTS & Security Headers |
| **AI Blog Writer** | `features/ai-blog/` | ✅ Implemented | TipTap Rich Text Editor, Real-time SEO Scoring, Unsplash Image Injection, Multi-Platform Serializers (WordPress, Webflow, Medium, Shopify, Notion), PDF & DOCX Export, Version History |
| **Social Media Scheduler** | `features/scheduler/`, `features/social/` | ✅ Implemented | BullMQ Queues, Cron Job Recurrence, Multi-Account Timezone Slots, Multi-Platform Publishing (Meta, LinkedIn, X, TikTok, YouTube) |
| **Post Composer** | `features/post-creation/` | ✅ Implemented | Multi-Platform Character Limit Checks, Platform Preview, AI Caption Synthesis, Hashtag Optimization, Media Attachments |
| **Business Knowledge Base (RAG)** | `features/knowledge/` | ✅ Implemented | PostgreSQL + `pgvector` Embeddings, Document Ingestion (PDF/TXT), Semantic Similarity Search, Context Injection into Prompts |
| **Ad Campaign Manager** | `features/ad-campaigns/` | ✅ Implemented | Meta & Google Ad Creative Generation, Variant Testing, Campaign Launch Queue, Performance Metrics Sync Worker |
| **Video Generation** | `features/video_generation/` | ✅ Implemented | HeyGen & Replicate Integration, Script-to-Video Generation, Async Status Polling Worker, Video Analytics Dashboard |
| **Image Generation** | `features/image_generation/` | ✅ Implemented | Flux & Stable Diffusion API Workers, S3 Asset Storage, Image Storage Database Tracking, Prompt Upscaling |
| **Review Booster** | `features/crm/`, `mastra/agents/review-booster-agent.ts` | ✅ Implemented | Review Request Automation (SMS/Email), Sentiment Analysis, Customer Feedback Pipeline, Multi-Channel Review Aggregation |
| **CRM & Lead Management** | `features/crm/` | ✅ Implemented | Lead Capture, Demo Bookings, Pipeline Stages, Contact Interaction History, Lead Scoring |
| **Multi-Location Management** | `features/multi-location/` | ✅ Implemented | Multi-Branch Franchise Management, Location-Specific Tone and Schedules, Centralized vs Local Content Overrides |
| **Social & Business Analytics** | `features/analytics/` | ✅ Implemented | Cross-Platform Aggregation, Recharts Visualizations, Trend Detection, AI Growth Recommendations |
| **Compliance & Safety** | `features/compliance/` | ✅ Implemented | Forbidden Keyword Detection, Brand Safety Audits, Automated Draft Rejection/Flagging |
| **Workflow Automation** | `features/workflow/`, `mastra/workflows/` | ✅ Implemented | Multi-Step Trigger-Action Pipelines, Weather-Driven Posting, Competitor Tracking, Scheduled Workflows |
| **Mastra Multi-Agent Engine** | `mastra/` | ✅ Implemented | 13 Specialized Autonomous Agents, LibSQL + DuckDB Observability Store, Weather/YouTube/Competitor Tools |
| **Organization & Team RBAC** | `features/organization/` | ✅ Implemented | Multi-Tenancy (`businessId`), Team Member Roles (`OWNER`, `ADMIN`, `EDITOR`, `VIEWER`), Invitation Flow |
| **System Operations & Logs** | `features/system/` | ✅ Implemented | Activity Logs, BullMQ Job Logs, Error Tracking, System Metrics, Maintenance Mode Toggle |
| **AI Creative Studio** | `app/(user)/studio/`, `features/image_generation/`, `features/video_generation/` | ✅ Production-Ready | Multimodal Creative Workspace, Tabbed UI (Flux Pro Images, Runway/Luma AI Videos, Media Gallery), URL Query State Persistence (`?tab=...`), `AnimatePresence` Transitions |
| **Workspace & Multi-Tenancy Hub** | `components/common/WorkspaceSwitcher.tsx`, `components/user/layout/` | ✅ Production-Ready | Instant Tenant Switching, Query Invalidation, Fullscreen Sync Overlay, Dynamic User & Admin Layout Shell (`w-64`, `h-16`, `p-6 bg-muted/40`) |
| **Resource Quota Telemetry** | `components/billing/UsageLimitIndicator.tsx`, `app/(user)/dashboard/` | ✅ Production-Ready | Visual Progress Gauges (`ai_posts`, `ai_articles`, `brand_voice_profiles`), Dynamic Warning Thresholds (80% Amber, 100% Destructive), 1-Click Upgrade Links |
| **Marketing Landing Suite** | `app/(marketing)/` | ✅ Implemented | 10 Animated Sections (GSAP + Framer Motion + Lenis), Interactive Comparison, Pricing Calculator with 1-Click Checkout, FAQ Accordion |
| **Admin Operations Panel** | `app/(admin)/` | ✅ Implemented | System Resource Dashboard, AI Blog Template Manager, Global User Directory, Error Monitoring |

---

## Detailed Module Breakdown

### 1. Subscription, Plan Entitlements & Billing System (`features/billing/`)
- **Centralized Plan Hierarchy (`features/billing/config/plans.config.ts`)**:
  - `Free` ($0): 5 AI social posts/mo, 20 blog articles/mo, 3,000 max words/article, 1 Brand Voice profile, manual CMS export.
  - `Starter` ($29/mo or $24/mo annual): 50 AI social posts/mo, 100 blog articles/mo, 8,000 max words/article, 5 Brand Voices, automated post & article scheduling, topical cluster mapping, AI detection bypass.
  - `Pro` ($99/mo or $79/mo annual): Unlimited posts & articles, no word limits, unlimited Brand Voices, team seats, developer API access, priority support.
  - `Enterprise` ($299/mo): Full white-label reports, dedicated instances, SLA.
- **Entitlement Service (`EntitlementService`)**: Cached, high-throughput capability verification (`canAccess`, `getFeatureLimit`, `resolvePlanForBusiness`).
- **Usage Metering (`UsageService`)**: PostgreSQL atomic consumption (`consume`) and quota checking (`canConsume`). Prevents unauthorized resource consumption with `QuotaExceededError`.
- **Stripe Lifecycle Integration**:
  - `POST /api/billing/checkout`: Initiates Stripe Checkout sessions for upgrades and annual/monthly billing cycles.
  - `POST /api/billing/portal`: Generates customer billing portal sessions.
  - `POST /api/billing/webhooks`: Idempotent event processing (`checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`).
  - `GET /api/cron/billing-reconciliation`: Periodic reconciliation and monthly quota reset worker.
- **Auto-Activation on Registration**: Seeding of Organization, default workspace, active Free subscription, and initial usage limits on user signup.
- **Interactive Marketing Checkout (`components/home/PricingCard.tsx`)**: 1-click checkout for logged-in workspaces and registration pre-fill for new visitors.
- **Dashboard Quota Banners (`app/(user)/dashboard/page.tsx`)**: Prominent upgrade triggers when free quotas are exhausted.
- **Billing Settings Dashboard (`app/(user)/settings/billing/page.tsx`)**: Real-time quota breakdown, subscription status, invoice PDF download links, and plan tier switcher.

---

### 2. Route Protection & Security Architecture (`proxy.ts`, `lib/security.ts`)
- **Middleware Proxy (`proxy.ts`)**: Base path prefix route protection for user dashboards, APIs, content libraries, schedules, settings, and workflows with automatic redirect to `/login?redirect=...`.
- **Direct Header Session Verification**: `auth.api.getSession({ headers: request.headers })` ensuring session tokens are accurately parsed on every request.
- **Public Route & Webhook Whitelisting**: Clean bypass for auth endpoints, Stripe webhooks, Prometheus metrics, and public marketing pages.
- **Security Defenses (`lib/security.ts`)**: Magic byte binary header validation for media uploads, HTML sanitization, HSTS, and XSS filtering.

---

### 3. AI Blog Writer (`features/ai-blog/`)
- **Interactive Rich Text Editor**: Powered by TipTap (`@tiptap/react`) with live formatting, undo/redo, heading hierarchy enforcement, and blockquotes.
- **Real-Time Preview Synchronization**: Immediate bidirectional reflection between editor updates and preview renderers.
- **Context-Aware Visuals**: `BlogImageService` analyzes headings and category keywords to automatically inject contextual Unsplash images.
- **Real-Time SEO Auditor**: Scans keyword density, readability, title/meta tag lengths, and heading structures in real time.
- **Platform-Specific Export Serializers**:
  - **WordPress**: Generates standard Gutenberg block comments (`<!-- wp:paragraph -->`).
  - **Medium**: Semantic, clean HTML.
  - **Webflow & Shopify**: Clean styled HTML for direct CMS pasting.
  - **Notion**: Formatted block-compatible HTML.
- **Multi-Format Downloads**: PDF (via `jsPDF` + `html2canvas`), Word `.docx` (HTML Blob), Markdown, and Rich HTML clipboard.

---

### 4. Social Media Scheduler & Publisher (`features/scheduler/`, `features/social/`)
- **Queue Architecture**: Powered by BullMQ on Redis (`social-posting-queue`).
- **Recurrence Engine**: Supports daily, weekly, and custom cron-based posting schedules with automated time slot optimization.
- **Platform Adapters**: Meta (Facebook & Instagram), LinkedIn, X (Twitter API v2), TikTok for Business, YouTube Community & Shorts.
- **Failover & Retries**: Automated retry logic with exponential backoff for network or rate-limit issues.

---

### 5. Business Knowledge Base & RAG Pipeline (`features/knowledge/`)
- **Vector Storage**: Integrated PostgreSQL `pgvector` (`vector` extension).
- **Document Ingestion**: Supports PDF and plain-text file uploads.
- **Chunking & Embeddings**: Automated document parsing, semantic chunking, and embedding generation via OpenAI `text-embedding-3-small`.
- **RAG Querying**: Cosine distance similarity search (`<=>`) dynamically injects brand knowledge, mission statements, and tone preferences into generation prompts.

---

### 6. Ad Campaign Engine (`features/ad-campaigns/`)
- **Ad Creative Synthesis**: Generates high-converting headlines, primary texts, descriptions, and CTAs tailored to Meta and Google Ads specifications.
- **A/B Variant Testing**: Generates and tracks multiple ad copy and visual variations simultaneously.
- **Launch Queue & Performance Sync**: Asynchronous campaign deployment and scheduled metrics synchronization from ad accounts.

---

### 7. Video & Image Generation Pipelines (`features/video_generation/`, `features/image_generation/`)
- **Video Generation**: Script-to-video processing via HeyGen and Replicate integrations with background status polling workers.
- **Image Generation**: Generates high-resolution social imagery via Flux and Stable Diffusion models, automatically persisted to AWS S3 / Cloudflare R2 with database tracking.

---

### 8. Mastra Multi-Agent Engine (`mastra/`)
- **13 Autonomous Agents**:
  - `weatherAgent`: Triggers localized posts based on weather forecasts.
  - `youtubeAgent`: Ingests YouTube URLs, extracts transcripts, and drafts derivative social posts.
  - `competitorAgent`: Analyzes competitor strategies and identifies content gaps.
  - `trendEventAgent`: Detects viral topics and holiday hooks.
  - `reviewBoosterAgent`: Orchestrates feedback gathering and positive review generation.
  - `multiLocationAgent`: Coordinates franchise locations and localizes messaging.
  - `blogWriterAgent`: Orchestrates deep-dive long-form article synthesis.
  - `socialMediaAgent`, `adCopyAgent`, `analyticsAgent`, `complianceAgent`, `audioVideoAgent`, `schedulingAgent`.

---

### 9. Modernized UI Suite & Theme Transition Engine (`components/`, `app/(user)/`)
- **Animated Theme Switcher (`components/common/ThemeToggleAnimated.tsx`)**: View Transitions API radial circle-blur expanding toggle synchronized with `next-themes` and `localStorage`.
- **Central Global Modals (`components/common/GlobalModals.tsx`)**: Unified dialog orchestrator mounted in `app/(user)/layout.tsx` managing content creation, workflow builder, member invitations, and content scheduling.
- **Contents Library (`app/(user)/contents/`)**: Multi-platform asset management with floating batch selection toolbar and instant media inspector.
- **Post Management (`app/(user)/posts/`)**: Tabbed status filtering (`All`, `Draft`, `Scheduled`, `Published`, `Trash`) with real-time sync telemetry.
- **Workflow Engine (`app/(user)/workflows/`)**: Node step pipeline badges, execution status toggles, and drag-and-drop media ingestion dropzone.
- **Omni Schedule (`app/(user)/schedule/`)**: Interactive calendar with AI peak times drawer and hourly intensity heatmap.
- **Posting Schedule (`app/(user)/post-schedule/`)**: Queue timeline cards with BullMQ and Cron engine status pills.
- **Multi-Location Hub (`app/(user)/multi-location/`)**: AI Regional Strategist dialog, GPS branch geocoding, and 1-click regional copy adaptation.
- **Social Engagement Unified Inbox (`app/(user)/engagement/`)**: 2-pane direct message stream with unified channel filter buttons (Instagram, Facebook, LinkedIn, X, YouTube) and instant reply dispatcher.
- **Review & Reputation Manager (`app/(user)/reviews/`)**: Autopilot requests switch, 4 stat cards with monospace telemetry, sentiment indicators, and AI auto-response generation.
