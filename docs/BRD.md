# Business Requirement Document (BRD)
## SocialAI: Business Strategy, Commercial Architecture & Financial Model

**Document Version:** 2.4.0  
**Status:** Approved for Commercial Operations  
**Domain:** Enterprise SaaS / AI Marketing Automation

---

## 1. Business Context & Market Opportunity

### 1.1 Market Overview
The global social media management and AI marketing software market is projected to grow from **$22.8 Billion in 2024 to $78.4 Billion by 2030 (CAGR 22.9%)**. However, existing platforms (e.g., Hootsuite, Sprout Social, Buffer) operate primarily as passive scheduling schedulers. They lack native autonomous multi-agent creation, RAG-guided brand voice continuity, multimodal video/voice generation, and multi-location franchise synchronization.

### 1.2 Market Sizing
- **Total Addressable Market (TAM):** $78.4B — Global digital marketing, social automation, and enterprise content generation software.
- **Serviceable Addressable Market (SAM):** $18.2B — Mid-market B2B companies, digital marketing agencies, and franchise operations across North America and Europe.
- **Serviceable Obtainable Market (SOM):** $1.4B — High-velocity growth companies and agencies seeking autonomous AI-first publishing pipelines.

```
┌────────────────────────────────────────────────────────────────────────┐
│  TAM ($78.4B) - Global Digital Marketing & Content Software            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  SAM ($18.2B) - Mid-Market B2B, Agencies & Franchise Operations  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │  SOM ($1.4B) - AI-First Multi-Agent Autonomous Publishing   │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Strategic Business Goals & Objectives

| Objective | 12-Month Target | 24-Month Target | Strategic Value |
| :--- | :--- | :--- | :--- |
| **Annual Recurring Revenue (ARR)** | $3.5 Million | $12.0 Million | Establish market leadership in autonomous agency workflows. |
| **Active Workspaces** | 5,000 Workspaces | 22,000 Workspaces | Expand network effects and multi-brand client lock-in. |
| **Net Revenue Retention (NRR)** | $> 118\%$ | $> 125\%$ | Driven by quota expansion, seat upgrades, and video/voice add-ons. |
| **Customer Acquisition Cost (CAC) Payback** | $< 4.5$ Months | $< 3.8$ Months | Organic growth via product-led viral social watermarks and SEO blogs. |
| **Gross Margin** | $> 78\%$ | $> 84\%$ | Optimized LLM caching, prompt compression, and self-hosted vector indexing. |

---

## 3. Commercial Model & Subscription Tier Architecture

SocialAI employs a **Hybrid Product-Led Growth (PLG) + Enterprise Sales** monetization model combining tiered subscriptions with automated usage metering.

### 3.1 Subscription Plan Matrix
| Feature & Quota Entitlements | Free Starter | Starter Tier ($49/mo) | Pro Growth ($149/mo) | Enterprise ($499+/mo) |
| :--- | :--- | :--- | :--- | :--- |
| **Target Segment** | Solopreneurs / Trial | Early-stage Startups | Growing Agencies / SMBs | Multi-Brand Enterprises |
| **Monthly AI Posts** | 5 Posts | 100 Posts | Unlimited | Unlimited |
| **AI Blog / SEO Articles** | 1 Article | 10 Articles | 50 Articles | Unlimited Custom |
| **Brand Voice DNA Profiles** | 1 Profile | 3 Profiles | 10 Profiles | Unlimited (pgvector) |
| **Generative Video Storyboards** | — | 3 Videos/mo (720p) | 20 Videos/mo (HD 1080p) | 100+ Videos/mo (4K) |
| **ElevenLabs Voiceover Minutes** | — | 15 Minutes/mo | 60 Minutes/mo | 300+ Minutes/mo |
| **Autonomous Workflows** | 1 Basic Pipeline | 3 Active Pipelines | 10 Active Pipelines | Unlimited Swarm Workflows |
| **Team Seats Included** | 1 Seat | 3 Seats | 10 Seats | Unlimited RBAC Seats |
| **Multi-Location Sync** | — | — | Up to 5 Locations | Unlimited Franchise Nodes |
| **API & Webhook Access** | — | — | ✅ Full Access | ✅ Dedicated SLA & Custom Endpoints |
| **Mobile App Companion** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ MDM / SSO Integration |

### 3.2 Add-On Monetization & Overages
- **Additional Video Generation Packs:** $29 for 10 Runway Gen-3 scenes.
- **Additional Voiceover Packs:** $19 for 60 ElevenLabs neural minutes.
- **Additional Brand Voice Vector Store:** $10/month per 10,000 embedded document chunks.
- **Dedicated Private LLM Fine-Tuning:** $1,500 one-time setup + $250/mo maintenance.

---

## 4. Stakeholder Analysis & Requirements

```
                       ┌─────────────────────────────────────────────────────────┐
                       │                   Key Stakeholders                      │
                       └────────────┬──────────────────────────────┬─────────────┘
                                    │                              │
         ┌──────────────────────────┴────────┐            ┌────────┴──────────────────────────┐
         ▼                                   ▼            ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐ ┌──────────────────┐        ┌──────────────────┐
