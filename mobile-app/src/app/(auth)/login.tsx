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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { loginWithEmail } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading(true);

    try {
      await loginWithEmail(email.trim(), password);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setLoading(false);
      router.replace(redirect ? (redirect as any) : '/(tabs)');
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Invalid email or password. Please check your credentials.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card */}
          <GlassCard style={styles.card}>
            {/* Brand Logo & Header */}
            <View style={styles.brandHeader}>
              <View style={[styles.brandLogo, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.brandLogoText}>S</ThemedText>
              </View>
              <ThemedText type="heading" style={styles.brandTitle}>
                Log in to SocialAI
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
                Welcome back! Access your autonomous social workspace.
              </ThemedText>
            </View>

            {/* Segment Switcher Tabs */}
            <View style={[styles.tabSegment, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                style={styles.tabBtn}
              >
                <ThemedText type="caption" style={{ color: theme.textMuted, fontWeight: '600' }}>
                  Sign up
                </ThemedText>
              </TouchableOpacity>
              <View style={[styles.tabBtn, styles.tabBtnActive, { backgroundColor: theme.card }]}>
                <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                  Log in
                </ThemedText>
                <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
              </View>
            </View>

            {/* Google OAuth Button */}
            <GoogleAuthButton text="Sign in with Google" />

            {/* Separator */}
            <View style={styles.separatorContainer}>
              <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
              <ThemedText type="caption" style={[styles.separatorText, { backgroundColor: theme.card, color: theme.textMuted }]}>
                or
              </ThemedText>
            </View>

            {/* Form Inputs */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  Email
                </ThemedText>
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage('');
                  }}
                  placeholder="you@company.com"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.backgroundElement,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  Password
                </ThemedText>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      setErrorMessage('');
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    style={[
                      styles.textInput,
                      styles.passwordInput,
                      {
                        backgroundColor: theme.backgroundElement,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={8}
                  >
                    <Icons.Lock size={18} color={showPassword ? theme.primary : theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password Row */}
              <View style={styles.auxRow}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.rememberMeBtn}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: rememberMe ? theme.primary : theme.border,
                        backgroundColor: rememberMe ? theme.primary : 'transparent',
                      },
                    ]}
                  >
                    {rememberMe && <Icons.Check size={12} color="#FFFFFF" />}
                  </View>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    Remember for 30 days
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '600' }}>
                    Forgot password?
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Error Alert Box */}
              {errorMessage ? (
                <View style={[styles.errorBox, { backgroundColor: `${theme.destructive}15`, borderColor: `${theme.destructive}30` }]}>
                  <ThemedText type="caption" style={{ color: theme.destructive, fontWeight: '600' }}>
                    {errorMessage}
                  </ThemedText>
                </View>
              ) : null}

              {/* Submit Button */}
              <Button
                title="Sign in to workspace"
                onPress={handleLogin}
                loading={loading}
                size="lg"
                style={styles.submitBtn}
              />
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Don't have an account?{' '}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                  Start free trial
                </ThemedText>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Security Footnote */}
          <ThemedText type="caption" style={[styles.securityFootnote, { color: theme.textMuted }]}>
            Enterprise SOC 2 Type II Certified • 256-bit Encryption
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingVertical: Spacing.eight,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    padding: Spacing.six,
    gap: Spacing.four,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.half,
  },
  tabSegment: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.sm,
    position: 'relative',
  },
  tabBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
  separatorContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.one,
  },
  separatorLine: {
    width: '100%',
    height: 1,
  },
  separatorText: {
    position: 'absolute',
    paddingHorizontal: Spacing.two,
    fontSize: 12,
  },
  formSection: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Platform.OS === 'ios' ? Spacing.three : Spacing.two,
    fontSize: 14,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 42,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.three,
    padding: Spacing.one,
  },
  auxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  rememberMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  securityFootnote: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: Spacing.six,
  },
});
