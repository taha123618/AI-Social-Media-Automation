import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import { backendApi } from '@/lib/backend';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';

type RegisterStep = 'CREDENTIALS' | 'OTP_VERIFY';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { loginWithEmail } = useAuthStore();

  const [step, setStep] = useState<RegisterStep>('CREDENTIALS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State (6 digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<Array<TextInput | null>>([]);

  // Timers and UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [expiresInSeconds, setExpiresInSeconds] = useState(120);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength();
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#3B82F6',
    '#10B981',
  ];

  // Countdown timers for OTP step
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'OTP_VERIFY') {
      interval = setInterval(() => {
        setExpiresInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async () => {
    setErrorMessage('');
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please complete all registration fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLoading(true);

    try {
      const res = await backendApi.sendRegisterOtp(name.trim(), email.trim(), password);
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        return;
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setStep('OTP_VERIFY');
      setResendCooldown(60);
      setExpiresInSeconds(120);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (cleanVal && index === 5 && newOtp.every((digit) => digit !== '')) {
      executeVerifyOtp(newOtp.join(''));
    }
  };

  // Handle OTP backspace key
  const handleOtpKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Execute OTP Verification & Workspace Activation
  const executeVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setErrorMessage('');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLoading(true);

    try {
      const res = await backendApi.verifyRegisterOtp(name.trim(), email.trim(), password, code);
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
        setOtp(['', '', '', '', '', '']);
        otpInputsRef.current[0]?.focus();
        return;
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Auto login after verification
      try {
        await loginWithEmail(email.trim(), password);
        router.replace(redirect ? (redirect as any) : '/(tabs)');
      } catch {
        router.replace(redirect ? (`/(auth)/login?redirect=${encodeURIComponent(redirect)}` as any) : '/(auth)/login');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify security code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');

    try {
      const res = await backendApi.resendRegisterOtp(email.trim(), name.trim());
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setResendCooldown(60);
      setExpiresInSeconds(120);
      setOtp(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <GlassCard style={styles.card}>
            {step === 'CREDENTIALS' ? (
              <>
                {/* Brand Header */}
                <View style={styles.brandHeader}>
                  <View style={[styles.brandLogo, { backgroundColor: theme.primary }]}>
                    <ThemedText style={styles.brandLogoText}>S</ThemedText>
                  </View>
                  <ThemedText type="heading" style={styles.brandTitle}>
                    Get started with SocialAI
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
                    Start your 14-day free trial • No credit card required.
                  </ThemedText>
                </View>

                {/* Segment Switcher Tabs */}
                <View style={[styles.tabSegment, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <View style={[styles.tabBtn, styles.tabBtnActive, { backgroundColor: theme.card }]}>
                    <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                      Sign up
                    </ThemedText>
                    <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.tabBtn}
                  >
                    <ThemedText type="caption" style={{ color: theme.textMuted, fontWeight: '600' }}>
                      Log in
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Google OAuth Button */}
                <GoogleAuthButton text="Sign up with Google" />

                {/* Separator */}
                <View style={styles.separatorContainer}>
                  <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
                  <ThemedText type="caption" style={[styles.separatorText, { backgroundColor: theme.card, color: theme.textMuted }]}>
                    or
                  </ThemedText>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <ThemedText type="caption" style={styles.inputLabel}>
                      Full Name
                    </ThemedText>
                    <TextInput
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        setErrorMessage('');
                      }}
                      placeholder="Jane Doe"
                      placeholderTextColor={theme.textMuted}
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
                      ]}
                    />
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <ThemedText type="caption" style={styles.inputLabel}>
                      Work Email
                    </ThemedText>
                    <TextInput
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setErrorMessage('');
                      }}
                      placeholder="jane@company.com"
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
                      ]}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <ThemedText type="caption" style={styles.inputLabel}>
                        Password
                      </ThemedText>
                      {password ? (
                        <ThemedText type="caption" style={{ color: strengthColors[passwordScore], fontWeight: '700' }}>
                          {strengthLabels[passwordScore]}
                        </ThemedText>
                      ) : null}
                    </View>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        value={password}
                        onChangeText={(val) => {
                          setPassword(val);
                          setErrorMessage('');
                        }}
                        placeholder="Create a password"
                        placeholderTextColor={theme.textMuted}
                        secureTextEntry={!showPassword}
                        style={[
                          styles.textInput,
                          styles.passwordInput,
                          { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
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

                    {/* Password Strength Progress Bar */}
                    {password.length > 0 && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBarRow}>
                          {[1, 2, 3, 4].map((lvl) => (
                            <View
                              key={lvl}
                              style={[
                                styles.strengthBarSegment,
                                {
                                  backgroundColor: passwordScore >= lvl ? strengthColors[passwordScore] : theme.border,
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <View style={styles.strengthHintsRow}>
                          <ThemedText type="caption" style={{ color: password.length >= 8 ? theme.success : theme.textMuted, fontSize: 10 }}>
                            • 8+ chars
                          </ThemedText>
                          <ThemedText type="caption" style={{ color: /[A-Z]/.test(password) ? theme.success : theme.textMuted, fontSize: 10 }}>
                            • Uppercase
                          </ThemedText>
                          <ThemedText type="caption" style={{ color: /[0-9]/.test(password) ? theme.success : theme.textMuted, fontSize: 10 }}>
                            • Number
                          </ThemedText>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <ThemedText type="caption" style={styles.inputLabel}>
                        Confirm Password
                      </ThemedText>
                      {confirmPassword ? (
                        <ThemedText
                          type="caption"
                          style={{
                            color: password === confirmPassword ? theme.success : theme.destructive,
                            fontWeight: '600',
                          }}
                        >
                          {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </ThemedText>
                      ) : null}
                    </View>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        value={confirmPassword}
                        onChangeText={(val) => {
                          setConfirmPassword(val);
                          setErrorMessage('');
                        }}
                        placeholder="••••••••"
                        placeholderTextColor={theme.textMuted}
                        secureTextEntry={!showConfirmPassword}
                        style={[
                          styles.textInput,
                          styles.passwordInput,
                          {
                            backgroundColor: theme.backgroundElement,
                            color: theme.text,
                            borderColor: confirmPassword && password !== confirmPassword ? theme.destructive : theme.border,
                          },
                        ]}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeBtn}
                        hitSlop={8}
                      >
                        <Icons.Lock size={18} color={showConfirmPassword ? theme.primary : theme.textMuted} />
                      </TouchableOpacity>
                    </View>
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
                    title="Create workspace account"
                    onPress={handleSendOtp}
                    loading={isLoading}
                    size="lg"
                    style={styles.submitBtn}
                  />

                  <ThemedText type="caption" style={[styles.termsText, { color: theme.textMuted }]}>
                    By creating an account, you agree to SocialAI's Privacy Policy and Enterprise Terms.
                  </ThemedText>
                </View>

                {/* Footer */}
                <View style={styles.footerRow}>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    Already have an account?{' '}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                      Log in
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Step 2: 2FA OTP Code Verification */
              <View style={styles.otpStepContainer}>
                <View style={styles.brandHeader}>
                  <View style={[styles.otpBadge, { backgroundColor: theme.primaryLight }]}>
                    <Icons.Key size={26} color={theme.primary} />
                  </View>
                  <ThemedText type="heading" style={styles.brandTitle}>
                    Two-Factor Security Code
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
                    We sent a 6-digit one-time code to{' '}
                    <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                      {email}
                    </ThemedText>
                  </ThemedText>
                </View>

                {/* 6 Segmented OTP Boxes */}
                <View style={styles.otpBoxesRow}>
                  {otp.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(idx, val)}
                      onKeyPress={(e) => handleOtpKeyPress(idx, e)}
                      keyboardType="number-pad"
                      maxLength={1}
                      style={[
                        styles.otpBox,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: digit ? theme.primary : theme.border,
                          color: theme.text,
                        },
                      ]}
                    />
                  ))}
                </View>

                {/* Expiry & Resend Row */}
                <View style={styles.auxRow}>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    Expires in{' '}
                    <ThemedText type="caption" style={{ color: theme.text, fontWeight: '700' }}>
                      {formatTime(expiresInSeconds)}
                    </ThemedText>
                  </ThemedText>

                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        color: resendCooldown > 0 ? theme.textMuted : theme.primary,
                        fontWeight: '700',
                      }}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Error Box */}
                {errorMessage ? (
                  <View style={[styles.errorBox, { backgroundColor: `${theme.destructive}15`, borderColor: `${theme.destructive}30` }]}>
                    <ThemedText type="caption" style={{ color: theme.destructive, fontWeight: '600' }}>
                      {errorMessage}
                    </ThemedText>
                  </View>
                ) : null}

                {/* Verify Button */}
                <Button
                  title="Verify & Activate Workspace"
                  onPress={() => executeVerifyOtp()}
                  loading={isLoading}
                  disabled={otp.some((d) => !d)}
                  size="lg"
                  style={styles.submitBtn}
                />

                {/* Back to Edit Credentials Link */}
                <TouchableOpacity
                  onPress={() => {
                    setStep('CREDENTIALS');
                    setErrorMessage('');
                  }}
                  style={styles.backCredentialsBtn}
                >
                  <Icons.ArrowLeft size={14} color={theme.textMuted} />
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    Wrong email address? Edit details
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  strengthContainer: {
    gap: 4,
    marginTop: 2,
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
  },
  strengthBarSegment: {
    flex: 1,
    borderRadius: 2,
  },
  strengthHintsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.three,
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: Spacing.one,
    lineHeight: 16,
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
  otpStepContainer: {
    gap: Spacing.four,
  },
  otpBadge: {
    width: 52,
    height: 52,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.two,
  },
  otpBox: {
    width: 44,
    height: 54,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  auxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backCredentialsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
});
