import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

export const PRESET_TIMES = [
  { label: 'Publish Immediately', value: 'NOW' },
  { label: 'Next Peak Slot (09:00 AM)', value: 'PEAK' },
  { label: 'Tomorrow 12:30 PM', value: 'TOMORROW_NOON' },
  { label: 'Tomorrow 06:00 PM', value: 'TOMORROW_EVE' },
];

interface ScheduleSelectorProps {
  selectedTiming: string;
  onSelectTiming: (value: string) => void;
}

export function ScheduleSelector({
  selectedTiming,
  onSelectTiming,
}: ScheduleSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        4. Publishing Schedule
      </ThemedText>
      <View style={styles.timingList}>
        {PRESET_TIMES.map((preset) => {
          const isSelected = selectedTiming === preset.value;
          return (
            <TouchableOpacity
              key={preset.value}
              onPress={() => onSelectTiming(preset.value)}
              style={[
                styles.timingItem,
                {
                  backgroundColor: isSelected ? theme.primaryLight : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
            >
              <Icons.Clock size={16} color={isSelected ? theme.primary : theme.textMuted} />
              <ThemedText
                style={[
                  styles.timingLabel,
                  { color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '600' : '400' },
                ]}
              >
                {preset.label}
              </ThemedText>
              {isSelected && <Icons.Check size={16} color={theme.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: Spacing.two,
  },
  timingList: {
    gap: Spacing.two,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.two,
  },
  timingLabel: {
    flex: 1,
    fontSize: 14,
  },
});
