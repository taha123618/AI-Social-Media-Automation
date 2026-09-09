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
import { Badge, SocialPlatform } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useListeningQuery } from '@/hooks/queries/use-listening-query';

export default function SocialListeningScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: mentions = [], isLoading, refetch } = useListeningQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Radio size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Social Listening</ThemedText>
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
          Brand Mentions Radar
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Real-time cross-network sentiment analysis and automated opportunity detection.
        </ThemedText>

        {/* Mentions Stream */}
        <View style={styles.listContainer}>
          {mentions.map((men) => (
            <GlassCard key={men.id} style={styles.mentionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.authorRow}>
                  <ThemedText type="defaultSemiBold">{men.author}</ThemedText>
                  <Badge variant="platform" platform={men.platform as SocialPlatform} />
                </View>
                <View style={[styles.sentimentPill, { backgroundColor: `${theme.success}20` }]}>
                  <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700', fontSize: 10 }}>
                    {men.sentimentScore}% {men.sentiment}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.mentionContent}>
                "{men.content}"
              </ThemedText>

              <View style={[styles.cardFooter, { borderTopColor: theme.borderSubtle }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Reach: {men.reach.toLocaleString()} • {men.timestamp}
                </ThemedText>
                <ThemedText type="mono" style={{ color: theme.primary, fontSize: 12 }}>
                  🔥 {men.engagement} Engagements
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
  mentionCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sentimentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  mentionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: 1,
  },
});
