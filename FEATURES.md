# Features & Capabilities Matrix

This document provides a comprehensive overview of all features and modules implemented across the **AI Social Media & Content Automation Platform**, their current implementation status, underlying architecture, integration points, and enterprise capabilities.

---

## Feature Matrix Summary

| Domain Module | Primary Location | Status | Key Technologies & Capabilities |
| :--- | :--- | :--- | :--- |
| **Two-Factor Auth (2FA) & Security** | `app/api/auth/register/`, `components/auth/register-form.tsx` | ✅ Production-Ready | 6-digit cryptographic numeric OTP, 2-minute expiry, 60s resend cooldown, immediate Nodemailer delivery + BullMQ queue fallback, real-time password strength meter, 6 segmented auto-advancing OTP inputs with paste support |
| **Subscription & Billing Engine** | `features/billing/`, `app/api/billing/`, `app/(admin)/admin/(dashboard)/billing/` | ✅ Production-Ready | Stripe Checkout & Customer Portal, Centralized Plan Entitlements (`free`, `starter`, `pro`, `enterprise`), Transactional Metering, Idempotent Webhooks, Admin Billing Command Center, Manual Plan Overrides with Audit Logging, Dynamic Client & Server Feature Gating |
| **AI Visual Carousel Studio** | `app/(user)/carousels/`, `features/carousel_builder/` | ✅ Production-Ready | Multi-Slide LinkedIn PDF Carousels and Instagram Swipe Post generation (`TITLE`, `CONTENT`, `STATISTIC`, `QUOTE`, `STEPS`, `CTA`), 6 color themes, slide editor, saved decks library, JSON export, and hard-refresh draft recovery |
| **Voice Cloning & Narration Studio** | `app/(user)/voice/`, `features/voice_studio/` | ✅ Production-Ready | Studio-grade narration playback speaking the exact user script, Web Speech API synthesis + OpenAI TTS binary streaming, pitch/timbre mapping for 10 personas (`nova`, `shimmer`, `alloy`, `echo`, `onyx`, `fable`, etc.), reactive waveform animations, and persistent storage |
| **Brand Voice Guardian** | `app/(user)/guardian/`, `features/brand_guardian/` | ✅ Production-Ready | Real-time copy linter, Flesch-Kincaid reading ease analysis, brand persona tone compliance, forbidden jargon detection from PostgreSQL profiles, character limits, and 1-click AI copy polishing |
| **Autonomous DM Sales Bot** | `app/(user)/dm-automation/`, `features/dm_automation/` | ✅ Production-Ready | Inbound DM automation across Instagram, Facebook, LinkedIn, X; custom keyword rules stored in PostgreSQL, contextual AI replies, and automated lead capture into `prisma.lead` database |
| **AI Multi-Model Arena** | `app/(user)/arena/`, `features/ai_arena/` | ✅ Production-Ready | Side-by-side parallel model execution (Claude 3.5 Sonnet, GPT-4o, DeepSeek-R1, Gemini 2.0 Flash), token calculation, cost estimation in USD, lexical entropy quality scoring, and hard-refresh state recovery |
| **Social Listening & Radar** | `app/(user)/listening/`, `features/social_listening/` | ✅ Production-Ready | Real-time omnichannel brand monitoring across X, Reddit, LinkedIn; dynamic sentiment breakdown, competitor share-of-voice benchmarks, market trending keywords, and AI executive briefings |
| **Enterprise Webhook Gateway** | `app/(user)/settings/webhooks/`, `features/webhooks/` | ✅ Production-Ready | Outbound event dispatcher, HMAC SHA-256 signatures, replay protection, endpoint management, test ping simulation with live delivery logs |
| **Dedicated Settings Sub-Pages** | `app/(user)/settings/*` | ✅ Production-Ready | Dedicated URLs for `/settings/profile`, `/settings/organization`, `/settings/api-keys`, `/settings/webhooks`, `/settings/notifications`, `/settings/credentials`, `/settings/schedule`, `/settings/crm` with unified sub-tab navigation and clean main sidebar |
| **Route Protection & Security Middleware** | `proxy.ts`, `lib/security.ts` | ✅ Production-Ready | Multi-Path Protection, Session Extraction, Safe Open-Redirect Defense, Magic Byte File Upload Validation, HSTS & Security Headers |
| **AI Blog Writer** | `features/ai-blog/` | ✅ Production-Ready | TipTap Rich Text Editor, Real-time SEO Scoring, Unsplash Image Injection, Multi-Platform Serializers (WordPress, Webflow, Medium, Shopify, Notion), PDF & DOCX Export, Version History |
| **Social Media Scheduler** | `features/scheduler/`, `features/social/` | ✅ Production-Ready | BullMQ Queues, Cron Job Recurrence, Multi-Account Timezone Slots, Multi-Platform Publishing (Meta, LinkedIn, X, TikTok, YouTube) |
| **Post Composer** | `features/post-creation/` | ✅ Production-Ready | Multi-Platform Character Limit Checks, Platform Preview, AI Caption Synthesis, Hashtag Optimization, Media Attachments, Safe Date Scheduling Popover |
| **Business Knowledge Base (RAG)** | `features/knowledge/` | ✅ Production-Ready | PostgreSQL + `pgvector` Embeddings, Document Ingestion (PDF/TXT), Semantic Similarity Search, Context Injection into Prompts |
| **Ad Campaign Manager** | `features/ad-campaigns/` | ✅ Production-Ready | Meta & Google Ad Creative Generation, Variant Testing, Campaign Launch Queue, Performance Metrics Sync Worker |
| **Video Generation** | `features/video_generation/` | ✅ Production-Ready | HeyGen & Replicate Integration, Script-to-Video Generation, Async Status Polling Worker, Video Analytics Dashboard |
| **Image Generation** | `features/image_generation/` | ✅ Production-Ready | Flux & Stable Diffusion API Workers, S3 Asset Storage, Image Storage Database Tracking, Prompt Upscaling |
| **Review Booster** | `features/crm/`, `services/ai/agents/review-booster.agent.ts` | ✅ Production-Ready | Review Request Automation (SMS/Email), Sentiment Analysis, Customer Feedback Pipeline, Multi-Channel Review Aggregation |
| **CRM & Lead Management** | `features/crm/` | ✅ Production-Ready | Lead Capture, Demo Bookings, Pipeline Stages, Contact Interaction History, Lead Scoring |
| **Multi-Location Management** | `features/multi-location/` | ✅ Production-Ready | Multi-Branch Franchise Management, Location-Specific Tone and Schedules, Centralized vs Local Content Overrides, Resilient Location String/JSON Parsing |
| **Social & Business Analytics** | `features/analytics/` | ✅ Production-Ready | Cross-Platform Aggregation, Recharts Visualizations, Trend Detection, AI Growth Recommendations (Gated Growth Engine) |
| **Compliance & Safety** | `features/compliance/` | ✅ Production-Ready | Forbidden Keyword Detection, Brand Safety Audits, Automated Draft Rejection/Flagging, GDPR Data Export & Atomic Cascade Deletion |
| **Workflow Automation & AI Orchestrator** | `features/workflow/`, `services/ai/workflows/` | ✅ Production-Ready | Multi-Step Pipelines: `blogGenerationWorkflow`, `postPublishingWorkflow`, `weatherWorkflow`, `socialListeningWorkflow`, `carouselPublishingWorkflow`, `voiceNarrationWorkflow` |
| **Custom AI Multi-Agent Engine** | `services/ai/` | ✅ Production-Ready | 16 Specialized Autonomous Agents, 19 Zod-Validated Tools, 6 Multi-Step Async Workflows, Dynamic Model Switching (OpenRouter in dev / OpenAI in prod) |
| **Mobile App Companion** | `mobile-app/` | ✅ Production-Ready | Expo SDK 57, React Native 0.86, Expo Router, TanStack Query, Zustand, FlashList, Light/Dark Theming, Offline Mock Fallback, Real-Time API Sync |
| **Organization & Team RBAC** | `features/organization/` | ✅ Production-Ready | Multi-Tenancy (`businessId`), Team Member Roles (`OWNER`, `ADMIN`, `EDITOR`, `VIEWER`), Invitation Flow, Pro Tier Gating |
| **System Operations & Observability** | `features/system/`, `app/api/metrics/`, `app/api/system/alerts/` | ✅ Production-Ready | Activity Logs, BullMQ Job Logs, Error Tracking, Prometheus `/api/metrics` Exporter, Alertmanager Webhook Dispatcher, Health & Readiness Probes (`/api/health`, `/api/health/ready`) |
| **Admin Operations Panel** | `app/(admin)/` | ✅ Production-Ready | Dedicated Billing Command Center (`/admin/billing`), User Directory with Plan Overrides & Atomic Cascading Deletion, System Resource Dashboard, Error Logs, Stripe Webhook Monitor |

