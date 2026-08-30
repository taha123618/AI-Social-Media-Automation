# Comprehensive Project Structure Analysis

## Executive Summary

This is an **AI-powered social media automation platform** built with Next.js 16, a custom multi-agent AI framework (`services/ai/*`), and PostgreSQL with pgvector. It provides businesses with automated content generation, social media posting, analytics, lead generation, and review management capabilities.

**Core Tech Stack:**
- Frontend: Next.js 16 App Router, React 19, Tailwind CSS
- Backend: Next.js API Routes, Server Actions
- Database: PostgreSQL (with pgvector)
- ORM: Prisma 7
- AI Framework: Custom TypeScript AI Engine (`services/ai/*`)
- Authentication: Better Auth (email/password + Google OAuth)
- Message Queue: Potential workers-based scheduling system

---

## 1. DATABASE SCHEMA (Prisma Models)

### Core User & Organization Models

#### User Model
- **Purpose:** Core user identity
- **Key Fields:**
  - `id`, `email` (unique), `name`, `image`
  - `emailVerified`, `resetToken`, `resetTokenExpiry`
  - Account linking (for OAuth providers)
  - Session management
- **Relations:** Owns organizations, memberships in businesses, creates content, workflows, video/image jobs

#### Account Model
- OAuth provider credentials (Google, etc.)
- Stores `refresh_token`, `access_token`, `token_type`, `scope`
- Fields: `type`, `providerId`, `accountId`, `password` (for email/password auth)

#### Session Model
- JWT-based session management
- Fields: `token`, `expiresAt`, `ipAddress`, `userAgent`
- Supports session tracking and device management

#### Business Model
- **Purpose:** Workspace container (each user can own/join multiple businesses)
- **Key Fields:**
  - `name`, `slug` (unique), `website`, `logo`
  - `businessType` (enum: RESTAURANT, SALON, REAL_ESTATE, etc.)
  - `googleBusinessProfileId`
  - `location`, `operatingHours` (JSON)
  - `services` (array)
  - `organizationId` (optional)
- **Relations:** Members, profiles, content, posts, reviews, leads, social accounts

#### BusinessMember Model
- **Purpose:** Team membership with roles
- **Fields:** `role` (OWNER, ADMIN, EDITOR, VIEWER), `joinedAt`
- **Key Relation:** Links User → Business with role-based access control

#### Organization Model
- **Purpose:** Enterprise-level grouping (multiple businesses per organization)
- **Key Fields:** `name`, `slug` (unique), `ownerId`
- **Relations:** Owns multiple businesses, has members, subscriptions

#### OrganizationMember Model
- Role-based access at organization level (MEMBER default)
- Tracks who invited the member

---

### Content & Publishing Models

#### ContentDraft Model
- **Purpose:** Pre-publication content staging
- **Key Fields:**
  - `title`, `content` (text), `contentJson` (structured data)
  - `intent` (enum: SALES, EDUCATION, EVENT, ENGAGEMENT, BRAND_AWARENESS)
  - `platforms` (array of Platform enum)
  - `status` (DRAFT, PENDING_REVIEW, APPROVED, REJECTED, SCHEDULED, POSTED, FAILED)
  - `assetStatus` (PENDING, GENERATING, COMPLETED, FAILED)
  - `customPrompt`, `visualPrompt`
  - `mediaUrl`, `videoScript`
  - `scheduledFor`, `postedAt`
  - `workflowId`, `executionId`
- **Relations:** Creator (User), Business, Workflow, Posts, Comments, ApprovalLogs, ManualOverrides

#### Post Model
- **Purpose:** Published social media post tracking
- **Key Fields:**
  - `externalPostId`, `publishedUrl`
  - `platform` (LINKEDIN, TWITTER, INSTAGRAM, FACEBOOK, TIKTOK, YOUTUBE, MASTODON, BLUESKY, PINTEREST, GOOGLE_BUSINESS)
  - `postedAt`, `scheduledFor`
  - **Analytics (flattened from old PostAnalytics):**
    - Engagement: `likes`, `comments`, `shares`, `saves`
    - Reach: `impressions`, `reach`, `profileVisits`
    - Video: `videoViews`, `videoCompletionRate`, `reelWatchTime`
    - Actions: `clicks`, `websiteClicks`, `bookingClicks`, `messageClicks`, `phoneClicks`, `directionRequests`
    - Stories: `storyTaps`, `storyExits`
  - `analyticsUpdatedAt`
  - `status` (ContentStatus enum)
  - `workflowId` (if posted via workflow)
