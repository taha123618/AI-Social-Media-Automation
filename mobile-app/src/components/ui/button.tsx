import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radii, Spacing } from '@/constants/theme';

export interface ButtonProps {
  title?: string;
  label?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function Button({
  title,
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();
  const displayTitle = label || title || '';

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSelected;
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.backgroundElement;
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'destructive':
        return theme.destructive;
      default:
        return theme.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.borderSubtle : theme.border;
    }
    return 'transparent';
  };

  const getTextColor = (): TextStyle['color'] => {
    if (disabled) return theme.textMuted;
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#FFFFFF';
      case 'secondary':
        return theme.text;
      case 'outline':
      case 'ghost':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };

  const paddingVertical = size === 'sm' ? Spacing.two : size === 'lg' ? Spacing.four : Spacing.three;
  const paddingHorizontal = size === 'sm' ? Spacing.three : size === 'lg' ? Spacing.six : Spacing.four;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical,
          paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : theme.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <ThemedText
            style={[
              styles.text,
              { color: getTextColor() },
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              icon ? { marginLeft: Spacing.two } : null,
              textStyle,
            ]}
          >
            {displayTitle}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.lg,
  },
  text: {
    fontWeight: '600',
    fontSize: 15,
  },
  textSm: {
    fontSize: 13,
  },
  textLg: {
    fontSize: 17,
  },
});
