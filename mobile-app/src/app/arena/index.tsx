import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { backendApi } from '@/lib/backend';
import { ArenaComparisonResult } from '@/types/api';

const SAMPLE_PROMPTS = [
  'Why autonomous AI agents outperform single LLM prompts in SaaS marketing',
  'Break down the LinkedIn algorithm 2026 dwell-time strategy in 3 steps',
  'Create a high-converting carousel hook for B2B founder personal brands',
];

export default function AIArenaScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArenaComparisonResult | null>(null);

  const handleRunComparison = async (testPrompt?: string) => {
    const targetPrompt = testPrompt || prompt;
    if (!targetPrompt.trim()) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading(true);
    try {
      const data = await backendApi.getArenaComparison(targetPrompt);
      setResult(data);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Fallback handled in backendApi
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Sparkles size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">AI Model Arena</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.pageTitle}>
          Multi-Model LLM Arena
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Execute identical prompts across GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and DeepSeek in real-time.
        </ThemedText>

        {/* Prompt Input Box */}
        <GlassCard style={styles.inputCard}>
          <ThemedText type="caption" style={styles.inputLabel}>
            BENCHMARK PROMPT
          </ThemedText>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Enter a strategic concept or marketing hook..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
          />
          <Button
            title="Execute Side-by-Side Comparison"
            variant="primary"
            size="md"
            loading={loading}
            icon={<Icons.Sparkles size={16} color="#FFFFFF" />}
            onPress={() => handleRunComparison()}
            style={{ marginTop: Spacing.two }}
          />
        </GlassCard>

        {/* Quick Sample Prompts */}
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.two, marginTop: Spacing.three }}>
          SAMPLE BENCHMARKS
        </ThemedText>
        <View style={styles.sampleRow}>
          {SAMPLE_PROMPTS.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setPrompt(p);
                handleRunComparison(p);
              }}
              style={[styles.sampleChip, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
            >
              <ThemedText type="caption" numberOfLines={1} style={{ color: theme.textSecondary }}>
                💡 {p}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Arena Results Stream */}
        {result && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <ThemedText type="subtitle">Arena Telemetry</ThemedText>
              <View style={[styles.winnerBadge, { backgroundColor: theme.primaryLight }]}>
                <Icons.Check size={12} color={theme.primary} />
                <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                  Best: {result.recommendedModelId.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            {result.results.map((m) => (
              <GlassCard key={m.modelId} style={styles.modelCard}>
                <View style={styles.modelHeader}>
                  <View>
                    <ThemedText type="defaultSemiBold">{m.name}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textMuted }}>
                      {m.provider}
                    </ThemedText>
                  </View>
                  <View style={styles.modelMetrics}>
                    <ThemedText type="mono" style={{ color: theme.primary, fontSize: 12 }}>
                      ⚡ {m.latencyMs}ms
                    </ThemedText>
                    <ThemedText type="mono" style={{ color: theme.success, fontSize: 12 }}>
                      {m.qualityScore}% Score
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.modelOutput}>{m.output}</ThemedText>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  pageTitle: {
    marginBottom: Spacing.one,
  },
  inputCard: {
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    fontSize: 14,
    minHeight: 70,
  },
  sampleRow: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  sampleChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  resultsContainer: {
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  modelCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: Spacing.two,
  },
  modelMetrics: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modelOutput: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.one,
  },
});
