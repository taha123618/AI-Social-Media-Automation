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
│   │   ├── _layout.tsx              # Root stack & tab layout provider
│   │   ├── index.tsx                # Home / Dashboard feed screen
│   │   └── explore.tsx              # Content explorer & discovery screen
│   ├── components/                  # Reusable UI & themed components
│   │   ├── themed-text.tsx          # Typography adhering to light/dark palette
│   │   ├── themed-view.tsx          # Background view with theme support
│   │   ├── animated-icon.tsx        # Motion-enhanced tab & action icons
│   │   ├── app-tabs.tsx             # Bottom navigation tabs for native
│   │   ├── app-tabs.web.tsx         # Platform-specific web navigation
│   │   └── ui/                      # Collapsible, badges, modals
│   ├── constants/
│   │   └── theme.ts                 # Light & dark theme tokens, tints, neutrals
│   ├── hooks/
│   │   ├── use-theme.ts             # Theme context & color scheme resolution
│   │   ├── use-color-scheme.ts      # Native color scheme hook
│   │   └── use-color-scheme.web.ts  # Web-safe color scheme hook
│   └── global.css                   # Global styles
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

# Typechecking and linting
npx tsc --noEmit             # TypeScript typecheck
bunx expo lint               # Expo ESLint runner

# Package management (ALWAYS use expo install to resolve SDK-compatible versions)
bunx expo install <package>
bunx expo install --fix      # Auto-reconcile mismatched SDK dependency versions
bunx expo-doctor             # Diagnose health of dependencies and configuration
```

---

## Core Development Guidelines

### 1. File-Based Routing with Expo Router
- All screens live inside `src/app/`.
- Every `.tsx` file in `src/app/` represents a route (e.g. `src/app/index.tsx` -> `/`, `src/app/explore.tsx` -> `/explore`).
- `_layout.tsx` wraps child screens with navigators (Tabs, Stack, Drawer) and global providers (`QueryClientProvider`, theme contexts).
- Never place non-route components directly inside `src/app/`; place them in `src/components/`.
- Use `router.push('/target')`, `router.replace()`, or `<Link href="/target">` from `expo-router` for type-safe navigation.

### 2. Backend Connectivity & Environment Setup
The mobile app communicates with the Next.js SaaS backend via `EXPO_PUBLIC_API_URL`:
- **iOS Simulator**: `http://localhost:3000`
- **Android Emulator**: `http://10.0.2.2:3000` (maps to host localhost)
- **Physical Devices**: Set to your LAN IP: `http://192.168.x.x:3000`

```env
# mobile-app/.env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000/ws
EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true
```

When `EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true`, the app provides graceful fallback data if the local Next.js server is offline or unreachable during UI testing.

### 3. State Management & Data Fetching
- **Server Data**: Use `@tanstack/react-query` (`useQuery`, `useMutation`). Always define query keys systematically (`['posts', businessId]`, `['analytics', timeRange]`).
- **Client/Session State**: Use Zustand (`zustand`) for user session, active workspace, filter selections, and cached UI states.
- **Persistent Storage**: Use `@react-native-async-storage/async-storage` for auth tokens and user preferences.

### 4. Continuous Native Generation (CNG) & Native Directories
- **Never edit or commit `ios/` or `android/` folders manually**. They are generated dynamically via Prebuild / CNG.
- Configure app icons, splash screens, permissions, bundle IDs, and deep links in `mobile-app/app.json`.
- Add native capabilities via Expo Config Plugins in `app.json`.

### 5. High-Performance Lists
- For feeds, post lists, or notification logs, use `@shopify/flash-list` rather than standard `FlatList`.
- Always provide `estimatedItemSize` to ensure butter-smooth 60fps/120fps scrolling.

### 6. Theme & Responsive Design
- Leverage `useTheme()` and `useColorScheme()` from `src/hooks/use-theme.ts` for automated light/dark mode adaptation.
- Use `ThemedText` and `ThemedView` primitives to ensure consistent visual aesthetics across platforms.
- Wrap touchable elements with `HitSlop` (minimum 44x44 points) to adhere to iOS and Android accessibility guidelines.
