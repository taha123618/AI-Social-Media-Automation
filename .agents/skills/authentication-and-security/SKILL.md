---
name: authentication-and-security
description: Use this skill for implementing authentication, authorization, security measures, and access control across the application.
---

# Authentication and Security

You are operating as a Security Engineer responsible for securing user authentication, multi-tenant authorization, session protection, and API endpoints.

## Authentication Framework
- **Core Library**: `better-auth` with Prisma Adapter (`better-auth/adapters/prisma`)
- **Server Auth Config**: `lib/auth.ts` (`export const auth = betterAuth({...})`)
- **Client Auth Client**: `lib/auth-client.ts` (`createAuthClient({...})` from `better-auth/react`)
- **API Catch-all**: `app/api/auth/[...all]/route.ts`
- **Adapters**: Prisma Adapter connecting to PostgreSQL `User`, `Session`, `Account`, and `Verification` models.
- **Providers**: Email/Password (with bcrypt hashing, 12 rounds), Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
- **Lifecycle Hooks**: Automatic welcome email delivery, default business/workspace provisioning, and audit log generation on user signup.

## Security Architecture

### 1) Role-Based Access Control (RBAC)
User access is partitioned by system roles and organizational permissions:
- **System Roles**: `USER`, `ADMIN`, `SUPER_ADMIN`
- **Business/Organization Roles**: `OWNER`, `ADMIN`, `EDITOR`, `VIEWER`

```typescript
// Checking permission in Server Actions or Route Handlers
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function verifyBusinessAccess(businessId: string, allowedRoles: string[] = ['OWNER', 'ADMIN', 'EDITOR']) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Super admins bypass tenant restrictions
  if (session.user.role === 'SUPER_ADMIN') {
    return session.user;
  }

  const membership = await prisma.businessMember.findFirst({
    where: {
      businessId,
      userId: session.user.id,
      role: { in: allowedRoles as any },
    },
  });

  if (!membership) {
    throw new Error('Forbidden: Insufficient business permissions');
  }

  return session.user;
}
```

### 2) Middleware & Route Protection (`middleware.ts`)
Next.js edge middleware safeguards protected paths:
- `/admin/*` -> Requires `ADMIN` or `SUPER_ADMIN` role
- `/dashboard/*` / `/contents/*` / `/analytics/*` -> Requires valid session
- `/login` / `/register` -> Redirects authenticated users to `/dashboard`

### 3) Multi-Tenancy Data Isolation
- Enforce `businessId` constraints on all Prisma create, read, update, and delete queries.
- Prevent IDOR (Insecure Direct Object Reference) vulnerabilities by verifying resource ownership before mutations.

### 4) Webhook Security & Signature Verification
- Stripe Webhooks: Validate signature via `stripe.webhooks.constructEvent()`.
- Social Webhooks (Meta, TikTok, X, LinkedIn): Verify HMAC SHA-256 signature headers.

### 5) Secrets & Environment Safety
- Never check in `.env` files.
- Store sensitive API keys (OpenAI, Anthropic, AWS, Stripe) in environment variables.
- Mask sensitive tokens in logs using `@mastra/observability` `SensitiveDataFilter` and `SystemLogger`.

## Security Checklist
- [ ] Passwords hashed with bcrypt (salt rounds = 12)
- [ ] `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` configured
- [ ] Multi-tenant isolation verified on every database query
- [ ] API routes protected against CSRF and rate-limited
- [ ] Input validated with strict Zod schemas
- [ ] Error messages do not leak stack traces or internal DB details to clients
