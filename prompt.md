# Frontend UI Upgrade — Master Specification & Implementation Prompt

> **Topic:** Frontend UI Upgrade  
> **Target Frameworks:** Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, Recharts, Lucide Icons.  
> **Theme Accents:** Electric Violet (`oklch(0.58 0.23 275)` / `oklch(0.65 0.22 275)`) & Deep Indigo (`oklch(0.55 0.22 260)`).

---

## 1. System Overview & Objectives

You are tasked with executing a comprehensive, enterprise-grade **Frontend UI Upgrade** across a Next.js 16 App Router full-stack SaaS platform. The goal is to transform the application into a world-class, modern, intelligent, and performance-optimized experience adhering strictly to the **Modern Premium SaaS Design System**.

### Primary Deliverables:
1. **Design System & Token Architecture**: Unified global OKLCH color palette, dark-first layered backgrounds, Electric Violet accents, and an intentional radius scale.
2. **Identical Layout Shells**: Exact structural grid parity between Admin (`app/(admin)/*`) and User (`app/(user)/*`) routes (`w-64` sidebar, `h-16` command header, `p-6 bg-muted/40 min-h-[calc(100vh-4rem)]` container).
3. **Workspace Switcher & Multi-Tenancy Navigation**: Tenant selector integrated into the sidebar footer with animated transition overlays and React Query cache synchronization.
4. **AI Creative Studio Hub (`/studio`)**: Unified tabbed multimodal interface uniting AI Image Studio, AI Video Studio, and the Media Gallery with URL query persistence (`?tab=images|videos|gallery`).
5. **Resource Quota Telemetry**: Integrated `UsageLimitIndicator` components on user dashboards showing live plan capacity (`ai_posts`, `ai_articles`, `brand_voice_profiles`) with threshold warnings and 1-click upgrades.
6. **Motion & Interaction Polish**: Clean Framer Motion physics (`[0.16, 1, 0.3, 1]` cubic-bezier), non-blocking entrances, and removal of any DOM-mutating or jittery animation patterns on data tables and counters.

---

## 2. Core Design Tokens (`app/globals.css`)

Ensure the global CSS configuration strictly implements the following variables:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 258 90% 66%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 220 14% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 258 90% 66%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 258 90% 66%;
    --radius: 0.75rem;

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
    --background: 225 20% 7%;
    --foreground: 0 0% 98%;
    --card: 225 18% 10%;
    --card-foreground: 0 0% 98%;
    --popover: 225 18% 12%;
    --popover-foreground: 0 0% 98%;
    --primary: 258 90% 66%;
    --primary-foreground: 0 0% 100%;
    --secondary: 225 14% 16%;
    --secondary-foreground: 0 0% 98%;
    --muted: 225 14% 16%;
    --muted-foreground: 220 10% 65%;
    --accent: 230 75% 62%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 225 14% 20%;
    --input: 225 14% 20%;
    --ring: 258 90% 66%;
    --radius: 0.75rem;

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

---

## 3. Border Radius & Component Hierarchy Rules

Apply border radius strictly based on functional component scale:

1. **`rounded-md` (6px)**:
   - Compact status badges, table tags, dropdown item hover states.
2. **`rounded-lg` (8px)**:
   - Interactive buttons (`Button`), form inputs (`Input`), dropdown triggers (`SelectTrigger`), tabs, icon containers.
3. **`rounded-xl` (12px)**:
   - Content cards (`Card`), modal dialogs (`DialogContent`), data table containers, metric panels.
4. **`rounded-2xl` (16px)**:
   - Hero preview frames, onboarding wizard step containers, auth card wrappers.
5. **`rounded-full` (9999px)**:
   - User profile avatars, live status pulse dots, pill badges.
6. **`font-mono` Usage**:
   - Monospace font is strictly reserved for quantitative metrics, KPI values, currency amounts, quotas (`used / limit`), timestamps, and UUIDs.

---

## 4. Layout Shell Parity (`layout.tsx`)

Both User and Admin dashboard layouts must share the exact same structural grid:

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

### Key Layout Specifications:
- **Sidebar Width**: `w-64` (256px), collapsible to icon mode (`collapsible="icon"`).
- **Navbar Height**: `h-16` (64px), sticky top header (`bg-background/80 backdrop-blur-md`), dynamic breadcrumbs, command search bar, and `ModeToggle`.
- **Main Container**: `p-6 bg-muted/40 min-h-[calc(100vh-4rem)]`.

---

## 5. User Sidebar Navigation (`user-sidebar.tsx`)

Organize application routes into 5 categorized sections with status badges and an embedded workspace switcher in the footer:

