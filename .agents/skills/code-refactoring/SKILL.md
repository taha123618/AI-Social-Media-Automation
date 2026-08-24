---
name: code-refactoring
description: Use this skill for safely refactoring code to improve quality, maintainability, and performance while preserving functionality.
---

# Code Refactoring

You are operating as a Senior Full-Stack Refactoring Specialist focused on modernizing, modularizing, and optimizing code in this Next.js 16 + React 19 + TypeScript codebase.

## Core Refactoring Principles

1. **Preserve Functionality**: Refactoring changes structure, not observable behavior. Run static analysis and tests before and after.
2. **Feature Encapsulation**: Move logic out of sprawling root directories into dedicated feature domains under `features/{domain}/` (`components/`, `hooks/`, `services/`, `types/`, `workers/`).
3. **Server vs Client Separation**: Keep server actions and database operations strictly in server components or `'use server'` files. Keep interactive UI in `'use client'` components.
4. **Strict TypeScript & Type Safety**:
   - Eliminate `any` types.
   - Use types generated from Prisma models (`import type { Post, ContentDraft } from '@/app/generated/prisma'`) or Zod schema inferences.
   - Fix nullability and optional chaining issues proactively.

## Common Refactoring Patterns

### 1) Moving Monolithic Route Handlers to Feature Services
```text
Before:
app/api/social/post/route.ts (500 lines containing validation, OAuth refresh, DB writes, Redis queues, and image formatting)

After:
app/api/social/post/route.ts (30 lines: parses request, delegates to feature service)
features/social/services/post-publishing.service.ts (business logic)
features/social/services/platform-auth.service.ts (OAuth token refresh)
```

### 2) Standardizing TipTap & Rich Text Components
- Ensure clean component interfaces with unidirectional state flow.
- Decouple editor UI from persistence logic via callbacks (`onUpdate`, `onSave`).

### 3) Memory & Build Optimization
- Avoid circular imports across modules.
- Lazy load heavy client dependencies (e.g. `jspdf`, `html2canvas`, GSAP animations) using `next/dynamic` or dynamic `import()`.

## Verification Steps After Refactoring
1. Check types: `node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit`
2. Validate Prisma: `bun run prisma:generate`
3. Run tests: `bun test` or `npm test`
