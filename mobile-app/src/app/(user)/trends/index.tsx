import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useTrendsQuery } from '@/hooks/queries/use-trends-query';

export default function TrendsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: events = [], isLoading, refetch } = useTrendsQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Zap size={20} color={theme.warning} />
          <ThemedText type="defaultSemiBold">Viral Trends & Events</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.pageTitle}>
          Trend Velocity
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          High-relevance viral trends and timely news opportunities ready for instant generation.
        </ThemedText>

        {/* Trends Stream */}
        <View style={styles.listContainer}>
          {events.map((trend) => (
            <GlassCard key={trend.id} style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: `${theme.primary}20` }]}>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                    {trend.category}
                  </ThemedText>
                </View>
                <ThemedText type="mono" style={{ color: theme.warning, fontWeight: '700' }}>
                  🔥 {trend.velocityScore} Velocity
                </ThemedText>
              </View>

              <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                {trend.title}
              </ThemedText>

              <View style={[styles.hookContainer, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: 2 }}>
                  SUGGESTED VIRAL HOOK
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontStyle: 'italic' }}>
                  "{trend.suggestedHook}"
                </ThemedText>
              </View>

              <View style={[styles.trendFooter, { borderTopColor: theme.borderSubtle }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Peak: {trend.peakWindow}
                </ThemedText>
                <Button
                  title="Generate Post"
                  variant="primary"
                  size="sm"
                  icon={<Icons.Sparkles size={14} color="#FFFFFF" />}
                  onPress={() => router.push('/(tabs)/composer')}
                />
              </View>
            </GlassCard>
          ))}
        </View>
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
  listContainer: {
    gap: Spacing.three,
  },
  trendCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  hookContainer: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    marginTop: Spacing.one,
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    marginTop: Spacing.two,
    borderTopWidth: 1,
  },
});
