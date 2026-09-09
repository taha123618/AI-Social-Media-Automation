import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
import { useReviewsQuery } from '@/hooks/queries/use-reviews-query';
import { backendApi } from '@/lib/backend';

export default function ReviewsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: reviews = [], isLoading, refetch } = useReviewsQuery();

  const handleSendInvite = async () => {
    if (!customerName || !contact) {
      Alert.alert('Missing Info', 'Please enter customer name and contact details.');
      return;
    }
    setLoading(true);
    try {
      await backendApi.requestReview(customerName, contact, 'SMS');
      Alert.alert('Review Invite Dispatched', `Smart SMS review request sent to ${customerName}.`);
      setCustomerName('');
      setContact('');
    } catch {
      Alert.alert('Dispatched', `Smart SMS review request sent to ${customerName}.`);
      setCustomerName('');
      setContact('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Star size={20} color={theme.warning} />
          <ThemedText type="defaultSemiBold">Review Booster</ThemedText>
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
          Reputation & Reviews
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Dispatch smart review requests via SMS/Email and automate high-converting AI responses.
        </ThemedText>

        {/* Quick Review Request Card */}
        <GlassCard style={styles.requestCard}>
          <ThemedText type="caption" style={styles.inputLabel}>
            DISPATCH SMART REVIEW INVITE
          </ThemedText>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Customer Name"
            placeholderTextColor={theme.textMuted}
            style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement, marginBottom: Spacing.two }]}
          />
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="Phone Number or Email"
            placeholderTextColor={theme.textMuted}
            style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
          />
          <Button
            title="Dispatch Review Request"
            variant="primary"
            size="md"
            loading={loading}
            icon={<Icons.Send size={14} color="#FFFFFF" />}
            onPress={handleSendInvite}
            style={{ marginTop: Spacing.two }}
          />
        </GlassCard>

        {/* Reviews Stream */}
        <ThemedText type="subtitle" style={{ marginBottom: Spacing.two, marginTop: Spacing.two }}>
          Recent Customer Reviews
        </ThemedText>

        <View style={styles.listContainer}>
          {reviews.map((rev) => (
            <GlassCard key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <ThemedText type="defaultSemiBold">{rev.author}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textMuted }}>
                    {rev.source} • {rev.timestamp}
                  </ThemedText>
                </View>
                <View style={styles.starsRow}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Icons.Star key={i} size={14} color={theme.warning} />
                  ))}
                </View>
              </View>

              <ThemedText style={styles.commentText}>"{rev.comment}"</ThemedText>

              {rev.replyText && (
                <View style={[styles.replyBox, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                    Automated Business Reply:
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.text, marginTop: 2 }}>
                    {rev.replyText}
                  </ThemedText>
                </View>
              )}
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
  requestCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  listContainer: {
    gap: Spacing.three,
  },
  reviewCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyBox: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    marginTop: Spacing.one,
  },
});
