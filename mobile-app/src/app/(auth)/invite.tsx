import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth.store';
import { Spacing, Radii } from '@/constants/theme';
import { backendApi } from '@/lib/backend';

export default function InviteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const isAuthenticated = useAuthStore((state: any) => !!state.user);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<{
    id: string;
    businessName: string;
    inviterName: string;
    role: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const data = await backendApi.getInvitation(token);
        if (data.success && data.invitation) {
          setInvitation(data.invitation);
        } else {
          setInvitation(null);
        }
      } catch {
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSubmitting(true);

    try {
      await backendApi.acceptInvitation(token);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Welcome!', `You have joined ${invitation?.businessName || 'the workspace'}.`, [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (err: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', err?.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
        >
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText type="caption" style={{ color: theme.textMuted, marginTop: Spacing.four }}>
                Loading invitation details...
              </ThemedText>
            </View>
          ) : !token || !invitation ? (
            <View style={styles.centerContainer}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: `${theme.destructive}15`,
                    borderColor: `${theme.destructive}30`,
                  },
                ]}
              >
                <Icons.AlertCircle size={28} color={theme.destructive} />
              </View>
              <ThemedText type="subtitle" style={styles.title}>
                Invalid Invitation
              </ThemedText>
              <ThemedText
                type="caption"
                style={[styles.subtitle, { color: theme.textMuted, marginBottom: Spacing.six }]}
              >
                This invitation link is invalid, has expired, or has already been accepted.
              </ThemedText>
              <Button
                title="Return to Sign In"
                variant="primary"
                size="lg"
                onPress={() => router.replace('/(auth)/login')}
                style={{ width: '100%' }}
              />
            </View>
          ) : !isAuthenticated ? (
            <View style={styles.centerContainer}>
              <View
                style={[
                  styles.brandLogo,
                  {
                    backgroundColor: theme.primary,
                  },
                ]}
              >
                <ThemedText style={styles.brandLetter}>S</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.title}>
                Sign In Required
              </ThemedText>
              <ThemedText
                type="caption"
                style={[styles.subtitle, { color: theme.textMuted, marginBottom: Spacing.six }]}
              >
                You have been invited to join{' '}
                <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                  {invitation.businessName}
                </ThemedText>{' '}
                as a{' '}
                <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                  {invitation.role}
                </ThemedText>
                . Please sign in or create an account to accept.
              </ThemedText>

              <View style={{ width: '100%', gap: Spacing.three }}>
                <Button
                  title="Sign In"
                  variant="primary"
                  size="lg"
                  onPress={() => router.replace(`/(auth)/login?redirect=/invite?token=${token}`)}
                />
                <Button
                  title="Create Account"
                  variant="outline"
                  size="lg"
                  onPress={() => router.replace(`/(auth)/register?redirect=/invite?token=${token}`)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: `${theme.primary}15`,
                    borderColor: `${theme.primary}30`,
                  },
                ]}
              >
                <Icons.Users size={28} color={theme.primary} />
              </View>
              <ThemedText type="subtitle" style={styles.title}>
                Join Workspace
              </ThemedText>
              <ThemedText
                type="caption"
                style={[styles.subtitle, { color: theme.textMuted, marginBottom: Spacing.six }]}
              >
                <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                  {invitation.inviterName}
                </ThemedText>{' '}
                has invited you to join{' '}
                <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                  {invitation.businessName}
                </ThemedText>{' '}
                as a{' '}
                <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                  {invitation.role}
                </ThemedText>
                .
              </ThemedText>

              <Button
                title="Accept Invitation"
                variant="primary"
                size="lg"
                loading={submitting}
                onPress={handleAccept}
                style={{ width: '100%' }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.six,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radii.xl,
    padding: Spacing.six,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  brandLetter: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.one,
    textAlign: 'center',
    lineHeight: 20,
  },
});