│ Agency Directors │               │ Marketing Execs  │ │ Franchise Owners │        │ Compliance & DPO │
├──────────────────┤               ├──────────────────┤ ├──────────────────┤        ├──────────────────┤
│ Multi-tenant     │               │ Verified ROAS &  │ │ Localized promo  │        │ GDPR/CCPA data   │
│ client workspace │               │ Growth Score     │ │ hours & phone    │        │ deletion audit   │
│ management with  │               │ dashboards with  │ │ token injection  │        │ logs, zero data  │
│ 1-tap mobile     │               │ CRM lead sync to │ │ without rogue    │        │ leaks, strict    │
│ client approval. │               │ Salesforce.      │ │ brand drift.     │        │ tenant isolation.│
└──────────────────┘               └──────────────────┘ └──────────────────┘        └──────────────────┘
```

---

## 5. Unit Economics & Cost Structure (COGS Analysis)

To preserve gross margins $> 78\%$, the cost of goods sold per active Pro tier subscriber ($149/mo) is engineered as follows:

| Cost Component | Monthly Consumption (Avg Pro User) | Unit Rate | Total Monthly Cost |
| :--- | :--- | :--- | :--- |
| **LLM Text Generation (GPT-4o)** | 450,000 Tokens (In/Out) | $5.00 / 1M Tokens blended | $2.25 |
| **pgvector Embeddings (`text-embedding-3-small`)** | 20,000 Tokens | $0.02 / 1M Tokens | $0.01 |
| **Runway Gen-3/4.5 Video Scenes** | 12 Scenes | $0.60 / 5s scene | $7.20 |
| **ElevenLabs Voiceover TTS** | 35 Minutes (approx. 5,000 words) | $0.15 / 1k characters | $3.75 |
| **Database & Compute (PostgreSQL, Redis, Next.js)** | Multi-Tenant Shared Slice | Fixed allocation | $2.40 |
| **Cloud Object Storage & CDN (S3 / R2)** | 15 GB assets + bandwidth | $0.015 / GB | $0.23 |
| **Total Monthly COGS per Pro User** | — | — | **$15.84** |
| **Gross Profit Margin per Pro User** | — | — | **$133.16 (89.4%)** |

---

## 6. Business Risk Management & Compliance

### 6.1 Platform API Term Dependency
- **Risk:** Social network APIs (Meta, X, LinkedIn, TikTok) may alter rate limits, deprecate endpoints, or adjust permissions.
- **Mitigation:** Abstract all social interactions behind the modular `SocialMediaService`. Implement automated 7-day token expiration alerts and graceful API error handling.

### 6.2 Data Privacy & Regulatory Compliance (GDPR, CCPA)
- **Requirements:**
  - Automated user metadata deletion (`ComplianceService.handleMetaDataDeletion`).
  - Single-click full data export formatted in JSON (`ComplianceService.exportUserData`).
  - Absolute row-level data scoping (`businessId`) to eliminate cross-tenant data exposure.

### 6.3 Brand Safety & Hallucination Liability
- **Mitigation:** Every AI-generated draft passes through the deterministic `BrandGuardianAgent` and `brandGuardianTool` to check character counts, Flesch-Kincaid readability, and forbidden terms before entering `PENDING_REVIEW` state. No automated post is published without user approval unless explicitly enabled in autonomous workflow settings.
