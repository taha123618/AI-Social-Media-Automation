# Dashboard API – Complete Usage & Design

## Overview

The dashboard API (`/api/dashboard`) provides metrics, drafts, workflows, and connected accounts scoped by business. It features:
- **Business Scoping**: Filter by `businessId` via query param or `x-business-id` header
- **Dual-Layer Caching**: Redis (primary) + in-memory TTL cache (fallback)
- **Optimized Queries**: Parallel Prisma queries with selective includes
- **Production Ready**: Error handling, logging, graceful Redis fallback

---

## API Endpoint

### GET `/api/dashboard`

#### Request Parameters

**Query String:**
```
GET /api/dashboard?businessId=acme-corp-123
```

**Headers:**
```
GET /api/dashboard
X-Business-Id: acme-corp-123
```

#### Response

```json
{
  "metrics": [
    { "label": "Content Drafts", "value": "24", "change": "" },
    { "label": "Published Posts", "value": "142", "change": "" },
    { "label": "Total Reach", "value": "45200", "change": "" },
    { "label": "Engagement Rate", "value": "8.3%", "change": "" }
  ],
  "drafts": [
    {
      "title": "Summer Campaign",
      "status": "pending_review",
      "date": "2026-02-14T10:30:00.000Z",
      "platforms": ["INSTAGRAM", "TWITTER"],
      "author": "Sarah Chen"
    }
  ],
  "workflows": [
    {
      "draftId": "draft-123",
      "title": "Q1 Content Plan",
      "business": "Acme Corp",
      "requestedBy": "Alex Kumar",
      "createdAt": "2026-02-14T10:30:00.000Z",
      "status": "PENDING_REVIEW"
    }
  ],
  "accounts": [
    {
      "id": "acc-123",
      "name": "Acme Instagram",
      "platform": "INSTAGRAM",
      "avatar": "https://...",
      "active": true
    }
  ]
}
```

#### Status Codes

- `200 OK` – Dashboard data retrieved successfully
- `500 Internal Server Error` – Database or query error

---

## Scoping Logic

### No businessId Provided
Returns **global metrics** across all businesses.

### businessId Provided
Returns **scoped metrics** for that business only:
- `contentDraft.count({ where: { businessId } })`
- `post.count({ where: { businessId } })`
- `postAnalytics.aggregate({ where: { post: { businessId } }, ... })`
- `socialAccount.findMany({ where: { businessId, isActive: true } })`

---

## Caching Strategy

### TTL: 30 seconds (configurable at top of route.ts)

### Cache Key Format
- **Global**: `dashboard:global`
- **Business-scoped**: `dashboard:business-id-xyz`

### Lookup Order
1. **Redis** (if available) – fastest, shared across instances
2. **In-Memory** (fallback) – per-process cache
3. **Database** – if both caches miss

### Graceful Fallback
If Redis is unavailable or errors occur, the API continues using the in-memory cache and database without interruption.

---

## Cache Invalidation

### Manual Invalidation

```typescript
import { invalidateDashboardCache, invalidateAllDashboardCaches } from '@/lib/dashboard-cache';

// Invalidate for a specific business
await invalidateDashboardCache('business-id-123');

// Invalidate for global cache
await invalidateDashboardCache();

// Invalidate all dashboard caches at once
await invalidateAllDashboardCaches();
```

### Automatic Invalidation Hooks (Recommended)

When you create, update, or delete content, workflows, or accounts, call the cache invalidation:

```typescript
// In your content creation API
import { invalidateDashboardCache } from '@/lib/dashboard-cache';

export async function POST(req: Request) {
  // ... create draft logic
  const newDraft = await prisma.contentDraft.create({ ... });

  // Invalidate dashboard cache for this business
  await invalidateDashboardCache(newDraft.businessId);

  return NextResponse.json(newDraft);
}
```

---

## Client Usage Examples

### React Component (Global)
```typescript
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{data.metrics[0].value} drafts</div>;
}
```

### React Component (Business-Scoped)
```typescript
interface Props {
  businessId: string;
}

export default function BusinessDashboard({ businessId }: Props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/dashboard?businessId=${businessId}`)
      .then(res => res.json())
      .then(setData);
  }, [businessId]);

  return <div>{data?.metrics[0].value} drafts</div>;
}
```

### cURL Examples
```bash
# Global dashboard
curl http://localhost:3000/api/dashboard

# Business-scoped (query param)
curl "http://localhost:3000/api/dashboard?businessId=acme-corp"

# Business-scoped (header)
curl -H "X-Business-Id: acme-corp" http://localhost:3000/api/dashboard
```

---

## Environment Setup

### Required
```env
DATABASE_URL=postgresql://...
```

### Optional (Redis)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret
```

If Redis is not configured or unavailable, the API gracefully uses in-memory caching.

---

## Performance Notes

- **Parallel Queries**: All 6 Prisma queries run concurrently via `Promise.all()`
- **Selective Includes**: Only fetch required fields (e.g., `{ select: { name: true } }`)
- **TTL**: 30 seconds keeps data fresh while reducing database load
- **Multi-Database Support**: Works with PostgreSQL, MySQL, and SQLite

---

## Troubleshooting

### Cache Not Updating?
Check if Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

Manually invalidate:
```typescript
await invalidateDashboardCache(businessId);
```

### Slow Queries?
- Ensure database indexes on `businessId`, `status`, `isActive`
- Consider increasing TTL if data churn is low
- Monitor Prisma query times in logs

### Redis Errors?
Look for "Redis read failed" or "Failed to write dashboard cache to Redis" in logs. The API continues working with in-memory cache as fallback.

---

## File Structure

```
lib/
  cache.ts                 ← In-memory TTL cache (shared utility)
  dashboard-cache.ts       ← Dashboard-specific cache helpers (this file)
  redis.ts                 ← Redis client setup
  prisma.ts                ← Prisma client setup
app/
  api/
    dashboard/
      route.ts             ← Main API endpoint (scoped, dual-cache)
```

---

## Migration Checklist

When deploying this to production:

- [ ] Ensure Redis is available (or accept in-memory-only caching)
- [ ] Set `DATABASE_URL` environment variable
- [ ] Test with `?businessId=...` query param on multiple tenants
- [ ] Verify cache invalidation logic is wired in content creation APIs
- [ ] Monitor dashboard API response times and cache hit rates
- [ ] Set up alerts if Redis becomes unavailable
- [ ] Document `X-Business-Id` header requirement for internal services

---

## API Contract (TypeScript)

```typescript
interface DashboardData {
  metrics: Array<{
    label: string;
    value: string;
    change: string;
  }>;
  drafts: Array<{
    title: string;
    status: string; // 'pending_review', 'approved', 'scheduled', etc.
    date: string; // ISO 8601
    platforms: string[]; // Platform enum names
    author: string | null;
  }>;
  workflows: Array<{
    draftId: string;
    title: string;
    business: string | null;
    requestedBy: string | null;
    createdAt: string | undefined;
    status: string;
  }>;
  accounts: Array<{
    id: string;
    name: string;
    platform: string; // 'INSTAGRAM', 'TWITTER', 'LINKEDIN', etc.
    avatar: string | null;
    active: boolean;
  }>;
}
```
