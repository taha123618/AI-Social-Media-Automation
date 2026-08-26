# Modern Premium SaaS Design System Strategy

> **Project:** AI Social Media & Content Automation Platform  
> **Framework:** Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, Recharts, TipTap, Lucide Icons.  
> **Accent Palette:** Electric Violet (`oklch(0.58 0.23 275)` / `oklch(0.65 0.22 275)`) & Deep Indigo (`oklch(0.55 0.22 260)`).

---

## 1. Visual Identity & Design Philosophy

### 1.1 Core Aesthetic Principles
* **Atmosphere**: Sophisticated, dark-first, intelligent, and performance-engineered. Avoid generic template aesthetics, tactical gaming UI, excessive visual noise, or playful cartoonish elements.
* **Visual Direction**: Multi-layered slate surfaces, intentional OKLCH gradient accents, precise typography, micro-borders, and physics-based motion.
* **Brand Impression**:
  - **Multi-Agent Autonomy**: Communicates high-powered AI fleets operating seamlessly in the background.
  - **Contextual Intelligence**: RAG grounding and vector memory reflected through high-precision telemetry.
  - **Multi-Tenant Isolation**: Clean tenant context switching with zero visual friction.
  - **Enterprise Reliability**: Clean data visualization, zero layout shifts, and predictable interaction models.

### 1.2 Anti-Patterns & Hard Boundaries
* ❌ **No Random Colors or Rainbow Gradients**: Never introduce uncurated hues; adhere strictly to the Electric Violet / Indigo scale.
* ❌ **No Global 0px Border Radius**: Never enforce `--radius: 0rem` or `rounded-none` across standard interactive components.
* ❌ **No Heavy Blocking Animations**: Never use DOM-mutating GSAP timelines or `textContent` number tweens that cause table jumps or hydration conflicts.
* ❌ **No Placeholder Content**: Avoid `Lorem Ipsum` in production surfaces; always render realistic, domain-specific AI social content.
* ❌ **No Harsh Dropshadows**: Use subtle tinted shadows (`shadow-xs`, `shadow-sm shadow-primary/25`) rather than heavy opaque black shadows.

---

## 2. Core Color Palette Tokens (CSS Variables)

The design system is powered by CSS variables mapped through Tailwind CSS and shadcn/ui primitives.

### 2.1 CSS Variables Definition (`app/globals.css`)

```css
@layer base {
  :root {
    /* Base Surfaces & Typography */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;

    /* Card & Modal Surfaces */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Primary Accent: Electric Violet */
    --primary: 258 90% 66%;
    --primary-foreground: 0 0% 100%;

    /* Secondary & Muted Controls */
    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 220 14% 96%;
    --muted-foreground: 215 16% 47%;

    /* Accent: Indigo */
    --accent: 258 90% 66%;
    --accent-foreground: 0 0% 100%;

    /* Functional Status */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & Focus Rings */
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 258 90% 66%;
    --radius: 0.75rem;

    /* Sidebar Variables */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 258 90% 66%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 258 90% 66%;
  }

  .dark {
    /* Base Surfaces & Typography */
    --background: 225 20% 7%;
    --foreground: 0 0% 98%;

    /* Card & Modal Surfaces */
    --card: 225 18% 10%;
    --card-foreground: 0 0% 98%;
    --popover: 225 18% 12%;
    --popover-foreground: 0 0% 98%;

    /* Primary Accent: Luminous Electric Violet */
    --primary: 258 90% 66%;
    --primary-foreground: 0 0% 100%;

    /* Secondary & Muted Controls */
    --secondary: 225 14% 16%;
    --secondary-foreground: 0 0% 98%;
    --muted: 225 14% 16%;
    --muted-foreground: 220 10% 65%;

    /* Accent: Deep Indigo */
    --accent: 230 75% 62%;
    --accent-foreground: 0 0% 100%;

    /* Functional Status */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & Focus Rings */
    --border: 225 14% 20%;
    --input: 225 14% 20%;
    --ring: 258 90% 66%;
    --radius: 0.75rem;

    /* Sidebar Variables */
    --sidebar-background: 225 18% 9%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 258 90% 66%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 225 14% 14%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 225 14% 18%;
    --sidebar-ring: 258 90% 66%;
  }
}
```

