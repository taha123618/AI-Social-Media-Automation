# Modern Premium SaaS Design System Strategy

> **Project:** AI Social Media & Content Automation Platform ("SocialAI")
> **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion, GSAP + ScrollTrigger, Lenis Smooth Scroll, Recharts, TipTap, Lucide Icons.
> **Accent Palette:** Electric Violet / Indigo — `oklch(0.58 0.23 275)` → `oklch(0.65 0.22 275)`.

---

## 1. Visual Identity & Design Philosophy

### 1.1 Core Aesthetic Principles

The platform communicates **multi-agent autonomy**, **contextual RAG intelligence**, **enterprise reliability**, and **analytical precision** through every design decision.

* **Dark-First, Layered Surfaces**: Deep slate backgrounds (`hsl(225, 20%, 7%)`) with progressively lighter card surfaces (`hsl(225, 18%, 10%)`) and popover layers (`hsl(225, 18%, 12%)`).
* **Controlled Electric Violet Accent**: Primary accent is strictly Electric Violet (`--primary: 258 90% 66%`). Used on CTAs, active nav items, icon containers, badge outlines, and focus rings.
* **Typographic Precision**: Heavy use of `font-extrabold tracking-tight` for headings. `font-mono` reserved exclusively for quantitative telemetry, timestamps, and pricing.
* **Physics Motion**: All interactive elements use spring-based or cubic-bezier easing. Never linear.
* **Ambient Layering**: Subtle mesh-gradient backdrops (`mesh-gradient` CSS class) and blurred glow orbs at zero pointer-events to add depth without visual noise.

### 1.2 What the Interface Communicates

| Signal | Design Expression |
| :--- | :--- |
| **AI Autonomy** | Animated progress bars in hero mockup, "Synthesizing..." real-time status text |
| **Scale & Velocity** | `font-mono` metric counters (`+148.2%`, `24.8K`), dispatch queue timestamps |
| **Brand Safety / RAG** | "pgvector RAG" badge, "Deterministic tone adherence" copy |
| **Enterprise Trust** | Star rating testimonials, Trust props (`14-Day Free Trial`, `Zero Credit Card`) |
| **Premium SaaS** | `whileHover={{ y: -4 }}` card lifts, `backdrop-blur-md` navbar, `shadow-primary/25` CTAs |

### 1.3 Hard Anti-Patterns (Never Do)

* ❌ `--radius: 0rem` or `rounded-none` globally — destroys the balanced premium feel.
* ❌ `gsap.from(".table-row")` on query-invalidated data tables — causes flash-of-content jitter.
* ❌ `textContent: 0` GSAP number tweens on formatted stat strings — corrupts locale formatting.
* ❌ Green/neon-green accents — the palette is Violet/Indigo only. Emerald is allowed exclusively for positive telemetry deltas (`+148.2%`, uptime badges).
* ❌ `Lorem ipsum` in any production component — all content must be domain-specific and real.
* ❌ `ScrollTrigger.registerPlugin()` at module top level — must be wrapped in `typeof window !== "undefined"` guard (see `lib/animations/gsap.ts`).

---

## 2. Color System

### 2.1 CSS Variable Definitions (`app/globals.css`)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* ✅ Primary: Electric Violet */
    --primary: 258 90% 66%;
    --primary-foreground: 0 0% 100%;

    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 220 14% 96%;
    --muted-foreground: 215 16% 47%;

    /* ✅ Accent: Indigo */
    --accent: 258 90% 66%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 258 90% 66%;
    --radius: 0.75rem;

    /* Sidebar tokens */
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
    /* ✅ Deep slate base: hsl(225, 20%, 7%) */
    --background: 225 20% 7%;
    --foreground: 0 0% 98%;

    /* Slightly elevated card surfaces */
    --card: 225 18% 10%;
    --card-foreground: 0 0% 98%;
    --popover: 225 18% 12%;
    --popover-foreground: 0 0% 98%;

    /* ✅ Primary: Electric Violet (same hue, dark-mode luminosity) */
    --primary: 258 90% 66%;
    --primary-foreground: 0 0% 100%;

    --secondary: 225 14% 16%;
    --secondary-foreground: 0 0% 98%;
    --muted: 225 14% 16%;
    --muted-foreground: 220 10% 65%;

    /* ✅ Accent: Deep Indigo */
    --accent: 230 75% 62%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 225 14% 20%;
    --input: 225 14% 20%;
    --ring: 258 90% 66%;
    --radius: 0.75rem;

    /* Sidebar dark tokens */
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