- **Relations:** Creator, Business, Draft, SocialAccount, Workflow, SuccessfulPattern

#### ApprovalLog Model
- **Purpose:** Track content review/approval history
- **Fields:** `status`, `comment`, `reviewedAt`, `userId`, `draftId`

#### DraftComment Model
- **Purpose:** Collaborative content review comments
- **Fields:** `content`, `createdAt`, `resolved`, `parentId` (for nested comments)
- **Relations:** Author (User), Draft

---

### Social Media Integration Models

#### SocialAccount Model
- **Purpose:** Connected social media account for a business
- **Key Fields:**
  - `platform` (enum)
  - `platformId` (external ID from social platform)
  - `accessToken`, `refreshToken`, `tokenExpiresAt`
  - `name`, `avatar`, `profileUrl`
  - `isActive`
- **Relations:** Business
- **Unique Constraint:** `(businessId, platform, platformId)`

#### ThirdPartyService Model
- **Purpose:** API credentials for external services
- **Fields:** `platform`, `apiKey`, `apiSecret`, `apiTier` (free/paid), `isActive`
- **Relations:** Business

#### OAuthState Model
- **Purpose:** Temporary OAuth state during authentication
- **Fields:** `businessId`, `platform`, `tokenData` (JSON), `expiresAt`

---

### Business Profile & Knowledge

#### BusinessProfile Model
- **Purpose:** Business branding and tone configuration
- **Key Fields:**
  - `mission`, `vision`, `uvp` (unique value proposition), `usp` (unique selling proposition)
  - `targetAudience`, `industry`, `tone`, `brandTone` (enum: PROFESSIONAL, FRIENDLY, CREATIVE, TECHNICAL, LUXURY, CASUAL)
  - `colorPalette` (JSON)
  - `forbiddenWords` (array - words to avoid in content)
  - `watermark`
  - `autoRequestReviews` (boolean)
- **Relations:** Business (1:1)

#### KnowledgeBase Model
- **Purpose:** RAG (Retrieval-Augmented Generation) storage for business context
- **Fields:** `businessId` (unique)
- **Relations:** KnowledgeDocuments, KnowledgeChunks

#### KnowledgeDocument Model
- **Fields:** `filename`, `fileType`, `s3Key`, `sourceUrl`, `uploadedAt`, `status`
- **Relations:** KnowledgeBase, KnowledgeChunks

#### KnowledgeChunk Model
- **Fields:**
  - `content` (text)
  - `embedding` (PostgreSQL vector type for semantic search)
  - `metadata` (JSON)
- **Relations:** Document, KnowledgeBase

---

### Review & Lead Management

#### Review Model
- **Purpose:** Track customer reviews from various platforms
- **Key Fields:**
  - `source` (GOOGLE, YELP, FACEBOOK, TRIPADVISOR, DIRECT, OTHER)
  - `externalId`, `platformUrl`
  - `reviewerName`, `reviewerEmail`, `rating` (1-5)
  - `reviewText`, `isVerified`
  - `sentiment` (VERY_POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY_NEGATIVE)
  - `responseText`, `respondedAt`, `respondedBy`
  - `convertedToPost`, `socialPostId` (if turned into a social post)
- **Relations:** Business
- **Indexes:** businessId, source, rating, sentiment

#### ReviewRequest Model
- **Purpose:** Track outgoing review requests to customers
- **Key Fields:**
  - `customerName`, `customerEmail`, `customerPhone`
  - `status` (PENDING, SENT, DELIVERED, OPENED, CLICKED, SUBMITTED, BOUNCED, UNSUBSCRIBED)
  - `channel` (EMAIL, SMS, WHATSAPP, IN_PERSON)
  - `sentAt`, `deliveredAt`, `openedAt`, `clickedAt`, `submittedAt`
  - `followUpCount`, `lastFollowUpAt`
  - `token` (unique - for tracking links)
- **Relations:** Business

