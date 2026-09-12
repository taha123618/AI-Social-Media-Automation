# Technical Requirement Document (TRD)
## SocialAI: Enterprise Multi-Agent Architecture & Engineering Specification

**Document Version:** 2.4.0  
**Status:** Approved & Implemented  
**Core Technologies:** Next.js 16 (App Router), React 19, TypeScript 5.8, Node.js `>=22.18.0` / Bun `>=1.0.0`, PostgreSQL 16/18 + pgvector, Prisma 7, Redis 7 + BullMQ, Expo SDK 57 / React Native 0.86.

---

## 1. High-Level Architecture Overview

SocialAI is architected as an event-driven, multi-tenant enterprise system combining a high-performance Next.js 16 App Router frontend/backend with a dedicated pure TypeScript autonomous multi-agent AI engine and a cross-platform Expo React Native mobile client.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CLIENT APPLICATIONS                                       │
│   ┌──────────────────────────────────────────────┐   ┌──────────────────────────────────────┐   │
│   │    Next.js 16 Web SaaS (Desktop/Tablet)      │   │   Mobile App (Expo SDK 57 / RN 0.86) │   │
│   │   • 29 User Modules     • Admin Console      │   │   • FlashList Feeds   • Biometrics   │   │
│   │   • Radix Primitives    • Framer Motion      │   │   • Zustand Stores    • Haptics      │   │
│   └──────────────────────┬───────────────────────┘   └──────────────────┬───────────────────┘   │
└──────────────────────────┼──────────────────────────────────────────────┼───────────────────────┘
                           │ HTTPS / WSS                                  │ HTTPS (Axios / TanStack Query)
                           ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EDGE GATEWAY & SECURITY PROXY                                    │
│   • Nginx Reverse Proxy (TLS Termination, Rate Limiting, HTTP Security Headers: HSTS, CSP)     │
│   • Edge Proxy Guard (`proxy.ts`): Better Auth Verification, SSRF Safe-URL Validation           │
└──────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               NEXT.JS 16 APPLICATION SERVER & APIs                              │
│   • Route Handlers (`app/api/*`)           • Server Actions (`app/(user)/actions/*`)            │
│   • Better Auth Authentication Engine      • Entitlement & Metering Service                     │
│   • Multi-Tenant Request Context Scoper    • Webhook Dispatcher & HMAC SHA-256 Signer           │
└──────────────────────┬───────────────────────────────────────────────┬──────────────────────────┘
                       │                                               │
                       ▼                                               ▼
┌──────────────────────────────────────────────┐   ┌──────────────────────────────────────────────┐
│       CUSTOM AI MULTI-AGENT SWARM ENGINE     │   │      BACKGROUND ASYNC WORKER CLUSTER         │
│   • Central Orchestrator (`services/ai/`)    │   │   • BullMQ Queues (Publishing, Workflows)    │
│   • 16 Autonomous Domain Agents              │   │   • Redis 7 In-Memory State & Rate Limits    │
│   • 19 Zod-Schema Validated Deterministic    │   │   • Cron Job Recurrence Engine               │
│     Tools (`services/ai/tools/`)             │   │   • Social Token Auto-Refresh Daemon         │
│   • 6 Async Workflow State Machines          │   │                                              │
│   • Dynamic LLM Provider (`AIService`)       │   │                                              │
│     (OpenRouter Dev ◄► OpenAI Prod)          │   │                                              │
│   • Semantic RAG & pgvector Embeddings       │   │                                              │
└──────────────────────┬───────────────────────┘   └──────────────────┬───────────────────────────┘
                       │                                               │
                       ▼                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA & STORAGE SUBSYSTEM                                     │
│   • PostgreSQL 16/18 with pgvector extension (1536-dim HNSW Cosine Indexing)                    │
│   • Prisma 7 Client ORM with Modular Domain Schemas (`prisma/models/*.prisma`)                   │
│   • AWS S3 / Cloudflare R2 Cloud Object Storage (Pre-signed Uploads, Magic Byte File Guards)    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. AI Multi-Agent Engine (`services/ai/`)

The multi-agent system is written in strict TypeScript without heavy external agent runtime dependencies, ensuring deterministic execution, minimal latency, and zero memory leaks.

