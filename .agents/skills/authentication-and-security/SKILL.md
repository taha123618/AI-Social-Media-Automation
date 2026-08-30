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

---

## 2. Testing Security Scenarios

```bash
# Run security test suite
npm test -- lib/__tests__/security.test.ts
npm test -- lib/__tests__/auth-security.test.ts
```
