---
name: frontend-ui-development
description: Use this skill for building user interfaces, Next.js page components, React client/server components, styling with Tailwind CSS, animations, and UI/UX engineering.
---

# Frontend UI/UX Development

You are operating as a Senior Frontend Engineer and UI/UX Specialist crafting high-performance, aesthetically stunning web experiences in Next.js 16 + React 19 following the **Modern Premium SaaS Design System** (`design.md`).

## Tech Stack & Design System
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS with custom theme tokens (`tailwind.config.ts`, `globals.css`)
- **Theme Accents**: Electric Violet (`oklch(0.58 0.23 275)` / `oklch(0.65 0.22 275)`) & Indigo (`oklch(0.55 0.22 260)`)
- **Component Primitives**: Radix UI primitives (`@radix-ui/*`), shadcn/ui, Lucide React icons (`lucide-react`)
- **Rich Text Editing**: TipTap editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`)
- **Animation & Motion**: Framer Motion (`framer-motion`) with cubic-bezier easing (`[0.16, 1, 0.3, 1]`)
- **Charts & Data Viz**: Recharts (`recharts`)

## Architecture & Layouts

```text
app/
  (marketing)/        # High-conversion marketing pages with 1-click checkout & interactive demos
  (auth)/             # Authentication forms and onboarding flows with rounded-2xl glass containers
  (user)/             # User workspace dashboard (Creative Studio, scheduler, drafts, analytics, billing)
  (admin)/            # Administrative operations dashboard, telemetry, and system controls
```

## Core Frontend Guidelines

### 1) Aesthetic & Visual Excellence
- **Design Tokens**: Enforce Electric Violet primary (`bg-primary`, `text-primary`) with subtle border styling (`border-border/80`).
- **Radius Hierarchy**:
  - `rounded-md` (6px): Compact badges, dropdown menu items, small tags.
  - `rounded-lg` (8px): Buttons, text inputs, selects, tab triggers, icon wrappers.
  - `rounded-xl` (12px): Standard cards, dialogs, tables, content panels.
  - `rounded-2xl` (16px): Hero visuals, preview mockups, onboarding wizard containers.
  - `rounded-full` (9999px): Avatars, status dots, and pill switches.
- **Monospace Telemetry**: Use `font-mono` exclusively on metrics, price numbers, quota values, IDs, and timestamps.
- **Never use placeholder lorem ipsum**: Provide real, contextual product data.

### 2) Shared Layout Shell Specification
Both User (`app/(user)/*`) and Admin (`app/(admin)/*`) routes must maintain identical structural grids:
- **Sidebar**: `w-64`, collapsible to icon mode (`collapsible="icon"`), sticky header, grouped navigation sections with category labels, and footer with tenant switcher.
- **Navbar**: `h-16`, sticky top header (`bg-background/80 backdrop-blur-md`), dynamic breadcrumbs, resource search, and `ModeToggle`.
- **Main Container**: `p-6 bg-muted/40 min-h-[calc(100vh-4rem)]`.

### 3) Key Component Implementations
- **AI Creative Studio (`/studio`)**: Tabbed hub linking Image Generation, Video Generation, and Media Gallery with URL query sync (`?tab=images|videos|gallery`) and `AnimatePresence`.
- **Workspace Switcher ([`WorkspaceSwitcher`](file:///Users/taha/projects/ai_social_media_automation/components/common/WorkspaceSwitcher.tsx))**: Embedded in sidebar footer, displaying active tenant, animated switching overlay, and query cache invalidation.
- **Resource Quota Telemetry ([`UsageLimitIndicator`](file:///Users/taha/projects/ai_social_media_automation/components/billing/UsageLimitIndicator.tsx))**: Visual progress meters with 80% warning threshold (amber) and exhaustion alert (destructive red) with direct upgrade triggers.
- **Interactive Pricing Card ([`PricingCard`](file:///Users/taha/projects/ai_social_media_automation/components/home/PricingCard.tsx))**: Dynamic annual/monthly toggle with spring animation and 1-click Stripe Checkout initiation.

### 4) Server vs Client Component Separation & Hydration Stability
- Default to **Server Components** for data fetching, static rendering, and SEO metadata.
- Use `'use client'` only when components require browser APIs, state (`useState`), effects (`useEffect`), or event listeners.
- Use `useHasHydrated()` and `suppressHydrationWarning` on dynamic skeletons or portal overlays to prevent React 19 hydration mismatches.

### 5) Motion & Animation Best Practices
- Keep animations lightweight, physics-based, and non-blocking.
- Never use DOM-mutating `gsap.from` animations on data tables or number values that cause layout jitter or hydration conflicts.
