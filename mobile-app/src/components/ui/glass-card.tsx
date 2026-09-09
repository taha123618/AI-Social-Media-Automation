import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/constants/theme';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
}

export function GlassCard({
  children,
  style,
  onPress,
  elevated = false,
}: GlassCardProps) {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: elevated ? theme.cardElevated : theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: Radii.xl,
    padding: Spacing.four,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.card, containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, containerStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
