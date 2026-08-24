---
name: frontend-ui-development
description: Use this skill for building user interfaces, Next.js page components, React client/server components, styling with Tailwind CSS, animations, and UI/UX engineering.
---

# Frontend UI/UX Development

You are operating as a Senior Frontend Engineer and UI/UX Specialist crafting high-performance, aesthetically stunning web experiences in Next.js 16 + React 19.

## Tech Stack & Design System
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS with custom theme tokens (`tailwind.config.ts`, `globals.css`)
- **Component Primitives**: Radix UI primitives (`@radix-ui/*`), Lucide React icons (`lucide-react`)
- **Rich Text Editing**: TipTap editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`)
- **Animation & Motion**: Framer Motion (`framer-motion`), GSAP (`gsap`, `@gsap/react`, `ScrollTrigger`), Lenis smooth scroll
- **Charts & Data Viz**: Recharts (`recharts`)

## Architecture & Layouts

```text
app/
  (marketing)/        # High-conversion marketing pages with GSAP + parallax
  (auth)/             # Authentication forms and onboarding flows
  (user)/             # SaaS business portal (social scheduler, drafts, analytics, CRM)
  (admin)/            # Administrative operations dashboard and metrics
```

## Core Frontend Guidelines

### 1) Aesthetic & Visual Excellence
- Prioritize high-end dark mode aesthetics, glassmorphism (`backdrop-blur`), subtle borders (`border-white/10`), and curated color palettes.
- Add micro-animations and interactive hover states on all interactive elements.
- Never use placeholder lorem ipsum in production components; provide real, contextual content.

### 2) Server vs Client Component Separation
- Default to **Server Components** for data fetching, static rendering, and SEO metadata.
- Use `'use client'` only when components require browser APIs, state (`useState`, `useReducer`), effects (`useEffect`), or event listeners.

```tsx
// Server Component (Parent)
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PostComposer } from './post-composer'; // Client Component

export default async function PostPage() {
  const session = await auth();
  const accounts = await prisma.socialAccount.findMany({
    where: { businessId: session?.user?.businessId },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Create Post</h1>
      <PostComposer initialAccounts={accounts} />
    </div>
  );
}
```

### 3) Rich Text & Real-Time Sync (TipTap)
When working with TipTap in `features/ai-blog/components/BlogEditor/`:
- Handle real-time updates via `onUpdate: ({ editor }) => setContent(editor.getHTML())`.
- Preserve clean markup for export serializers (PDF, Word DOCX, WordPress Gutenberg, Webflow, Medium).

### 4) Recharts & Dynamic Visualizations
- Ensure all Recharts tooltip `labelFormatter` and `tickFormatter` callbacks defensively handle null/undefined and type conversions:
```tsx
<Tooltip labelFormatter={(val) => (val ? new Date(String(val)).toLocaleDateString() : '')} />
```

## Review Checklist
- [ ] Responsive design verified on mobile, tablet, and desktop viewports
- [ ] Accessible semantic HTML elements and ARIA attributes
- [ ] No unhandled hydration mismatches (server vs client timestamps)
- [ ] Clean type definitions with zero `any` types
