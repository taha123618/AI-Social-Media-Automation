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
import { useKnowledgeQuery } from '@/hooks/queries/use-knowledge-query';

export default function KnowledgeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: profile, isLoading, refetch } = useKnowledgeQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Bookmark size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Brand DNA & Knowledge</ThemedText>
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
          Brand Memory Vault
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Vectorized context documents and tone profiles that ground all autonomous AI agents.
        </ThemedText>

        {profile && (
          <View style={styles.contentContainer}>
            {/* Tone Card */}
            <GlassCard style={styles.infoCard}>
              <ThemedText type="caption" style={styles.cardLabel}>
                BRAND VOICE & TONE GUIDELINES
              </ThemedText>
              <ThemedText style={styles.cardBody}>
                {profile.brandVoice}
              </ThemedText>
            </GlassCard>

            {/* Target Audience Card */}
            <GlassCard style={styles.infoCard}>
              <ThemedText type="caption" style={styles.cardLabel}>
                TARGET ICP AUDIENCE
              </ThemedText>
              <ThemedText style={styles.cardBody}>
                {profile.targetAudience}
              </ThemedText>
            </GlassCard>

            {/* Core Offerings */}
            <GlassCard style={styles.infoCard}>
              <ThemedText type="caption" style={styles.cardLabel}>
                INDEXED KEY PRODUCTS & SERVICES
              </ThemedText>
              <View style={styles.tagsRow}>
                {profile.keyProducts.map((prod, i) => (
                  <View key={i} style={[styles.productTag, { backgroundColor: theme.primaryLight }]}>
                    <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                      {prod}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Sync Meta */}
            <View style={[styles.metaRow, { borderTopColor: theme.borderSubtle }]}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {profile.documentsCount} Vector Documents Indexed
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.success }}>
                ✓ Last Trained: {profile.lastTrainedAt}
              </ThemedText>
            </View>
          </View>
        )}
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
  contentContainer: {
    gap: Spacing.three,
  },
  infoCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  productTag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
});