### 2.2 Semantic Color Usage Map

| Token | Usage Contexts | Never Use For |
| :--- | :--- | :--- |
| `text-primary` / `bg-primary` | CTA buttons, active nav items, badge borders, focus rings, progress bars | Body text, neutral icons |
| `text-accent` / `bg-accent` | Secondary badges, feature icon accent, gradient endpoint | Primary CTAs |
| `text-muted-foreground` | Descriptions, subtitles, placeholder text, secondary labels | Headings, metric values |
| `text-foreground` | Primary headings, card titles, stat numbers, body copy | Captions, helpers |
| `emerald-500` / `text-emerald-500` | Positive metric trends (`+148.2%`), system uptime, healthy status | General accent |
| `amber-500` | Quota warnings (>= 80% usage), `os X` traffic light (decorative) | Primary actions |
| `destructive` | Quota exhaustion, delete actions, error states | Neutral warnings |

### 2.3 Gradient Patterns

```css
/* Hero headline gradient — From Violet → Indigo → Purple */
.gradient-headline {
  background: linear-gradient(to right, var(--primary), var(--accent), theme('colors.purple.400'));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Pricing popular badge gradient */
.gradient-popular-badge {
  background: linear-gradient(to right, var(--primary), var(--accent));
}

/* Ambient mesh backdrop (absolute, -z-10, pointer-events-none) */
.mesh-gradient {
  background: radial-gradient(ellipse 60% 50% at 50% -10%, oklch(0.65 0.22 275 / 0.12), transparent),
              radial-gradient(ellipse 40% 35% at 85% 20%, oklch(0.55 0.22 260 / 0.08), transparent);
}
```

---

## 3. Typography System

### 3.1 Font Stack
* **`font-sans`**: `Geist Sans` / `Inter` — UI text, headings, body copy.
* **`font-mono`**: `Geist Mono` / `JetBrains Mono` — Exclusively for quantitative data.

### 3.2 Type Scale

| Role | Tailwind Classes | Applied On |
| :--- | :--- | :--- |
| **Hero H1** | `text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]` | Main homepage headline |
| **Section H2** | `text-3xl md:text-5xl font-extrabold tracking-tight` | Features, Pricing, Workflow section titles |
| **Card H3** | `text-base font-bold text-foreground` | Feature cards, testimonial names, step titles |
| **Page Title** | `text-3xl font-bold tracking-tight text-foreground` | Dashboard, Studio, Settings page headers |
| **Section Header** | `text-base font-bold text-foreground` | Card titles, metric panel labels |
| **Body** | `text-sm text-muted-foreground leading-relaxed` | Descriptions, card subtitles |
| **Caption / Label** | `text-xs text-muted-foreground` | Form labels, secondary meta |
| **Badge** | `text-[10px] font-mono font-semibold uppercase tracking-wider` | Feature badges (`AGENTIC CMS`, `PGVECTOR RAG`) |
| **Metric Counter** | `text-xl font-mono font-bold text-foreground` | `+148.2%`, `24.8K`, `$29` |
| **Micro Badge** | `text-[10px] font-mono text-primary` | Scheduled timestamps (`09:00 AM`) |

### 3.3 `font-mono` Policy
Reserve `font-mono` strictly for:
- Numerical metrics and percentages (`+148.2%`, `24.8K`, `99.9%`)
- Pricing amounts (`$29`, `$99`)
- Quota counters (`3 / 5`, `12 / 50`)
- Timestamps (`09:00 AM`, `2026-08-26`)
- URL / hostname displays (`app.socialai.internal/workspace/fleet`)
- Status codes, UUIDs, and transaction hashes

