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
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { backendApi } from '@/lib/backend';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Invalid Link', 'This password reset link is invalid or has expired.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading(true);

    try {
      await backendApi.resetPassword(token, password);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Your password has been updated successfully. Please log in.', [
        {
          text: 'Sign In',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]);
    } catch (err: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', err?.message || 'Failed to reset password. Please try again.');
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
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            {!token ? (
              <View style={styles.invalidContainer}>
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
                  Invalid link
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[styles.subtitle, { color: theme.textMuted, marginBottom: Spacing.six }]}
                >
                  This password reset link is invalid or has expired.
                </ThemedText>
                <Button
                  title="Request new link"
                  variant="primary"
                  size="lg"
                  onPress={() => router.replace('/(auth)/forgot-password')}
                  style={{ width: '100%' }}
                />
              </View>
            ) : (
              <View>
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
                    <Icons.Lock size={24} color={theme.primary} />
                  </View>
                  <ThemedText type="subtitle" style={styles.title}>
                    Set new password
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.subtitle, { color: theme.textMuted }]}>
                    Create a secure password with at least 8 characters
                  </ThemedText>
                </View>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <ThemedText type="caption" style={styles.label}>
                      New password
                    </ThemedText>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={theme.textMuted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        style={[
                          styles.input,
                          styles.passwordInput,
                          {
                            backgroundColor: theme.background,
                            color: theme.text,
                            borderColor: theme.border,
                          },
                        ]}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeBtn}
                      >
                        {showPassword ? (
                          <Icons.EyeOff size={20} color={theme.textMuted} />
                        ) : (
                          <Icons.Eye size={20} color={theme.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText type="caption" style={styles.label}>
                      Confirm new password
                    </ThemedText>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      placeholderTextColor={theme.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
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
                    title="Update password"
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
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
  invalidContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
