import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useGalleryQuery } from '@/hooks/queries/use-gallery-query';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function GalleryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: mediaItems = [], isLoading, refetch } = useGalleryQuery();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Image size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Media Assets Vault</ThemedText>
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: Spacing.two }}>
            <ThemedText type="title">Creative Assets</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              S3 cloud media storage, AI image prompts, and video renders.
            </ThemedText>
          </View>
          <Button
            title="Create"
            variant="primary"
            size="sm"
            icon={<Icons.Plus size={14} color="#FFFFFF" />}
            onPress={() => router.push('/image' as any)}
          />
        </View>

        {mediaItems.length === 0 && !isLoading ? (
          <EmptyState
            icon={<Icons.Image size={32} color={theme.primary} />}
            title="No Media Assets Found"
            description="Your cloud storage and AI generated graphics will appear here once created."
            actionLabel="Generate AI Image"
            onAction={() => router.push('/image' as any)}
          />
        ) : (
          <View style={styles.grid}>
            {mediaItems.map((item) => (
              <GlassCard key={item.id} style={[styles.mediaCard, { width: ITEM_WIDTH }]}>
                {item.url ? (
                  <Image source={{ uri: item.url }} style={styles.mediaImage} contentFit="cover" />
                ) : (
                  <View style={[styles.mediaPlaceholder, { backgroundColor: theme.backgroundElement }]}>
                    <Icons.Image size={24} color={theme.textMuted} />
                  </View>
                )}
                <ThemedText type="caption" numberOfLines={1} style={styles.mediaTitle}>
                  {item.filename || 'Generated Asset'}
                </ThemedText>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  mediaCard: {
    padding: Spacing.two,
    gap: Spacing.one,
  },
  mediaImage: {
    width: '100%',
    height: 120,
    borderRadius: Radii.md,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
