import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useWorkflowsQuery } from '@/hooks/queries/use-workflows-query';
import { backendApi } from '@/lib/backend';

export default function WorkflowsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: workflows = [], isLoading, refetch } = useWorkflowsQuery('PENDING_REVIEW');

  const handleApprove = async (id: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await backendApi.approveWorkflowDraft(id);
      Alert.alert('Workflow Approved', 'Content draft has been approved and moved to the publishing queue.');
      refetch();
    } catch (err: any) {
      Alert.alert('Approval Failed', err?.message || 'Could not approve workflow draft.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await backendApi.rejectWorkflowDraft(id);
      Alert.alert('Workflow Rejected', 'Draft has been returned for agent revision.');
      refetch();
    } catch (err: any) {
      Alert.alert('Rejection Failed', err?.message || 'Could not reject workflow draft.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Check size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Approval Workflows</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <ThemedText type="title" style={styles.pageTitle}>
          Review & Approvals
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Human-in-the-loop review pipeline for agent-generated content and high-stakes campaigns.
        </ThemedText>

        {workflows.length === 0 && !isLoading ? (
          <EmptyState
            icon={<Icons.Check size={32} color={theme.primary} />}
            title="All Caught Up"
            description="No pending drafts currently require human-in-the-loop approval."
            actionLabel="Generate New Draft"
            onAction={() => router.push('/(tabs)/composer')}
          />
        ) : (
          <View style={styles.listContainer}>
            {workflows.map((wf) => (
              <GlassCard key={wf.id} style={styles.wfCard}>
                <View style={styles.wfHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                      {wf.title}
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textMuted }}>
                      By {wf.author} • {wf.platforms.join(', ')}
                    </ThemedText>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: `${theme.success}20` }]}>
                    <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700', fontSize: 10 }}>
                      {wf.riskScore}
                    </ThemedText>
                  </View>
                </View>

                {wf.content ? (
                  <ThemedText type="caption" numberOfLines={3} style={{ color: theme.text }}>
                    {wf.content}
                  </ThemedText>
                ) : null}

                <View style={[styles.actionsRow, { borderTopColor: theme.borderSubtle }]}>
                  <Button
                    title="Reject"
                    variant="outline"
                    size="sm"
                    onPress={() => handleReject(wf.id)}
                  />
                  <Button
                    title="Approve & Queue"
                    variant="primary"
                    size="sm"
                    icon={<Icons.Check size={14} color="#FFFFFF" />}
                    onPress={() => handleApprove(wf.id)}
                  />
                </View>
              </GlassCard>
            ))}
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
  listContainer: {
    gap: Spacing.three,
  },
  wfCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  wfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
});
