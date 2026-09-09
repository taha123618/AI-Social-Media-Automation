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
import { useAdsQuery } from '@/hooks/queries/use-ads-query';

export default function UserAdCampaignsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: campaigns = [], isLoading, refetch } = useAdsQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Sparkles size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Ad Campaigns</ThemedText>
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
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="title">Paid Campaigns</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Autonomous multi-variant ad copywriting and budget optimization.
            </ThemedText>
          </View>
        </View>

        {/* Campaigns Stream */}
        <View style={styles.listContainer}>
          {campaigns.map((camp) => (
            <GlassCard key={camp.id} style={styles.campCard}>
              <View style={styles.campHeader}>
                <View>
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                    {camp.name}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    {camp.platform} • {camp.variantsCount} AI Variants
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${theme.success}20` }]}>
                  <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700', fontSize: 10 }}>
                    {camp.status}
                  </ThemedText>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    ROAS
                  </ThemedText>
                  <ThemedText type="mono" style={{ color: theme.success, fontSize: 16, fontWeight: '700' }}>
                    {camp.roas}x
                  </ThemedText>
                </View>

                <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    Daily Budget
                  </ThemedText>
                  <ThemedText type="mono" style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>
                    ${camp.dailyBudget}
                  </ThemedText>
                </View>

                <View style={[styles.metricBox, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    Conversions
                  </ThemedText>
                  <ThemedText type="mono" style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>
                    {camp.conversions}
                  </ThemedText>
                </View>
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
  headerRow: {
    marginBottom: Spacing.four,
  },
  listContainer: {
    gap: Spacing.three,
  },
  campCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  campHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricBox: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Radii.md,
    alignItems: 'center',
    gap: 2,
  },
});
