# SocialAI Mobile Companion App 📱

The official cross-platform mobile companion for the **SocialAI** enterprise social media automation and AI content management platform. Built on **Expo SDK 57**, **React Native 0.86**, and **React 19**, it provides on-the-go workspace access, publishing queues, AI multi-platform composition, omnichannel social inbox, and real-time performance telemetry.

---

## Architecture & Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime & Core** | Expo SDK | `~57.0.21` | Modern universal mobile runtime |
| **Framework** | React Native | `0.86.3` | Native cross-platform rendering engine |
| **Language & Engine** | React / TypeScript | `19.2.3` / `~6.0.3` | React 19 concurrent features & strict types |
| **Routing** | Expo Router | `~57.0.20` | File-based navigation inside `src/app/` |
| **Data Fetching** | TanStack React Query | `^5.102.8` | Declarative server-state caching & sync with SWR |
| **Client State** | Zustand | `^5.0.15` | Lightweight client, multi-tenant workspace & auth store |
| **High-Performance Lists** | `@shopify/flash-list` | `^2.3.2` | 60/120fps virtualized feed rendering |
| **Motion & Gestures** | Reanimated / Gesture Handler | `4.5.1` / `~2.32.0` | Physics-based 60fps animations & gestures |
| **Haptics** | `expo-haptics` | `~57.0.2` | Tactile feedback on actions, tabs, and alerts |
| **Persistence** | Async Storage | `^3.1.1` | Local token and workspace preference storage |
| **Networking** | Axios (direct) | `^1.20.0` | Direct calls to backend `app/api/*` routes with auth & tenant headers |

---

## Directory & Screen Hierarchy

```text
mobile-app/
├── src/
│   ├── app/                         # Expo Router file-based screens & layouts
│   │   ├── _layout.tsx              # Root Provider (QueryClient, AuthGate, ThemeProvider, OfflineBanner, Global Drawer)
│   │   ├── index.tsx                # Smart Auth Gate & Tenant Redirector
│   │   ├── (auth)/                  # Authentication Route Group
│   │   │   ├── login.tsx            # Email/password login, Face ID/Biometrics & Google OAuth
│   │   │   ├── register.tsx         # Registration with 6-digit cryptographic numeric OTP
│   │   │   ├── forgot-password.tsx  # Password recovery request flow
│   │   │   ├── reset-password.tsx   # Reset password with token
│   │   │   ├── invite.tsx           # Accept workspace team invitation
│   │   │   └── onboarding.tsx       # Multi-step brand onboarding flow
│   │   ├── (tabs)/                  # Main Authenticated 5-Tab Navigation
│   │   │   ├── _layout.tsx          # Custom blur glass tab bar with haptics
│   │   │   ├── index.tsx            # [Tab 1: Executive Dashboard] KPI telemetry & live queues
│   │   │   ├── composer.tsx         # [Tab 2: Quick AI Composer] Multi-platform creator & media picker
│   │   │   ├── calendar.tsx         # [Tab 3: Queue Calendar] Weekly visual timeline & peak planner
│   │   │   ├── inbox.tsx            # [Tab 4: Unified Social Inbox] Omnichannel DMs & AI intent replies
│   │   │   └── analytics.tsx        # [Tab 5: Performance & Quotas] Growth velocity & plan credit meters
│   │   └── (user)/                  # 29 SaaS Domain Modules & Workspaces
│   │       ├── _layout.tsx          # Protected Stack Layout for User Routes
│   │       ├── dashboard/           # Executive KPI Dashboard
│   │       ├── contents/ & posts/   # Content Library & Post Approval Queue
│   │       ├── schedule/            # Visual Calendar Posting Slots
│   │       ├── image/ & videos/     # Diffusion Image & RAG Video Storyboard Studios
│   │       ├── voice/ & carousels/  # ElevenLabs Voice Narrator & Carousel Decks
│   │       ├── blog/                # AI Long-Form SEO Article Writer
│   │       ├── ad-campaigns/        # Paid Ads & ROAS Tracking
│   │       ├── competitors/ & arena/# Competitor Intelligence & Multi-LLM Arena
│   │       ├── listening/ & reviews/# Social Listening Mentions & Review Booster
│   │       ├── trends/ & workflows/ # Viral Trend Radar & Autonomous Agent Pipelines
│   │       ├── multi-location/      # Multi-Branch Franchise Manager
│   │       ├── engagement/          # Smart DM Automation & Trigger Rules
│   │       ├── gallery/ & knowledge/# Cloud Media Assets & Brand DNA Store
│   │       └── settings/            # Profile, Workspaces, Billing, Team, Social, API Keys
│   ├── lib/
│   │   ├── backend.ts               # Single direct bridge to backend app/api/* routes (`backendApi`)
│   │   └── biometrics.ts            # Biometric auth helpers (Face ID / fingerprint)
│   ├── hooks/
│   │   ├── queries/                 # React Query v5 query hooks
│   │   ├── mutations/               # React Query v5 optimistic mutation hooks
│   │   ├── use-theme.ts             # Theme context & color scheme resolution
│   │   └── use-color-scheme.ts      # Native color scheme observer
│   ├── types/
│   │   └── api.ts                   # Centralized TypeScript domain interfaces
│   ├── components/                  # Reusable UI & design system primitives
│   │   ├── icons.tsx                # Native SVG vector icon library (with Fingerprint, Image, Video)
│   │   ├── offline-banner.tsx       # Real-time network status banner (expo-network)
│   │   ├── themed-text.tsx          # Dynamic light/dark typography
│   │   ├── themed-view.tsx          # Adaptive background container
│   │   ├── animated-icon.tsx        # Motion-enhanced splash and logo
│   │   ├── navigation/app-sidebar.tsx # Global slide-over drawer navigation
│   │   └── ui/                      # GlassCard, Button, Badge, OtpInput, Skeleton
│   ├── constants/
│   │   ├── theme.ts                 # Design tokens (Electric Violet palette, Spacing, Radii)
│   │   └── query-keys.ts            # Deterministic React Query cache keys
│   └── stores/
│       ├── auth.store.ts            # Zustand persistent auth store (biometrics, JWT, theme)
│       ├── workspace.store.ts       # Active tenant & businessId selector store
│       └── sidebar.store.ts         # Global drawer visibility store
├── assets/                          # App icons, splash screens, favicon
├── app.json                         # Expo configuration (CNG plugins, bundle IDs)
└── package.json                     # Mobile dependencies and run scripts
```

