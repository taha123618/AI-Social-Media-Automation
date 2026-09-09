import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn as ReanimatedFadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  ZoomIn,
} from 'react-native-reanimated';

export type FadeDirection = 'none' | 'up' | 'down' | 'left' | 'right' | 'zoom';

export interface FadeInProps {
  children: React.ReactNode;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({
  children,
  direction = 'down',
  delay = 0,
  duration = 400,
  distance = 16,
  style,
}: FadeInProps) {
  const getEnteringAnimation = () => {
    switch (direction) {
      case 'down':
        return FadeInDown.delay(delay).duration(duration).springify().damping(18);
      case 'up':
        return FadeInUp.delay(delay).duration(duration).springify().damping(18);
      case 'left':
        return FadeInLeft.delay(delay).duration(duration).springify().damping(18);
      case 'right':
        return FadeInRight.delay(delay).duration(duration).springify().damping(18);
      case 'zoom':
        return ZoomIn.delay(delay).duration(duration).springify().damping(18);
      case 'none':
      default:
        return ReanimatedFadeIn.delay(delay).duration(duration);
    }
  };

  return (
    <Animated.View entering={getEnteringAnimation()} style={style}>
      {children}
    </Animated.View>
  );
}