---

## 4. Border Radius Hierarchy

| Tier | Class | px | Applied On |
| :--- | :--- | :--- | :--- |
| Micro | `rounded-md` | 6 | Dropdown items, status tags, `font-mono` hostname chips, small icon badges |
| Control | `rounded-lg` | 8 | Buttons (`h-11`, `h-12`), form inputs, tab triggers, pricing feature check circles |
| Card | `rounded-xl` | 12 | Feature cards, workflow step cards, testimonial cards, stat panels, dialog content |
| Hero Frame | `rounded-2xl` | 16 | Homepage product preview mockup, auth card containers, onboarding steps |
| Pill | `rounded-full` | 9999 | Announcement pills, plan badges, avatar initials circles, status pulse dots, `Most Popular` badge |

---

## 5. Homepage Architecture (`app/(marketing)/page.tsx`)

The marketing homepage is built from 6 dynamically-imported React components (`next/dynamic`) for optimal code splitting and hydration performance:

```text
layout.tsx (MarketingLayout)
  └── Navbar (sticky, backdrop-blur-md)
  └── <main>
      ├── Hero          — Announcement pill, H1, CTA pair, trust props, product mockup, marquee
      ├── Features      — 6-card 3-column grid with icon, badge, title, description, hover lift
      ├── ToolsShowcase — Platform integrations carousel with visual preview
      ├── UseCases      — Industry vertical use case panels
      ├── Workflow      — 4-step alternating timeline with GSAP scrub progress line
      └── Pricing       — Annual/monthly toggle with 3-tier PricingCard grid
  └── Testimonials  (injected via layout, horizontal scroll strip)
  └── FAQ           (injected via layout, accordion)
  └── CTA           (injected via layout, full-width conversion section)
  └── Footer        (injected via layout)
  └── ScrollToTop
```

### 5.1 Announcement Pill Pattern
```tsx
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 shadow-xs backdrop-blur-md">
  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
  <span className="text-xs font-semibold text-primary tracking-tight">V2.0 is live: Multi-channel AI Scheduling</span>
  <ChevronRight className="w-3.5 h-3.5 text-primary" />
</div>
```

### 5.2 Section Header Pattern (Reused Across All Sections)
```tsx
{/* Eyebrow badge */}
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
  INTELLIGENT CAPABILITIES
</div>
{/* Gradient headline */}
<h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
  Autonomous Engine. <br />
  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
    Compounding Organic Reach.
  </span>
</h2>
```

### 5.3 Product Preview Mockup (Hero)
A `rounded-2xl` browser-chrome frame containing a 12-column mini dashboard:
- **Col 1-3 (Mini Sidebar)**: 4 nav items (one `bg-primary` active, rest `bg-muted/40`).
- **Col 4-9 (Generation Card + Metrics)**: AI Writer card with animated progress bar + `+148.2%` / `24.8K` stat grid in `font-mono`.
- **Col 10-12 (Dispatch Queue)**: 3 timestamped slots in `font-mono` + "DISPATCH QUEUE" button.
- **Floating badge**: `animate={{ y: [0, -6, 0] }}` floating indicator card (Autonomous AI Dispatcher, 5 channels).

---

## 6. Animation Architecture

### 6.1 Animation Libraries & Their Roles

| Library | Role | When to Use |
| :--- | :--- | :--- |
| **Framer Motion** | Component-level micro-interactions and scroll-triggered `whileInView` animations | Feature cards, testimonials, pricing cards, hero fade-in stagger, tab transitions, `AnimatePresence` panel switching |
| **GSAP + ScrollTrigger** | Scroll-scrubbed progress lines and parallax-style visual narrative effects | Workflow section progress line (`scaleY` scrub), complex multi-element scroll choreography |
| **Lenis** | Smooth inertial scrolling for premium scroll feel | Applied globally via `ClientWrapper`, respects `prefers-reduced-motion` |

