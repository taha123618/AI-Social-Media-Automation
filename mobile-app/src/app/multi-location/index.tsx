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
import { useLocationsQuery } from '@/hooks/queries/use-locations-query';

export default function MultiLocationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: locations = [], isLoading, refetch } = useLocationsQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Building size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Multi-Location Brand Sync</ThemedText>
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
          Regional Locations
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Synchronize brand voice guidelines while allowing regional custom localized scheduling.
        </ThemedText>

        {/* Location Branches */}
        <View style={styles.listContainer}>
          {locations.map((loc) => (
            <GlassCard key={loc.id} style={styles.locCard}>
              <View style={styles.locHeader}>
                <View>
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                    {loc.name}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    {loc.address}, {loc.city}, {loc.state}
                  </ThemedText>
                </View>
                <View style={[styles.syncBadge, { backgroundColor: `${theme.success}20` }]}>
                  <Icons.Check size={12} color={theme.success} />
                  <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                    Synced
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.metricsRow, { borderTopColor: theme.borderSubtle }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Active Campaigns: <ThemedText type="mono" style={{ color: theme.text }}>{loc.activeCampaigns}</ThemedText>
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Local Eng. Rate: <ThemedText type="mono" style={{ color: theme.primary }}>{loc.localEngagementRate}</ThemedText>
                </ThemedText>
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
  locCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  locHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
});
