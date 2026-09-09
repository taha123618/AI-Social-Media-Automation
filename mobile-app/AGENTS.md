# Mobile App Agent Guidelines (`mobile-app/`)

You are an expert React Native and Expo SDK 57 mobile engineer working on the **SocialAI Mobile Companion App**. You follow modern mobile engineering patterns, strict TypeScript practices, and prioritize smooth 60/120fps cross-platform performance.

---

## 1. Expo SDK 57 Guidelines — Do Not Trust Outdated Patterns

Expo introduces breaking updates with each SDK release. This project uses **Expo SDK 57**, **React Native 0.86.3**, and **React 19.2.3**.

Before writing code that touches Expo or React Native APIs:
1. Check `package.json` for installed packages and exact versions.
2. For Expo Router docs: https://docs.expo.dev/router/introduction/
3. For Expo SDK 57 reference: https://docs.expo.dev/versions/latest/
4. Always install packages via `bunx expo install <package>` or `npx expo install <package>` to guarantee SDK version compatibility.

---

## 2. Essential Commands

Run these commands from inside `mobile-app/`:

```bash
bunx expo start              # Start Metro bundler
bunx expo start --ios        # Start in iOS simulator
bunx expo start --android    # Start in Android emulator
bunx expo start --web        # Start in web browser
npx tsc --noEmit             # TypeScript type check (0 errors)
bun test                     # Run mobile test suite (40 tests across 3 files)
bunx expo lint               # Expo ESLint runner
bunx expo install <package>  # Install SDK-compatible packages
bunx expo install --fix      # Auto-fix mismatched package versions
bunx expo-doctor             # Diagnose dependency and configuration health
```

---

## 3. Navigation & Routing Structure (Expo Router)

Routes reside strictly inside `src/app/` categorized into 3 core route groups:
1. **`(auth)`**: Authentication & onboarding flows (`login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `invite.tsx`, `onboarding.tsx`).
2. **`(tabs)`**: 5-Tab authenticated navigation (`(tabs)/index.tsx` Executive Dashboard, `composer.tsx`, `calendar.tsx`, `inbox.tsx`, `analytics.tsx`).
3. **`(user)`**: 29 standalone domain modules matching the Next.js SaaS web application:
   - **Studios**: `image`, `videos`, `voice`, `carousels`, `studio`
   - **Intelligence Swarm**: `blog`, `ad-campaigns`, `competitors`, `arena`, `trends`, `listening`, `reviews`, `multi-location`, `engagement`, `dm-automation`
   - **Operations & Assets**: `gallery`, `workflows`, `knowledge`, `contents`, `posts`, `schedule`, `post-schedule`
   - **Tenant & Workspace Settings**: `settings/profile`, `settings/workspaces`, `settings/billing`, `settings/api-keys`, `settings/team`, `settings/social`

- Root `_layout.tsx` mounts global providers (`QueryClientProvider`, `ThemeProvider`, `AnimatedSplashOverlay`, `OfflineBanner`, and `AppSidebar`).
- Never create loose top-level route duplicates outside `(auth)`, `(tabs)`, and `(user)`.

---

## 4. Backend Integration & Data Fetching

- **Direct Backend Client (`src/lib/backend.ts`)**: All requests funnel directly through `backendApi` over the base URL in `EXPO_PUBLIC_API_URL` (default `http://localhost:3000`).
- **Multi-Tenant Headers (`buildHeaders()`)**: Passes `Authorization: Bearer <token>` and `x-business-id` on every authenticated request.
- **Server Data Caching**: Wrap `backendApi` calls in `@tanstack/react-query` hooks under `src/hooks/queries/` and `src/hooks/mutations/`.
- **Client State**:
  - `auth.store.ts`: Authentication tokens, user state, theme mode, and biometrics.
  - `workspace.store.ts`: Active tenant business context (`activeWorkspaceId`, `workspaces`).
  - `sidebar.store.ts`: Global slide-over drawer state (`isOpen`, `open()`, `close()`, `toggle()`).
- **Offline Resilience**: When `EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true`, the app provides full fallback data if the local backend server is unreachable.

---

## 5. UI & Styling Guardrails

- **Continuous Native Generation (CNG)**: Never manually edit or create `ios/` or `android/` folders. Configure all native behavior in `app.json` via Expo config plugins.
- **High-Performance Lists**: Use `@shopify/flash-list` with `estimatedItemSize` instead of standard `FlatList` for feeds and queues.
- **Themed UI & Glassmorphism**: Leverage `useTheme()` from `src/hooks/use-theme.ts` and use `ThemedText`, `ThemedView`, and `GlassCard` primitives to support dynamic dark and light mode.
- **Icons**: Use `lucide-react-native` vector icons through `src/components/icons.tsx`.
- **Pre-Completion Checks**: Always run `npx tsc --noEmit` and `bun test` before completing any mobile task.
