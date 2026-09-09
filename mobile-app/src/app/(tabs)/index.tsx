import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge, PostStatus, SocialPlatform } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { Post } from '@/types/api';
import { useAuthStore } from '@/stores/auth.store';

type FilterType = 'ALL' | 'SCHEDULED' | 'DRAFT' | 'PUBLISHED' | 'FAILED';

export default function FeedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeWorkspaceId, workspaces } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [activeWorkspaceId, workspaces]
  );

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['posts', activeWorkspaceId],
    queryFn: () => postsApi.getPosts(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: PostStatus }) => {
      if (status === 'PUBLISHED') {
        return postsApi.publishPost(postId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
  });

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
      FAILED: posts.filter((p) => p.status === 'FAILED').length,
    };
  }, [posts]);

  const handleFilterSelect = (filter: FilterType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedFilter(filter);
  };

  const handlePublishNow = (post: Post) => {
    updateStatusMutation.mutate({ postId: post.id, status: 'PUBLISHED' });
  };

  const handleDelete = (post: Post) => {
    Alert.alert('Delete Post', 'Are you sure you want to remove this post from your queue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePostMutation.mutate(post.id) },
    ]);
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    return (
      <GlassCard style={styles.postCard}>
        {/* Card Header: Platforms & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.platformBadges}>
            {item.platforms.map((plat) => (
              <Badge key={plat} variant="platform" platform={plat as SocialPlatform} style={styles.badgeSpacing} />
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
              <ThemedText type="mono" style={styles.metricValue}>
                {item.analytics.likes}
              </ThemedText>
            </View>
            <View style={styles.metricItem}>
              <Icons.MessageCircle size={14} color={theme.info} />
              <ThemedText type="mono" style={styles.metricValue}>
                {item.analytics.comments}
              </ThemedText>
            </View>
            <View style={styles.metricItem}>
              <Icons.Share2 size={14} color={theme.success} />
              <ThemedText type="mono" style={styles.metricValue}>
                {item.analytics.shares}
              </ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText type="caption" style={styles.metricLabel}>
                Impressions:
              </ThemedText>
              <ThemedText type="mono" style={styles.metricValue}>
                {item.analytics.impressions.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Action Buttons for Pending Posts */}
        {item.status !== 'PUBLISHED' && (
          <View style={[styles.actionsRow, { borderTopColor: theme.borderSubtle }]}>
            <Button
              title="Publish Now"
              variant="primary"
              size="sm"
              icon={<Icons.Send size={14} color="#FFFFFF" />}
              onPress={() => handlePublishNow(item)}
              style={styles.actionBtn}
            />
            <Button
              title="Delete"
              variant="ghost"
              size="sm"
              icon={<Icons.Trash size={14} color={theme.destructive} />}
              onPress={() => handleDelete(item)}
              textStyle={{ color: theme.destructive }}
            />
          </View>
        )}
      </GlassCard>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top App Bar with Workspace Switcher */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.workspaceSelector}
          onPress={() => router.push('/settings/workspaces')}
          activeOpacity={0.7}
        >
          <View style={[styles.workspaceAvatar, { backgroundColor: theme.primaryLight }]}>
            <Icons.Building size={16} color={theme.primary} />
          </View>
          <View>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Active Workspace
            </ThemedText>
            <View style={styles.workspaceRow}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {activeWorkspace?.name || 'Workspace'}
              </ThemedText>
              <Icons.ChevronDown size={14} color={theme.textMuted} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push('/studio/carousel-preview')}
          >
            <Icons.Layers size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push('/settings/profile')}
          >
            <Icons.Settings size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Horizontal Tabs */}
      <View style={styles.filterScrollWrapper}>
        {(['ALL', 'SCHEDULED', 'DRAFT', 'PUBLISHED', 'FAILED'] as FilterType[]).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterSelect(filter)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? theme.primary : theme.backgroundElement,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
              activeOpacity={0.75}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: isActive ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {filter.charAt(0) + filter.slice(1).toLowerCase()}
              </ThemedText>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : theme.backgroundSelected },
                ]}
              >
                <ThemedText
                  type="mono"
                  style={[styles.countText, { color: isActive ? '#FFFFFF' : theme.textMuted }]}
                >
                  {filterCounts[filter]}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* FlashList Feed */}
      <View style={styles.feedContainer}>
        <FlashList
          data={filteredPosts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icons.Feed size={44} color={theme.textMuted} />
              <ThemedText type="heading" style={styles.emptyTitle}>
                No posts found
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubtitle}>
                Create your first post using the AI Composer tab.
              </ThemedText>
              <Button
                title="Create with AI"
                icon={<Icons.Sparkles size={16} color="#FFFFFF" />}
                onPress={() => router.push('/(tabs)/composer')}
                style={styles.emptyButton}
              />
            </View>
          }
        />
      </View>
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
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    maxWidth: '70%',
  },
  workspaceAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScrollWrapper: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: Spacing.two,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  countText: {
    fontSize: 11,
  },
  feedContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  postCard: {
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  platformBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  badgeSpacing: {
    marginRight: Spacing.one,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  mediaContainer: {
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  timeText: {
    fontSize: 12,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  scoreText: {
    fontSize: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    marginTop: Spacing.three,
    borderTopWidth: 1,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metricLabel: {
    fontSize: 11,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    marginTop: Spacing.three,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingHorizontal: Spacing.four,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
    gap: Spacing.two,
  },
  emptyTitle: {
    marginTop: Spacing.two,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  emptyButton: {
    minWidth: 160,
  },
});
