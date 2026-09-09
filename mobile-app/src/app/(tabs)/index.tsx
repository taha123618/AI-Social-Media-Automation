import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge, PostStatus, SocialPlatform } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { UsageLimitIndicator } from '@/components/billing/usage-limit-indicator';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { usePostsQuery } from '@/hooks/queries/use-posts-query';
import { useWorkflowsQuery } from '@/hooks/queries/use-workflows-query';
import { useBillingQuery } from '@/hooks/queries/use-billing-query';
import { usePostMutations } from '@/hooks/mutations/use-post-mutations';
import { Post } from '@/types/api';
import { useAuthStore } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'ALL' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [activeWorkspaceId, workspaces]
  );

  const { data: posts = [], isLoading: isPostsLoading, refetch: refetchPosts } = usePostsQuery();
  const { data: workflows = [], isLoading: isWorkflowsLoading, refetch: refetchWorkflows } = useWorkflowsQuery();
  const { data: billingDetails, isLoading: isBillingLoading, refetch: refetchBilling } = useBillingQuery();
  const { publishPostMutation, deletePostMutation } = usePostMutations();

  const isRefreshing = isPostsLoading || isWorkflowsLoading || isBillingLoading;

  const handleRefresh = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await Promise.all([refetchPosts(), refetchWorkflows(), refetchBilling()]);
  };

  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'ALL') return posts;
    return posts.filter((p) => p.status === selectedFilter);
  }, [posts, selectedFilter]);

  const filterCounts = useMemo(() => {
    return {
      ALL: posts.length,
      SCHEDULED: posts.filter((p) => p.status === 'SCHEDULED').length,
      DRAFT: posts.filter((p) => p.status === 'DRAFT').length,
      PUBLISHED: posts.filter((p) => p.status === 'PUBLISHED').length,
    };
  }, [posts]);

  const handleFilterSelect = (filter: FilterType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFilter(filter);
  };

  const handlePublishNow = (post: Post) => {
    publishPostMutation.mutate(post.id);
  };

  const handleDelete = (post: Post) => {
    Alert.alert('Delete Post', 'Are you sure you want to remove this post from your queue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePostMutation.mutate(post.id) },
    ]);
  };

  const activePlanName = billingDetails?.planTier || activeWorkspace?.planTier || 'Pro';
  const isPaidTier = activePlanName.toLowerCase() !== 'free';

  const metrics = [
    {
      title: 'Total Activity',
      value: posts.length.toString(),
      icon: Icons.Activity,
      description: 'AI generated posts & vectors',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Active Subscription',
      value: activePlanName,
      icon: Icons.CreditCard,
      description: isPaidTier ? 'Automated billing active' : '14-day Pro trial available',
      badge: isPaidTier ? 'PRO TIER' : 'FREE PLAN',
    },
    {
      title: 'Active Workflows',
      value: workflows.length.toString(),
      icon: Icons.Workflow,
      description: 'Autonomous agent pipelines',
      trend: '+4.2%',
      trendUp: true,
    },
    {
      title: 'Support & System',
      value: 'Operational',
      icon: Icons.HelpCircle,
      description: '99.9% agent engine uptime',
      badge: 'OPTIMAL',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          {/* Executive Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <ThemedText type="title" style={styles.greetingTitle}>
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </ThemedText>
              <ThemedText type="caption" style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                Monitor your autonomous AI fleets, content queues, and subscription quota telemetry.
              </ThemedText>
            </View>

            {/* Quick Launch Header Actions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.headerActionsScroll}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/blog' as any)}
                style={[styles.headerActionBtn, { backgroundColor: theme.primary }]}
              >
                <Icons.Sparkles size={14} color="#FFFFFF" />
                <ThemedText style={styles.headerActionText}>Generate Article</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/workflows' as any)}
                style={[styles.headerActionBtn, styles.headerActionOutline, { borderColor: theme.border, backgroundColor: theme.card }]}
              >
                <Icons.Workflow size={14} color={theme.text} />
                <ThemedText style={[styles.headerActionTextOutline, { color: theme.text }]}>View Workflows</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/composer' as any)}
                style={[styles.headerActionBtn, styles.headerActionOutline, { borderColor: theme.border, backgroundColor: theme.card }]}
              >
                <Icons.Plus size={14} color={theme.text} />
                <ThemedText style={[styles.headerActionTextOutline, { color: theme.text }]}>New Post</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 4 KPI Metrics Grid */}
          <View style={styles.metricsGrid}>
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <GlassCard key={i} style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <ThemedText type="caption" style={[styles.metricTitle, { color: theme.textSecondary }]}>
                      {metric.title}
                    </ThemedText>
                    <View style={[styles.metricIconBox, { backgroundColor: theme.primaryGlow }]}>
                      <Icon size={16} color={theme.primary} />
                    </View>
                  </View>

                  <ThemedText type="title" style={styles.metricValue}>
                    {metric.value}
                  </ThemedText>

                  <View style={styles.metricFooter}>
                    <ThemedText type="caption" style={[styles.metricDesc, { color: theme.textMuted }]} numberOfLines={1}>
                      {metric.description}
                    </ThemedText>
                    {metric.trend && (
                      <View style={[styles.trendBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                        <Icons.TrendingUp size={11} color={theme.success} />
                        <ThemedText type="mono" style={[styles.trendText, { color: theme.success }]}>
                          {metric.trend}
                        </ThemedText>
                      </View>
                    )}
                    {metric.badge && (
                      <View style={[styles.badgeTag, { backgroundColor: theme.backgroundElement }]}>
                        <ThemedText type="mono" style={[styles.badgeTagText, { color: theme.textSecondary }]}>
                          {metric.badge}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </GlassCard>
              );
            })}
          </View>

          {/* Resource Quota Telemetry Section */}
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.primaryGlow }]}>
                  <Icons.Gauge size={18} color={theme.primary} />
                </View>
                <View>
                  <ThemedText type="bodyMedium" style={{ fontWeight: '800' }}>
                    Resource Quota Telemetry
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    Live billing cycle capacity and feature consumption meters.
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/settings/billing' as any)}
                style={[styles.smallBtn, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
              >
                <ThemedText style={[styles.smallBtnText, { color: theme.text }]}>Manage Quotas</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.quotaGrid}>
              <UsageLimitIndicator
                label="Monthly AI Posts"
                used={billingDetails?.usage?.postsUsed || posts.length}
                limit={billingDetails?.usage?.postsLimit || 100}
              />
              <UsageLimitIndicator
                label="AI Tokens & Storage"
                used={billingDetails?.usage?.aiTokensUsed || 125000}
                limit={billingDetails?.usage?.aiTokensLimit || 1000000}
                unit="Tokens"
              />
              <UsageLimitIndicator
                label="Cloud Storage Assets"
                used={billingDetails?.usage?.storageGbUsed || 1.2}
                limit={billingDetails?.usage?.storageGbLimit || 10}
                unit="GB"
              />
            </View>
          </GlassCard>

          {/* AI Content Generation Engine */}
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View>
                <ThemedText type="bodyMedium" style={{ fontWeight: '800' }}>
                  AI Content Generation Engine
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Launch autonomous AI agents to produce high-ranking content.
                </ThemedText>
              </View>
              <Badge label="AGENTIC V2" variant="platform" size="sm" style={{ backgroundColor: theme.backgroundElement }} />
            </View>

            <View style={styles.engineGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/blog' as any)}
                style={[styles.engineCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
              >
                <View style={styles.engineCardTop}>
                  <View style={[styles.engineIconCircle, { backgroundColor: theme.primaryGlow }]}>
                    <Icons.FileText size={18} color={theme.primary} />
                  </View>
                  <Icons.ArrowUpRight size={16} color={theme.textSecondary} />
                </View>
                <ThemedText style={styles.engineCardTitle}>Long-Form SEO Articles</ThemedText>
                <ThemedText style={[styles.engineCardDesc, { color: theme.textSecondary }]}>
                  Compose Gutenberg-ready blog posts with keyword research and automatic schema markup.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/workflows' as any)}
                style={[styles.engineCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
              >
                <View style={styles.engineCardTop}>
                  <View style={[styles.engineIconCircle, { backgroundColor: theme.primaryGlow }]}>
                    <Icons.Workflow size={18} color={theme.primary} />
                  </View>
                  <Icons.ArrowUpRight size={16} color={theme.textSecondary} />
                </View>
                <ThemedText style={styles.engineCardTitle}>Multi-Step Workflows</ThemedText>
                <ThemedText style={[styles.engineCardDesc, { color: theme.textSecondary }]}>
                  Automate cross-network scheduling, competitor counter-posting, and engagement.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/arena' as any)}
                style={[styles.engineCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
              >
                <View style={styles.engineCardTop}>
                  <View style={[styles.engineIconCircle, { backgroundColor: theme.primaryGlow }]}>
                    <Icons.Compass size={18} color={theme.primary} />
                  </View>
                  <Icons.ArrowUpRight size={16} color={theme.textSecondary} />
                </View>
                <ThemedText style={styles.engineCardTitle}>AI Model Arena</ThemedText>
                <ThemedText style={[styles.engineCardDesc, { color: theme.textSecondary }]}>
                  Multi-LLM side-by-side benchmark & comparison across GPT-4o, Claude, DeepSeek, and Gemini.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/competitors' as any)}
                style={[styles.engineCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
              >
                <View style={styles.engineCardTop}>
                  <View style={[styles.engineIconCircle, { backgroundColor: theme.primaryGlow }]}>
                    <Icons.Target size={18} color={theme.primary} />
                  </View>
                  <Icons.ArrowUpRight size={16} color={theme.textSecondary} />
                </View>
                <ThemedText style={styles.engineCardTitle}>Competitor Intelligence</ThemedText>
                <ThemedText style={[styles.engineCardDesc, { color: theme.textSecondary }]}>
                  Autonomous SWOT analysis, keyword radar & real-time market share telemetry.
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Scale Banner */}
            <View style={[styles.proBanner, { backgroundColor: theme.primaryGlow, borderColor: theme.primaryLight }]}>
              <View style={styles.proBannerLeft}>
                <View style={[styles.proBannerIcon, { backgroundColor: theme.primary }]}>
                  <Icons.Zap size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.proBannerTitle}>Scale Your Production Capacity</ThemedText>
                  <ThemedText style={[styles.proBannerSubtitle, { color: theme.textSecondary }]}>
                    Upgrade to Pro for unlimited brand voices and priority background worker queues.
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/settings/billing' as any)}
                style={[styles.proBannerBtn, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={styles.proBannerBtnText}>Manage Plan</ThemedText>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Recent Content Activity & Live Queue */}
          <View style={styles.feedSectionHeader}>
            <View>
              <ThemedText type="bodyMedium" style={{ fontWeight: '800', fontSize: 16 }}>
                Recent Content Activity
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Latest drafts and pipeline generation events ({filteredPosts.length})
              </ThemedText>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/composer' as any)}
              style={styles.newPostLink}
            >
              <ThemedText style={[styles.newPostLinkText, { color: theme.primary }]}>+ New Draft</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(['ALL', 'PUBLISHED', 'SCHEDULED', 'DRAFT'] as FilterType[]).map((filter) => {
              const isSelected = selectedFilter === filter;
              const count = filterCounts[filter];
              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.7}
                  onPress={() => handleFilterSelect(filter)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {filter === 'ALL' ? 'All Content' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                  </ThemedText>
                  <View
                    style={[
                      styles.filterBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : theme.backgroundElement,
                      },
                    ]}
                  >
                    <ThemedText
                      type="mono"
                      style={[
                        styles.filterBadgeText,
                        { color: isSelected ? '#FFFFFF' : theme.textMuted },
                      ]}
                    >
                      {count}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Posts Feed Items */}
          {filteredPosts.length > 0 ? (
            filteredPosts.map((item) => (
              <GlassCard key={item.id} style={styles.postCard}>
                {/* Card Header: Platforms & Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.platformBadges}>
                    {item.platforms.map((plat) => (
                      <Badge
                        key={plat}
                        variant="platform"
                        platform={plat as SocialPlatform}
                        style={styles.badgeSpacing}
                      />
                    ))}
                  </View>
                  <Badge variant="status" status={item.status} />
                </View>

                {/* Content Body */}
                <ThemedText style={styles.postContent} numberOfLines={4}>
                  {item.content}
                </ThemedText>

                {/* Media Preview if attached */}
                {item.mediaUrl && (
                  <View style={styles.mediaContainer}>
                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.mediaImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {item.mediaType === 'video' && (
                      <View style={styles.videoBadge}>
                        <Icons.Video size={12} color="#FFFFFF" />
                        <ThemedText style={styles.videoBadgeText}>VIDEO</ThemedText>
                      </View>
                    )}
                  </View>
                )}

                {/* Telemetry / Scheduled Time */}
                <View style={styles.cardFooter}>
                  <View style={styles.timeInfo}>
                    <Icons.Clock size={14} color={theme.textMuted} />
                    <ThemedText type="caption" style={styles.timeText}>
                      {item.status === 'PUBLISHED'
                        ? 'Published recently'
                        : `Scheduled for ${new Date(item.scheduledFor).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`}
                    </ThemedText>
                  </View>

                  {item.brandToneScore && (
                    <View style={styles.scoreBadge}>
                      <Icons.ShieldCheck size={14} color={theme.success} />
                      <ThemedText type="mono" style={[styles.scoreText, { color: theme.success }]}>
                        {item.brandToneScore}% Tone
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Analytics if published */}
                {item.analytics && (
                  <View style={[styles.analyticsRow, { borderTopColor: theme.borderSubtle }]}>
                    <View style={styles.metricItem}>
                      <Icons.Heart size={14} color={theme.primary} />
                      <ThemedText type="mono" style={styles.metricItemValue}>
                        {item.analytics.likes}
                      </ThemedText>
                    </View>
                    <View style={styles.metricItem}>
                      <Icons.MessageCircle size={14} color={theme.info} />
                      <ThemedText type="mono" style={styles.metricItemValue}>
                        {item.analytics.comments}
                      </ThemedText>
                    </View>
                    <View style={styles.metricItem}>
                      <Icons.Share2 size={14} color={theme.secondary} />
                      <ThemedText type="mono" style={styles.metricItemValue}>
                        {item.analytics.shares}
                      </ThemedText>
                    </View>
                    <View style={styles.metricItem}>
                      <Icons.BarChart size={14} color={theme.success} />
                      <ThemedText type="mono" style={styles.metricItemValue}>
                        {item.analytics.impressions}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={[styles.actionRow, { borderTopColor: theme.borderSubtle }]}>
                  {item.status !== 'PUBLISHED' && (
                    <Button
                      label="Publish Now"
                      variant="primary"
                      size="sm"
                      icon={<Icons.Send size={14} color="#FFFFFF" />}
                      onPress={() => handlePublishNow(item)}
                      style={styles.publishBtn}
                    />
                  )}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDelete(item)}
                    style={[styles.deleteBtn, { backgroundColor: theme.backgroundElement }]}
                  >
                    <Icons.Trash size={16} color={theme.destructive} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.emptyState}>
              <Icons.Layers size={36} color={theme.textMuted} />
              <ThemedText style={styles.emptyTitle}>No recent posts yet</ThemedText>
              <ThemedText type="caption" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Generate your first article or social post to populate this feed.
              </ThemedText>
              <Button
                label="Launch AI Composer"
                variant="primary"
                size="md"
                icon={<Icons.Sparkles size={16} color="#FFFFFF" />}
                onPress={() => router.push('/(tabs)/composer' as any)}
                style={{ marginTop: Spacing.four }}
              />
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight * 2,
  },
  header: {
    marginBottom: Spacing.five,
  },
  headerTextContainer: {
    marginBottom: Spacing.three,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  headerActionsScroll: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radii.lg,
    gap: 6,
  },
  headerActionOutline: {
    borderWidth: 1,
  },
  headerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerActionTextOutline: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  metricCard: {
    width: (SCREEN_WIDTH - Spacing.four * 2 - Spacing.three) / 2,
    padding: Spacing.three,
    borderRadius: Radii.xl,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metricDesc: {
    fontSize: 10,
    flex: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  badgeTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: Radii.xl,
    marginBottom: Spacing.five,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quotaGrid: {
    gap: Spacing.two,
  },
  engineGrid: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  engineCard: {
    padding: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  engineCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  engineIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  engineCardDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  proBanner: {
    padding: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  proBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  proBannerSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  proBannerBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.md,
  },
  proBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  feedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  newPostLink: {
    paddingVertical: 4,
  },
  newPostLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  postCard: {
    padding: Spacing.four,
    borderRadius: Radii.xl,
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  platformBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  badgeSpacing: {
    marginRight: 2,
  },
  postContent: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.three,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    gap: 4,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: 1,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemValue: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Spacing.two,
    marginTop: Spacing.two,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  publishBtn: {
    flex: 1,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.eight,
    borderRadius: Radii.xl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.three,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
