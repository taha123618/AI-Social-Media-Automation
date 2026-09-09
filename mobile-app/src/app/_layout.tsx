import React, { useEffect } from 'react';
import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OfflineBanner } from '@/components/offline-banner';
import { AppSidebar } from '@/components/navigation/app-sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const activeScheme = useColorScheme();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const isDark = activeScheme === 'dark';
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

              {/* User Dashboard & Domain Modules */}
              <Stack.Screen name="(user)" />

              {/* Authentication Flows */}
              <Stack.Screen name="(auth)" />
            </Stack>

            {/* Global Slide-over App Sidebar */}
            <AppSidebar />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
