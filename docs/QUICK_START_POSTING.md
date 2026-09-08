# Social Media Posting Feature - Quick Start & Implementation Guide

## 🚀 Quick Start

### Step 1: Update Environment Variables

```bash
# .env.local
FACEBOOK_APP_ID=your_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=your_FACEBOOK_APP_SECRET
META_WEBHOOK_TOKEN=generate_secure_random_token
OPENAI_API_KEY=your_openai_api_key
```

### Step 2: Add New Prisma Models

Create migration for new models:

```bash
npm run prisma:migrate add_post_publishing_models
```

### Step 3: Register Custom AI Agents and Workflows

In `services/ai/index.ts`, all agents and workflows are registered and exported:

```typescript
export * from './agents';
export * from './tools';
export * from './workflows';
```

### Step 4: Test OAuth Flow

1. Visit: `http://localhost:3000/api/social/auth/facebook`
2. Authenticate with Meta
3. Verify token is stored in database

### Step 5: Test Post Creation

```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -H "x-business-id: your_business_id" \
  -d '{
    "platforms": ["FACEBOOK", "INSTAGRAM"],
    "socialAccountIds": ["account_id_1"],
    "contentJson": {
      "text": "Test post content",
      "hashtags": ["#test"],
      "callToAction": "Learn more"
    },
    "intent": "ENGAGEMENT"
  }'
```

---

## 📋 Complete Implementation Checklist

### Database
- [ ] Create Prisma models for posts, analytics, publishing queue
- [ ] Run migrations
- [ ] Verify schema in database
- [ ] Create indexes for performance

### Meta API Setup
- [ ] Create Meta Developer App
- [ ] Configure OAuth 2.0 redirect URIs
- [ ] Request all required scopes
- [ ] Set up webhook
- [ ] Generate and store verify token
- [ ] Test OAuth flow in development

### Backend - API Endpoints
- [ ] POST `/api/posts/create` - Create draft
- [ ] PATCH `/api/posts/[id]/update` - Update draft
- [ ] DELETE `/api/posts/[id]` - Delete draft
- [ ] POST `/api/posts/[id]/publish` - Publish post
- [ ] PATCH `/api/posts/[id]/schedule` - Schedule post
- [ ] GET `/api/posts` - List posts with filters
- [ ] GET `/api/posts/[id]/analytics` - Get post metrics
- [ ] GET `/api/social/accounts` - List connected accounts
- [ ] POST `/api/social/auth/callback` - OAuth callback handler
- [ ] POST `/api/webhooks/meta` - Webhook receiver
- [ ] POST `/api/posts/batch/publish` - Batch publishing

### Backend - Services
- [ ] MetaBusinessManagerService (extended)
  - [ ] OAuth token management
  - [ ] Facebook publishing
  - [ ] Instagram publishing
  - [ ] Analytics fetching
  - [ ] Token refresh logic
- [ ] PostingService
  - [ ] Draft management
  - [ ] Publishing orchestration
  - [ ] Queue management
- [ ] AnalyticsService
  - [ ] Metrics aggregation
  - [ ] Historical tracking
  - [ ] Report generation

### Backend - AI/Workflows Integration
- [ ] Post creation agent
- [ ] Post publisher agent
- [ ] Analytics agent
- [ ] Post publishing workflow
- [ ] Analytics fetching workflow
- [ ] Scheduled posting workflow

### Frontend - React Components
- [ ] Posts listing page with tabs
- [ ] Post creation modal
- [ ] Rich text editor
- [ ] Media upload component
- [ ] Account selector
- [ ] Preview panel
- [ ] AI Assistant modal
- [ ] Scheduling selector
- [ ] Analytics dashboard
- [ ] Post detail view
- [ ] Batch operations UI

### Frontend - State Management
- [ ] React Query setup for posts
- [ ] React Query setup for accounts
- [ ] React Query setup for analytics
- [ ] Mutation hooks for create/update/publish
- [ ] Optimistic updates where appropriate

### Testing
- [ ] Unit tests for API endpoints
- [ ] Unit tests for services
- [ ] Integration tests for workflows
- [ ] E2E tests for UI flows
- [ ] Meta API sandbox testing
- [ ] Error handling tests
- [ ] Rate limiting tests

### Documentation
- [ ] API endpoint documentation
- [ ] Meta permissions guide (DONE)
- [ ] Troubleshooting guide
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] User guide

### Deployment
- [ ] Environment variable configuration
- [ ] Database schema deployed
- [ ] API endpoints live
- [ ] Webhook URL configured
- [ ] Monitoring set up
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

### Security
- [ ] Tokens encrypted in database
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CSRF protection on forms
- [ ] Audit logging for all actions
- [ ] Webhook token validation

### Performance Optimization
- [ ] Database query optimization
- [ ] API response caching
- [ ] Image optimization
- [ ] Lazy loading on UI
- [ ] Pagination implemented
- [ ] Rate limit handling with backoff

---

## 📂 File Structure

