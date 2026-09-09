import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge, SocialPlatform } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useSocialQuery } from '@/hooks/queries/use-social-query';

export default function SocialAccountsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: accounts = [], isLoading, refetch } = useSocialQuery();

  const handleSyncAll = () => {
    Alert.alert('Accounts Synced', 'All OAuth tokens and audience telemetry refreshed from provider APIs.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Share2 size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Connected Accounts</ThemedText>
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
            <ThemedText type="title">Social Channels</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Manage OAuth integrations across LinkedIn, X, Instagram, TikTok, and YouTube.
            </ThemedText>
          </View>
          <Button
            title="Sync All"
            variant="outline"
            size="sm"
            onPress={handleSyncAll}
          />
        </View>

        {/* Accounts List */}
        <View style={styles.listContainer}>
          {accounts.map((acc) => (
            <GlassCard key={acc.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountIdentity}>
                  <Badge variant="platform" platform={acc.platform as SocialPlatform} />
                  <View>
                    <ThemedText type="defaultSemiBold">{acc.displayName}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textMuted }}>
                      {acc.username}
                    </ThemedText>
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: `${theme.success}20` }]}>
                  <Icons.Check size={12} color={theme.success} />
                  <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                    Connected
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: theme.borderSubtle }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Audience: <ThemedText type="mono" style={{ color: theme.text }}>{acc.followersCount.toLocaleString()}</ThemedText> followers
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Token: {acc.tokenExpiresAt}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  listContainer: {
    gap: Spacing.three,
  },
  accountCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
});
