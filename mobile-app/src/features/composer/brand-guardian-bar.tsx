import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface BrandGuardianBarProps {
  readingEaseScore: number;
  charsRemaining: number;
  isOverLimit: boolean;
}

export function BrandGuardianBar({
  readingEaseScore,
  charsRemaining,
  isOverLimit,
}: BrandGuardianBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.linterBar, { borderTopColor: theme.borderSubtle }]}>
      <View style={styles.linterItem}>
        <Icons.ShieldCheck size={14} color={readingEaseScore >= 80 ? theme.success : theme.warning} />
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Readability:{' '}
          <ThemedText type="mono" style={{ color: readingEaseScore >= 80 ? theme.success : theme.warning }}>
            {readingEaseScore}%
          </ThemedText>
        </ThemedText>
      </View>

      <View style={styles.linterItem}>
        <ThemedText
          type="mono"
          style={[
            styles.charCount,
            { color: isOverLimit ? theme.destructive : charsRemaining < 30 ? theme.warning : theme.textMuted },
          ]}
        >
          {charsRemaining} chars
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
  },
  linterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  charCount: {
    fontSize: 12,
  },
});