```
.
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── create/route.ts          ✅ DONE
│   │   │   ├── [id]/
│   │   │   │   ├── publish/route.ts     ✅ DONE
│   │   │   │   ├── update/route.ts      ✅ DONE
│   │   │   │   ├── analytics/route.ts   ✅ DONE
│   │   │   │   └── schedule/route.ts    (TODO)
│   │   │   └── route.ts                 (TODO - GET posts list)
│   │   ├── social/
│   │   │   ├── accounts/route.ts        (TODO)
│   │   │   ├── auth/route.ts            (TODO)
│   │   │   └── callback/route.ts        (TODO)
│   │   ├── webhooks/
│   │   │   └── meta/route.ts            (TODO)
│   │   └── upload/
│   │       └── media/route.ts           (TODO)
│   └── (user)/
│       └── posts/
│           └── page.tsx                 (TODO)
│
├── components/
│   └── user/
│       └── social/
│           ├── posts-page.tsx           ✅ DONE
│           ├── post-creation-editor.tsx ✅ DONE
│           ├── post-preview.tsx         (TODO)
│           └── analytics-dashboard.tsx  (TODO)
│
├── features/
│   ├── social/
│   │   ├── services/
│   │   │   ├── meta-business-manager-extended.service.ts ✅ DONE
│   │   │   ├── posting.service.ts       (TODO)
│   │   │   └── analytics.service.ts     (TODO)
│   │   ├── types/
│   │   └── utils/
│   └── scheduler/
│       └── workers/
│           └── posting.worker.ts        (TODO)
│
├── services/
│   └── ai/
│       ├── agents/
│       ├── tools/
│       ├── workflows/
│       └── index.tsDONE
│   └── tools/
│       └── publishing-tools.ts          (TODO)
│
├── prisma/
│   ├── models/
│   │   └── post.prisma                  (EXTEND - add new fields)
│   └── migrations/
│       └── add_posting_queue/           (TODO)
│
├── types/
│   └── social-posting.types.ts          ✅ DONE
│
└── docs/
    ├── SOCIAL_MEDIA_POSTING_COMPLETE.md ✅ DONE
    ├── META_API_PERMISSIONS.md          ✅ DONE
    └── QUICK_START.md                    (This file)
```

---

## 🔧 Remaining Implementation Tasks

### High Priority
1. **GET /api/posts endpoint** - List posts with filtering
2. **Account connection UI** - AuthorizeAccount component
3. **Analytics dashboard** - Display metrics and charts
4. **Webhook handler** - Process Meta events
5. **Batch operations** - Publish multiple posts at once

### Medium Priority
6. **AI content generation** - Full integration with OpenRouter
7. **Post scheduling UI** - Calendar picker
8. **Preview for each platform** - Show how post looks on each platform
9. **Hashtag suggestions** - AI-powered recommendations
10. **Analytics trends** - Show metrics over time

### Lower Priority
11. **A/B testing** - Create post variations
12. **Hashtag analytics** - Track hashtag performance
13. **Competitor tracking** - Monitor competitor posts
14. **Post templates** - Save and reuse post templates
15. **Team collaboration** - Comments on drafts

---

## 🧪 Testing Commands

### Create Test Post
```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Content-Type: application/json" \
  -H "x-business-id: test-business-123" \
  -d '{
    "platforms": ["FACEBOOK"],
    "socialAccountIds": ["account-123"],
    "contentJson": {
      "text": "Hello from test",
      "hashtags": ["#test", "#automation"],
      "callToAction": "Learn more"
    },
    "intent": "ENGAGEMENT"
  }'
```

### Update Draft
```bash
curl -X PATCH http://localhost:3000/api/posts/draft-id/update \
  -H "Content-Type: application/json" \
  -H "x-business-id: test-business-123" \
  -d '{
    "contentJson": {
      "text": "Updated content"
    }
  }'
```

### Publish Post
```bash
curl -X POST http://localhost:3000/api/posts/draft-id/publish \
  -H "Content-Type: application/json" \
  -H "x-business-id: test-business-123" \
  -d '{
    "publishImmediately": true,
    "socialAccountIds": ["account-123"]
  }'
```

### List Posts
```bash
curl http://localhost:3000/api/posts \
  -H "x-business-id: test-business-123" \
  -G --data-urlencode "status=PUBLISHED" \
  --data-urlencode "platform=FACEBOOK"
```

### Get Analytics
```bash
curl http://localhost:3000/api/posts/post-id/analytics \
  -H "x-business-id: test-business-123"
```

---

## 🐛 Debugging Tips

### Enable Logging
```typescript
// In your API route
await SystemLogger.logInfo({
  message: 'Post created',
  context: 'POST /api/posts/create',
  data: { draftId, platforms },
});
```

### Check Token Status
```typescript
const isValid = await MetaBusinessManagerService.verifyToken(accessToken);
console.log('Token valid:', isValid);
```

### Monitor Rate Limits
```typescript
const response = await fetch(metaApiUrl);
console.log('Rate limit remaining:', response.headers.get('x-rate-limit-remaining'));
```

---

## 📊 Success Metrics

Once fully implemented, you should be able to:
- [ ] Create posts in < 2 seconds
- [ ] Publish to multiple platforms simultaneously
- [ ] Schedule posts for future times
- [ ] View analytics within 1 hour of posting
- [ ] Handle 100 posts per day per business
- [ ] Support multiple social accounts per business
- [ ] Recover gracefully from API errors

---

## 📞 Support & Resources

- [Custom AI Engine Documentation](file:///Users/taha/projects/ai_social_media_automation/services/ai)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [React Query Docs](https://tanstack.com/query/latest)
- [Next.js Documentation](https://nextjs.org/docs)

---

## Notes

- All timestamps are in UTC
- Media files are uploaded to S3 before publishing
- Posts have a maximum 5000 character limit
- Scheduling is limited to 6 months in advance
- Meta rate limits are 200/hour per user, 1000/hour per page
- Token refresh happens automatically, but can be manual if needed

---

**Last Updated**: April 9, 2026
**Status**: Implementation in Progress
**Next Review**: After first successful post publishing
