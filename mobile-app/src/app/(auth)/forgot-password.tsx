import React, { useState } from 'react';
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
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please provide your account email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icons.ChevronRight size={20} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
          <ThemedText type="caption" style={{ color: theme.text, marginLeft: 4 }}>
            Back to Sign In
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.header}>
          <ThemedText type="subtitle">Reset Password</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Enter your email to receive a password recovery link
          </ThemedText>
        </View>

        {sent ? (
          <View style={styles.sentContainer}>
            <View style={[styles.checkCircle, { backgroundColor: theme.successBg }]}>
              <Icons.Check size={32} color={theme.success} />
            </View>
            <ThemedText type="heading" style={{ marginTop: Spacing.three }}>
              Recovery Link Sent
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
              We've dispatched password reset instructions to {email}. Check your inbox or spam folder.
            </ThemedText>
            <Button
              title="Return to Login"
              variant="primary"
              onPress={() => router.replace('/(auth)/login')}
              style={{ marginTop: Spacing.four, width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <ThemedText type="caption" style={styles.inputLabel}>
                Account Email
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="founder@agency.com"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border },
                ]}
              />
            </View>

            <Button
              title="Send Recovery Link"
              onPress={handleReset}
              loading={loading}
              size="lg"
              style={{ marginTop: Spacing.two }}
            />
          </View>
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
  sentContainer: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
