import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii, PlatformColors } from '@/constants/theme';
import { SocialPlatform } from '@/types/api';

export const ALL_PLATFORMS: Array<{ id: SocialPlatform; name: string }> = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
];

interface PlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onChange: (platforms: SocialPlatform[]) => void;
}

export function PlatformSelector({ selectedPlatforms, onChange }: PlatformSelectorProps) {
  const theme = useTheme();

  const togglePlatform = (plat: SocialPlatform) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        onChange(selectedPlatforms.filter((p) => p !== plat));
      }
    } else {
      onChange([...selectedPlatforms, plat]);
    }
  };

  return (
    <View style={styles.container}>
      {ALL_PLATFORMS.map(({ id, name }) => {
        const isSelected = selectedPlatforms.includes(id);
        const platColor = PlatformColors[id as keyof typeof PlatformColors] || theme.primary;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => togglePlatform(id)}
            activeOpacity={0.7}
            style={[
              styles.platformChip,
              {
                backgroundColor: isSelected ? `${platColor}20` : theme.backgroundElement,
                borderColor: isSelected ? platColor : theme.border,
              },
            ]}
          >
            <View style={[styles.platformDot, { backgroundColor: isSelected ? platColor : theme.textMuted }]} />
            <ThemedText
              style={[
                styles.platformChipText,
                { color: isSelected ? platColor : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
              ]}
            >
              {name}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: Spacing.one + Spacing.half,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformChipText: {
    fontSize: 13,
  },
});
