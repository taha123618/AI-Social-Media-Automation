---
name: frontend-ui-development
description: Use this skill for building user interfaces, Next.js page components, React client/server components, styling with Tailwind CSS, animations, and UI/UX engineering.
---

# Frontend UI/UX Development

You are operating as a Senior Frontend Engineer and UI/UX Specialist crafting high-performance, aesthetically stunning web experiences in Next.js 16 + React 19 following the **Modern Premium SaaS Design System** (`design.md`).

## Tech Stack & Design System
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4 with custom theme tokens (`tailwind.config.ts`, `globals.css`)
- **Theme Accents**: Electric Violet (`oklch(0.58 0.23 275)` / `oklch(0.65 0.22 275)`) & Indigo (`oklch(0.55 0.22 260)`)
- **Theme Switching**: [`ThemeToggleAnimated`](file:///Users/taha/projects/ai_social_media_automation/components/common/ThemeToggleAnimated.tsx) via CSS View Transitions API (`circle-blur` radial expand) synchronized with `next-themes` and `localStorage`
- **Component Primitives**: Radix UI primitives (`@radix-ui/*`), shadcn/ui, Lucide React icons (`lucide-react`)
- **Rich Text Editing**: TipTap editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`)
- **Animation & Motion**: Framer Motion (`framer-motion`) with cubic-bezier easing (`[0.16, 1, 0.3, 1]`) and GSAP ScrollTrigger
- **Charts & Data Viz**: Recharts (`recharts`)

## Architecture & Layouts

```text
app/
  (marketing)/        # High-conversion marketing pages with 1-click checkout & interactive demos
  (auth)/             # Authentication forms and onboarding flows with rounded-2xl glass containers
  (user)/             # User workspace dashboard with centralized GlobalModals orchestrator
  (admin)/            # Administrative operations dashboard, telemetry, and system controls
```

## Core Frontend Guidelines

### 1) Aesthetic & Visual Excellence
- **Design Tokens**: Enforce Electric Violet primary (`bg-primary`, `text-primary`) with subtle border styling (`border-border/80`).
- **Radius Hierarchy**:
  - `rounded-md` (6px): Compact badges, dropdown menu items, small tags.
  - `rounded-lg` (8px): Buttons, text inputs, selects, tab triggers, icon wrappers.
  - `rounded-xl` (12px): Standard cards, dialogs, tables, content panels, tab containers.
  - `rounded-2xl` (16px): Hero visuals, preview mockups, major modal containers, header banners.
  - `rounded-full` (9999px): Avatars, status dots, and pill switches.
- **Monospace Telemetry**: Use `font-mono` exclusively on metrics, price numbers, quota values, IDs, and timestamps.
- **Never use placeholder lorem ipsum**: Provide real, contextual product data.

### 2) Shared Layout Shell Specification
Both User (`app/(user)/*`) and Admin (`app/(admin)/*`) routes maintain structural grids:
- **Sidebar**: `w-64`, collapsible to icon mode (`collapsible="icon"`), sticky header, grouped navigation sections with category labels, and footer with tenant switcher.
- **Navbar**: `h-16`, sticky top header (`bg-background/80 backdrop-blur-md`), dynamic breadcrumbs, resource search, and `ThemeToggleAnimated` (`ModeToggle`).
- **Main Container**: `p-4 md:p-6 bg-muted/40 min-h-[calc(100vh-4rem)] pb-bottom-nav md:pb-6`.
- **Global Modals**: Mount [`GlobalModals`](file:///Users/taha/projects/ai_social_media_automation/components/common/GlobalModals.tsx) centrally inside `app/(user)/layout.tsx` (wrapped by `QueryProvider`).

### 3) Key Component Implementations
- **Central Global Modals ([`GlobalModals`](file:///Users/taha/projects/ai_social_media_automation/components/common/GlobalModals.tsx))**: Global modal orchestrator for `create-content`, `create-workflow`, `invite-member`, `content-details`, and `schedule-content`.
- **Animated Theme Toggle ([`ThemeToggleAnimated`](file:///Users/taha/projects/ai_social_media_automation/components/common/ThemeToggleAnimated.tsx))**: View Transitions API toggle with radial circle-blur expanding from top-right (dark) and bottom-left (light).
- **Contents Library (`/contents`)**: Interactive card grid with platform badges, quick inspection modal, multi-select checkboxes, and floating batch actions bar.
- **Post Management (`/posts`)**: Horizontal scrollable filter tabs with dynamic count badges, real-time BullMQ sync, and floating batch status/deletion bar.
- **Workflow Engine (`/workflows`)**: Visual step pipeline node badges, live execution telemetry chips, operational toggle states, and drag & drop media ingestion dropzone.
- **Omni Schedule (`/schedule`)**: Calendar grid with day cells, today's badge, best times drawer (`best-times-panel.tsx`) with hourly heatmap.
- **Posting Schedule (`/post-schedule`)**: Queue timeline cards with platform badges, BullMQ/Cron engine status pills, and linked workflow chips.
- **Multi-Location Hub (`/multi-location`)**: AI Regional Strategist modal, safe GPS branch detection with reverse geocoding, aggregate metrics cards, and 1-click regional copy adaptation.
- **Social Engagement Unified Inbox (`/engagement`)**: 2-pane direct message stream with channel switcher (Instagram, Facebook, LinkedIn, X, YouTube) and instant reply dispatcher.
- **Review Manager (`/reviews`)**: Autopilot review requests switch, 4 stat cards with monospace telemetry, sentiment indicators, and AI auto-response generation.
- **AI Creative Studio (`/studio`)**: Tabbed hub linking Image Generation, Video Generation, and Media Gallery with URL query sync (`?tab=images|videos|gallery`) and `AnimatePresence`.
- **Workspace Switcher ([`WorkspaceSwitcher`](file:///Users/taha/projects/ai_social_media_automation/components/common/WorkspaceSwitcher.tsx))**: Embedded in sidebar footer, displaying active tenant, animated switching overlay, and query cache invalidation.
- **Resource Quota Telemetry ([`UsageLimitIndicator`](file:///Users/taha/projects/ai_social_media_automation/components/billing/UsageLimitIndicator.tsx))**: Visual progress meters with 80% warning threshold (amber) and exhaustion alert (destructive red) with direct upgrade triggers.
- **Dynamic Feature Gating ([`FeatureGate`](file:///Users/taha/projects/ai_social_media_automation/components/billing/FeatureGate.tsx) & [`useEntitlements`](file:///Users/taha/projects/ai_social_media_automation/hooks/use-entitlements.ts))**: Reactively resolves workspace entitlements from `/api/billing/entitlements` to dynamically unlock features (`scheduling`, `advanced_analytics`, `team_collaboration`, `api_access`) with glassmorphic upgrade prompts for locked tiers.
- **Safe Date Scheduling Popover ([`SchedulingPopover`](file:///Users/taha/projects/ai_social_media_automation/components/social/SchedulingPopover.tsx))**: Safe date parser & formatter with preset peak times (`09:00 AM`, `12:30 PM`, `06:00 PM`, `09:00 PM`) preventing `RangeError` runtime exceptions on unparsed string dates.
- **Admin Billing Command Center (`/admin/billing`)**: 3-tab operational hub with Executive MRR/ARR KPIs, filterable subscription directory with live search, period extension, quota reset, and audit trail note logging.

### 4) Server vs Client Component Separation & Hydration Stability
- Default to **Server Components** for data fetching, static rendering, and SEO metadata.
- Use `'use client'` only when components require browser APIs, state (`useState`), effects (`useEffect`), or event listeners.
- Use `useHasHydrated()` and `suppressHydrationWarning` on dynamic skeletons or portal overlays to prevent React 19 hydration mismatches.

### 5) Motion & Animation Best Practices
- Keep animations lightweight, physics-based, and non-blocking.
- Never use DOM-mutating `gsap.from` animations on data tables or number values that cause layout jitter or hydration conflicts.
