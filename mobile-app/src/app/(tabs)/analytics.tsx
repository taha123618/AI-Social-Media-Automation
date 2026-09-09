import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useAnalyticsQuery } from '@/hooks/queries/use-analytics-query';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { data: analytics, isLoading, refetch } = useAnalyticsQuery();

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
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

        {isLoading || !analytics ? (
          <View style={styles.loadingContainer}>
            <View style={styles.metricsGrid}>
              <Skeleton width="48%" height={110} style={{ borderRadius: Radii.xl }} />
              <Skeleton width="48%" height={110} style={{ borderRadius: Radii.xl }} />
              <Skeleton width="48%" height={110} style={{ borderRadius: Radii.xl }} />
              <Skeleton width="48%" height={110} style={{ borderRadius: Radii.xl }} />
            </View>
            <Skeleton width="100%" height={160} style={{ borderRadius: Radii.xl, marginTop: Spacing.four }} />
            <Skeleton width="100%" height={140} style={{ borderRadius: Radii.xl, marginTop: Spacing.four }} />
          </View>
        ) : (
          <>
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
          </>
        )}
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
    paddingVertical: Spacing.half,
    borderRadius: Radii.full,
  },
  loadingContainer: {
    gap: Spacing.two,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  metricCard: {
    width: '48%',
    padding: Spacing.three,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  metricBigNumber: {
    fontSize: 22,
    marginBottom: Spacing.two,
  },
  deltaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    fontSize: 15,
  },
  quotasCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
    gap: Spacing.three,
  },
  quotaItem: {
    gap: Spacing.one,
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsCard: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  recText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
