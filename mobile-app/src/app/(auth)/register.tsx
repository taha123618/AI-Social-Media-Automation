import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';

type RegisterStep = 'DETAILS' | 'OTP_VERIFY';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { loginDemo, registerWithEmail } = useAuthStore();

  const [step, setStep] = useState<RegisterStep>('DETAILS');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'OTP_VERIFY' && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  const handleSendOtp = () => {
    if (!email || !password || !orgName) {
      Alert.alert('Missing Fields', 'Please complete all registration fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP_VERIFY');
      setResendCooldown(60);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 600);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newDigits = [...otpDigits];
    newDigits[index] = text;
    setOtpDigits(newDigits);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the full 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(orgName, email, password);
      setLoading(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Workspace Created', 'Welcome to SocialAI enterprise platform!', [
        { text: 'Enter Workspace', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Registration Error', err.message || 'Could not complete registration.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <TouchableOpacity
          onPress={() => (step === 'OTP_VERIFY' ? setStep('DETAILS') : router.back())}
          style={styles.backBtn}
        >
          <Icons.ChevronRight size={20} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
          <ThemedText type="caption" style={{ color: theme.text, marginLeft: 4 }}>
            Back
          </ThemedText>
        </TouchableOpacity>

        {step === 'DETAILS' ? (
          <>
            <View style={styles.header}>
              <ThemedText type="subtitle">Create Workspace</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Step 1: Organization & Admin Account
              </ThemedText>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  Organization / Agency Name
                </ThemedText>
                <TextInput
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder="Apex Media Holdings"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.textInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  Work Email
                </ThemedText>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="founder@agency.com"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.textInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  Password
                </ThemedText>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  style={[styles.textInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
                />
              </View>

              <Button
                title="Continue to 2FA Verification"
                onPress={handleSendOtp}
                loading={loading}
                size="lg"
                style={{ marginTop: Spacing.three }}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <ThemedText type="subtitle">2-Factor Authentication</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Enter the 6-digit cryptographic OTP sent to {email}
              </ThemedText>
            </View>

            <View style={styles.otpBoxesRow}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    inputRefs.current[idx] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, idx)}
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

            <Button
              title="Verify & Launch Workspace"
              onPress={handleVerifyOtp}
              loading={loading}
              size="lg"
              style={{ marginTop: Spacing.four }}
            />

            <View style={styles.resendContainer}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? "}
              </ThemedText>
              {resendCooldown === 0 && (
                <TouchableOpacity onPress={handleSendOtp}>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                    Resend OTP
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    padding: Spacing.six,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  header: {
    marginBottom: Spacing.six,
  },
  formSection: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.four,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
});
