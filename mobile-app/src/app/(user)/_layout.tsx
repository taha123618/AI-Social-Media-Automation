import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export default function UserLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard/index" />
      <Stack.Screen name="contents/index" />
      <Stack.Screen name="posts/index" />
      <Stack.Screen name="schedule/index" />
      <Stack.Screen name="post-schedule/index" />
      <Stack.Screen name="ad-campaigns/index" />
      <Stack.Screen name="analytics/index" />
      <Stack.Screen name="arena/index" />
      <Stack.Screen name="blog/index" />
      <Stack.Screen name="carousels/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="competitors/index" />
      <Stack.Screen name="dm-automation/index" />
      <Stack.Screen name="engagement/index" />
      <Stack.Screen name="gallery/index" />
      <Stack.Screen name="image/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="knowledge/index" />
      <Stack.Screen name="listening/index" />
      <Stack.Screen name="multi-location/index" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="reviews/index" />
      <Stack.Screen name="social/index" />
      <Stack.Screen name="studio/index" />
      <Stack.Screen name="team/index" />
      <Stack.Screen name="trends/index" />
      <Stack.Screen name="videos/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="voice/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="workflows/index" />
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/profile" />
      <Stack.Screen name="settings/workspaces" />
      <Stack.Screen name="settings/billing" />
      <Stack.Screen name="settings/api-keys" />
      <Stack.Screen name="settings/team" />
      <Stack.Screen name="settings/social" />
    </Stack>
  );
}
