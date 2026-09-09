import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticFeedback?: boolean;
}

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  children,
  style,
  scaleTo = 0.96,
  hapticFeedback = true,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (e: any) => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(scaleTo, {
      damping: 15,
      stiffness: 300,
    });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    onPressOut?.(e);
  };

  return (
    <AnimatedPressableBase
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
}
