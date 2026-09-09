import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { backendApi } from '@/lib/backend';
import { GeneratedVideoResult } from '@/types/api';

const VOICE_PRESETS = [
  'Professional Narrator (Male)',
  'Energetic Thought Leader (Female)',
  'Corporate Tech Founder (Male)',
  'Casual Conversational (Female)',
  'Direct B2B Executive (Male)',
];

export default function VideoGeneratorScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<GeneratedVideoResult | null>(null);

  const handleGenerate = async () => {
    if (!concept.trim()) {
      Alert.alert('Concept Required', 'Please enter a topic or concept for the video script.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await backendApi.generateVideoStoryboard(
        title.trim() || 'AI Social Strategy Video',
        concept,
        selectedVoice
      );
      setVideoResult(result);
    } catch {
      Alert.alert('Generation Error', 'Failed to generate video storyboard. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!videoResult) return;
    try {
      const sceneSummary = videoResult.scenes
        .map((s) => `[Scene ${s.sceneNumber}: ${s.title}]\n🎙 "${s.script}"\n🎬 ${s.visualPrompt}`)
        .join('\n\n');

      await Share.share({
        title: videoResult.title,
        message: `🎬 ${videoResult.title} (${videoResult.totalDurationSeconds}s)\nVoice: ${videoResult.voiceStyle}\n\n${sceneSummary}`,
      });
    } catch {
      // Ignored
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.backgroundElement }]}
          activeOpacity={0.7}
        >
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="heading" style={styles.headerTitle}>
          RAG Video Storyboard
        </ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <GlassCard style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
              <Icons.Video size={24} color={theme.primary} />
            </View>
            <View style={styles.bannerText}>
              <ThemedText type="defaultSemiBold" style={{ fontWeight: '700' }}>
                AI Video Director
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                Synthesizes multi-scene scripts, timing breakdowns, and cinematic B-roll visual cues.
              </ThemedText>
            </View>
          </View>
        </GlassCard>

        {/* Video Title */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          VIDEO TITLE / TOPIC
        </ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <TextInput
            style={[styles.singleInput, { color: theme.text }]}
            placeholder="e.g. Why B2B Companies Fail at Organic Reach"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Concept / Key Talking Points */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>
          CORE CONCEPT & HOOK ANGLE
        </ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textArea, { color: theme.text }]}
            placeholder="Explain why short-form video requires a 3-second pattern interrupt and how AI automation streamlines multi-channel distribution..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            value={concept}
            onChangeText={setConcept}
          />
        </View>

        {/* Voice Persona Selection */}
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>
          SYNTHETIC VOICE NARRATOR
        </ThemedText>
        <View style={{ gap: Spacing.two }}>
          {VOICE_PRESETS.map((v) => {
            const isSelected = selectedVoice === v;
            return (
              <TouchableOpacity
                key={v}
                style={[
                  styles.voiceItem,
                  {
                    backgroundColor: isSelected ? `${theme.primary}15` : theme.backgroundElement,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedVoice(v)}
                activeOpacity={0.8}
              >
                <Icons.Radio size={16} color={isSelected ? theme.primary : theme.textMuted} />
                <ThemedText
                  type="bodyMedium"
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? theme.primary : theme.text,
                    flex: 1,
                  }}
                >
                  {v}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Generate Button */}
        <Button
          label={isGenerating ? 'Directing Storyboard...' : 'Generate 3-Scene Storyboard'}
          variant="primary"
          size="lg"
          loading={isGenerating}
          icon={<Icons.Sparkles size={18} color="#FFFFFF" />}
          onPress={handleGenerate}
          style={{ marginTop: Spacing.five }}
        />

        {/* Storyboard Output */}
        {videoResult && (
          <View style={{ marginTop: Spacing.five }}>
            <View style={styles.resultHeader}>
              <ThemedText type="heading" style={{ fontWeight: '800', flex: 1 }}>
                {videoResult.title}
              </ThemedText>
              <View style={[styles.durationBadge, { backgroundColor: `${theme.primary}20` }]}>
                <ThemedText type="mono" style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>
                  {videoResult.totalDurationSeconds}s TOTAL
                </ThemedText>
              </View>
            </View>

            <View style={{ gap: Spacing.three, marginTop: Spacing.three }}>
              {videoResult.scenes.map((scene) => (
                <GlassCard key={scene.sceneNumber} style={styles.sceneCard}>
                  <View style={styles.sceneHeader}>
                    <View style={[styles.sceneBadge, { backgroundColor: theme.backgroundElement }]}>
                      <ThemedText type="mono" style={{ fontSize: 11, fontWeight: '800', color: theme.primary }}>
                        SCENE {scene.sceneNumber}
                      </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={{ fontWeight: '700', flex: 1 }}>
                      {scene.title}
                    </ThemedText>
                    <ThemedText type="mono" style={{ fontSize: 12, color: theme.textSecondary }}>
                      {scene.durationSeconds}s
                    </ThemedText>
                  </View>

                  {/* Voice Script */}
                  <View style={[styles.scriptBox, { backgroundColor: `${theme.primary}08` }]}>
                    <View style={styles.scriptLabelRow}>
                      <Icons.Mic size={12} color={theme.primary} />
                      <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                        VOICEOVER SCRIPT
                      </ThemedText>
                    </View>
                    <ThemedText type="bodyMedium" style={{ fontSize: 13, lineHeight: 19, marginTop: 4 }}>
                      "{scene.script}"
                    </ThemedText>
                  </View>

                  {/* Visual Cues */}
                  <View style={[styles.visualBox, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.scriptLabelRow}>
                      <Icons.Video size={12} color={theme.textSecondary} />
                      <ThemedText type="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                        CINEMATIC VISUAL CUE
                      </ThemedText>
                    </View>
                    <ThemedText type="caption" style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                      {scene.visualPrompt}
                    </ThemedText>
                  </View>
                </GlassCard>
              ))}
            </View>

            <Button
              label="Share Storyboard Spec"
              variant="outline"
              size="md"
              icon={<Icons.Send size={16} color={theme.primary} />}
              onPress={handleShare}
              style={{ marginTop: Spacing.four }}
            />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 60,
  },
  banner: {
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  sectionLabel: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  singleInput: {
    fontSize: 14,
    height: 36,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    minHeight: 72,
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  durationBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  sceneCard: {
    padding: Spacing.four,
  },
  sceneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sceneBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  scriptBox: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    marginBottom: Spacing.two,
  },
  visualBox: {
    padding: Spacing.three,
    borderRadius: Radii.md,
  },
  scriptLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
