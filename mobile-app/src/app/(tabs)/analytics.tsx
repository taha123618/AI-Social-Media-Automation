import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export default function AnalyticsScreen() {
  const theme = useTheme();

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getAnalytics(),
  });

  if (!analytics) return null;

  const renderProgressBar = (used: number, limit: number, label: string) => {
    const percent = Math.min(100, Math.round((used / limit) * 100));
    const isExhausted = percent >= 100;
    const isWarning = percent >= 80 && !isExhausted;
    const barColor = isExhausted ? theme.destructive : isWarning ? theme.warning : theme.primary;

    return (
      <View key={label} style={styles.quotaItem}>
        <View style={styles.quotaHeader}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 13 }}>
            {label}
          </ThemedText>
          <ThemedText type="mono" style={{ fontSize: 13 }}>
            {used} / {limit} ({percent}%)
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: barColor }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle">Growth & Quotas</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              30-day performance telemetry and plan credits
            </ThemedText>
          </View>
          <View style={[styles.planBadge, { backgroundColor: theme.primaryLight }]}>
            <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
              PRO PLAN
            </ThemedText>
          </View>
        </View>

        {/* 4 Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Follower Velocity */}
          <GlassCard style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Follower Velocity
              </ThemedText>
              <Icons.User size={16} color={theme.primary} />
            </View>
            <ThemedText type="title" style={styles.metricBigNumber}>
              {analytics.followerVelocity}
            </ThemedText>
            <View style={[styles.deltaPill, { backgroundColor: theme.successBg }]}>
              <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                {analytics.followerGrowthPercent} this month
              </ThemedText>
            </View>
          </GlassCard>

          {/* Total Impressions */}
          <GlassCard style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Total Impressions
              </ThemedText>
              <Icons.Share2 size={16} color={theme.info} />
            </View>
            <ThemedText type="title" style={styles.metricBigNumber}>
              {analytics.totalImpressions}
            </ThemedText>
            <View style={[styles.deltaPill, { backgroundColor: theme.successBg }]}>
              <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                {analytics.impressionsGrowthPercent} reach
              </ThemedText>
            </View>
          </GlassCard>

          {/* Avg Engagement Rate */}
          <GlassCard style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Engagement Rate
              </ThemedText>
              <Icons.Heart size={16} color={theme.warning} />
            </View>
            <ThemedText type="title" style={styles.metricBigNumber}>
              {analytics.avgEngagementRate}
            </ThemedText>
            <View style={[styles.deltaPill, { backgroundColor: theme.successBg }]}>
              <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                {analytics.engagementGrowthPercent} vs benchmark
              </ThemedText>
            </View>
          </GlassCard>

          {/* Attributed Leads */}
          <GlassCard style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Attributed Leads
              </ThemedText>
              <Icons.Zap size={16} color={theme.success} />
            </View>
            <ThemedText type="title" style={styles.metricBigNumber}>
              {analytics.attributedLeads}
            </ThemedText>
            <View style={[styles.deltaPill, { backgroundColor: theme.successBg }]}>
              <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                {analytics.leadsGrowthPercent} pipeline
              </ThemedText>
            </View>
          </GlassCard>
        </View>

        {/* Plan Quotas Progress Section */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Monthly Quota Telemetry
        </ThemedText>
        <GlassCard style={styles.quotasCard}>
          {renderProgressBar(analytics.quotas.posts.used, analytics.quotas.posts.limit, analytics.quotas.posts.label)}
          {renderProgressBar(
            analytics.quotas.articles.used,
            analytics.quotas.articles.limit,
            analytics.quotas.articles.label
          )}
          {renderProgressBar(
            analytics.quotas.storage.used,
            analytics.quotas.storage.limit,
            analytics.quotas.storage.label
          )}
        </GlassCard>

        {/* AI Recommendations */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          AI Strategic Growth Directives
        </ThemedText>
        <GlassCard style={styles.recommendationsCard}>
          {analytics.aiRecommendations.map((rec: string, index: number) => (
            <View
              key={index}
              style={[
                styles.recRow,
                index < analytics.aiRecommendations.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.borderSubtle,
                },
              ]}
            >
              <Icons.Sparkles size={16} color={theme.primary} />
              <ThemedText style={styles.recText}>{rec}</ThemedText>
            </View>
          ))}
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
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  planBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  metricCard: {
    width: '47.5%',
    padding: Spacing.three,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  metricBigNumber: {
    fontSize: 24,
    lineHeight: 30,
    marginBottom: Spacing.one,
  },
  deltaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  quotasCard: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  quotaItem: {
    gap: 6,
  },
  quotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  recommendationsCard: {
    padding: 0,
    marginBottom: Spacing.four,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  recText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