### 6.2 Centralized Animation Config (`lib/animations/motion.ts`)
```typescript
import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

export const slideUp: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const floatingAnimation = {
  animate: { y: [0, -10, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } },
};
```

### 6.3 GSAP Config (`lib/animations/gsap.ts`)
```typescript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ✅ MUST be guarded — Never call at module top-level
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false, autoSleep: 60 });
  ScrollTrigger.config({ limitCallbacks: true });
}

export const scrollAnimationDefaults = {
  start: "top 85%", end: "bottom 15%",
  toggleActions: "play none none reverse",
};

export const transitionFast = { duration: 0.3, ease: "power2.out" };
export const transitionMedium = { duration: 0.5, ease: "power3.out" };
export const transitionSlow = { duration: 0.8, ease: "power4.out" };

export { gsap, ScrollTrigger };
```

### 6.4 Workflow GSAP Scrub Pattern (`Workflow.tsx`)
```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    // Scroll-scrubbed progress line (scaleY: 0 → 1)
    gsap.fromTo(progressRef.current, { scaleY: 0 }, {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: sectionRef.current, start: "top 20%", end: "bottom 80%", scrub: 1 },
    });

    // Step cards alternate x-entrance from left/right
    gsap.utils.toArray<HTMLElement>(".workflow-step").forEach((step, i) => {
      gsap.fromTo(step, { opacity: 0, x: i % 2 === 0 ? -30 : 30 }, {
        opacity: 1, x: 0, duration: 0.8,
        scrollTrigger: { trigger: step, start: "top 85%", end: "top 55%", scrub: 1 },
      });
    });
  }, sectionRef);
  return () => ctx.revert(); // ✅ Always clean up ctx
}, []);
```

**Rules for GSAP usage:**
1. Always use `gsap.context()` scoped to a `ref` — prevents memory leaks.
2. Always return `ctx.revert()` from `useEffect` cleanup.
3. Never target generic class selectors (`.table-row`, `.card`) that could match sibling components.
4. Scrub animations only on non-critical reading content — not on interactive forms or data tables.

---

## 7. Interactive Component Patterns

### 7.1 Feature Card (`Features.tsx`)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: idx * 0.08, duration: 0.4 }}
  className="group p-6 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
>
  {/* Icon container + monospace badge */}
  <div className="flex items-center justify-between mb-4">
    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
      {feature.icon}
    </div>
    <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
      {feature.badge}
    </span>
  </div>
  {/* Title with group-hover color transition */}
  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
    {feature.title}
  </h3>
  {/* Footer CTA link */}
  <div className="mt-4 pt-4 border-t border-border/60 flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
    <span>Explore Capability</span>
    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
  </div>
