import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
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
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { usePostsQuery } from '@/hooks/queries/use-posts-query';
import { usePostMutations } from '@/hooks/mutations/use-post-mutations';
import { Post } from '@/types/api';

type FilterType = 'ALL' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export default function ContentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const { data: posts = [], isLoading, refetch } = usePostsQuery();
  const { publishPostMutation, deletePostMutation } = usePostMutations();

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
    publishPostMutation.mutate(post.id);
  };

  const handleDelete = (post: Post) => {
    Alert.alert('Delete Content Draft', 'Are you sure you want to remove this item from your content library?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePostMutation.mutate(post.id) },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.backgroundElement }]}
            hitSlop={12}
          >
            <Icons.ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Content Drafts & Library
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/composer' as any)}
            style={[styles.createBtn, { backgroundColor: theme.primaryGlow }]}
          >
            <Icons.Plus size={18} color={theme.primary} />
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
            />
          }
        >
          {/* Summary Banner */}
          <GlassCard style={styles.banner}>
            <View style={styles.bannerRow}>
              <View style={[styles.bannerIconBox, { backgroundColor: theme.primaryGlow }]}>
                <Icons.FileText size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium" style={{ fontWeight: '800' }}>
                  Unified Content Repository
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  Manage scheduled releases, AI-generated drafts, and published multi-channel assets.
                </ThemedText>
              </View>
            </View>
          </GlassCard>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as FilterType[]).map((filter) => {
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
                    {filter === 'ALL' ? 'All Items' : filter.charAt(0) + filter.slice(1).toLowerCase()}
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
              <ThemedText style={styles.emptyTitle}>No content in this view</ThemedText>
              <ThemedText type="caption" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Compose new social posts, articles, or AI carousels to populate your repository.
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight * 2,
  },
  banner: {
    padding: Spacing.four,
    borderRadius: Radii.xl,
    marginBottom: Spacing.four,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