### 2.1 Core Types (`services/ai/types.ts`)
```typescript
export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: z.ZodSchema<TInput>;
  execute: (input: TInput, context: AgentContext) => Promise<TOutput>;
}

export interface AgentDefinition {
  name: string;
  role: string;
  systemPrompt: string;
  tools: string[]; // Reference to registered tool names
  temperature?: number;
  maxTokens?: number;
}

export interface WorkflowStep {
  id: string;
  agent?: string;
  tool?: string;
  inputMapping: (state: Record<string, any>) => any;
  outputKey: string;
  condition?: (state: Record<string, any>) => boolean;
}
```

### 2.2 Dynamic LLM Provider (`AIService`)
The platform dynamically toggles model execution based on the environment:
- **Development / Staging:** Routes through **OpenRouter** (`openrouter.ai/api/v1`) to access cost-effective models (DeepSeek-R1, Claude 3.5 Sonnet, Gemini Flash, GPT-4o-mini).
- **Production:** Directly routes to **OpenAI API** (`api.openai.com/v1`) with failover redundancy.

```typescript
export class AIService {
  static async generateText(prompt: string, systemPrompt?: string, options?: ModelOptions): Promise<string> {
    const isDev = process.env.NODE_ENV !== 'production';
    const apiKey = isDev ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY;
    const baseURL = isDev ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1';
    const model = options?.model || (isDev ? 'openai/gpt-4o-mini' : 'gpt-4o');

    // Secure fetch execution with timeout abort controller (30s)
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(isDev && { 'HTTP-Referer': 'https://socialai.app', 'X-Title': 'SocialAI' })
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
}
```

### 2.3 16 Autonomous Domain Agents
| Agent | Source File | Responsibilities & Strategy |
| :--- | :--- | :--- |
| `analyticsAgent` | `analytics.agent.ts` | Calculates growth score, analyzes retention, and drafts ROI summaries. |
| `blogWriterAgent` | `blog.agent.ts` | Formulates SEO keyword structures, drafts Gutenberg HTML, and creates schema tags. |
| `brandGuardianAgent` | `brand-guardian.agent.ts` | Audits copy against Flesch-Kincaid grade, platform char limits, and forbidden words. |
| `carouselAgent` | `carousel.agent.ts` | Structures swipeable decks (Hook -> 3-5 Content Cards -> CTA Slide). |
| `competitorAgent` | `competitor.agent.ts` | Benchmarks competitor posting velocity and computes SWOT opportunities. |
| `dmAutomationAgent` | `dm-automation.agent.ts` | Classifies inbound messages by intent (`LEAD`, `SUPPORT`, `PRICING`) and drafts replies. |
| `engagementAgent` | `engagement.agent.ts` | Generates witty, high-value social comment replies to boost algorithm dwell time. |
| `multiLocationAgent` | `multi-location.agent.ts` | Rewrites global master posts with localized store metadata (hours, address, promos). |
| `postCreationAgent` | `post-creation.agent.ts` | Crafts tailored posts for X, LinkedIn, Instagram, TikTok, and Facebook with hashtag sets. |
| `reviewBoosterAgent` | `review-booster.agent.ts` | Parses positive customer feedback into quote-card graphics and social snippets. |
| `socialListeningAgent` | `social-listening.agent.ts` | Detects keyword sentiment shifts and alerts users to potential PR escalations. |
| `templateAgent` | `template.agent.ts` | Produces 90-day industry content calendars across 12 specific business verticals. |
| `trendEventAgent` | `trend-event.agent.ts` | Identifies calendar milestones, holidays, and trending audios to generate topical hooks. |
| `voiceAgent` | `voice.agent.ts` | Formulates spoken-word audio scripts tailored to ElevenLabs voice persona timbres. |
| `weatherAgent` | `weather.agent.ts` | Ingests real-time local meteorological data to trigger dynamic rainy/sunny weather promos. |
| `youtubeAgent` | `youtube.agent.ts` | Analyzes YouTube video transcripts and extracts 5 repurposed social media post snippets. |

