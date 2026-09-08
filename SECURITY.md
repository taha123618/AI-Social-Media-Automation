# Security Policy

## 🛡️ Supported Versions

The following versions of the AI Social Media Automation platform currently receive security updates and patches:

| Version | Supported          | Security Patch Cadence |
| ------- | ------------------ | ---------------------- |
| 0.1.x   | :white_check_mark: | Active (Immediate)     |
| < 0.1.0 | :x:                | Deprecated             |

---

## 🔒 Reporting a Vulnerability

We take the security of our dual-engine SaaS application, multi-tenant data stores, and user workloads extremely seriously. If you discover a security vulnerability, we appreciate your responsible disclosure.

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, report vulnerabilities privately by emailing:
📧 **security@example.com**

Please include in your report:
1. **Summary**: Description of the vulnerability and its potential impact.
2. **Steps to Reproduce**: Detailed proof of concept or reproduction steps.
3. **Affected Components**: File paths, routes, or API endpoints.
4. **Suggested Remediation**: (Optional) Proposed patch or configuration fix.

### Response SLA & Timelines

- **Initial Response & Acknowledgment**: Within **24 hours**.
- **Triage & Severity Classification**: Within **48 hours**.
- **Patch Release & Security Advisory**: Within **7 days** for Critical/High vulnerabilities.

---

## 🛡️ Core Security Architecture & Standards

1. **Multi-Tenant Scoping**: All Prisma database queries must enforce `businessId` filtering to guarantee tenant isolation.
2. **Authentication & Password Hashing**: Powered by Better-Auth with bcrypt (12 rounds), minimum 8-character password enforcement, and generic error responses to prevent account enumeration.
3. **Two-Factor Authentication (2FA)**: Cryptographic 6-digit numeric OTPs generated with `crypto.randomInt`, stored with a 2-minute expiration, 60-second rate-limited resend cooldowns, and direct SMTP email delivery.
4. **Perimeter Gateway Defense**: Next.js edge proxy (`proxy.ts`) enforces **Deny by Default** on all `/api/*` endpoints. Any unlisted API route requires a verified user session or dedicated admin token.
5. **SSRF Defense**: External resource fetching requires `SecurityService.validateSafeUrl` validation to block private IP CIDRs, IPv6 loopback, internal cluster hostnames, and Cloud Metadata (IMDS `169.254.169.254`).
6. **File Upload Hardening**: S3 uploads require binary magic byte verification (`SecurityService.validateMagicBytes`) and path traversal sanitization (`SecurityService.sanitizeFilename`).
7. **Admin Cryptography**: Production environments strictly disallow fallback secrets for `ADMIN_JWT_SECRET` (minimum 32-character requirement enforced by `getAdminJwtSecret()`).
8. **Transport & HTTP Headers**: `HSTS` (1 year), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
9. **Automated Cybersecurity Regression Testing**: Verified continuously via `lib/__tests__/cybersecurity-regression.test.ts`.
10. **Continuous DevSecOps**: Automated Trivy container/filesystem scanning and TruffleHog secrets detection on every pull request.
