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
| **Networking** | Axios Client | `^1.20.0` | Bearer token injection and offline mock data fallback |

---

## Directory & Screen Hierarchy

```text
mobile-app/
├── src/
│   ├── app/                         # Expo Router file-based screens & layouts
│   │   ├── _layout.tsx              # Root Provider (QueryClient, AuthGate, ThemeProvider, OfflineBanner)
│   │   ├── index.tsx                # Smart Auth Gate & Tenant Redirector
│   │   ├── (auth)/                  # Authentication Route Group
│   │   │   ├── login.tsx            # Email/password login, Face ID/Biometrics & Demo Explorer
│   │   │   ├── register.tsx         # Registration with 6-digit cryptographic numeric OTP
│   │   │   └── forgot-password.tsx  # Password recovery request flow
│   │   ├── (tabs)/                  # Main Authenticated 5-Tab Navigation
│   │   │   ├── _layout.tsx          # Custom blur glass tab bar with haptics
│   │   │   ├── index.tsx            # [Tab 1: Feed & Live Queue] FlashList posts, filter chips
│   │   │   ├── composer.tsx         # [Tab 2: Quick AI Composer] Multi-platform creator & media picker
│   │   │   ├── calendar.tsx         # [Tab 3: Queue Calendar] Weekly visual timeline & peak planner
│   │   │   ├── inbox.tsx            # [Tab 4: Unified Social Inbox] Omnichannel DMs & AI intent replies
│   │   │   └── analytics.tsx        # [Tab 5: Performance & Quotas] Growth velocity & plan credit meters
│   │   ├── studio/                  # AI Creative Studios Modal Group
│   │   │   ├── carousel-preview.tsx # Multi-slide LinkedIn PDF & IG swipe deck viewer
│   │   │   └── voice-narrator.tsx   # Voice cloning script player with reactive audio waveform
│   │   └── settings/                # Account & Workspace Settings
│   │       ├── workspaces.tsx       # Switch or create tenant workspaces (businessId)
│   │       ├── api-keys.tsx         # API key and HMAC webhook monitor
│   │       └── profile.tsx          # User profile, theme switcher (Light/Dark/System), Biometrics toggle
│   ├── api/                         # Modular typed Axios domain services
│   │   ├── client.ts                # Axios instance with auth interceptors & offline fallback
│   │   ├── auth.ts                  # Login, register, logout, OTP verify
│   │   ├── posts.ts                 # Post queries, publishing, agent synthesis
│   │   ├── calendar.ts              # Queue schedule and peak slot planner
│   │   ├── inbox.ts                 # Conversations, DM rules, and smart replies
│   │   ├── analytics.ts             # Performance telemetry and resource quotas
│   │   ├── workspaces.ts            # Multi-tenant workspace switcher and creator
│   │   └── settings.ts              # API keys and HMAC webhook monitors
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
│   │   └── ui/                      # GlassCard, Button, Badge, OtpInput, Skeleton
│   ├── constants/
│   │   ├── theme.ts                 # Design tokens (Electric Violet palette, Spacing, Radii)
│   │   └── query-keys.ts            # Deterministic React Query cache keys
│   └── stores/
│       ├── auth.store.ts            # Zustand persistent auth store (biometrics, JWT, theme)
│       └── workspace.store.ts       # Active tenant & businessId selector store
├── assets/                          # App icons, splash screens, favicon
├── app.json                         # Expo configuration (CNG plugins, bundle IDs)
└── package.json                     # Mobile dependencies and run scripts
```

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

# 2. Run backend test suite (58 suites, 281 tests)
npm test
```

---

## Continuous Native Generation (CNG)

The mobile companion adheres to **Continuous Native Generation (CNG)** principles. Never create or edit `ios/` or `android/` folders manually. Configure all native permissions, app icons, splash screens, and plugins in `app.json`.
