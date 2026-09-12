# ADR-007: Cross-Platform Mobile Companion with Expo SDK 57 & Direct Backend Client

- **Status**: Accepted
- **Date**: 2026-03-25
- **Drivers**: Mobile Engineering & UX Team

## Context

Enterprise users and agency clients require on-the-go review, push notifications, and 1-tap post approvals. We evaluated hybrid web PWA vs Flutter vs modern React Native with Expo SDK 57.

## Options Considered

1. **Progressive Web App (PWA):**
   - No app store distribution; limited background push notification support on iOS; inferior gesture animations.
2. **Flutter (Dart):**
   - High performance, but requires a separate programming language, non-shared state models, and separate developer skillsets.
3. **Expo SDK 57 with React Native 0.86 & Expo Router:**
   - 100% TypeScript shared domain interfaces (`types/api.ts`).
   - High-performance list virtualization via `@shopify/flash-list` (120 FPS).
   - Continuous Native Generation (CNG) eliminating fragile manual `ios/` and `android/` directory management.

## Decision

We chose **Expo SDK 57 (`~57.0.21`) with React Native 0.86.3 and Expo Router**, using Zustand for client state, TanStack Query for SWR server-state caching, and a direct `backendApi` client (`src/lib/backend.ts`) communicating directly with Next.js App Router endpoints.

## Consequences

- **Positive**: 40 unit/integration tests running via Bun test in $< 500\text{ms}$; 0 manual native code; full feature parity across 29 user domain modules; seamless biometrics and haptic feedback.
- **Negative**: Relies on Expo config plugins for third-party native libraries.

## Compliance

- Developers MUST NOT create or commit manual `ios/` or `android/` directories.
- All backend requests MUST pass through `backendApi` with `buildHeaders()`.
- Route hierarchy MUST adhere to `(auth)`, `(tabs)`, and `(user)`.
