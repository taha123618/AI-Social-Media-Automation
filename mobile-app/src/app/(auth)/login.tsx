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
import { useAuthStore } from '@/stores/auth.store';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { loginWithEmail } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      setLoading(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Login Failed', err.message || 'Please check your email and password.');
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryLight }]}>
            <Icons.Sparkles size={32} color={theme.primary} />
          </View>
          <ThemedText type="title" style={{ marginTop: Spacing.three }}>
            SocialAI
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
            Autonomous Multi-Agent Social Media Automation
          </ThemedText>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.inputLabel}>
              Email Address
            </ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="founder@company.com"
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

          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <ThemedText type="caption" style={styles.inputLabel}>
                Password
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <ThemedText type="caption" style={{ color: theme.primary }}>
                  Forgot?
                </ThemedText>
              </TouchableOpacity>
            </View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
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

          <Button
            title="Sign In to Workspace"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />

        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Don't have an enterprise workspace?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
              Register (2FA)
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    gap: Spacing.three,
    marginBottom: Spacing.six,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontWeight: '600',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  loginBtn: {
    marginTop: Spacing.two,
  },
  biometricBtn: {
    marginTop: Spacing.one,
  },
  demoBtn: {
    marginTop: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
