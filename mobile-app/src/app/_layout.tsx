import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OfflineBanner } from '@/components/offline-banner';
import { useAuthStore } from '@/stores/auth.store';
import { Colors } from '@/constants/theme';

// Create TanStack Query client with SWR defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { themeMode, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Determine active theme
  const effectiveTheme =
    themeMode === 'system'
      ? systemColorScheme === 'unspecified'
        ? 'dark'
        : systemColorScheme || 'dark'
      : themeMode;

  const isDark = effectiveTheme === 'dark';
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={isDark ? customDarkTheme : customLightTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <AnimatedSplashOverlay />
            <OfflineBanner />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                },
              }}
            >
              {/* Root entry redirect */}
              <Stack.Screen name="index" />

              {/* Main Authenticated 5-Tab Navigation */}
              <Stack.Screen name="(tabs)" />

              {/* Authentication Flows */}
              <Stack.Screen name="(auth)" />

              {/* Creative Studios (Modal Presentations) */}
              <Stack.Screen
                name="studio/carousel-preview"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="studio/voice-narrator"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />

              {/* Settings & Tenant Configuration */}
              <Stack.Screen
                name="settings/workspaces"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="settings/api-keys"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="settings/profile"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