---

## Direct Backend API Pattern

The mobile app has **no separate API layer**. The legacy `src/api/` wrapper (axios client + per-domain normalizers) was removed — every request goes **directly** to the Next.js backend's `app/api/*` routes over the base URL in `EXPO_PUBLIC_API_URL` (default `http://localhost:3000`).

### Single entry point — `src/lib/backend.ts`

All backend access funnels through the `backendApi` object exported from `src/lib/backend.ts`, which exposes one method per backend route, grouped by domain:

| Domain | Methods | Backend routes |
| :--- | :--- | :--- |
| **Auth** | `login`, `register`, `logout`, `getMe`, `requestPasswordReset` | `/api/auth/*` |
| **Posts** | `getPosts`, `createPost`, `deletePost`, `publishPost`, `generateCopy` | `/api/posts`, `/api/posts/:id/publish`, `/api/generation` |
| **Calendar** | `getCalendarSlots` | `/api/posting-schedule` |
| **Inbox** | `getConversations`, `sendReply` | `/api/dm-automation/*` |
| **Analytics** | `getAnalytics` | `/api/analytics/overview`, `/api/analytics/growth` |
| **Settings** | `getApiKeysAndWebhooks` | `/api/settings/api-keys`, `/api/settings/webhooks` |
| **Workspaces** | `getWorkspaces`, `createWorkspace` | `/api/workspaces` |

### Multi-tenant headers — `buildHeaders()`

Every authenticated call passes `{ headers: await buildHeaders() }`. The helper builds the auth + multi-tenancy headers from live Zustand state:

| Header | Source |
| :--- | :--- |
| `Authorization: Bearer <token>` | `useAuthStore.getState().sessionToken` |
| `x-business-id` | Active workspace from `useWorkspaceStore` (falls back to `useAuthStore`) |

`buildHeaders(tokenOverride)` accepts an explicit token for flows that run before the store is populated (e.g. `initAuth` validating a stored session against `/api/auth/me`). Multi-tenancy is enforced server-side — the client never trusts client-supplied tenant IDs for data access.

### Consumers

| Layer | Usage |
| :--- | :--- |
| **Stores** | `stores/auth.store.ts` & `stores/workspace.store.ts` call `backendApi` directly for login, session validation, logout, and workspace CRUD |
| **Hooks** | React Query hooks under `hooks/queries/` & `hooks/mutations/` wrap `backendApi` methods for dashboard data |
| **Screens** | Screens with one-off calls (e.g. `forgot-password`, `composer` AI copy) import `backendApi` directly |

### Error-handling conventions

- **Read-only fetches** (`getPosts`, `getCalendarSlots`, `getConversations`, `getAnalytics`, `getWorkspaces`, `getApiKeysAndWebhooks`) catch failures internally and return empty arrays / structured zero-states so screens degrade gracefully offline.
- **Mutations** (`login`, `register`, `createWorkspace`, `createPost`, …) throw on failure so callers can surface the error in the UI.
- **`logout`** is best-effort: server-side session invalidation failures are swallowed and local state is always cleared.

### Adding a new endpoint

1. Add a method to `backendApi` in `src/lib/backend.ts` that calls `${API_BASE_URL}/api/<route>` with `{ headers: await buildHeaders() }`.
2. Type request/response payloads in `src/types/api.ts`.
3. Wrap it in a React Query hook or call it from a store — never create a new API wrapper layer.

---

## Quick Start & Local Development

### 1. Prerequisites
- **Node.js**: `>=22.18.0` or **Bun**: `>=1.0.0`
- **Expo Go** app on your physical device, or:
  - **Xcode** (iOS Simulator) on macOS
  - **Android Studio** (Android Emulator)

### 2. Installation
```bash
cd mobile-app
bun install
# or: npm install
```

### 3. Environment Configuration
Verify your backend endpoint in `.env`:
```env
# mobile-app/.env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000/ws
EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true
```

> [!TIP]
> **Instant Mobile Demo Explorer:**
> When `EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true`, the app provides instant access with full mock data for posts, calendar slots, omnichannel DMs, AI caption generation, and analytics even if the web backend is offline.
> Tap **"1-Tap Demo Explorer"** on the login screen to jump directly into the full platform experience.

### 4. Running the Development Server
```bash
# Start the Metro bundler
bunx expo start
# Or with npm
npx expo start

# Direct platform shortcuts:
bunx expo start --ios        # Opens in iOS Simulator
bunx expo start --android    # Opens in Android Emulator
bunx expo start --web        # Opens in Web Browser
```

---

## Quality Gates & Verification

Run these checks prior to submitting changes:

```bash
# 1. Typecheck with TypeScript
npx tsc --noEmit

# 2. Run mobile test suite
bun test
```

---

## Continuous Native Generation (CNG)

The mobile companion adheres to **Continuous Native Generation (CNG)** principles. Never create or edit `ios/` or `android/` folders manually. Configure all native permissions, app icons, splash screens, and plugins in `app.json`.
