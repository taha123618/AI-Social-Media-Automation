import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/constants/theme';

export interface PulseBadgeProps {
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  pulse?: boolean;
}

export function PulseBadge({
  label,
  color,
  style,
  pulse = true,
}: PulseBadgeProps) {
  const theme = useTheme();
  const badgeColor = color || theme.primary;
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (pulse) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 1200, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1200, easing: Easing.out(Easing.ease) }),
          withTiming(0.6, { duration: 0 })
        ),
        -1,
        false
      );
    }
  }, [pulse]);

  const animatedHaloStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: `${badgeColor}18`, borderColor: `${badgeColor}35` },
        style,
      ]}
    >
      <View style={styles.dotWrapper}>
        {pulse && (
          <Animated.View
            style={[
              styles.pulseHalo,
              { backgroundColor: badgeColor },
              animatedHaloStyle,
            ]}
          />
        )}
        <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      </View>
      <ThemedText style={[styles.label, { color: badgeColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dotWrapper: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseHalo: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
