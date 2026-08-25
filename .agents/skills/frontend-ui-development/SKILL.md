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
  (marketing)/        # High-conversion marketing pages with GSAP + 1-click checkout
  (auth)/             # Authentication forms and onboarding flows
  (user)/             # SaaS business portal (social scheduler, drafts, analytics, billing)
  (admin)/            # Administrative operations dashboard and metrics
```

## Core Frontend Guidelines

### 1) Aesthetic & Visual Excellence
- Prioritize high-end dark mode aesthetics, glassmorphism (`backdrop-blur`), subtle borders (`border-white/10`), and curated color palettes.
- Add micro-animations and interactive hover states on all interactive elements.
- Never use placeholder lorem ipsum in production components; provide real, contextual content.

### 2) Server vs Client Component Separation & Hydration Stability
- Default to **Server Components** for data fetching, static rendering, and SEO metadata.
- Use `'use client'` only when components require browser APIs, state (`useState`), effects (`useEffect`), or event listeners.
- Use `useHasHydrated()` and `suppressHydrationWarning` on dynamic skeletons or portal overlays to prevent React 19 hydration mismatches.

### 3) Billing & Upgrade UX Patterns
- **Usage Indicators**: [`UsageLimitIndicator`](file:///Users/taha/projects/ai_social_media_automation/components/billing/UsageLimitIndicator.tsx) visually communicates monthly quota consumption and turns amber/red as limits approach.
- **1-Click Checkout**: [`PricingCard`](file:///Users/taha/projects/ai_social_media_automation/components/home/PricingCard.tsx) dynamically resolves active workspace ID with `useCurrentBusiness()` and triggers Stripe Checkout sessions directly.
- **Quota Exhaustion Alerts**: Render actionable upgrade prompts on dashboard surfaces whenever free generation quotas are reached.

### 4) Rich Text & Real-Time Sync (TipTap)
- Bind TipTap editor events cleanly with debounced update handlers to ensure smooth typing performance.