---

## Detailed Module Breakdown

### 1. Two-Factor Authentication (2FA) & Security (`app/api/auth/register/`, `components/auth/register-form.tsx`)
- **6-Digit Cryptographic OTP Engine**:
  - `POST /api/auth/register/send-otp`: Generates a cryptographically secure 6-digit numeric OTP (`crypto.randomInt`), persists in `prisma.verification` with a 2-minute expiry (`register-otp:<email>`), and validates password strength.
  - `POST /api/auth/register/verify-otp`: Validates user input against active verification records, cleans up OTP records on match, initializes tenant workspace via Better Auth `signUpEmail`, and marks `emailVerified: true`.
  - `POST /api/auth/register/resend-otp`: Rate-limited 60-second cooldown per email address with fresh OTP generation.
- **Immediate Nodemailer Delivery & BullMQ Queue Fallback**:
  - Direct immediate SMTP dispatch via `sendEmailImmediate` with automatic queue fallback to `emailQueue` if external SMTP is busy.
  - Dark-mode HTML email template featuring styled 6-digit OTP code container, security tips, and expiry warning.
- **Interactive Multi-Step Frontend**:
  - Step 1: Real-time password strength meter (progress bar + criteria badges for length, numbers, symbols, uppercase), toggle password visibility, Google OAuth.
  - Step 2: 6 segmented auto-advancing input boxes, full clipboard paste support (auto-populates and triggers instant verification), live 2-minute countdown timer (`MM:SS`), 60s cooldown resend button, error shake animation, and seamless auto-login on verification.