### 2.4 19 Zod-Schema Validated Tools
All tools are defined in `services/ai/tools/` and require Zod input/output schemas:
1. `adBoosterTool`: Generates high-CTR Meta/Google ad copy with target ROAS estimation.
2. `analyticsTool`: Queries database analytics metrics across 7d, 30d, 90d intervals.
3. `blogTool`: Executes SEO scoring and checks heading hierarchy (`h1`, `h2`, `h3`).
4. `brandGuardianTool`: Scans text against forbidden terms and validates character constraints.
5. `carouselTool`: Generates JSON slide structures with styling tokens.
6. `competitorTool`: Aggregates competitor benchmarks and engagement differentials.
7. `crmIntegrationTool`: Dispatches qualified inbound leads to HubSpot, Salesforce, or webhook destinations.
8. `dmAutomationTool`: Matches incoming keywords against configured trigger rules.
9. `growthScoreTool`: Computes multi-factor account health score (0-100).
10. `industryTemplateTool`: Resolves domain-specific post templates (Healthcare, Real Estate, SaaS, Fitness, etc.).
11. `localEventTool`: Returns upcoming regional holidays and cultural events.
12. `multiLocationTool`: Replaces franchise template tokens (`{{store_name}}`, `{{phone}}`).
13. `postCreationTool`: Formulates platform-compliant copy with platform constraints.
14. `reviewBoosterTool`: Extracts 5-star sentiment and formats social proof highlights.
15. `socialEngagementTool`: Formulates conversational social replies.
16. `socialListeningTool`: Aggregates mention volume, reach, and sentiment polarity.
17. `voiceTool`: Formulates ElevenLabs voice synthesis payloads.
18. `weatherTool`: Queries OpenWeatherMap API for live temperature and condition codes.
19. `youtubeTool`: Fetches video transcripts and time-indexed highlight sections.

### 2.5 6 Asynchronous Multi-Step Workflows
1. **`blogWorkflow`**: Keyword Research $\rightarrow$ Article Outline $\rightarrow$ Section Drafting $\rightarrow$ SEO Linting $\rightarrow$ Featured Image Injection.
2. **`carouselPublishingWorkflow`**: Topic Formulation $\rightarrow$ Multi-Slide Layout $\rightarrow$ Theme Styling $\rightarrow$ PDF/Image Deck Rendering.
3. **`postPublishingWorkflow`**: Multi-Channel Copy Synthesis $\rightarrow$ Brand Guardian Lint $\rightarrow$ Visual Asset Attachment $\rightarrow$ Approval Queue Dispatch.
4. **`socialListeningWorkflow`**: Omnichannel Mention Scan $\rightarrow$ Sentiment Scoring $\rightarrow$ Escalation Flagging $\rightarrow$ AI Brief Creation.
5. **`voiceNarrationWorkflow`**: Spoken Script Synthesis $\rightarrow$ Vocal Pacing & Pronunciation Check $\rightarrow$ ElevenLabs Audio Generation $\rightarrow$ Waveform Asset Build.
6. **`weatherWorkflow`**: Live Meteorological Ingestion $\rightarrow$ Weather Promotion Rule Matching $\rightarrow$ Automated Post Queueing.

---

## 3. Database Schema & Vector Data Modeling

The database uses **PostgreSQL 16/18** with the **pgvector** extension. The Prisma 7 schema is split into domain-specific modules under `prisma/models/`:

```
prisma/
├── schema.prisma              # Datasource, pgvector extension, client generator
└── models/
    ├── Ad.prisma              # AdCampaign, AdCreative, AdMetrics
    ├── Auth.prisma            # User, Session, Account, Verification
    ├── Billing.prisma         # Subscription, Plan, UsageQuota, Invoice
    ├── Blog.prisma            # BlogPost, BlogSeoAudit, BlogCategory
    ├── Business.prisma        # Business, Membership, Invitation, Workspace
    ├── CRM.prisma             # Lead, CrmIntegration, CustomerContact
    ├── Knowledge.prisma       # KnowledgeProfile, DocumentChunk (pgvector)
    ├── Social.prisma          # ConnectedAccount, Post, PostSchedule, MediaAsset
    ├── System.prisma          # ActivityLog, ErrorLog, AuditTrail, SystemMetric
    ├── Video.prisma           # VideoProject, VideoScene, RenderJob
    └── Workflow.prisma        # WorkflowDefinition, WorkflowExecution, ContentDraft
```

