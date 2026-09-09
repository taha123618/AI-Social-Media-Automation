import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge, SocialPlatform } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';
import { useCalendarQuery } from '@/hooks/queries/use-calendar-query';
import { CalendarSlot } from '@/types/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const theme = useTheme();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const { data: slots = [], isLoading, refetch } = useCalendarQuery();

  const handleDaySelect = (dayIndex: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDay(dayIndex);
  };

  const daySlots = slots.filter((s: CalendarSlot) => s.dayOfWeek === selectedDay);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle">Publishing Calendar</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Audience peak hours and queue slots
          </ThemedText>
        </View>

        {/* Weekly Day Strip */}
        <View style={styles.dayStrip}>
          {DAYS.map((dayName, idx) => {
            const isSelected = selectedDay === idx;
            const isToday = new Date().getDay() === idx;
            return (
              <TouchableOpacity
                key={dayName}
                onPress={() => handleDaySelect(idx)}
                activeOpacity={0.75}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : isToday ? theme.secondary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={[styles.dayLabel, { color: isSelected ? '#FFFFFF' : theme.textMuted }]}
                >
                  {dayName}
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.dayNumber, { color: isSelected ? '#FFFFFF' : theme.text }]}
                >
                  {idx + 1}
                </ThemedText>
                {isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      { backgroundColor: isSelected ? '#FFFFFF' : theme.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AI Peak Recommendation Card */}
        <GlassCard style={[styles.recommendationCard, { backgroundColor: theme.primaryLight }]}>
          <View style={styles.recommendationHeader}>
            <Icons.Zap size={20} color={theme.primary} />
            <ThemedText type="defaultSemiBold" style={{ color: theme.primary }}>
              Algorithmic Peak Insight
            </ThemedText>
          </View>
          <ThemedText style={[styles.recommendationText, { color: theme.text }]}>
            {DAYS[selectedDay]} audience engagement peaks between 08:30 AM and 01:30 PM. Posts scheduled in these
            windows receive an estimated +32% higher reach.
          </ThemedText>
        </GlassCard>

        {/* Queue Slots Section */}
        <View style={styles.slotsSectionHeader}>
          <ThemedText type="defaultSemiBold">Scheduled Queue Slots ({DAYS[selectedDay]})</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            {daySlots.length} active slots
          </ThemedText>
        </View>

        {daySlots.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Icons.Clock size={32} color={theme.textMuted} />
            <ThemedText type="defaultSemiBold" style={{ marginTop: Spacing.two }}>
              No slots scheduled for {DAYS[selectedDay]}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
              Add a peak queue slot to automate content delivery on this day.
            </ThemedText>
          </GlassCard>
        ) : (
          daySlots.map((slot: CalendarSlot) => (
            <GlassCard key={slot.id} style={styles.slotCard}>
              <View style={styles.slotLeft}>
                <Icons.Clock size={16} color={theme.primary} />
                <View>
                  <ThemedText type="mono" style={styles.slotTime}>
                    {slot.time}
                  </ThemedText>
                  <Badge variant="platform" platform={slot.platform as SocialPlatform} style={{ marginTop: 4 }} />
                </View>
              </View>

              <View style={styles.slotRight}>
                {slot.isPeakHour && (
                  <View style={[styles.peakBadge, { backgroundColor: theme.successBg }]}>
                    <Icons.Zap size={12} color={theme.success} />
                    <ThemedText type="caption" style={{ color: theme.success, fontWeight: '700' }}>
                      Peak Window
                    </ThemedText>
                  </View>
                )}
                <ThemedText type="caption" style={{ color: theme.textMuted, marginTop: 4 }}>
                  Score: <ThemedText type="mono">{slot.engagementScore}%</ThemedText>
                </ThemedText>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  header: {
    marginBottom: Spacing.four,
  },
  dayStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.lg,
    borderWidth: 1,
    minWidth: 44,
  },
  dayLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 16,
    marginTop: 2,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  recommendationCard: {
    marginBottom: Spacing.four,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    marginBottom: Spacing.one,
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  slotsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  slotTime: {
    fontSize: 15,
  },
  slotRight: {
    alignItems: 'flex-end',
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
});
