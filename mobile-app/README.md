# SocialAI Mobile Companion App 📱

The official cross-platform mobile companion for the **SocialAI** enterprise social media automation and AI content management platform. Built on **Expo SDK 57**, **React Native 0.86**, and **React 19**, it provides on-the-go workspace access, publishing queues, content discovery, and real-time social performance telemetry.

---

## Architecture & Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime & Core** | Expo SDK | `~57.0.21` | Modern universal mobile runtime |
| **Framework** | React Native | `0.86.3` | Native cross-platform rendering engine |
| **Language & Engine** | React / TypeScript | `19.2.3` / `~6.0.3` | React 19 concurrent features & strict types |
| **Routing** | Expo Router | `~57.0.20` | File-based navigation inside `src/app/` |
| **Data Fetching** | TanStack React Query | `^5.102.8` | Declarative server-state caching & sync |
| **Client State** | Zustand | `^5.0.15` | Lightweight client and session state store |
| **High-Performance Lists** | `@shopify/flash-list` | `^2.3.2` | 60/120fps virtualized feed rendering |
| **Motion & Gestures** | Reanimated / Gesture Handler | `4.5.1` / `~2.32.0` | Physics-based 60fps animations & gestures |
| **Persistence** | Async Storage | `^3.1.1` | Local token and workspace preference storage |
| **UI Components** | Expo Symbols & Glass Effect | `~57.0.2` | Native SF Symbols & modern glassmorphic styling |

---

## Directory Structure

```text
mobile-app/
├── src/
│   ├── app/                         # Expo Router file-based screens & layouts
│   │   ├── _layout.tsx              # Root stack navigator & theme provider
│   │   ├── index.tsx                # Dashboard feed & scheduled post preview
│   │   └── explore.tsx              # AI content explorer & discovery screen
│   ├── components/                  # Reusable UI & themed components
│   │   ├── themed-text.tsx          # Dynamic light/dark typography
│   │   ├── themed-view.tsx          # Adaptive background container
│   │   ├── animated-icon.tsx        # Motion-enhanced tab icons
│   │   ├── app-tabs.tsx             # Native bottom navigation tabs
│   │   ├── app-tabs.web.tsx         # Responsive web navigation bar
│   │   └── ui/                      # Collapsible cards, badges, modal dialogs
│   ├── constants/
│   │   └── theme.ts                 # Design tokens (Electric Violet palette, tints)
│   ├── hooks/
│   │   ├── use-theme.ts             # Theme context & color scheme resolution
│   │   ├── use-color-scheme.ts      # Native color scheme observer
│   │   └── use-color-scheme.web.ts  # Web-safe color scheme observer
│   └── global.css                   # Global styles & resets
├── assets/                          # App icons, splash screens, favicon
├── scripts/                         # Reset project & maintenance scripts
├── .env                             # Local environment variables
├── .env.example                     # Environment template
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
Copy the environment template and verify your backend endpoint:
```bash
cp .env.example .env
```

```env
# mobile-app/.env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000/ws
EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true
```

> [!TIP]
> **Emulator vs Physical Device Connectivity:**
> - **iOS Simulator**: `http://localhost:3000`
> - **Android Emulator**: `http://10.0.2.2:3000` (maps to your host machine's `localhost`)
> - **Physical Device (Expo Go)**: Set `EXPO_PUBLIC_API_URL` to your computer's local Wi-Fi IP (e.g. `http://192.168.1.150:3000`).

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

# 2. Lint code
bunx expo lint

# 3. Diagnose Expo dependencies and configurations
bunx expo-doctor
```

---

## Building & Releasing with EAS (Expo Application Services)

The mobile companion leverages **Continuous Native Generation (CNG)**. Native folders (`ios/`, `android/`) are generated automatically by EAS or Expo Prebuild.

```bash
# Install EAS CLI globally or run via bunx / npx
bunx eas-cli login

# Build a development build for native debugging
bunx eas-cli build --profile development --platform all

# Build production binaries for App Store and Google Play
bunx eas-cli build --profile production --platform all

# Publish over-the-air (OTA) updates without app store re-submission
bunx eas-cli update --branch production --message "Update content discovery feed"
```

---

## Related Documentation
- [Root README](file:///Users/taha/projects/ai_social_media_automation/README.md)
- [System Architecture](file:///Users/taha/projects/ai_social_media_automation/ARCHITECTURE.md)
- [Mobile Agent Skill](file:///Users/taha/projects/ai_social_media_automation/.agents/skills/mobile-app-development/SKILL.md)
- [Development Guide](file:///Users/taha/projects/ai_social_media_automation/DEVELOPMENT.md)
