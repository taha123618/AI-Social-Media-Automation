## 📌 Pull Request Description

### Summary of Changes
<!-- Provide a clear, concise summary of what changes are introduced by this PR and why. -->

### Related Issue
<!-- Link the issue this PR addresses (e.g. Fixes #123, Closes #456) -->
Closes #

### Type of Change
- [ ] 🚀 New Feature (non-breaking change adding functionality)
- [ ] 🐛 Bug Fix (non-breaking fix for an unexpected issue)
- [ ] 🎨 UI/UX & Design System (Tailwind CSS v4, Radix, dark mode tokens)
- [ ] 🤖 AI Agent / Multi-Agent Workflow (`services/ai/*`)
- [ ] 🗄️ Database & Schema Migration (Prisma models, pgvector)
- [ ] ⚡ Background Workers & Queues (BullMQ / Redis)
- [ ] 🔒 Cybersecurity & Hardening (SSRF, tenant isolation, auth guards)
- [ ] ⚡ Performance & Optimization
- [ ] 📖 Documentation Update

---

## 🧪 Testing & Verification Checklist

Before submitting this PR, please verify all commands locally:

- [ ] **Type Integrity**: `node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit` (Exits 0 with 0 errors)
- [ ] **Linter Check**: `npm run lint` (0 ESLint errors and 0 warnings)
- [ ] **Automated Test Suites**: `npm test` (All 58 test suites / 281 tests passing)
- [ ] **Production Build**: `npm run build` (Next.js 16 standalone compilation succeeds)
- [ ] **Agent Skills Sync**: `npm run skills:sync` (Executed if `.agents/skills/` was modified)

---

## 🛡️ Security & Multi-Tenancy Self-Check

- [ ] **Tenant Isolation**: All Prisma database queries are scoped by `businessId` or `organizationId`.
- [ ] **SSRF Protection**: All external URLs fetched by agents/services are validated with `SecurityService.validateSafeUrl()`.
- [ ] **Edge Proxy**: Any new `/api/*` endpoints adhere to Deny-by-Default unless explicitly declared public in `proxy.ts`.
- [ ] **Credential Safety**: No hardcoded API keys, passwords, or live tokens are committed.
- [ ] **File Uploads**: Media uploads validate magic bytes (`validateMagicBytes`) and sanitize filenames (`sanitizeFilename`).

---

## 📸 Screenshots or Recordings (if applicable)
<!-- Add UI screenshots or browser recordings for frontend/visual changes -->