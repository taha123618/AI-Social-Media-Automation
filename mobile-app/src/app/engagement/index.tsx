import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radii } from '@/constants/theme';

export default function EngagementScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [autoLikeEnabled, setAutoLikeEnabled] = useState(true);
  const [commentResponderEnabled, setCommentResponderEnabled] = useState(true);
  const [leadQualifierEnabled, setLeadQualifierEnabled] = useState(true);

  const handleSavePreferences = () => {
    Alert.alert('Engagement Settings Saved', 'Autonomous auto-engagement rules updated across all channels.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.topBarLeft}>
          <Icons.Zap size={20} color={theme.primary} />
          <ThemedText type="defaultSemiBold">Auto-Engagement Engine</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icons.Close size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.pageTitle}>
          Autonomous Engagement
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.four }}>
          Configure smart commentary swarms, automated prospect warm-up, and viral thread boosts.
        </ThemedText>

        <GlassCard style={styles.cardSection}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="defaultSemiBold">Prospect Comment Warm-Up</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Automatically leave insightful comments on target ICP accounts.
              </ThemedText>
            </View>
            <Switch
              value={autoLikeEnabled}
              onValueChange={setAutoLikeEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="defaultSemiBold">Smart Comment Responder</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Reply to post comments within 3 minutes to maximize LinkedIn dwell time algorithm boost.
              </ThemedText>
            </View>
            <Switch
              value={commentResponderEnabled}
              onValueChange={setCommentResponderEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="defaultSemiBold">Lead Intent Qualifier</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Tag and sync commenters asking for pricing directly into your CRM.
              </ThemedText>
            </View>
            <Switch
              value={leadQualifierEnabled}
              onValueChange={setLeadQualifierEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        <Button
          title="Save Engagement Preferences"
          variant="primary"
          size="lg"
          onPress={handleSavePreferences}
          style={{ marginTop: Spacing.four }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  pageTitle: {
    marginBottom: Spacing.one,
  },
  cardSection: {
    padding: Spacing.four,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
});