```text
Overview:
  - Dashboard (/dashboard)
  - Analytics (/analytics)

AI Generation & Media:
  - Creative Studio (/studio, badge: "Hub")
  - AI Blog Writer (/blog, badge: "AI")
  - Contents Library (/contents)
  - Posts Feed (/posts)

Autonomous Strategy:
  - Workflows (/workflows, badge: "Swarm")
  - Competitors (/competitors, badge: "AI")
  - Local Trends (/trends, badge: "AI")
  - Brand Knowledge (/knowledge, badge: "RAG")

Publishing & Reach:
  - Ad Campaigns (/ad-campaigns, badge: "Ads")
  - Engagement (/engagement, badge: "AI")
  - Calendar (/schedule)
  - Post Schedule (/post-schedule)
  - Social Accounts (/social/accounts)
  - Multi-Location (/multi-location, badge: "Pro")
  - Reviews (/reviews)

Workspace & Team:
  - Team Members (/team)
  - Settings (/settings)

Footer:
  - WorkspaceSwitcher (interactive dropdown with active tenant dot)
  - Sign Out Button
```

---

## 6. AI Creative Studio (`app/(user)/studio/page.tsx`)

Create the unified **AI Creative Studio** uniting images, videos, and media library:

```tsx
import { StudioTabs } from "./_components/studio-tabs";

export default async function StudioPage() {
  const businessId = (await getActiveWorkspaceId()) || "";
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Creative Studio</h1>
          <p className="text-sm text-muted-foreground">Generate high-resolution social imagery, cinematic video reels, and manage your cloud media library.</p>
        </div>
      </div>
      <StudioTabs businessId={businessId} userId={session?.user?.id || ""} />
    </div>
  );
}
```

### Tab Configuration:
- **`images`**: AI Image Studio (Flux Pro text-to-image synthesis, multi-aspect-ratio outputs, style presets).
- **`videos`**: AI Video Studio (Cinematic Runway / Luma video generation with pgvector brand context grounding).
- **`gallery`**: Media Library & Gallery (Unified repository of all cloud-rendered images and video reels with search and filtering).
- **State Sync**: Syncs with URL query parameter (`?tab=images|videos|gallery`) and renders transitions with `<AnimatePresence mode="wait">`.

---

## 7. Resource Quota Telemetry (`UsageLimitIndicator`)

Incorporate live billing capacity meters directly into the User Dashboard:

```tsx
<Card className="rounded-xl border border-border bg-card shadow-xs">
  <CardHeader>
    <CardTitle className="text-base font-bold text-foreground">Resource Quota Telemetry</CardTitle>
    <CardDescription className="text-xs text-muted-foreground">Live billing cycle capacity and feature consumption meters.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UsageLimitIndicator
        feature="ai_posts"
        label="Monthly AI Posts"
        used={postsUsage?.used || 0}
        limit={postsUsage?.limit ?? 5}
      />
      <UsageLimitIndicator
        feature="ai_articles"
        label="AI Blog Articles"
        used={articlesUsage?.used || 0}
        limit={articlesUsage?.limit ?? 1}
      />
      <UsageLimitIndicator
        feature="brand_voice_profiles"
        label="Brand Voice Profiles"
        used={brandVoiceUsage?.used || 0}
        limit={brandVoiceUsage?.limit ?? 1}
      />
    </div>
  </CardContent>
</Card>
```

### Visual Thresholds:
- `< 80% used`: Electric Violet fill bar (`bg-primary`).
- `>= 80% used`: Amber warning bar (`bg-amber-500`).
- `>= 100% capacity`: Destructive red bar (`bg-destructive`) with inline "Quota exhausted" alert and upgrade action.
- `limit === -1`: Renders "Unlimited" badge for Pro/Enterprise accounts.

---

## 8. Motion & Performance Engineering

1. **Non-Blocking Entrances**:
   - Use Framer Motion with subtle initial translations (`y: 8px -> 0px` or `y: 12px -> 0px`) and short durations (`0.2s - 0.3s`).
   - Never block user interaction or focus with lengthy animation timelines.
2. **Zero Table Layout Shifts**:
   - Ensure data tables and system logs render immediately without staggered `gsap.from` animations that jump or flash on search, pagination, or tab switches.
3. **No Numerical Mutation Glitches**:
   - Never use GSAP `textContent: 0` tweens on numeric stats or formatted strings to prevent hydration mismatches and text corruption.
4. **Hydration Guards**:
   - Wrap interactive portal overlays or dynamic skeletons with `useHasHydrated()` and `suppressHydrationWarning`.

---

## 9. Verification Commands

Always verify the integrity of the frontend upgrade using:

```bash
# Verify TypeScript compile integrity with 8GB heap memory allocation
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --noEmit

# Execute unit and integration tests
bun test
```