### 3.1 pgvector RAG Schema & HNSW Indexing
```prisma
model DocumentChunk {
  id          String   @id @default(uuid())
  businessId  String
  profileId   String
  content     String   @db.Text
  embedding   Unsupported("vector(1536)")
  metadata    Json?
  createdAt   DateTime @default(now())

  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  @@index([businessId])
}
```
**HNSW Cosine Vector Search Query (`services/ai/embedding.service.ts`):**
```sql
SELECT id, content, metadata, 1 - (embedding <=> $1::vector) AS similarity
FROM "DocumentChunk"
WHERE "businessId" = $2
ORDER BY embedding <=> $1::vector
LIMIT $3;
```

---

## 4. Multi-Tenant Security & Threat Model

### 4.1 Strict Multi-Tenancy Invariant
Every database query in the entire application MUST explicitly scope tenant records by `businessId`. Cross-tenant data querying without explicit authorized business membership is strictly prevented at the API proxy layer and database query level:
```typescript
// Enforced Pattern
const posts = await prisma.post.findMany({
  where: {
    businessId: activeWorkspaceId, // REQUIRED
    status: 'PUBLISHED'
  }
});
```

### 4.2 SSRF Protection (`SecurityService.validateSafeUrl`)
Prior to executing any outbound `fetch()` request (webhooks, media ingestion, OAuth endpoints), the URL is validated against internal and private IP ranges:
```typescript
export class SecurityService {
  static validateSafeUrl(urlString: string): boolean {
    const parsed = new URL(urlString);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname;
    // Disallow loopback, private ranges, metadata IPs (169.254.169.254)
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }
    return true;
  }
}
```

### 4.3 Webhook HMAC SHA-256 Signatures
Outbound webhooks dispatched by `WebhookService` sign payloads using a shared secret prefixed with `whsec_`:
```typescript
const signature = crypto
  .createHmac('sha256', endpoint.secret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Delivered in Header: X-SocialAI-Signature: sha256=<signature>
```

---

## 5. Mobile Companion App Architecture (`mobile-app/`)

### 5.1 Architecture Stack
- **Framework:** Expo SDK 57 (`~57.0.21`), React Native 0.86.3, React 19.2.3.
- **Routing:** Expo Router with 3 route groups:
  - `src/app/(auth)/`: Login, Register with 6-digit OTP, Forgot Password, Reset Password, Invite, Onboarding.
  - `src/app/(tabs)/`: 5-Tab bar (Dashboard, Composer, Calendar, Inbox, Analytics).
  - `src/app/(user)/`: 29 standalone domain modules matching web SaaS.
- **State Management:** Zustand (`auth.store.ts`, `workspace.store.ts`, `sidebar.store.ts`).
- **Data Fetching:** TanStack React Query v5 wrapping the direct `src/lib/backend.ts` (`backendApi`) client.
- **Feed Virtualization:** `@shopify/flash-list` rendering 1000+ items at 120 FPS.
- **Continuous Native Generation (CNG):** Zero manual edits in native folders (`ios/`, `android/`). All plugins and permissions configured via `app.json`.

---

## 6. Observability, Deployment & DevOps

### 6.1 Telemetry Stack
- **Prometheus Metrics (`/api/system/metrics`):** Exposes HTTP request latency, queue depth, memory pressure, and active worker counts.
- **Grafana Dashboards (`monitoring/grafana/`):** Pre-provisioned visual panels for MRR telemetry, API status codes, and LLM token expenditures.
- **Alertmanager (`monitoring/alertmanager/`):** Configured with Slack and PagerDuty webhooks for critical service threshold violations ($> 2\%$ error rate or Redis memory $> 85\%$).

### 6.2 Container & Orchestration
- **Docker Multi-Stage Build:** Minimal Alpine-based Node.js runtime allocating up to 8GB heap memory (`NODE_OPTIONS="--max-old-space-size=8192"`).
- **Kubernetes Manifests (`k8s/`):** Deployments with horizontal pod autoscalers (HPA), Redis stateful sets, and ingress controllers.