### 2.2 OKLCH Modern CSS Color Tokens
* **Primary (Light)**: `oklch(0.58 0.23 275)` — Electric Violet for high-contrast CTA buttons and interactive active states.
* **Primary (Dark)**: `oklch(0.65 0.22 275)` — Luminous Violet for dark-mode contrast readability.
* **Accent**: `oklch(0.55 0.22 260)` — Deep Indigo for secondary badges, subtle gradient overlays, and hover states.
* **Success Telemetry**: `oklch(0.62 0.19 145)` / `emerald-500` for positive metric trends (`+12.5%`) and optimal system uptime.
* **Warning Quota**: `oklch(0.75 0.18 75)` / `amber-500` for quota usage approaching limits (>= 80%).
* **Destructive Exhaustion**: `oklch(0.55 0.22 25)` / `rose-500` / `destructive` for quota exhaustion and deletion triggers.

---

## 3. Border Radius Hierarchy & Surface Geometry

The application uses an intentional 5-tier radius scale to establish consistent visual rhythm across all components:

| Radius Tier | Tailwind Class | Value | Usage & Application |
| :--- | :--- | :--- | :--- |
| **Micro / Compact** | `rounded-md` | `6px` | Compact status tags, dropdown menu items, sub-badges, tooltip popups |
| **Interactive Controls** | `rounded-lg` | `8px` | Action buttons (`Button`), input boxes (`Input`), dropdown triggers (`SelectTrigger`), tab switchers, icon wrappers |
| **Content Panels** | `rounded-xl` | `12px` | Standard cards (`Card`), modal dialogs (`DialogContent`), data table containers, metric panels |
| **Hero / Visual Frames** | `rounded-2xl` | `16px` | Hero image wrappers, product preview mockups, auth card containers, onboarding wizard steps |
| **Pill / Avatars** | `rounded-full` | `9999px` | User profile avatars, live status pulse dots, toggle switch pills |

---

## 4. Typography Scale & Monospace Policy

### 4.1 Font Family Stack
* **Primary UI Font**: `Geist Sans` / `Inter` (`font-sans`) for headings, body copy, descriptions, and labels.
* **Monospace Font**: `Geist Mono` / `JetBrains Mono` (`font-mono`) strictly applied to quantitative telemetry:
  - Metric counters & statistics (e.g. `1,280`, `99.9%`)
  - Resource quota ratios (e.g. `3 / 5`, `12 / 50`)
  - Subscription pricing & ROAS multipliers (e.g. `$29/mo`, `4.8x`)
  - Timestamps, dates, and durations (e.g. `2026-08-26`, `10:45 AM`)
  - UUIDs, transaction hashes, and status tokens

### 4.2 Standard Type Scale
* **Page H1**: `text-3xl font-bold tracking-tight text-foreground` (with `text-sm text-muted-foreground mt-1` subtitle).
* **Section / Card H2**: `text-base font-bold text-foreground` (with `text-xs text-muted-foreground mt-0.5` subtitle).
* **Form Label**: `text-xs font-semibold uppercase tracking-wider text-muted-foreground`.
* **Body / Paragraph**: `text-xs text-muted-foreground leading-relaxed`.
* **Badge / Tag**: `text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md`.

---

## 5. Layout Shell Parity (`app/(user)/*` & `app/(admin)/*`)

The user dashboard and admin operations portal share an identical structural layout shell:

```text
+-------------------------------------------------------------------------------+
| Sidebar (w-64)                     | Top Navbar (h-16, sticky, backdrop-blur) |
| [Brand Logo + Title]               | [SidebarTrigger] [Breadcrumb] [Search]  |
|                                    +------------------------------------------+
| Nav Sections:                      | Main Content Area (p-6, bg-muted/40)    |
| - Overview                         |                                          |
| - AI Generation & Media            | [Page Header + Action CTAs]              |
| - Autonomous Strategy              |                                          |
| - Publishing & Reach               | [KPI Metrics Grid (4 columns)]           |
| - Workspace & Team                 |                                          |
|                                    | [Resource Quota Telemetry (3 columns)]   |
| Footer:                            |                                          |
| - WorkspaceSwitcher (Active Tenant)| [Primary Workspace Grid (7 columns)]     |
| - Sign Out Button                  |                                          |
+-------------------------------------------------------------------------------+
```

