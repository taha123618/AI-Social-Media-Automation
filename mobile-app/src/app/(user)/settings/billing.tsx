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
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useBillingQuery } from '@/hooks/queries/use-billing-query';

export default function BillingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: billing, isLoading, refetch } = useBillingQuery();

  const handleManageStripe = () => {
    Alert.alert('Customer Portal', 'Stripe Billing Portal link dispatched to your email.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.ShieldCheck size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Plan & Billing</ThemedText>
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
          Subscription Details
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Manage your enterprise plan tier, quota metering, and automated invoices.
        </ThemedText>

        {billing && (
          <View style={styles.contentContainer}>
            {/* Active Plan Card */}
            <GlassCard style={styles.planCard}>
              <View style={styles.planHeader}>
                <View>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    CURRENT PLAN TIER
                  </ThemedText>
                  <ThemedText type="title" style={{ color: theme.primary }}>
                    {billing.planTier} Tier
                  </ThemedText>
                </View>
                <ThemedText type="title" style={{ fontSize: 22 }}>
                  ${billing.amount} <ThemedText type="caption" style={{ color: theme.textMuted }}>/ {billing.interval}</ThemedText>
                </ThemedText>
              </View>

              <View style={[styles.planFooter, { borderTopColor: theme.borderSubtle }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Renews: {billing.renewsAt}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  {billing.paymentMethodMasked}
                </ThemedText>
              </View>
            </GlassCard>

            {/* Quota Progress */}
            <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>
              Usage & Quotas
            </ThemedText>

            <GlassCard style={styles.quotaCard}>
              <View style={styles.quotaRow}>
                <ThemedText type="defaultSemiBold">AI Social Posts</ThemedText>
                <ThemedText type="mono" style={{ color: theme.primary }}>
                  {billing.usage.postsUsed} / {billing.usage.postsLimit}
                </ThemedText>
              </View>

              <View style={styles.quotaRow}>
                <ThemedText type="defaultSemiBold">AI Tokens Processed</ThemedText>
                <ThemedText type="mono" style={{ color: theme.primary }}>
                  {(billing.usage.aiTokensUsed / 1000).toFixed(0)}K / {(billing.usage.aiTokensLimit / 1000).toFixed(0)}K
                </ThemedText>
              </View>

              <View style={styles.quotaRow}>
                <ThemedText type="defaultSemiBold">S3 Media Storage</ThemedText>
                <ThemedText type="mono" style={{ color: theme.primary }}>
                  {billing.usage.storageGbUsed} GB / {billing.usage.storageGbLimit} GB
                </ThemedText>
              </View>
            </GlassCard>

            <Button
              title="Manage Stripe Subscription"
              variant="outline"
              size="lg"
              onPress={handleManageStripe}
              style={{ marginTop: Spacing.two }}
            />
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
  planCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  quotaCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  quotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
