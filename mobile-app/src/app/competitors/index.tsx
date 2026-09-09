import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import { useCompetitorsQuery } from '@/hooks/queries/use-competitors-query';

export default function CompetitorsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [domainInput, setDomainInput] = useState('');
  const { data: competitors = [], isLoading, refetch } = useCompetitorsQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.ShieldCheck size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Competitor Intelligence</ThemedText>
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
          Market Radar
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Autonomous SWOT analysis, keyword tracking, and market-share benchmarking.
        </ThemedText>

        {/* Scan Input */}
        <GlassCard style={styles.scanCard}>
          <ThemedText type="caption" style={styles.inputLabel}>
            SCAN NEW COMPETITOR DOMAIN
          </ThemedText>
          <View style={styles.inputRow}>
            <TextInput
              value={domainInput}
              onChangeText={setDomainInput}
              placeholder="e.g. hootsuite.com"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
            />
            <Button
              title="Scan"
              variant="primary"
              size="md"
              onPress={() => refetch()}
            />
          </View>
        </GlassCard>

        {/* Competitor Cards Stream */}
        <View style={styles.listContainer}>
          {competitors.map((comp) => (
            <GlassCard key={comp.id} style={styles.compCard}>
              <View style={styles.compHeader}>
                <View>
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                    {comp.name}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    {comp.domain}
                  </ThemedText>
                </View>
                <View style={[styles.shareBadge, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                    {comp.marketSharePercent}% Share
                  </ThemedText>
                </View>
              </View>

              {/* Traffic Metric */}
              <View style={styles.metricRow}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Est. Traffic: <ThemedText type="mono" style={{ color: theme.text }}>{comp.estimatedTraffic}</ThemedText>
                </ThemedText>
              </View>

              {/* Top Keywords */}
              <View style={styles.keywordsRow}>
                {comp.topKeywords.map((kw, i) => (
                  <View key={i} style={[styles.kwChip, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText type="caption" style={{ fontSize: 11 }}>
                      #{kw}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Strengths & Weaknesses */}
              <View style={styles.swotGrid}>
                <View style={[styles.swotBox, { borderColor: theme.success, backgroundColor: `${theme.success}10` }]}>
                  <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                    ✓ STRENGTHS
                  </ThemedText>
                  {comp.strengths.map((s, i) => (
                    <ThemedText key={i} type="caption" style={{ fontSize: 11, marginTop: 2 }}>
                      • {s}
                    </ThemedText>
                  ))}
                </View>

                <View style={[styles.swotBox, { borderColor: theme.destructive, backgroundColor: `${theme.destructive}10` }]}>
                  <ThemedText type="caption" style={{ color: theme.destructive, fontWeight: '700' }}>
                    ⚠ VULNERABILITIES
                  </ThemedText>
                  {comp.weaknesses.map((w, i) => (
                    <ThemedText key={i} type="caption" style={{ fontSize: 11, marginTop: 2 }}>
                      • {w}
                    </ThemedText>
                  ))}
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
  pageTitle: {
    marginBottom: Spacing.one,
  },
  scanCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  listContainer: {
    gap: Spacing.three,
  },
  compCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  compHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  metricRow: {
    marginTop: 2,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginVertical: Spacing.one,
  },
  kwChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  swotGrid: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  swotBox: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.two,
  },
});
