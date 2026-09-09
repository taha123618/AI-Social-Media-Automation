import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { backendApi } from '@/lib/backend';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading(true);
    try {
      await backendApi.requestPasswordReset(email.trim());
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Container */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            {!isSubmitted ? (
              <View>
                {/* Header Icon */}
                <View style={styles.header}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: `${theme.primary}15`,
                        borderColor: `${theme.primary}30`,
                      },
                    ]}
                  >
                    <Icons.Mail size={24} color={theme.primary} />
                  </View>
                  <ThemedText type="subtitle" style={styles.title}>
                    Reset your password
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.subtitle, { color: theme.textMuted }]}>
                    Enter your email address and we'll send you a recovery link
                  </ThemedText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <ThemedText type="caption" style={styles.label}>
                      Email address
                    </ThemedText>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                  </View>

                  <Button
                    title="Send reset link"
                    onPress={handleSubmit}
                    loading={loading}
                    variant="primary"
                    size="lg"
                    style={{ marginTop: Spacing.two }}
                  />

                  <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    style={styles.backLink}
                  >
                    <Icons.ArrowLeft size={16} color={theme.textMuted} />
                    <ThemedText type="caption" style={{ color: theme.textMuted, marginLeft: 6 }}>
                      Back to sign in
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.successContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: `${theme.success}15`,
                      borderColor: `${theme.success}30`,
                    },
                  ]}
                >
                  <Icons.Check size={28} color={theme.success} />
                </View>
                <ThemedText type="subtitle" style={styles.title}>
                  Check your inbox
                </ThemedText>
                <ThemedText type="caption" style={[styles.subtitle, { color: theme.textMuted }]}>
                  We've sent a password reset link to{'\n'}
                  <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                    {email}
                  </ThemedText>
                </ThemedText>

                <View style={{ width: '100%', marginTop: Spacing.four, gap: Spacing.three }}>
                  <Button
                    title="Return to sign in"
                    variant="primary"
                    size="lg"
                    onPress={() => router.replace('/(auth)/login')}
                  />
                  <TouchableOpacity
                    onPress={() => setIsSubmitted(false)}
                    style={{ alignItems: 'center', paddingVertical: Spacing.two }}
                  >
                    <ThemedText type="caption" style={{ color: theme.textMuted }}>
                      Didn't receive email? Click to resend
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
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
  form: {
    gap: Spacing.four,
  },
  inputGroup: {
    gap: Spacing.two,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.four,
    fontSize: 15,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