</motion.div>
```

### 7.2 PricingCard (`PricingCard.tsx`)
* `whileHover={{ y: -4 }}` spring lift on all cards.
* Popular card: `border-primary ring-1 ring-primary/30 shadow-xl shadow-primary/10` ring treatment.
* `AnimatePresence` on discount badge (`billingCycle === 'year'`) with `y: 5 → 0` entrance.
* Price amount in `text-4xl sm:text-5xl font-extrabold font-mono` tracking-tight.
* Checkout: `fetch('/api/billing/checkout')` → redirect to Stripe URL, else fallback to `/settings/billing`.
* Unauthenticated: redirect to `/register?plan={id}&cycle={monthly|annual}`.

### 7.3 PricingToggle (`PricingToggle.tsx`)
* Spring-animated sliding indicator between Monthly / Annually options.
* Saves 20% badge appears with fade-in on annual selection.

### 7.4 Testimonials (`Testimonials.tsx`)
* Horizontal scrollable strip (`.no-scrollbar`, `overflow-x-auto`).
* Each card: `w-[300px] shrink-0 rounded-xl border border-border/80 bg-card`.
* `whileHover={{ y: -3 }}` micro-lift.
* Avatar: `rounded-full bg-primary/10` with 2-letter `font-mono` initials.

---

## 8. Navigation, Shell & Modals

### 8.1 Marketing Navbar (`components/common/Navbar.tsx`)
* Sticky, `h-16`, `bg-background/80 backdrop-blur-md border-b border-border`.
* Contains: Logo, Nav links (Features, Pricing, Integrations, Blog), CTA (`Get Started → Register`), and `ThemeToggleAnimated` (`ModeToggle`).

### 8.2 App Dashboard Shells (User & Admin)
Both `app/(user)/*` and `app/(admin)/*` share identical structure:
```
SidebarProvider
  └── Sidebar (w-64, collapsible="icon")
      ├── Header: Brand logo + "SocialAI" + subtitle
      ├── Nav Groups: Overview / AI Generation & Media / Autonomous Strategy / Publishing & Reach / Workspace & Team
      └── Footer: WorkspaceSwitcher + Sign Out
  └── SidebarInset
      ├── Navbar (h-16, sticky, backdrop-blur-md, breadcrumb + search + ThemeToggleAnimated)
      └── main (p-4 md:p-6 bg-muted/40 min-h-[calc(100vh-4rem)] pb-bottom-nav md:pb-6)
MobileBottomNav (mobile viewports)
GlobalModals (central modal orchestrator)
```

### 8.3 Animated Theme Transitions (`components/common/ThemeToggleAnimated.tsx`)
* **View Transitions API Integration**: Executes a radial `circle-blur` expansion originating from the top-right when switching to dark mode, and reversing from the bottom-left when switching to light mode.
* **Synchronized State**: Seamlessly coordinates `next-themes` state, `localStorage`, and the document `dark` CSS class.
* **Component Surface**: `rounded-xl border border-border/80 bg-card hover:bg-secondary/60` with spring micro-scaling on hover/active.

### 8.4 Central Global Modals Architecture (`components/common/GlobalModals.tsx`)
Mounted directly within `app/(user)/layout.tsx` to handle cross-page modal triggers without prop drilling:
* **Create Content Modal** (`create-content-modal.tsx`): Single post vs. multi-channel campaign generation with live token/char counters and AI platform chips.
* **Create Workflow Modal** (`create-workflow-modal.tsx`): Visual node pipeline graph with step connectors and execution triggers.
* **Invite Member Modal** (`invite-member-modal.tsx`): Role selection cards (`ADMIN`, `EDITOR`, `VIEWER`) and invite dispatch.
* **Content Details Modal** (`content-details-modal.tsx`): 1-click clipboard copy feedback and platform pills.
* **Schedule Content Modal** (`schedule-content-modal.tsx`): 14-day horizontal date carousel with peak time presets.

---

## 9. Key App-Level Feature UIs

### 9.1 AI Creative Studio (`app/(user)/studio/`)
* Tabbed multimodal hub: `images` → `videos` → `gallery`.
* URL sync: `?tab=images|videos|gallery` via `useSearchParams` / `useRouter`.
* `AnimatePresence mode="wait"` between tab panels.
* Pill tab switcher with active `border-primary` ring glow.

### 9.2 Contents Library (`app/(user)/contents/`)
* Grid of interactive cards with platform icons (Instagram, LinkedIn, X, Facebook, YouTube, TikTok).
* Multi-select checkboxes and floating batch action bar (`bottom-20 md:bottom-8`) for bulk scheduling and deletion.
* Quick inspection preview trigger and platform pill chips.

### 9.3 Post Management (`app/(user)/posts/`)
* Horizontal scrollable filter tabs with dynamic count badges (`All`, `Drafts`, `Scheduled`, `Published`, `Trash`).
* Synchronized BullMQ telemetry trigger with rotating reload animation.
* Floating multi-select action toolbar for batch status changes and deletion.

### 9.4 Workflow Engine (`app/(user)/workflows/`)
* Visual pipeline step chips representing autonomous AI agent executions (`Weather Trigger`, `RAG Context`, `Copy Generation`, `Auto Publish`).
* Operational status switches with optimistic UI feedback.
* Media ingestion dropzone with vision captioning indicators and draft inspection.

### 9.5 Omni Schedule (`app/(user)/schedule/`)
* Interactive calendar grid with today's indicator, month navigation, and engagement prediction chips.
* 30-Day Autopilot toggle in header card.
* Slide-over heatmap drawer (`best-times-panel.tsx`) showing hourly engagement intensity with 1-tap "Apply Slots" sync.

### 9.6 Posting Schedule Queue (`app/(user)/post-schedule/`)
* Chronological queue timeline cards with platform badges and status pills.
* Real-time BullMQ worker and Cron engine telemetry chips.

### 9.7 Multi-Location Hub (`app/(user)/multi-location/`)
* AI Regional Strategist modal for localized tone adaptation.
* Safe GPS branch detection with OpenStreetMap Nominatim reverse geocoding.
* Aggregate metrics cards and 1-click localized copy adaptation dialog.

### 9.8 Social Engagement Unified Inbox (`app/(user)/engagement/`)
* 2-pane direct message stream with unified channel filter buttons (Instagram, Facebook, LinkedIn, X, YouTube).
* Real-time chat dispatcher with instant reply triggers.

### 9.9 Review & Reputation Manager (`app/(user)/reviews/`)
* Autopilot review requests switch for post-checkout inquiries.
* 4 modern stat cards with monospace telemetry.
* AI auto-response generation dialog and 1-click testimonial-to-social-post converter.

### 9.10 Admin Operations & Billing Command Center (`app/(admin)/admin/(dashboard)/billing/`)
* **Executive Metrics Grid**: Real-time MRR, ARR run-rate, paying subscribers count, and tier distribution badges.
* **Filterable Subscription Directory**: Searchable list with plan filters (`All`, `Free`, `Starter`, `Pro`, `Enterprise`) and status pills (`Active`, `Trialing`, `Past Due`, `Canceled`).
* **Manage Override Modal**: 1-click plan upgrading, period extension date picker, usage quota counters reset, and audit trail note capture.
* **Audit Overrides Trail**: Live table documenting which admin changed which subscription, timestamp, previous vs new plan, and reason note.
* **Stripe Webhook Inspector**: Log of webhook events with status pills, payload inspector, and instant retry action.

### 9.11 Reactive Feature Gating (`<FeatureGate />`, `useEntitlements()`)
* **Dynamic Client Gate**: Resolves tenant subscription in real-time without page reload.
* **Tier Lock Badges**: Glassmorphic lock overlay with gradient badge, feature capability bullet list, and instant 1-click Upgrade CTA.
* **Gated Surfaces**:
  - Growth Engine (`/analytics`): Unlocked for `Starter`, `Pro`, and `Enterprise`.
  - Omni-Scheduler (`/schedule`): Unlocked for `Starter`, `Pro`, and `Enterprise`.
  - Team Collaboration (`/team`): Unlocked for `Pro` and `Enterprise`.
  - Developer API Access (`/settings`): Unlocked for `Pro` and `Enterprise`.

### 9.12 Theme Switcher with View Transitions (`components/theme/animated-theme-toggle.tsx`)
* Seamless circular expand view-transition animation when switching light/dark modes.
* Fallback to standard transition if `document.startViewTransition` is not supported.

---

## 10. Performance & Accessibility Standards

### 10.1 Hydration Safety
```tsx
// Dynamic imports for route-level code splitting
const Hero = dynamic(() => import("@/components/home/Hero"));
const Features = dynamic(() => import("@/components/home/Features"));

// Hydration guard for conditional browser-only renders
const hasMounted = useHasHydrated();
if (!hasMounted) return <Skeleton className="h-[X]" />;
```

### 10.2 `prefers-reduced-motion`
Lenis and all GSAP `ScrollTrigger` effects must check:
```typescript
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced) { /* initialize Lenis / GSAP */ }
```

### 10.3 Verification Commands
```bash
# TypeScript integrity (with 8GB heap for large codebases)
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit

# Full test suite
bun test
```

