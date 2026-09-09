import { Stack } from 'expo-router';

/**
 * Auth Group Layout
 *
 * Required by Expo Router to register the (auth) route group.
 * All authentication screens (login, register, forgot-password) share this
 * layout — a bare Stack with no header chrome so each screen owns its own UI.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
