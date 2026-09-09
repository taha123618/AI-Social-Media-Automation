import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [brandVoice, setBrandVoice] = useState('Authoritative, data-backed B2B thought leadership');
  const [industry, setIndustry] = useState('Enterprise Software / SaaS');
  const [icp, setIcp] = useState('Founders, CMOs, Agency Leaders');

  const handleCompleteOnboarding = () => {
    Alert.alert('Onboarding Complete', 'Your Brand DNA has been vectorized and configured for your agents!', [
      { text: 'Launch Dashboard', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
            <Icons.Sparkles size={28} color={theme.primary} />
          </View>
          <ThemedText type="title" style={{ marginTop: Spacing.three }}>
            Setup Brand DNA
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
            Teach your autonomous agent swarm your unique tone, voice guidelines, and target ICP.
          </ThemedText>
        </View>

        <GlassCard style={styles.formCard}>
          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.inputLabel}>
              Primary Industry
            </ThemedText>
            <TextInput
              value={industry}
              onChangeText={setIndustry}
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.inputLabel}>
              Brand Voice & Persona
            </ThemedText>
            <TextInput
              value={brandVoice}
              onChangeText={setBrandVoice}
              multiline
              numberOfLines={2}
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.inputLabel}>
              Target ICP Audience
            </ThemedText>
            <TextInput
              value={icp}
              onChangeText={setIcp}
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
            />
          </View>

          <Button
            title="Vectorize & Complete Setup"
            variant="primary"
            size="lg"
            icon={<Icons.Sparkles size={16} color="#FFFFFF" />}
            onPress={handleCompleteOnboarding}
            style={{ marginTop: Spacing.three }}
          />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.six,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    padding: Spacing.five,
    gap: Spacing.four,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
});
