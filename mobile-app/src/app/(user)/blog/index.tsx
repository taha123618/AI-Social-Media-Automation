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
import { useBlogQuery } from '@/hooks/queries/use-blog-query';

export default function UserBlogScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: articles = [], isLoading, refetch } = useBlogQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.MessageCircle size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">AI Blog Writer</ThemedText>
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
        <View style={styles.titleRow}>
          <View>
            <ThemedText type="title">SEO Articles</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Long-form programmatic thought leadership articles.
            </ThemedText>
          </View>
          <Button
            title="New Article"
            variant="primary"
            size="sm"
            icon={<Icons.Sparkles size={14} color="#FFFFFF" />}
            onPress={() => router.push('/(tabs)/composer')}
          />
        </View>

        {/* Articles List */}
        <View style={styles.articlesList}>
          {articles.map((art) => (
            <GlassCard key={art.id} style={styles.articleCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: art.status === 'PUBLISHED' ? `${theme.success}20` : `${theme.warning}20` }]}>
                  <ThemedText type="caption" style={{ color: art.status === 'PUBLISHED' ? theme.success : theme.warning, fontWeight: '700', fontSize: 10 }}>
                    {art.status}
                  </ThemedText>
                </View>
                <View style={styles.seoPill}>
                  <ThemedText type="mono" style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>
                    SEO Score: {art.seoScore}%
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="defaultSemiBold" style={styles.articleTitle}>
                {art.title}
              </ThemedText>

              <ThemedText style={styles.articleExcerpt} numberOfLines={2}>
                {art.excerpt}
              </ThemedText>

              <View style={[styles.articleFooter, { borderTopColor: theme.borderSubtle }]}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  {art.wordCount} words • #{art.targetKeyword}
                </ThemedText>
                <Icons.ChevronRight size={16} color={theme.textMuted} />
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  articlesList: {
    gap: Spacing.three,
  },
  articleCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  seoPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  articleTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  articleExcerpt: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: 1,
  },
});
