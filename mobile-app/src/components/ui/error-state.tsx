import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from './button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Failed to Load',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  style,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: `${theme.destructive}15` }]}>
        <Icons.Close size={28} color={theme.destructive} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="caption" style={[styles.message, { color: theme.textMuted }]}>
        {message}
      </ThemedText>
      {onRetry && (
        <Button
          title="Try Again"
          variant="secondary"
          size="sm"
          icon={<Icons.Refresh size={14} color={theme.text} />}
          onPress={onRetry}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.four,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 16,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  button: {
    marginTop: Spacing.four,
  },
});
