import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

export interface SelectedMediaItem {
  uri: string;
  type: 'image' | 'video';
}

interface MediaControlsProps {
  mediaList: SelectedMediaItem[];
  onPickMedia: () => void;
  onRemoveMedia: (index: number) => void;
}

export function MediaControls({
  mediaList,
  onPickMedia,
  onRemoveMedia,
}: MediaControlsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          3. Media Attachments ({mediaList.length})
        </ThemedText>
        <TouchableOpacity
          onPress={onPickMedia}
          activeOpacity={0.7}
          style={[styles.addMediaBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
        >
          <Icons.Plus size={14} color={theme.primary} />
          <ThemedText style={[styles.addMediaText, { color: theme.primary }]}>Add Media</ThemedText>
        </TouchableOpacity>
      </View>

      {mediaList.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
          {mediaList.map((m, idx) => (
            <View key={`${m.uri}_${idx}`} style={[styles.mediaThumbContainer, { borderColor: theme.border }]}>
              <Image source={{ uri: m.uri }} style={styles.mediaThumb} resizeMode="cover" />
              {m.type === 'video' && (
                <View style={styles.videoBadge}>
                  <Icons.Video size={12} color="#FFFFFF" />
                </View>
              )}
              <TouchableOpacity
                onPress={() => onRemoveMedia(idx)}
                activeOpacity={0.7}
                style={styles.removeMediaBtn}
              >
                <Icons.Close size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity
          onPress={onPickMedia}
          activeOpacity={0.7}
          style={[styles.emptyMediaBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
        >
          <Icons.Image size={24} color={theme.textMuted} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
            Attach photos or short clips from library
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 15,
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: Spacing.one,
  },
  addMediaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mediaStrip: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  mediaThumbContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 3,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMediaBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
});
