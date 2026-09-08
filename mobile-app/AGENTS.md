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
npx tsc --noEmit             # TypeScript type check (run before finishing any task)
bunx expo lint               # Expo ESLint runner
bunx expo install <package>  # Install SDK-compatible packages
bunx expo install --fix      # Auto-fix mismatched package versions
bunx expo-doctor             # Diagnose dependency and configuration health
```

---

## 3. Navigation & Routing (Expo Router)

- Routes reside strictly inside `src/app/`. Every file there defines a route or layout.
- Use `_layout.tsx` for shared navigators (Tabs, Stack, Header) and global providers.
- Keep non-route UI components, utilities, and hooks in `src/components/`, `src/hooks/`, and `src/constants/`.
- Import navigation hooks exclusively from `expo-router` (`useRouter`, `useLocalSearchParams`, `Link`).

---

## 4. Backend Integration & Data Fetching

- The mobile app connects to the Next.js SaaS backend via `EXPO_PUBLIC_API_URL` (defined in `.env`).
- In local development:
  - iOS Simulator uses `http://localhost:3000`
  - Android Emulator uses `http://10.0.2.2:3000`
  - Physical devices use your computer's LAN IP (`http://192.168.x.x:3000`)
- When `EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true`, components should gracefully display fallback mock data when the local backend server is offline or unreachable.
- Use `@tanstack/react-query` for all server data caching, invalidation, and mutations.
- Use `zustand` for lightweight local UI and session state.

---

## 5. Rules & Guardrails

- **Continuous Native Generation (CNG)**: Never manually edit or create `ios/` or `android/` folders. Configure all native behavior in `app.json` via Expo config plugins.
- **High-Performance Lists**: Use `@shopify/flash-list` with `estimatedItemSize` instead of standard `FlatList` for feeds and queues.
- **Themed UI**: Leverage `useTheme()` from `src/hooks/use-theme.ts` and use `ThemedText` and `ThemedView` primitives to support dynamic dark and light mode.
- **Pre-Completion Checks**: Always run `npx tsc --noEmit` and `bunx expo lint` before completing any mobile task.
