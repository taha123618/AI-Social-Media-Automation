---
name: mobile-app-development
description: Use this skill for developing, testing, and maintaining the React Native / Expo mobile application under mobile-app/, including Expo Router, TanStack Query, Zustand, FlashList, and Next.js backend API integration.
---

# Mobile App Development Skill (Expo SDK 57 & React Native 0.86)

You are operating as a Senior Mobile Engineer specializing in React Native, Expo SDK 57, Expo Router, and high-performance cross-platform architectures for the SocialAI companion mobile app located in [`mobile-app/`](file:///Users/taha/projects/ai_social_media_automation/mobile-app).

## Technology Stack

- **Framework**: Expo SDK 57 (`~57.0.21`), React Native 0.86.3, React 19.2.3
- **Routing & Navigation**: Expo Router `~57.0.20` (File-based navigation in `src/app/`)
- **Server State & Caching**: TanStack React Query `^5.102.8`
- **Client State Management**: Zustand `^5.0.15`
- **High-Performance Lists**: `@shopify/flash-list` `^2.3.2`
- **Animations & Gestures**: `react-native-reanimated` `4.5.1`, `react-native-gesture-handler` `~2.32.0`
- **Storage & Network**: `@react-native-async-storage/async-storage` `^3.1.1`, `axios` `^1.20.0`, `expo-network` `^57.0.1`
- **UI & System**: Expo Symbols (`expo-symbols`), Expo Glass Effect (`expo-glass-effect`), Expo Status Bar, Safe Area Context
- **TypeScript**: TypeScript `~6.0.3`

---

## Directory Structure (`mobile-app/`)

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
│   │   │   ├── reset-password.tsx   # Password reset with token
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
├── scripts/                         # Reset project & maintenance utilities
├── .env                             # Active local environment variables
├── .env.example                     # Environment template
├── app.json                         # Expo configuration (CNG plugins, bundle IDs)
└── package.json                     # Mobile dependencies and run scripts
```

---

## Developer Commands

Run from the `mobile-app/` directory:

```bash
cd mobile-app

# Start the Expo development server (Metro bundler)
bunx expo start
# Or using npm
npx expo start

# Platform-specific launchers
bunx expo start --ios        # Launch in iOS Simulator
bunx expo start --android    # Launch in Android Emulator
bunx expo start --web        # Launch in Web Browser

# Typechecking and testing
npx tsc --noEmit             # TypeScript typecheck (0 errors)
bun test                     # Run mobile test suites (40 tests)
bunx expo lint               # Expo ESLint runner

# Package management (ALWAYS use expo install to resolve SDK-compatible versions)
bunx expo install <package>
bunx expo install --fix      # Auto-reconcile mismatched SDK dependency versions
bunx expo-doctor             # Diagnose health of dependencies and configuration
```

---

## Core Development Guidelines

### 1. File-Based Routing with Expo Router
- All screens live inside `src/app/` categorized cleanly by route groups: `(auth)`, `(tabs)`, and `(user)`.
- Root `_layout.tsx` mounts the global `QueryClientProvider`, `ThemeProvider`, `AnimatedSplashOverlay`, `OfflineBanner`, and slide-over `AppSidebar`.
- Domain features reside in `(user)/` with their own stack navigator `src/app/(user)/_layout.tsx`.
- Never duplicate routes across root and `(user)/`. Keep all user domain modules strictly consolidated in `(user)/`.
- Use `router.push('/target')`, `router.replace()`, or `<Link href="/target">` from `expo-router` for type-safe navigation.

### 2. Direct Backend API Architecture
The mobile app communicates with the Next.js SaaS backend directly through `src/lib/backend.ts` (`backendApi`):
- Multi-tenancy headers (`x-business-id` and `Authorization: Bearer <token>`) are automatically attached via `buildHeaders()`.
- Server data queries wrap `backendApi` in TanStack Query hooks under `src/hooks/queries/`.
- Optimistic actions and updates wrap `backendApi` in TanStack Mutation hooks under `src/hooks/mutations/`.
- When `EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true`, the app provides graceful fallback data if the local Next.js server is unreachable.

### 3. State Management & Multi-Tenancy
- **Zustand Stores**:
  - `auth.store.ts`: Session tokens, user profiles, biometric authentication toggles, and appearance theme modes (light/dark/system).
  - `workspace.store.ts`: Active workspace state, tenant switching, and workspace creation.
  - `sidebar.store.ts`: Global slide-over drawer drawer state (`isOpen`, `open()`, `close()`, `toggle()`).
- **Persistent Storage**: `@react-native-async-storage/async-storage` for local token and preference persistence.

### 4. Continuous Native Generation (CNG) & Native Directories
- **Never edit or commit `ios/` or `android/` folders manually**. They are generated dynamically via Prebuild / CNG.
- Configure app icons, splash screens, permissions, bundle IDs, and deep links in `mobile-app/app.json`.
- Add native capabilities via Expo Config Plugins in `app.json`.

### 5. High-Performance Lists
- For feeds, post lists, or notification logs, use `@shopify/flash-list` rather than standard `FlatList`.
- Always provide `estimatedItemSize` to ensure butter-smooth 60fps/120fps scrolling.

### 6. Theme & Responsive Design
- Leverage `useTheme()` and `useColorScheme()` from `src/hooks/use-theme.ts` for automated light/dark mode adaptation.
- Use `ThemedText`, `ThemedView`, and `GlassCard` primitives to ensure consistent visual aesthetics across platforms.
- Use `lucide-react-native` vector icons via `src/components/icons.tsx`.
- Wrap touchable elements with `HitSlop` (minimum 44x44 points) to adhere to iOS and Android accessibility guidelines.
