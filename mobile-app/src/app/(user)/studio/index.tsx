import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UserStudioScreen() {
  const theme = useTheme();
  const router = useRouter();

  const STUDIOS = [
    {
      title: 'Image Diffusion Studio',
      description: 'Generate hyper-realistic marketing imagery across custom aspect ratios.',
      route: '/image',
      icon: Icons.Image,
      badge: 'PRO',
      badgeColor: theme.primary,
    },
    {
      title: 'RAG Video Storyboard',
      description: 'Convert scripts and brand ideas into animated multi-scene video pipelines.',
      route: '/videos',
      icon: Icons.Video,
      badge: 'PRO',
      badgeColor: theme.secondary,
    },
    {
      title: 'Voice Narration & TTS',
      description: 'Synthesize professional studio voiceovers with ElevenLabs neural voices.',
      route: '/voice',
      icon: Icons.Mic,
      badge: 'VOICE AI',
      badgeColor: theme.info,
    },
    {
      title: 'Carousel Card Studio',
      description: 'Design high-converting swipeable carousel decks for LinkedIn and Instagram.',
      route: '/carousels',
      icon: Icons.Layers,
      badge: 'VIRAL',
      badgeColor: theme.success,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Top Header */}
        <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.backgroundElement }]}
            hitSlop={12}
          >
            <Icons.ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Creative AI Studios
          </ThemedText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Banner */}
          <GlassCard style={styles.banner}>
            <View style={styles.bannerRow}>
              <View style={[styles.bannerIconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.Sparkles size={24} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium" style={{ fontWeight: '800' }}>
                  Generative Multi-Modal Studio
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  Transform raw concepts into visual, acoustic, and interactive marketing assets.
                </ThemedText>
              </View>
            </View>
          </GlassCard>

          {/* Studios List */}
          <View style={styles.grid}>
            {STUDIOS.map((st, i) => {
              const Icon = st.icon;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.85}
                  onPress={() => router.push(st.route as any)}
                >
                  <GlassCard style={styles.studioCard}>
                    <View style={styles.studioCardHeader}>
                      <View style={[styles.studioIconBox, { backgroundColor: theme.primaryGlow }]}>
                        <Icon size={22} color={theme.primary} />
                      </View>
                      <Badge label={st.badge} variant="platform" size="sm" style={{ backgroundColor: theme.backgroundElement }} />
                    </View>

                    <ThemedText style={styles.studioTitle}>{st.title}</ThemedText>
                    <ThemedText style={[styles.studioDesc, { color: theme.textSecondary }]}>
                      {st.description}
                    </ThemedText>

                    <View style={styles.studioCardFooter}>
                      <ThemedText style={[styles.launchText, { color: theme.primary }]}>
                        Launch Studio
                      </ThemedText>
                      <Icons.ArrowUpRight size={16} color={theme.primary} />
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight * 2,
  },
  banner: {
    padding: Spacing.four,
    borderRadius: Radii.xl,
    marginBottom: Spacing.five,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    gap: Spacing.four,
  },
  studioCard: {
    padding: Spacing.four,
    borderRadius: Radii.xl,
  },
  studioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  studioIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studioTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  studioDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  studioCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  launchText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
