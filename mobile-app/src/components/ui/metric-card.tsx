import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from './glass-card';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number; // e.g. +12.4
  period?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function MetricCard({
  label,
  value,
  change,
  period = 'vs last 30d',
  icon,
  style,
}: MetricCardProps) {
  const theme = useTheme();
  const isPositive = change !== undefined && change >= 0;

  return (
    <GlassCard style={[styles.card, style]}>
      <View style={styles.header}>
        <ThemedText type="caption" style={[styles.label, { color: theme.textMuted }]}>
          {label}
        </ThemedText>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>

      <ThemedText type="mono" style={styles.value}>
        {value}
      </ThemedText>

      {change !== undefined && (
        <View style={styles.footer}>
          <View
            style={[
              styles.badge,
              { backgroundColor: isPositive ? theme.successBg : `${theme.destructive}15` },
            ]}
          >
            <ThemedText
              type="mono"
              style={[
                styles.changeText,
                { color: isPositive ? theme.success : theme.destructive },
              ]}
            >
              {isPositive ? `+${change}%` : `${change}%`}
            </ThemedText>
          </View>
          <ThemedText type="caption" style={[styles.period, { color: theme.textMuted }]}>
            {period}
          </ThemedText>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    opacity: 0.8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    marginTop: Spacing.one,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  period: {
    fontSize: 11,
  },
});
