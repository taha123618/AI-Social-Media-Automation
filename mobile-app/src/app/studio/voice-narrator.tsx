import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

const VOICES = [
  { id: 'nova', name: 'Nova', desc: 'Warm & energetic' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Clear & professional' },
  { id: 'alloy', name: 'Alloy', desc: 'Balanced & neutral' },
  { id: 'echo', name: 'Echo', desc: 'Deep & authoritative' },
  { id: 'onyx', name: 'Onyx', desc: 'Cinematic narrator' },
  { id: 'fable', name: 'Fable', desc: 'Storyteller & expressive' },
];

const SPEEDS = ['0.75x', '1.0x', '1.25x', '1.5x'];

export default function VoiceNarratorModal() {
  const theme = useTheme();
  const router = useRouter();

  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [selectedSpeed, setSelectedSpeed] = useState('1.0x');
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveHeights, setWaveHeights] = useState([12, 24, 38, 16, 42, 28, 18, 34, 48, 20, 30, 14]);

  // Waveform pulsing animation simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveHeights((prev) =>
          prev.map(() => Math.floor(Math.random() * 40) + 10)
        );
      }, 150);
    } else {
      setWaveHeights([12, 16, 14, 18, 12, 20, 14, 16, 12, 18, 14, 12]);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Close Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Mic size={22} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Voice Cloning Studio</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Waveform Visualizer Player */}
        <GlassCard style={[styles.playerCard, { backgroundColor: theme.cardElevated }]}>
          <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.three }}>
            SYNTHETIC NARRATION STREAM
          </ThemedText>

          {/* Animated Waveform Bars */}
          <View style={styles.waveformRow}>
            {waveHeights.map((height, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height,
                    backgroundColor: isPlaying ? theme.primary : theme.border,
                  },
                ]}
              />
            ))}
          </View>

          {/* Play / Pause Big Button */}
          <TouchableOpacity
            onPress={togglePlayback}
            style={[styles.playButton, { backgroundColor: theme.primary }]}
            activeOpacity={0.85}
          >
            {isPlaying ? (
              <Icons.Pause size={24} color="#FFFFFF" />
            ) : (
              <Icons.Play size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <ThemedText type="defaultSemiBold" style={{ marginTop: Spacing.three }}>
            {isPlaying ? 'Playing Script Audio...' : 'Tap to Preview Voiceover'}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Voice persona: {selectedVoice.toUpperCase()} ({selectedSpeed})
          </ThemedText>
        </GlassCard>

        {/* Script Content */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Audio Narration Script
        </ThemedText>
        <GlassCard style={styles.scriptCard}>
          <ThemedText style={styles.scriptText}>
            "Welcome to the next evolution of autonomous content orchestration. SocialAI automatically audits your brand tone, compiles high-converting slide carousels, and publishes across five networks seamlessly."
          </ThemedText>
        </GlassCard>

        {/* Voice Persona Selector */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Select Vocal Timbre
        </ThemedText>
        <View style={styles.voicesGrid}>
          {VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedVoice(v.id);
                }}
                style={[
                  styles.voiceCard,
                  {
                    backgroundColor: isSelected ? theme.primaryLight : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Icons.Mic size={18} color={isSelected ? theme.primary : theme.textMuted} />
                <ThemedText type="defaultSemiBold" style={{ color: isSelected ? theme.primary : theme.text }}>
                  {v.name}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textMuted, fontSize: 11 }}>
                  {v.desc}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Speed Controls */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Playback Speed
        </ThemedText>
        <View style={styles.speedRow}>
          {SPEEDS.map((sp) => {
            const isSelected = selectedSpeed === sp;
            return (
              <TouchableOpacity
                key={sp}
                onPress={() => setSelectedSpeed(sp)}
                style={[
                  styles.speedChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="mono"
                  style={{ color: isSelected ? '#FFFFFF' : theme.textSecondary, fontSize: 13 }}
                >
                  {sp}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Attach to Post CTA */}
        <Button
          title="Attach Voiceover to Post"
          variant="primary"
          size="lg"
          icon={<Icons.Sparkles size={18} color="#FFFFFF" />}
          onPress={() => {
            router.push('/(tabs)/composer');
          }}
          style={styles.attachBtn}
        />
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
  playerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    marginBottom: Spacing.four,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 55,
    marginVertical: Spacing.three,
  },
  waveformBar: {
    width: 6,
    borderRadius: 3,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  scriptCard: {
    marginBottom: Spacing.four,
  },
  scriptText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  voicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  voiceCard: {
    width: '48.5%',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: 4,
  },
  speedRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  speedChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  attachBtn: {
    marginTop: Spacing.two,
  },
});
