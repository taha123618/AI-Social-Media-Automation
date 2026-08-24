---
name: api-and-core-backend
description: Use this skill for writing Next.js Route Handlers, middleware, input validation, server actions, backend services, and managing LLM/AI SDK orchestration.
---

# API and Core Backend Development

You are operating as a Senior Backend Engineer responsible for building robust, scalable, and secure APIs and backend services in Next.js 16 (App Router).

## Tech Stack & Architecture
- **Framework**: Next.js 16 (App Router), React 19 Server Actions
- **Route Handlers**: `app/api/**/route.ts`
- **Server Actions**: `app/**/actions.ts` and `features/**/actions.ts`
- **Data Access**: Prisma 7 Client (`app/generated/prisma`)
- **Authentication**: Better Auth (`lib/auth.ts`, `lib/auth-client.ts`)
- **Validation**: Zod (`z.object({...})`)
- **Multi-Tenancy**: Mandatory `businessId` filtering on all tenant data queries

## Core Backend Standards

### 1) Next.js 16 Route Handlers Pattern
All Route Handlers must:
1. Authenticate the request via `auth.api.getSession({ headers: await headers() })`.
2. Validate and sanitize input with Zod schemas.
3. Enforce tenant data isolation via `businessId`.
4. Wrap logic in try/catch and return standardized JSON error responses with appropriate HTTP status codes.

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createDraftSchema = z.object({
  businessId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  platforms: z.array(z.enum(['META', 'LINKEDIN', 'X', 'TIKTOK', 'GOOGLE'])),
  scheduledFor: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createDraftSchema.parse(body);

    // Verify user membership in business
    const membership = await prisma.businessMember.findFirst({
      where: {
        businessId: validatedData.businessId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden: Business access denied' }, { status: 403 });
    }

    const draft = await prisma.contentDraft.create({
      data: {
        businessId: validatedData.businessId,
        content: validatedData.content,
        platforms: validatedData.platforms,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
      },
    });

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[API_CREATE_DRAFT_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2) React 19 Server Actions Pattern
Server actions provide type-safe mutation from client components:

```typescript
'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  businessId: z.string().cuid(),
  mission: z.string().optional(),
  targetAudience: z.string().optional(),
});

export async function updateBusinessProfile(formData: z.infer<typeof updateProfileSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const { businessId, mission, targetAudience } = updateProfileSchema.parse(formData);

  const updated = await prisma.businessProfile.upsert({
    where: { businessId },
    update: { mission, targetAudience },
    create: { businessId, mission, targetAudience },
  });

  revalidatePath(`/dashboard/settings`);
  return { success: true, profile: updated };
}
```

### 3) Multi-Tenancy Rules
- **Never perform unscoped queries** on tenant resources (`ContentDraft`, `BlogArticle`, `SocialAccount`, `Campaign`, etc.).
- Always include `where: { businessId: currentBusinessId }`.
- Ensure multi-tenant queries have composite indexes defined in Prisma schema (`@@index([businessId])`).

## Review Checklist
- [ ] Route Handler or Server Action uses `auth.api.getSession()` authentication
- [ ] Zod schema validates all inputs
- [ ] Multi-tenancy check verifies user permission for `businessId`
- [ ] Structured logging with `SystemLogger` on critical flows
- [ ] Standard HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)
- [ ] Safe JSON parsing and error boundaries
