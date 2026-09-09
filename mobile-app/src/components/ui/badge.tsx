import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { PlatformColors, Radii, Spacing } from '@/constants/theme';

export type SocialPlatform = 'instagram' | 'linkedin' | 'x' | 'twitter' | 'tiktok' | 'youtube' | 'facebook';
export type PostStatus = 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'FAILED';

export interface BadgeProps {
  label?: string;
  variant?: 'status' | 'platform' | 'custom';
  status?: PostStatus;
  platform?: SocialPlatform;
  size?: 'sm' | 'md' | 'lg';
  bgColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  label,
  variant = 'custom',
  status,
  platform,
  size = 'md',
  bgColor,
  textColor,
  style,
}: BadgeProps) {
  const theme = useTheme();

  if (variant === 'platform' && platform) {
    const platKey = platform.toLowerCase() as keyof typeof PlatformColors;
    const color: string = PlatformColors[platKey] || theme.primary;
    const displayName = platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1);

    return (
      <View
        style={[
          styles.badge,
          size === 'sm' && styles.badgeSm,
          { backgroundColor: `${color}18`, borderColor: `${color}40`, borderWidth: 1 },
          style,
        ]}
      >
        <View style={[styles.dot, size === 'sm' && styles.dotSm, { backgroundColor: color }]} />
        <ThemedText style={[styles.label, size === 'sm' && styles.labelSm, { color }]}>
          {label || displayName}
        </ThemedText>
      </View>
    );
  }

  if (variant === 'status' && status) {
    let color: string = theme.textMuted;
    let bg: string = theme.backgroundElement;
    let text = status.toString();

    switch (status) {
      case 'PUBLISHED':
        color = theme.success;
        bg = theme.successBg;
        text = 'Published';
        break;
      case 'SCHEDULED':
        color = theme.warning;
        bg = theme.warningBg;
        text = 'Scheduled';
        break;
      case 'DRAFT':
        color = theme.primary;
        bg = theme.primaryLight;
        text = 'Draft';
        break;
      case 'FAILED':
        color = theme.destructive;
        bg = theme.destructiveBg;
        text = 'Failed';
        break;
    }

    return (
      <View
        style={[
          styles.badge,
          size === 'sm' && styles.badgeSm,
          { backgroundColor: bg },
          style,
        ]}
      >
        <View style={[styles.dot, size === 'sm' && styles.dotSm, { backgroundColor: color }]} />
        <ThemedText style={[styles.label, size === 'sm' && styles.labelSm, { color }]}>
          {label || text}
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor || theme.backgroundElement,
          borderColor: theme.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <ThemedText style={[styles.label, { color: textColor || theme.textSecondary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.one + Spacing.half,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badgeSm: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  dotSm: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: Spacing.one,
  },
  labelSm: {
    fontSize: 10,
  },
});