---

### 2. Subscription, Plan Entitlements & Billing System (`features/billing/`)
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
- **Admin Operations & Manual Subscription Override**:
  - **Command Center (`/admin/billing`)**: Executive MRR/ARR KPI metrics, full subscription directory with search & plan/status filters, granular usage meter inspectors, Stripe webhook log viewer, and manual plan override modal with audit note logging.
  - **User Plan Override (`/admin/users/edit/[id]`)**: Real-time plan switcher (`FREE`, `STARTER`, `PRO`, `ENTERPRISE`) and status control (`ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELED`) with period extension, usage limit reset, and audit trail record creation.

---

### 3. AI Visual Carousel Studio (`features/carousel_builder/`, `app/(user)/carousels/`)
- **AI Slide Generation**: Uses `carouselTool` and `AIService` to generate 5–10 structured slides with varied visual layouts (`TITLE`, `CONTENT`, `STATISTIC`, `QUOTE`, `STEPS`, `CTA`).
- **Visual Design Themes**: 6 modern themes (`MODERN_DARK`, `GRADIENT_PURPLE`, `MINIMAL_LIGHT`, `SUNSET_ORANGE`, `CYBERPUNK_NEON`, `FOREST_EMERALD`) with live aspect ratio switching (1:1 Square, 4:5 Portrait).
- **Hard-Refresh Draft Recovery & Deck Storage**: Instant `localStorage` write-through with saved deck libraries and JSON export.

---

### 4. AI Voice Cloning & Narration Studio (`features/voice_studio/`, `app/(user)/voice/`)
- **Exact Script Playback**: Speaks the exact script narrative via Web Speech API (`SpeechSynthesisUtterance`) or OpenAI TTS HD streaming.
- **Vocal Timbre Personas**: 10 voice profiles (`Nova`, `Shimmer`, `Alloy`, `Echo`, `Onyx`, `Fable`, etc.) with customizable speaking speeds ($0.75\times$–$1.5\times$).
- **Waveform Reactive Visualizer**: Real-time audio waveform animations that pulse synchronously with the voiceover and stop cleanly on pause.

---

### 5. Brand Voice Guardian (`features/brand_guardian/`, `app/(user)/guardian/`)
- **Multi-Tenant Linter**: Audits copy against forbidden words configured in PostgreSQL brand profiles.
- **Readability & Character Limit Guards**: Computes Flesch-Kincaid reading ease and checks social network length constraints (e.g. 280 chars on X).
- **1-Click AI Copy Polisher**: Cleans up formatting and aligns copy with corporate tone guidelines.

---

### 6. Autonomous DM Bot (`features/dm_automation/`, `app/(user)/dm-automation/`)
- **Custom Rule Engine**: Persisted in PostgreSQL `business.preferences.dmRules`.
- **Contextual Inbound DM Simulation**: Intelligent intent classification (`PRICING`, `MEETING_REQUEST`, `SUPPORT_QUESTION`, `LEAD_INQUIRY`).
- **Automatic Lead Capture**: Automatically logs qualified leads into `prisma.lead` database.

---

### 7. AI Multi-Model Arena (`features/ai_arena/`, `app/(user)/arena/`)
- **Parallel Inference Engine**: Simultaneously benchmarks Claude 3.5 Sonnet, GPT-4o, DeepSeek-R1, and Gemini 2.0 Flash.
- **Telemetry & Scoring**: Live latency (ms), token volume calculation, estimated cost in USD, and algorithmic lexical quality scoring.

---

### 8. Social Listening & Threat Radar (`features/social_listening/`, `app/(user)/listening/`)
- **Omnichannel Radar**: Dynamic brand mention monitoring, sentiment breakdown, and competitor share-of-voice tracking.
- **AI Executive Briefings**: Autonomous strategic directives and tactical growth recommendations.

---

### 9. Dedicated Settings Sub-Pages (`app/(user)/settings/*`)
- **Clean Sub-Routing**: `/settings/profile`, `/settings/organization`, `/settings/api-keys`, `/settings/webhooks`, `/settings/notifications`, `/settings/credentials`, `/settings/schedule`, `/settings/crm`.
- **Unified Sub-Navigation**: Horizontal tab bar linking all setting panels while keeping the left sidebar uncluttered.
