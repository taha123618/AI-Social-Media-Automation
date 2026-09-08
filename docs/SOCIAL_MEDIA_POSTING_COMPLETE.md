# Complete Social Media Posting Feature - Implementation Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Custom AI Agents & Workflows](#custom-ai-agents--workflows)
5. [React Components](#react-components)
6. [Meta API Integration](#meta-api-integration)
7. [Permissions & Scopes](#permissions--scopes)
8. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### High-Level Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                         │
├─────────────────────────────────────────────────────────────────────┤
│  Posts Page (List) → Create Post Modal → Draft Editor → Preview     │
│  ↓                                                         ↓         │
│  Status: Draft/Scheduled/Published                   Publish Now   │
└──────────────────────┬──────────────────────────────────┬───────────┘
                       │                                  │
                       ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API Layer (Next.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  POST   /api/posts/create                 - Create draft             │
│  PATCH  /api/posts/[id]/update            - Update draft             │
│  PATCH  /api/posts/[id]/publish           - Publish post             │
│  GET    /api/posts                        - List posts               │
│  GET    /api/posts/[id]/analytics         - Fetch analytics          │
│  PATCH  /api/posts/[id]/schedule          - Schedule post            │
│  DELETE /api/posts/[id]                   - Delete draft             │
└────────┬────────────────────────────┬──────────────────────┬────────┘
         │                            │                      │
         ▼                            ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Custom AI Agents & Workflows                      │
├─────────────────────────────────────────────────────────────────────┤
│  PostCreationAgent - Handles content generation                      │
│  PostPublishingWorkflow - Orchestrates publishing to multiple        │
│                           platforms                                  │
│  AnalyticsWorkflow - Fetches and aggregates platform metrics         │
│  ContentOptimizationAgent - AI-driven post optimization              │
└────────┬────────────────────────────────┬───────────────────────────┘
         │                                │
         ▼                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Database Layer (Prisma/PostgreSQL)                  │
├─────────────────────────────────────────────────────────────────────┤
│  ContentDraft    - Draft posts with metadata                         │
│  Post            - Published posts with platform references          │
│  PostAnalytics   - Post performance metrics                          │
│  SocialAccount   - Connected social media accounts                   │
│  MisconfiguredStatus - One-to-one tracking for publishing status     │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               External APIs (Meta Business Manager)                  │
├─────────────────────────────────────────────────────────────────────┤
│  Facebook Graph API v19.0                                            │
│  Instagram Graph API                                                 │
│  Creator Account API                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Post Lifecycle

```
┌──────────┐
│  DRAFT   │ ◄─── User creates/edits post
└────┬─────┘
     │
     ├─► (Save) ──► Stay in DRAFT
     │
     ├─► (Schedule) ──► SCHEDULED ──► (Time arrives) ──► PUBLISHING
     │                                                        │
     ├─► (Publish Now) ──────────────► PUBLISHING            │
     │                                     │                  │
     └─────────────────────────────────────┼──────────────────┘
                                           │
                                           ▼
                                      ┌──────────────┐
                                      │  PUBLISHED   │
                                      └──────────────┘
                                           │
                                           ├─► Analytics Collection
                                           │   (Likes, Comments, etc.)
                                           │
                                           └─► Archive (after 30 days)
```

---

## Database Schema

### Existing Tables (Already in your schema)

```typescript
// ContentDraft - Represents a post being created
model ContentDraft {
  id              String           @id @default(cuid())
  title           String?
  intent          ContentIntent    // SALES, EDUCATION, EVENT, etc.
  platforms       Platform[]       // Facebook, Instagram, TikTok, etc.
  customPrompt    String?
  contextUsed     Json?
  mediaUrl        String?
  status          ContentStatus    // DRAFT, PENDING_REVIEW, SCHEDULED, etc.
  scheduledFor    DateTime?
  postedAt        DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  businessId      String
  creatorId       String
  contentJson     Json?            // { text, caption, hashtags, etc. }
  videoScript     Json?
  visualPrompt    String?
  executionId     String?
  workflowId      String?

  // Relations
  business        Business         @relation(...)
  creator         User             @relation(...)
  approvals       ApprovalLog[]
  posts           Post[]           // Published posts created from this draft
}

// Post - Published post on social platform
model Post {
  id              String         @id @default(cuid())
  businessId      String
  creatorId       String
  draftId         String         // Links to ContentDraft
  externalPostId  String?        // Platform's post ID (e.g., Facebook post_id)
  platform        Platform
  postedAt        DateTime       @default(now())
  publishedUrl    String?        // Direct link to published post
  socialAccountId String         // Which account was used
  scheduledFor    DateTime?
  workflowId      String?

  // Relations
  business        Business       @relation(...)
  creator         User           @relation(...)
  draft           ContentDraft   @relation(...)
  socialAccount   SocialAccount  @relation(...)
  analytics       PostAnalytics?
}

// PostAnalytics - Performance metrics for published posts
model PostAnalytics {
  id                  String   @id @default(cuid())
  likes               Int      @default(0)
  shares              Int      @default(0)
  comments            Int      @default(0)
  impressions         Int      @default(0)
  clicks              Int      @default(0)
  updatedAt           DateTime @updatedAt
  postId              String   @unique
  bookingClicks       Int      @default(0)
  directionRequests   Int      @default(0)
  messageClicks       Int      @default(0)
  phoneClicks         Int      @default(0)
  saves               Int      @default(0)
  videoCompletionRate Float?
  videoViews          Int      @default(0)
  websiteClicks       Int      @default(0)

  post                Post     @relation(...)
}

// SocialAccount - Connected social media account
model SocialAccount {
  id             String    @id @default(cuid())
  platform       Platform
  platformId     String    // Platform's account ID
  accessToken    String?
  refreshToken   String?
  tokenExpiresAt DateTime?
  name           String?
  avatar         String?
  businessId     String
  isActive       Boolean   @default(true)
  profileUrl     String?

  posts          Post[]
  business       Business  @relation(...)
}
```

### New Tables to Add

```prisma
// For advanced scheduling and queue management
model PostPublishingQueue {
  id              String   @id @default(cuid())
  postId          String   @unique
  socialAccountId String
  platform        Platform
  payload         Json     // Complete post payload
  scheduledFor    DateTime?
  attempts        Int      @default(0)
  lastError       String?
  status          PublishingStatus @default(PENDING) // PENDING, PROCESSING, SUCCESS, FAILED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id])

  @@index([status, scheduledFor])
  @@index([platform])
}

// Track post performance trends
model PostMetricsSnapshot {
  id        String   @id @default(cuid())
  postId    String
  metrics   Json     // Snapshot of metrics at this time
  createdAt DateTime @default(now())

  @@index([postId, createdAt])
}

// For post variations and A/B testing
model PostVariation {
  id        String   @id @default(cuid())
  draftId   String
  variant   Int      // Version number
  contentJson Json   // Different content for testing
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  draft     ContentDraft @relation(fields: [draftId], references: [id], onDelete: Cascade)
}
```

---

## API Endpoints

### 1. POST `/api/posts/create` - Create New Draft

**Request:**
```typescript
interface CreatePostRequest {
  title?: string;
  platforms: Platform[];           // [FACEBOOK, INSTAGRAM]
  contentJson: {
    text?: string;
    caption?: string;
    hashtags?: string[];
    mentions?: string[];
    callToAction?: string;
  };
  mediaUrls?: string[];
  intent: ContentIntent;
  scheduledFor?: DateTime;
  socialAccountIds: string[];      // Which accounts to post to
}
```

**Response:**
```typescript
interface CreatePostResponse {
  draftId: string;
  status: ContentStatus;
  createdAt: DateTime;
  platforms: Platform[];
}
```

### 2. POST `/api/posts/[id]/publish` - Publish Post

**Request:**
```typescript
interface PublishPostRequest {
  now?: boolean;                   // true = post immediately
  scheduledFor?: DateTime;         // future = schedule for later
  socialAccountIds?: string[];     // Override accounts
}
```

**Response:**
```typescript
interface PublishPostResponse {
  postIds: string[];               // One per platform/account
  externalPostIds: {
    [key: string]: string;         // socialAccountId -> platformPostId
  };
  status: 'PUBLISHED' | 'SCHEDULED';
  publishedUrls: string[];
}
```

### 3. GET `/api/posts` - List Posts

**Query Parameters:**
```typescript
interface ListPostsQuery {
  skip?: number;
  take?: number;
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  platform?: Platform;
  sortBy?: 'date' | 'engagement' | 'reach';
}
```

**Response:**
```typescript
interface ListPostsResponse {
  posts: PostListItem[];
  total: number;

  interface PostListItem {
    id: string;
    title?: string;
    content: string;
    platforms: Platform[];
    status: PostStatus;
    postedAt?: DateTime;
    scheduledFor?: DateTime;
    mediaUrls?: string[];
    accounts: {
      id: string;
      name: string;
      avatar?: string;
      platform: Platform;
    }[];
    analytics?: {
      likes: number;
      comments: number;
      shares: number;
      reach: number;
    };
  }
}
```

### 4. PATCH `/api/posts/[id]/schedule` - Schedule Post

**Request:**
```typescript
interface SchedulePostRequest {
  scheduledFor: DateTime;
  timezone?: string;
  socialAccountIds?: string[];
}
```

### 5. GET `/api/posts/[id]/analytics` - Fetch Post Metrics

**Response:**
```typescript
interface PostAnalyticsResponse {
  postId: string;
  platform: Platform;
  externalPostId: string;
  metrics: {
    engagement: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
    reach: {
      impressions: number;
      reach: number;
      profileVisits: number;
    };
    video?: {
      views: number;
      completionRate: number;
      averageWatchTime: string;
    };
    story?: {
      replies: number;
      exits: number;
      navigates: number;
    };
  };
  updatedAt: DateTime;
  historicalTrend?: Array<{
    date: DateTime;
    metrics: any;
  }>;
}
```

---

## Custom AI Agents & Workflows

### 1. PostCreation Agent

**File:** `services/ai/agents/post-creation.agent.ts`

```typescript
import { AgentDefinition } from '../types';
import { AIService } from '../ai.service';
import { generateContentTool } from '../tools';

export const postCreationAgent: AgentDefinition = {
  name: 'Creative Content Producer',
  instructions: `You are an elite Social Media Copywriter and Creative Director...`,
  model: 'gpt-4o',
  tools: { generateContentTool },
};
```

### 2. Post Publishing Workflow

**File:** `services/ai/workflows/post-publishing.workflow.ts`

```typescript
import { WorkflowDefinition } from '../types';

export const postPublishingWorkflow: WorkflowDefinition = {
  id: 'post-publishing-workflow',
  name: 'Multi-Platform Post Publishing Pipeline',
  steps: [
    // Validation -> Platform Formatting -> Dispatch -> Logs
  ],
};
```
        action: {
          type: 'worker',
          work: async (input) => {
            // Validate post content before publishing
            return { valid: true };
          },
        },
      },
      {
        id: 'publishToFacebook',
        type: 'action',
        dependsOn: ['validateContent'],
        action: {
          type: 'worker',
          work: async (input) => {
            // Publish to Facebook
            return { postId: '...', url: '...' };
          },
        },
      },
      {
        id: 'publishToInstagram',
        type: 'action',
        dependsOn: ['validateContent'],
        action: {
          type: 'worker',
          work: async (input) => {
            // Publish to Instagram
            return { postId: '...', url: '...' };
          },
        },
      },
      {
        id: 'saveResults',
        type: 'action',
        dependsOn: ['publishToFacebook', 'publishToInstagram'],
        action: {
          type: 'worker',
          work: async (input) => {
            // Save post records and analytics
            return { success: true };
          },
        },
      },
    ],
  },
});
```

### 3. Analytics Fetching Workflow

```typescript
export const analyticsWorkflow = new Workflow({
  name: 'analyticsWorkflow',
  ttl: 3600, // Run every hour
  definition: {
    type: 'dag',
    steps: [
      {
        id: 'fetchFacebookMetrics',
        type: 'action',
        action: {
          type: 'worker',
          work: async (input) => {
            // Fetch from Facebook Graph API
            return { metrics: {...} };
          },
        },
      },
      {
        id: 'fetchInstagramMetrics',
        type: 'action',
        action: {
          type: 'worker',
          work: async (input) => {
            // Fetch from Instagram Graph API
            return { metrics: {...} };
          },
        },
      },
      {
        id: 'updateDatabase',
        type: 'action',
        dependsOn: ['fetchFacebookMetrics', 'fetchInstagramMetrics'],
        action: {
          type: 'worker',
          work: async (input) => {
            // Update PostAnalytics records
            return { updated: true };
          },
        },
      },
    ],
  },
});
```

---

## React Components

### 1. Posts Page (`/app/(user)/posts/page.tsx`)

Displays list of all posts with filters and actions.

### 2. Post Creation Modal

Interactive form for creating new posts with:
- Account selector
- Content editor with rich formatting
- Media uploader
- Platform-specific settings
- Preview panel

### 3. Post Editor Component

Rich text editor with formatting toolbar and live preview.

---

## Meta API Integration

### Required Permissions & Scopes

#### Facebook Pages
- `pages_manage_posts` - Create/delete posts
- `pages_read_engagement` - Read post metrics
- `pages_read_insights` - Access detailed insights
- `pages_manage_metadata` - Manage page settings

#### Instagram Business
- `instagram_basic` - Read basic info
- `instagram_content_publish` - Publish content
- `instagram_insights` - Read metrics

#### Creator Accounts
- `instagramGraph API` - Different endpoints for creator access

### Access Token Management

```typescript
interface TokenRefreshStrategy {
  checkExpiration: () => Date;
  refreshIfNeeded: () => Promise<string>;
  storeToken: (token: string, expiresAt: Date) => Promise<void>;
}
```

---

## Implementation Checklist

- [ ] Extend Prisma schema with new models
- [ ] Create TypeScript types and interfaces
- [ ] Build Meta API integration service
- [ ] Create Custom AI agents and workflows (`services/ai/*`)
- [ ] Implement API endpoints
- [ ] Build React UI components
- [ ] Add analytics dashboard
- [ ] Deploy and test
- [ ] Set up webhook handlers for real-time updates
- [ ] Create comprehensive documentation

---

## Continuation

See subsequent documents for:
- `types.ts` - Complete TypeScript interfaces
- `meta-api-service.ts` - Meta API implementation
- `api/` - All endpoint implementations
- `components/` - React UI components
