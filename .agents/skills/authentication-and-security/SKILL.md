---
name: authentication-and-security
description: Use this skill for implementing authentication, authorization, security measures, and access control across the application.
---

# Authentication, Authorization and Application Security

You are operating as a Senior Cybersecurity Engineer responsible for multi-tenant isolation, RBAC authorization, authentication flows (Better-Auth), input sanitization, file upload defenses, and OWASP Top 10 mitigation.

## Security Architecture & Core Libraries
- **Authentication Engine**: Better-Auth (`lib/auth.ts`) with bcrypt (12 rounds) and OAuth2 Google linking
- **Security Utilities**: `SecurityService` in [`lib/security.ts`](file:///Users/taha/projects/ai_social_media_automation/lib/security.ts)
- **Multi-Tenant Scoping**: All Prisma queries must include `businessId` filtering
- **Secure File Storage**: S3 presigned URLs with magic byte validation and filename sanitization in [`lib/s3.ts`](file:///Users/taha/projects/ai_social_media_automation/lib/s3.ts)
- **HTTP Security Headers**: HSTS, CSP, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`) in [`next.config.ts`](file:///Users/taha/projects/ai_social_media_automation/next.config.ts)

---

## 1. Secure Coding Standards

### 1.1 Input Sanitization & XSS Defense
```typescript
import { SecurityService } from '@/lib/security';

// Escape HTML special characters
const cleanText = SecurityService.escapeHtml(userInput);

// Sanitize rich HTML markup (strips <script>, javascript: URIs, on* event handlers)
const safeHtml = SecurityService.sanitizeHtml(rawHtml);
```

### 1.2 File Upload & MIME Spoofing Protection
- Always validate binary magic bytes before accepting or uploading files to S3:
```typescript
import { SecurityService } from '@/lib/security';

if (!SecurityService.validateMagicBytes(fileBuffer, mimeType)) {
  throw new Error('File signature mismatch (MIME spoofing detected)');
}

// Generate sanitized safe key
const safeKey = generateS3Key('uploads', file.name);
```

### 1.3 Multi-Tenant Isolation
- Never query tenant data without verifying membership and including `businessId`:
```typescript
const membership = await prisma.businessMember.findFirst({
  where: {
    businessId,
    userId: session.user.id,
    role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
  },
});
if (!membership) {
  throw new Error('Forbidden: Unauthorized tenant access');
}
```

### 1.4 Admin Panel Security & Audit Trails
- Administrative routes (`/admin/*`) require dedicated session verification via `validateAdminSession()` (`lib/admin-auth.ts`).
- All privileged actions (manual billing plan updates, user status toggles, webhook retries) must write an immutable audit trail entry to `AuditLog`:
```typescript
await prisma.auditLog.create({
  data: {
    userId: adminId,
    action: 'ADMIN_OVERRIDE_PLAN',
    entityType: 'SUBSCRIPTION',
    entityId: subscriptionId,
    metadata: { previousPlan, newPlan, reasonNote },
  },
});
```

### 1.5 Server-Side Request Forgery (SSRF) Defense
- When fetching external URLs (e.g. website scrapers, webhooks, RSS feeds), **never** execute raw `fetch()` on unsanitized user inputs.
- Always validate destination hostnames and IP addresses against restricted networks, loopback, and Cloud Instance Metadata (IMDS):
```typescript
import { SecurityService } from '@/lib/security';

const urlValidation = SecurityService.validateSafeUrl(targetUrl);
if (!urlValidation.safe) {
  throw new Error(`SSRF attempt blocked: ${urlValidation.reason}`);
}
```

### 1.6 API Perimeter Defense (Deny by Default)
- `proxy.ts` enforces a **Deny-by-Default** perimeter policy across all `/api/*` endpoints.
- Any API route not explicitly listed in `PUBLIC_PREFIXES` automatically requires a valid user session.
- Never add wildcards or weaken `PUBLIC_PREFIXES` to bypass authentication for tests.

### 1.7 Production Secrets & Admin Cryptography
- Never allow fallback placeholder secrets in production (`lib/admin-auth.ts`).
- Ensure `ADMIN_JWT_SECRET` is at least 32 characters in production environments.
- Always use `getAdminJwtSecret()` to verify admin sessions.

---

## 2. Testing Security Scenarios

```bash
# Run security regression & defensive validation test suites
bun test lib/__tests__/cybersecurity-regression.test.ts
bun test lib/__tests__/security.test.ts
bun test lib/__tests__/auth-security.test.ts
```
