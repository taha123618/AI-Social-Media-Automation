import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);

const THEMES = [
  { id: 'MODERN_DARK', name: 'Dark Studio', bg: '#18181B', text: '#FFFFFF', accent: '#7C3AED' },
  { id: 'GRADIENT_PURPLE', name: 'Electric Purple', bg: '#4C1D95', text: '#FFFFFF', accent: '#A78BFA' },
  { id: 'CYBERPUNK_NEON', name: 'Cyberpunk', bg: '#0A0A0A', text: '#00FFA3', accent: '#00FFA3' },
  { id: 'MINIMAL_LIGHT', name: 'Minimal White', bg: '#FFFFFF', text: '#09090B', accent: '#7C3AED' },
  { id: 'SUNSET_ORANGE', name: 'Sunset', bg: '#7C2D12', text: '#FFFFFF', accent: '#FB923C' },
  { id: 'FOREST_EMERALD', name: 'Emerald', bg: '#064E3B', text: '#FFFFFF', accent: '#34D399' },
];

const SLIDES = [
  {
    layout: 'HOOK',
    title: 'The Multi-Agent AI Playbook',
    content: 'Why autonomous agent swarms outperform single-model prompts in B2B marketing by 4.2x.',
    badge: 'SLIDE 1 / 5',
  },
  {
    layout: 'METRIC',
    title: '3.4x More Reposts',
    content: 'Visual swipe carousels on LinkedIn capture 280% longer dwell time than standard links.',
    badge: 'SLIDE 2 / 5',
  },
  {
    layout: 'FRAMEWORK',
    title: 'Step 1: Brand Guardian',
    content: 'Real-time Flesch-Kincaid reading audits ensure every post reads effortlessly at a 7th-grade level.',
    badge: 'SLIDE 3 / 5',
  },
  {
    layout: 'FRAMEWORK',
    title: 'Step 2: Peak Queue Timing',
    content: 'Automated BullMQ worker scheduling dispatches posts in localized peak audience windows.',
    badge: 'SLIDE 4 / 5',
  },
  {
    layout: 'CTA',
    title: 'Scale Organic Pipeline',
    content: 'Automate your multi-platform presence with SocialAI Studio today.',
    badge: 'SLIDE 5 / 5',
  },
];

export default function CarouselPreviewModal() {
  const theme = useTheme();
  const router = useRouter();

  const [activeThemeId, setActiveThemeId] = useState('MODERN_DARK');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  const handleNextSlide = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Close Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Layers size={22} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Carousel Studio Preview</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Theme Picker */}
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.two }}>
          Select Visual Theme
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themePickerScroll}>
          {THEMES.map((th) => {
            const isSelected = activeThemeId === th.id;
            return (
              <TouchableOpacity
                key={th.id}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setActiveThemeId(th.id);
                }}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: th.bg,
                    borderColor: isSelected ? theme.primary : 'rgba(255,255,255,0.2)',
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <ThemedText type="caption" style={{ color: th.text, fontWeight: '700' }}>
                  {th.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Slide Canvas Viewer */}
        <View style={styles.canvasContainer}>
          <View
            style={[
              styles.slideCard,
              {
                width: SLIDE_WIDTH,
                height: SLIDE_WIDTH * 1.25, // 4:5 Aspect Ratio
                backgroundColor: activeTheme.bg,
                borderColor: activeTheme.accent,
              },
            ]}
          >
            {/* Header Badge */}
            <View style={styles.slideHeader}>
              <View style={[styles.badgePill, { backgroundColor: `${activeTheme.accent}25` }]}>
                <ThemedText type="mono" style={{ color: activeTheme.accent, fontSize: 11 }}>
                  {currentSlide.badge}
                </ThemedText>
              </View>
              <ThemedText type="caption" style={{ color: activeTheme.accent, fontWeight: '700' }}>
                SOCIALAI
              </ThemedText>
            </View>

            {/* Slide Body */}
            <View style={styles.slideBody}>
              <ThemedText
                style={[
                  styles.slideTitle,
                  { color: activeTheme.text },
                ]}
              >
                {currentSlide.title}
              </ThemedText>
              <ThemedText
                style={[
                  styles.slideContent,
                  { color: activeTheme.text, opacity: 0.85 },
                ]}
              >
                {currentSlide.content}
              </ThemedText>
            </View>

            {/* Swipe prompt footer */}
            <View style={styles.slideFooter}>
              <ThemedText type="caption" style={{ color: activeTheme.accent }}>
                Swipe to explore 👉
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Navigation Arrows & Indicator */}
        <View style={styles.carouselNavRow}>
          <Button
            title="Previous"
            variant="secondary"
            size="sm"
            disabled={currentSlideIndex === 0}
            onPress={handlePrevSlide}
          />

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentSlideIndex ? theme.primary : theme.border,
                    width: i === currentSlideIndex ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>

          <Button
            title="Next Slide"
            variant="primary"
            size="sm"
            disabled={currentSlideIndex === SLIDES.length - 1}
            onPress={handleNextSlide}
          />
        </View>

        {/* Export / Queue CTA */}
        <Button
          title="Export Deck to Post Composer"
          variant="primary"
          size="lg"
          icon={<Icons.Sparkles size={18} color="#FFFFFF" />}
          onPress={() => {
            router.push('/(tabs)/composer');
          }}
          style={styles.exportBtn}
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
  themePickerScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  themeChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    marginRight: Spacing.two,
  },
  canvasContainer: {
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  slideCard: {
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    padding: Spacing.five,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  slideBody: {
    gap: Spacing.two,
  },
  slideTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  slideContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  slideFooter: {
    alignItems: 'flex-end',
  },
  carouselNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.four,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  exportBtn: {
    marginTop: Spacing.two,
  },
});