### 5.1 Main Layout Specification (`layout.tsx`)
```tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/layout/user-sidebar";
import { UserNavbar } from "@/components/user/layout/user-navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <UserNavbar />
        <main className="flex-1 p-6 bg-muted/40 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

## 6. Core Component Architectural Patterns

### 6.1 Multi-Tenant Workspace Switcher (`WorkspaceSwitcher`)
* **Placement**: Located in the sidebar footer directly above the Sign Out action.
* **Component Features**:
  - Displays current active workspace name and building icon with green/primary active dot.
  - Dropdown menu revealing available user workspaces with checkmark on the active tenant.
  - Full-screen animated overlay (`<AnimatePresence>`) with spinning loader during switching.
  - Invalidates all React Query cache keys and performs `router.refresh()` for immediate server state synchronization.

### 6.2 Resource Quota Telemetry (`UsageLimitIndicator`)
* **Placement**: Prominently featured on the main dashboard (`app/(user)/dashboard/page.tsx`).
* **Visual States**:
  - **Normal Operation**: Electric Violet bar (`bg-primary`) indicating current consumption.
  - **Warning Threshold (>= 80%)**: Amber bar (`bg-amber-500`) alerting user of approaching limits.
  - **Quota Exhausted**: Destructive red bar (`bg-destructive`) with inline alert and direct link to upgrade.
  - **Unlimited Tier**: Displays a bold "Unlimited" badge for Pro/Enterprise accounts.

### 6.3 AI Creative Studio (`app/(user)/studio/page.tsx`)
* **Architecture**: Multimodal creative hub uniting:
  - `images`: AI Image Studio (Flux Pro prompt generation, aspect ratio selector, visual styles).
  - `videos`: AI Video Studio (Cinematic Runway / Luma generation with RAG context injection).
  - `gallery`: Cloud Media Library (Searchable asset gallery with quick-filter tags).
* **State Synchronization**:
  - URL query persistence (`/studio?tab=images|videos|gallery`).
  - Animated pill selector with active border glow and `<AnimatePresence mode="wait">` panel switching.

### 6.4 AI Blog Writer & Rich Text Editor (`features/ai-blog/`)
* **Editor Integration**: TipTap rich text engine with heading enforcement, bulleted lists, and blockquotes.
* **Live SEO Gauge**: Real-time 0-100 score indicator analyzing title length, meta description, and keyword density.
* **Contextual Image Injection**: Automatic Unsplash modal analyzing section headings for visual insertion.
* **Platform Serializers**: Multi-export to WordPress Gutenberg, Medium, Webflow, Shopify, Notion, Word (.docx), and PDF.

---

## 7. Motion Physics & Animation Rules

### 7.1 Motion Tokens & Transition Presets
```typescript
export const MOTION_PRESETS = {
  instant: { duration: 0.15, ease: "easeOut" },
  smooth: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  spring: { type: "spring", stiffness: 300, damping: 25 },
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};
```

### 7.2 Non-Blocking Motion Principles
1. **Zero Input Delay**: Animations must never prevent immediate user typing, button clicks, or dropdown selections.
2. **Zero Layout Shifts on Tables**: Never apply entrance delays or `gsap.from` staggered translations on data tables or logs.
3. **No String Number Morphing**: Avoid `textContent: 0` GSAP numerical mutations that corrupt formatted numbers or cause hydration mismatches.
4. **Hydration Guards**: Dynamic skeletons and portal overlays must utilize `useHasHydrated()` and `suppressHydrationWarning`.

---

## 8. Verification & Quality Assurance Standards

Before approving any UI change, execute:

```bash
# Verify TypeScript integrity with 8GB heap space allocation
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit

# Run full unit and integration test suite
bun test
```
