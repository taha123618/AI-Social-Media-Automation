import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { backendApi, API_BASE_URL } from '@/lib/backend';

// Ensures browser session completes cleanly on web/mobile redirects
WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthButtonProps {
  text?: string;
  onPress?: () => void;
  onSuccess?: () => void;
}

/** Official 4-Color Google "G" Logo */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function GoogleAuthButton({
  text = 'Continue with Google',
  onPress,
  onSuccess,
}: GoogleAuthButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const { loginWithSession, fetchWorkspaces } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (isLoading) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);

    try {
      // 1. Generate deep link callback URL
      const redirectUrl = Linking.createURL('/oauth-callback');

      // 2. Request OAuth Authorization URL from Better Auth backend
      const initiateRes = await fetch(`${API_BASE_URL}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: redirectUrl,
        }),
      });

      let authUrl = '';
      if (initiateRes.ok) {
        const initData = await initiateRes.json();
        authUrl = initData.url || `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(redirectUrl)}`;
      } else {
        authUrl = `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(redirectUrl)}`;
      }

      // 3. Open secure in-app auth browser session
      const authResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (authResult.type === 'success' && authResult.url) {
        // Parse callback URL parameters
        const parsedUrl = Linking.parse(authResult.url);
        const token = (parsedUrl.queryParams?.token as string) ||
                      (parsedUrl.queryParams?.session_token as string) ||
                      (parsedUrl.queryParams?.sessionToken as string);

        // 4. Retrieve authenticated session details from backend
        const meRes = await backendApi.getMe(token || undefined);

        if (meRes.success && meRes.user) {
          const sessionUser = {
            id: meRes.user.id,
            name: meRes.user.name || 'Google User',
            email: meRes.user.email,
            avatarUrl: meRes.user.image || undefined,
          };

          const effectiveToken = token || `session_${Date.now()}`;
          await loginWithSession(sessionUser, effectiveToken);
          await fetchWorkspaces();

          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          if (onSuccess) {
            onSuccess();
          } else {
            router.replace('/(tabs)');
          }
        } else {
          throw new Error('Failed to retrieve user session after Google OAuth');
        }
      } else if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
        // User voluntarily cancelled the auth flow
        console.log('[GOOGLE-AUTH] User cancelled auth session');
      }
    } catch (error: any) {
      console.error('[GOOGLE-AUTH-ERROR]:', error);
      Alert.alert(
        'Google Authentication Failed',
        error?.message || 'Could not complete Google single sign-on. Please check credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleGoogleSignIn}
      disabled={isLoading}
      style={[
        styles.button,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: isLoading ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <GoogleIcon size={18} />
          </View>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            {text}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.two,
    minHeight: 48,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