#### Lead Model
- **Purpose:** Track leads generated from social media posts
- **Key Fields:**
  - `leadType` (PHONE_CALL, MESSAGE, WEBSITE_VISIT, BOOKING, DIRECTIONS, FORM_SUBMISSION, OTHER)
  - `source` (default: SOCIAL_MEDIA)
  - `status` (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
  - `estimatedValue`, `actualValue`, `notes`
  - `contactedAt`, `convertedAt`, `metadata` (JSON)
- **Relations:** Business, Post (optional)
- **Indexes:** businessId, leadType, status, createdAt

---

### Workflow & Automation Models

#### Workflow Model
- **Purpose:** Multi-step automation workflows
- **Key Fields:**
  - `name`, `description`
  - `trigger` (JSON - defines when workflow starts)
  - `isActive`, `runCount`, `lastRunAt`
- **Relations:** Business, Creator (User), Steps, Executions, Runs, Posts, ContentDrafts, VideoGenerationJobs

#### WorkflowStep Model
- **Purpose:** Individual workflow automation steps
- **Key Fields:** `name`, `type`, `config` (JSON), `order`, `conditions` (JSON array)
- **Relations:** Workflow, WorkflowRuns

#### WorkflowExecution Model
- **Purpose:** Single workflow run/execution
- **Key Fields:**
  - `status` (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)
  - `startedAt`, `completedAt`, `error`, `result` (JSON)
  - `triggerData` (JSON)
- **Relations:** Workflow, WorkflowRuns

#### WorkflowRun Model
- **Purpose:** Individual step execution within a workflow
- **Key Fields:**
  - `status` (PENDING, RUNNING, COMPLETED, FAILED, etc.)
  - `startedAt`, `completedAt`, `error`, `result` (JSON)
- **Relations:** Workflow, WorkflowExecution, WorkflowStep

---

### Content Generation & Media

#### ImageGenerationJob Model
- **Purpose:** Track DALL-E/image generation requests
- **Fields:** `prompt`, `status`, `imageUrl`, `metadata` (JSON)
- **Relations:** Business, User, Workflow

#### VideoGenerationJob Model
- **Purpose:** Track video generation requests
- **Fields:** `prompt`, `status`, `videoUrl`, `duration`, `metadata`
- **Relations:** Business, User, Workflow

#### ImageStorage Model
- **Purpose:** Uploaded/generated image storage tracking
- **Fields:** `s3Key`, `url`, `status` (UPLOADED, PENDING, FAILED), `metadata`
- **Relations:** Business, User

#### Gallery Model
- **Purpose:** Image/media gallery organization
- **Fields:** `name`, `description`, `type`
- **Relations:** Business

---

### System & Analytics

#### ActivityLog Model
- **Purpose:** User activity tracking
- **Fields:** `action`, `entity`, `entityId`, `userId`, `details` (JSON), `createdAt`
- **Indexes:** userId, entity, createdAt

#### ErrorLog Model
- **Purpose:** System error tracking
- **Fields:** `message`, `stack`, `source`, `context` (JSON), `path`, `resolved`, `createdAt`
- **Indexes:** source, resolved, createdAt

#### AuditLog Model
- **Purpose:** Compliance audit trail
- **Fields:** `action`, `resource`, `userId`, `ipAddress`, `userAgent`, `status`, `details` (JSON)
- **Indexes:** userId, action, createdAt

#### SystemMetric Model
- **Purpose:** Performance metrics
- **Fields:** `name`, `value`, `unit`, `tags` (JSON), `timestamp`
- **Indexes:** name, timestamp

---

### Additional Supporting Models

#### Team Invitation Model
- Invite users to businesses/organizations

#### Posting Schedule Model
- Schedule publication times

#### Settings Model
- User and business-level settings

#### Subscription & Billing Models
- **Subscription**: Multi-tenant subscription tracking (`organizationId`, `planId: FREE | STARTER | PRO | ENTERPRISE`, `status: ACTIVE | TRIALING | PAST_DUE | CANCELED`, `currentPeriodEnd`, `stripeCustomerId`, `stripeSubscriptionId`)
- **SubscriptionUsage**: Real-time quota meters per subscription period (`feature: AI_POSTS | AI_BLOG_ARTICLES | BRAND_VOICE_PROFILES`, `used`, `limit`, `period: MONTHLY`)
- **FeatureOverride**: Database overrides for feature access overrides (`feature`, `enabled`, `expiresAt`)
- **BillingInvoice**: Historical Stripe invoice records (`invoiceNumber`, `amount`, `currency`, `pdfUrl`, `status`)
- **AuditLog**: Administrative action audit trail (`userId`, `action: ADMIN_OVERRIDE_PLAN`, `entityType: SUBSCRIPTION`, `metadata`)

---

### Enums

```
Platform: LINKEDIN, TWITTER, INSTAGRAM, FACEBOOK, TIKTOK, YOUTUBE, MASTODON, BLUESKY, PINTEREST, GOOGLE_BUSINESS

ContentIntent: SALES, EDUCATION, EVENT, ENGAGEMENT, BRAND_AWARENESS

ContentStatus: GENERATED, PENDING_REVIEW, APPROVED, REJECTED, SCHEDULED, POSTED, FAILED, DRAFT

AssetStatus: PENDING, GENERATING, COMPLETED, FAILED

UserRole: OWNER, ADMIN, EDITOR, VIEWER

BrandTone: PROFESSIONAL, FRIENDLY, CREATIVE, TECHNICAL, LUXURY, CASUAL

BusinessType: RESTAURANT, SALON, CONTRACTOR, AUTO_REPAIR, REAL_ESTATE, HEALTH_FITNESS, etc.

ReviewSource: GOOGLE, YELP, FACEBOOK, TRIPADVISOR, DIRECT, OTHER

Sentiment: VERY_POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY_NEGATIVE

WorkflowExecutionStatus: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED

WorkflowRunStatus: PENDING, RUNNING, COMPLETED, FAILED, etc.

ReviewRequestStatus: PENDING, SENT, DELIVERED, OPENED, CLICKED, SUBMITTED, BOUNCED, UNSUBSCRIBED

ReviewRequestChannel: EMAIL, SMS, WHATSAPP, IN_PERSON

LeadType: PHONE_CALL, MESSAGE, WEBSITE_VISIT, BOOKING, DIRECTIONS, FORM_SUBMISSION, OTHER

LeadStatus: NEW, CONTACTED, QUALIFIED, CONVERTED, LOST

NotificationType: Various notification types

EntityType: For generic notification targeting
```

---

## 2. CUSTOM AI AGENTS & WORKFLOWS (`services/ai/`)

### Overview
A high-performance, pure TypeScript AI orchestration framework providing intelligent agents, Zod-validated tools, and multi-step workflows.

### Registered Agents (`services/ai/agents/`)
- `analyticsAgent`: Growth analytics and performance recommendations
- `blogWriterAgent` & `blogSeoAgent`: Long-form article ghostwriting and SEO engineering
- `competitorAgent`: Local competitor scanner and positioning analysis
- `engagementAgent`: Social comments and direct message interaction
- `multiLocationAgent`: Franchise and multi-location coordinator
- `postCreationAgent` & `postPublisherAgent`: Platform-specific copy synthesis and publishing
- `reviewBoosterAgent`: Reputation, feedback, and 5-star review conversion
- `templateAgent`: 90-day industry growth blueprints
- `trendEventAgent`: Local calendar and holiday event scout
- `weatherAgent`: Weather-driven promotional hooks
- `youtubeAgent`: Video transcription and repurposing

### Registered Workflows (`services/ai/workflows/`)
1. `blogGenerationWorkflow`: Outline -> Long-form Article -> SEO Optimization
2. `weatherWorkflow`: Open-Meteo forecast -> Activity & Promotion Planning
3. `postPublishingWorkflow`: Draft Validation -> Platform Formatting -> Dispatch -> Logs
4. `scheduledPostingWorkflow`: Due Post Detection -> Multi-Platform Publishing

---

## 3. CUSTOM AI TOOLS (`services/ai/tools/`)
- `growthScoreTool`: Calculates comprehensive 0-100 business growth scores
- `adBoosterTool`: Suggests organic posts for paid ad boosting
- `analyticsTool`: Cross-platform engagement aggregation
- `blogContentTool` & `seoAnalyzerTool`: Long-form generation and keyword density auditing
- `searchCompetitorsTool` & `analyzeCompetitorTool`: Competitive landscape scanner
- `crmIntegrationTool`: Lead sync with external CRMs
- `industryTemplateTool`: 90-day growth plans for niche verticals
- `localEventTool`: Municipal events and holiday discovery
- `multiLocationTool`: Organization-wide branch synchronization
- `generateContentTool`, `schedulePostTool`, `getPostAnalyticsTool`: Social publishing suite
- `requestReviewTool`, `generateReviewReplyTool`, `reviewToSocialPostTool`: Review management
- `weatherTool`: Open-Meteo current forecast integration
- `youtubeTool`: YouTube Data API statistics and metadata

### Post Creation Tools

#### generateContentTool
- **Input:** prompt, platforms[], tone, includeHashtags, includeCTA, existingContent, regenerationGoal
- **Output:** Platform-specific content with text, hashtags, CTA
- **Features:**
  - Character limit enforcement (280 for Twitter, 2200 for TikTok)
  - Structured output with schema validation
  - Regeneration support with specific goals

#### publishPostTool
- **Purpose:** Actual publishing to social platforms via Meta API

#### imageGenerationTool
- **Purpose:** Generate visual assets for posts (DALL-E 3)

#### fetchAnalyticsTool
- **Purpose:** Retrieve post metrics from social platforms

### Utility Tools

#### weatherTool
- **Purpose:** Fetch weather data

---

## 4. API ENDPOINTS STRUCTURE

### Authentication Routes (`/app/api/auth/`)
```
POST   /auth/register                - User registration
POST   /auth/login                   - Email/password login
POST   /auth/logout                  - Logout
GET    /auth/me                      - Get current user
GET/POST /auth/[...]                 - Better Auth OAuth handlers
POST   /auth/forgot-password         - Request password reset
POST   /auth/reset-password          - Reset password
POST   /auth/send-welcome-email      - Resend welcome email
```

### Social Media Routes (`/app/api/social/`)
```
/social/accounts/                    - Social account management
/social/auth/                        - OAuth/social auth
/social/sync/                        - Sync social data
/social/ai/                          - AI-powered social features
/social/callback/                    - OAuth callbacks
/social/entities/                    - Social entities management
/social/proxy-image/                 - Image proxy for social platforms
```

### Post Management (`/app/api/posts/`)
```
GET/POST /posts/                     - List/create posts
GET/PUT/DELETE /posts/[id]           - Single post operations
```

### Content Draft Routes (`/app/api/content-draft/`)
```
GET/POST /content-draft/             - List/create drafts
GET/PUT/DELETE /content-draft/[id]   - Single draft operations
```

### Video Generation (`/app/api/video/`)
```
GET    /video/[id]                   - Get video job
POST   /video/generate               - Create generation job
GET    /video/status                 - Check job status
POST   /video/cancel                 - Cancel job
GET    /video/gallery                - Video gallery
GET    /video/analytics              - Video analytics
POST   /video/batch                  - Batch operations
GET    /video/models                 - Available models
POST   /video/rag-generate           - RAG-powered generation
POST   /video/system/                - System operations
```

### Image Generation (`/app/api/image/`)
```
POST   /image/generate               - Create generation job
GET    /image/[id]                   - Get job status
GET    /image/status                 - Check status
POST   /image/brand-filters          - Apply brand filters
GET    /image/jobs                   - List generation jobs
POST   /image/upload                 - Upload images
```

### Workflow Routes (`/app/api/workflow/`)
```
/workflow/[draftId]                  - Workflow for specific draft
```

### Business Profile (`/app/api/business-profile/`)
- Business configuration and setup

### Analytics (`/app/api/analytics/`)
- Analytics and metrics

### Admin Routes (`/app/api/admin/`)
```
/admin/email-queue/                  - Email queue management
/admin/system/                       - System administration
```

### Dashboard (`/app/api/dashboard/`)
```
GET /dashboard                       - Dashboard metrics and data
```

### Other Routes
```
/app/api/knowledge/                  - Knowledge base operation
/app/api/settings/                   - User/business settings
/app/api/team/                       - Team management
/app/api/reviews/                    - Review management
/app/api/validation/                 - Input validation
/app/api/schedule/                   - Scheduling
/app/api/log/                        - Logging endpoints
/app/api/cron/                       - Scheduled tasks
/app/api/third-party/                - Third-party integrations
/app/api/tracking/                   - Event tracking
```

---

## 5. AUTHENTICATION & AUTHORIZATION

### Authentication System
**Provider:** Better Auth (v2)
**Methods:**
1. Email/Password
   - Min 8 characters, max 128 characters
   - bcrypt hashing (salt rounds: 12)
   - Email verification: optional
   - Password reset with token expiry

2. OAuth 2.0 (Google)
   - Account linking enabled
   - Automatic welcome email on signup

### Session Management
- **Duration:** 7 days
- **Cookie Cache:** 5 minutes
- **Session Tracking:** IP Address, User Agent
- **Token:** Unique session token storage

### Database Hooks
On user creation:
1. Send welcome email (non-blocking)
2. Create default business for user
3. Log audit event (USER_SIGNUP)
4. Log activity event

### Authorization Patterns
**Role-Based Access Control (RBAC):**
- **UserRole:** OWNER, ADMIN, EDITOR, VIEWER
- **OrgRole:** MEMBER (default)

**Business Access Check:**
```typescript
// Verify user is member of business via BusinessMember table
const membership = await prisma.businessMember.findUnique({
  where: { userId_businessId: { userId, businessId } }
});
```

**API-Level Protection:**
- Session validation via `auth.api.getSession()`
- Business ID scoping for multi-tenant isolation

---

## 6. BUSINESS DATA HANDLING

### Business Workspace Structure
```
Organization (1:Many) → Businesses → Team Members
   └─ Users (OrganizationMembers)
```

### Business Context
Each business has:
- **Profile:** Mission, vision, UVP, brand tone, target audience
- **Social Accounts:** Connected platforms (Facebook, Instagram, LinkedIn, Twitter, TikTok, YouTube, etc.)
- **Knowledge Base:** Company documents for RAG context
- **Content:** Drafts, published posts, scheduled content
- **Team:** Members with different roles
- **Workflows:** Automated posting/content pipelines
- **Leads & Reviews:** Customer interaction tracking
- **Settings:** API keys, webhooks, feature toggles

### Multi-Tenancy Implementation
- **Scoping:** All queries filtered by `businessId`
- **Isolation:** Via Prisma relations and database constraints
- **Access Control:** BusinessMember role verification

### Content Pipeline
```
ContentDraft (DRAFT)
    ↓
[ApprovalLog] ← Human Review
    ↓
ContentDraft (APPROVED/SCHEDULED)
    ↓
[Workflow Execution]
    ↓
Post (POSTED) → Analytics tracking
```

### Data Privacy & Compliance
- **Audit Logs:** All actions tracked with userId, ipAddress, userAgent
- **Activity Logs:** Entity-level tracking
- **Error Logs:** Separate error tracking for debugging
- **System Metrics:** Performance monitoring

---

## 7. SOCIAL MEDIA INTEGRATION

### Meta Business Manager Service
**Location:** `features/social/services/meta-business-manager-extended.service.ts`

**Capabilities:**
- OAuth token exchange and refresh
- Facebook/Instagram posting
- Platform-specific insights/analytics
- Token expiration management

**Required Scopes:**
- **Facebook Pages:** pages_show_list, pages_read_engagement, pages_manage_posts, pages_read_insights
- **Instagram Business:** instagram_basic, instagram_content_publish, instagram_graph_api
- **Creator Accounts:** Similar to Instagram Business
- **All Permissions:** Comprehensive access for full integration

**Base URL:** `https://graph.facebook.com/v19.0`

### Supported Platforms
- Meta ecosystem: Facebook, Instagram (Business & Creator)
- Independent: Twitter/X, LinkedIn, TikTok, YouTube, Mastodon, Bluesky, Pinterest
- Google Business Profile

### Analytics Integration
Posts store comprehensive metrics:
- **Engagement:** likes, comments, shares, saves
- **Reach:** impressions, profile visits
- **Video-Specific:** views, completion rate, watch time
- **User Actions:** clicks, bookings, messages, phone calls, directions
- **Story Metrics:** taps, exits

---

## 8. CONTENT GENERATION & INTELLIGENCE

### Generation Workflow
```
User Input/Prompt
    ↓
[Post Creation Agent]
    ↓
Content Generation (GPT-4 Turbo)
    ↓
Image Generation (DALL-E 3)
    ↓
ContentDraft
    ↓
Optional: Manual Review/Approval
    ↓
Publishing (via Post Publisher Agent)
```

### AI Models Used
- **LLM:** GPT-4 Turbo (content generation, analytics)
- **Vision:** DALL-E 3 (image generation)
- **Weather:** GPT-5-mini (lightweight tasks)

### Knowledge Base (RAG)
- Store business documents
- Vector embeddings (PostgreSQL vector type)
- Semantic search for context injection
- Supports PDFs, URLs, text documents

### Tone & Brand Configuration
- **Brand Tone:** Professional, Friendly, Creative, Technical, Luxury, Casual
- **Target Audience:** Configurable per business
- **Forbidden Words:** Excluded terms
- **Color Palette:** Brand guidelines

---

## 9. WORKERS & BACKGROUND JOBS

**Available Workers:**
```bash
worker:generation        - Content generation
worker:image            - Image generation
worker:video            - Video status checking
worker:knowledge        - Knowledge base updates
worker:posting          - Publishing jobs
worker:email            - Email sending
worker:social           - Social media sync
worker:posting-schedule - Scheduled post execution
worker:metrics          - System metrics collection
worker:clear-logs       - Log cleanup
```

---

## 10. FEATURE MODULES

### Post Creation (`features/post-creation/`)
- Draft creation and management
- Content generation orchestration

### Social Media (`features/social/`)
- Account connections
- Platform APIs
- OAuth flows

### Analytics (`features/analytics/`)
- Metrics aggregation
- Performance scoring
- Consistency analysis

### Video Generation (`features/video_generation/`)
- Video job tracking
- Status monitoring
- Brand filter application

### Image Generation (`features/image_generation/`)
- DALL-E integration
- Brand filter application
- Status tracking

### Knowledge Base (`features/knowledge/`)
- Document management
- Vector embeddings
- RAG implementation

### Organization (`features/organization/`)
- Multi-business support
- Team management

### Scheduler (`features/scheduler/`)
- Content scheduling
- Worker coordination

### System (`features/system/`)
- Logging service
- Error tracking
- Audit trails

### Settings (`features/settings/`)
- User preferences
- Business configuration

### Workflow (`features/workflow/`)
- Workflow creation and execution
- Step orchestration

---

## 11. CURRENT TECH STACK

**Frontend:**
- Next.js 14+
- React
- TailwindCSS (implied from structure)
- React Query (implied from file names)

**Backend:**
- Next.js API Routes & Server Actions
- Custom AI Engine (`services/ai/*`)
- Better Auth

**Database:**
- PostgreSQL
- Prisma ORM
- Vector support (pgvector extension)

**AI/ML:**
- Dynamic AIService (OpenRouter dev / OpenAI prod)
- LangChain integration
- 13 Custom autonomous agents & workflows

**Deployment/Ops:**
- Docker support
- Environment-based configuration
- Redis (implied caching)

---

## 12. KEY ARCHITECTURAL PATTERNS

### Multi-Tenancy
- All queries scoped by `businessId`
- Organizations contain multiple businesses
- Role-based access control per business

### Content Approval Workflow
Draft → Pending Review → Approved/Rejected → Scheduled → Posted

### AI Agent Architecture
Each agent:
- Has specific instructions and expertise
- Uses designated Zod-validated tools
- Executes dynamically via `AIService`

### API-Driven Workflows
Workflows trigger via:
- API calls
- Scheduled execution
- Manual triggers
- Event-based (webhooks)

---

## 13. GAPS & OPPORTUNITIES

### Currently Empty/Not Implemented
1. **Content Generation API:** Empty folder (`/app/api/content-generation/`)
2. **Detailed Review Management:** Basic model but limited API endpoints
3. **Lead Scoring:** Model exists but limited automation

### Expansion Opportunities
1. Competitor analysis
2. Advanced brand safety
3. Influencer identification
4. Sentiment-based content adaptation
5. Multi-language support
6. A/B testing framework
7. ROI tracking per content piece
8. Predictive posting times

---

## 14. DEPLOYMENT COMMANDS

```bash
# Development
npm run dev                          # Start Next.js dev server (localhost:3000)

# Database
npm run setup                        # Generate Prisma client + deploy migrations
npm run prisma:generate              # Generate Prisma client
npm run prisma:migrate              # Create migration
npm run prisma:push                 # Push schema to database
npm run prisma:studio               # Open Prisma Studio GUI

# Workers
npm run workers                      # Start main scheduler
npm run worker:generation            # Content generation worker
npm run worker:posting               # Publishing worker
npm run worker:video                 # Video status worker

# Build
npm run build                        # Production build
npm run start                        # Start production server

# Admin
npm run admin:seed                   # Seed admin user
```

---

## Summary

This is a **sophisticated, production-ready AI social media automation platform** with:
- ✅ Comprehensive multi-tenant architecture
- ✅ Advanced AI agent-based content generation
- ✅ Multi-platform social media publishing
- ✅ Detailed analytics and performance tracking
- ✅ Review and lead management
- ✅ Role-based access control
- ✅ Workflow automation capabilities
- ✅ Knowledge base for business context (RAG)
- ✅ Email and notification systems
- ✅ Audit and compliance logging

**Best for:** Small to medium businesses automating social media operations with AI-generated content.
