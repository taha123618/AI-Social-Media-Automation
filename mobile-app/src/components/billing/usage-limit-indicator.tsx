import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

export interface UsageLimitIndicatorProps {
  label: string;
  used: number;
  limit: number;
  showWarningThreshold?: number;
  unit?: string;
}

export function UsageLimitIndicator({
  label,
  used,
  limit,
  showWarningThreshold = 80,
  unit,
}: UsageLimitIndicatorProps) {
  const theme = useTheme();
  const router = useRouter();

  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const isNearLimit = !isUnlimited && percentage >= showWarningThreshold;
  const isExhausted = !isUnlimited && used >= limit;

  let progressColor: string = theme.primary;
  if (isExhausted) {
    progressColor = theme.destructive;
  } else if (isNearLimit) {
    progressColor = theme.warning;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText type="mono" style={[styles.usageCount, { color: theme.textSecondary }]}>
          {isUnlimited ? (
            <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>Unlimited</ThemedText>
          ) : (
            `${used.toLocaleString()} / ${limit.toLocaleString()}${unit ? ` ${unit}` : ''}`
          )}
        </ThemedText>
      </View>

      {!isUnlimited && (
        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.bar,
              {
                width: `${percentage}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      )}

      {isExhausted && (
        <View style={styles.exhaustedRow}>
          <ThemedText style={[styles.exhaustedText, { color: theme.destructive }]}>
            Quota exhausted
          </ThemedText>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings/billing' as any)}
            style={styles.upgradeLink}
          >
            <ThemedText style={[styles.upgradeText, { color: theme.primary }]}>Upgrade</ThemedText>
            <Icons.ArrowUpRight size={13} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  usageCount: {
    fontSize: 12,
  },
  track: {
    height: 6,
    borderRadius: Radii.full,
    overflow: 'hidden',
    width: '100%',
    marginTop: 4,
  },
  bar: {
    height: '100%',
    borderRadius: Radii.full,
  },
  exhaustedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  exhaustedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  upgradeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  upgradeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
